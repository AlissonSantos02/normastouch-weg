-- ============================================
-- MIGRAÇÕES PARA O BANCO SUPABASE
-- Projeto: ytlrgiklfnygbzrwhpdz
-- ============================================
-- Execute este SQL no SQL Editor do Supabase
-- https://supabase.com/dashboard/project/ytlrgiklfnygbzrwhpdz/sql/new
-- ============================================

-- ============================================
-- 1. SISTEMA DE ROLES (user_roles)
-- ============================================

-- Create enum for user roles
CREATE TYPE IF NOT EXISTS public.app_role AS ENUM ('admin', 'viewer');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS Policies for user_roles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Users can view their own role') THEN
    CREATE POLICY "Users can view their own role"
    ON public.user_roles
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Only admins can insert roles') THEN
    CREATE POLICY "Only admins can insert roles"
    ON public.user_roles
    FOR INSERT
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Only admins can update roles') THEN
    CREATE POLICY "Only admins can update roles"
    ON public.user_roles
    FOR UPDATE
    USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Only admins can delete roles') THEN
    CREATE POLICY "Only admins can delete roles"
    ON public.user_roles
    FOR DELETE
    USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Function to handle new user creation with default viewer role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'viewer');
  RETURN NEW;
END;
$$;

-- Trigger to automatically assign viewer role on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. STORAGE BUCKET PARA PDFs
-- ============================================

-- Criar bucket de storage para PDFs das normas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'normas-pdfs') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'normas-pdfs',
      'normas-pdfs',
      true,
      20971520, -- 20MB
      ARRAY['application/pdf']
    );
  END IF;
END $$;

-- Política para permitir visualização pública dos PDFs
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Permitir visualização pública de PDFs') THEN
    CREATE POLICY "Permitir visualização pública de PDFs"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'normas-pdfs');
  END IF;
END $$;

-- Política para permitir upload de PDFs (público para o painel admin)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Permitir upload de PDFs') THEN
    CREATE POLICY "Permitir upload de PDFs"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'normas-pdfs');
  END IF;
END $$;

-- Política para permitir exclusão de PDFs
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Permitir exclusão de PDFs') THEN
    CREATE POLICY "Permitir exclusão de PDFs"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'normas-pdfs');
  END IF;
END $$;

-- Política para permitir atualização de PDFs
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Permitir atualização de PDFs') THEN
    CREATE POLICY "Permitir atualização de PDFs"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'normas-pdfs');
  END IF;
END $$;

-- ============================================
-- 3. TABELA NORMAS
-- ============================================

-- Criar tabela para armazenar as normas
CREATE TABLE IF NOT EXISTS public.normas (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  categoria TEXT NOT NULL,
  descricao TEXT NOT NULL,
  pdf_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.normas ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem visualizar normas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'normas' AND policyname = 'Todos podem visualizar normas') THEN
    CREATE POLICY "Todos podem visualizar normas"
    ON public.normas
    FOR SELECT
    USING (true);
  END IF;
END $$;

-- Política: Apenas admins podem inserir normas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'normas' AND policyname = 'Apenas admins podem inserir normas') THEN
    CREATE POLICY "Apenas admins podem inserir normas"
    ON public.normas
    FOR INSERT
    WITH CHECK (has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Política: Apenas admins podem atualizar normas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'normas' AND policyname = 'Apenas admins podem atualizar normas') THEN
    CREATE POLICY "Apenas admins podem atualizar normas"
    ON public.normas
    FOR UPDATE
    USING (has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Política: Apenas admins podem deletar normas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'normas' AND policyname = 'Apenas admins podem deletar normas') THEN
    CREATE POLICY "Apenas admins podem deletar normas"
    ON public.normas
    FOR DELETE
    USING (has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- ============================================
-- 4. TRIGGERS E FUNÇÕES
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_normas_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_normas_updated_at_trigger ON public.normas;
CREATE TRIGGER update_normas_updated_at_trigger
BEFORE UPDATE ON public.normas
FOR EACH ROW
EXECUTE FUNCTION public.update_normas_updated_at();

-- ============================================
-- FIM DAS MIGRAÇÕES
-- ============================================

-- Após executar este SQL, você precisará:
-- 1. Criar o primeiro usuário admin manualmente
-- 2. Configurar as URLs de redirect na seção de Authentication
