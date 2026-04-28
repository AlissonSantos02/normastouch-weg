
-- 1. Tabela de locais
CREATE TABLE public.locais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.locais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados podem ver locais"
ON public.locais FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Apenas admins podem inserir locais"
ON public.locais FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Apenas admins podem atualizar locais"
ON public.locais FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Apenas admins podem deletar locais"
ON public.locais FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Local padrão
INSERT INTO public.locais (nome) VALUES ('WEG ITAJAI');

-- 2. Tabela profiles (vincula usuário ao local)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  local TEXT NOT NULL DEFAULT 'WEG ITAJAI',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios podem ver seu proprio profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todos os profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem atualizar profiles"
ON public.profiles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem inserir profiles"
ON public.profiles FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Cria profile para usuários existentes
INSERT INTO public.profiles (user_id, local)
SELECT id, 'WEG ITAJAI' FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- 3. Função para obter o local do usuário
CREATE OR REPLACE FUNCTION public.get_user_local(_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT local FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- 4. Atualiza handle_new_user para criar profile com local padrão
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'viewer');

  INSERT INTO public.profiles (user_id, local)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'local', 'WEG ITAJAI'));

  RETURN NEW;
END;
$$;

-- 5. Adiciona coluna local em normas
ALTER TABLE public.normas
ADD COLUMN local TEXT NOT NULL DEFAULT 'WEG ITAJAI';

-- Garante que normas existentes ficam em WEG ITAJAI
UPDATE public.normas SET local = 'WEG ITAJAI' WHERE local IS NULL;

-- 6. Atualiza políticas RLS de normas para filtrar por local
DROP POLICY IF EXISTS "Todos podem visualizar normas" ON public.normas;
DROP POLICY IF EXISTS "Apenas admins podem inserir normas" ON public.normas;
DROP POLICY IF EXISTS "Apenas admins podem atualizar normas" ON public.normas;
DROP POLICY IF EXISTS "Apenas admins podem deletar normas" ON public.normas;

CREATE POLICY "Usuarios veem normas do seu local"
ON public.normas FOR SELECT
TO authenticated
USING (local = public.get_user_local(auth.uid()));

CREATE POLICY "Admins podem inserir normas no seu local"
ON public.normas FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  AND local = public.get_user_local(auth.uid())
);

CREATE POLICY "Admins podem atualizar normas do seu local"
ON public.normas FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin')
  AND local = public.get_user_local(auth.uid())
);

CREATE POLICY "Admins podem deletar normas do seu local"
ON public.normas FOR DELETE
USING (
  public.has_role(auth.uid(), 'admin')
  AND local = public.get_user_local(auth.uid())
);
