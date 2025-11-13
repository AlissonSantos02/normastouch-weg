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
CREATE POLICY "Todos podem visualizar normas"
ON public.normas
FOR SELECT
USING (true);

-- Política: Apenas admins podem inserir normas
CREATE POLICY "Apenas admins podem inserir normas"
ON public.normas
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Política: Apenas admins podem atualizar normas
CREATE POLICY "Apenas admins podem atualizar normas"
ON public.normas
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Política: Apenas admins podem deletar normas
CREATE POLICY "Apenas admins podem deletar normas"
ON public.normas
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_normas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_normas_updated_at_trigger
BEFORE UPDATE ON public.normas
FOR EACH ROW
EXECUTE FUNCTION public.update_normas_updated_at();