
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.categorias (
  id text PRIMARY KEY,
  nome text NOT NULL,
  icone text NOT NULL DEFAULT 'FileText',
  color_class text NOT NULL DEFAULT 'electric',
  local text NOT NULL DEFAULT 'WEG ITAJAI',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios veem categorias do seu local"
ON public.categorias FOR SELECT
TO authenticated
USING (local = get_user_local(auth.uid()));

CREATE POLICY "Admins podem inserir categorias no seu local"
ON public.categorias FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND local = get_user_local(auth.uid()));

CREATE POLICY "Admins podem atualizar categorias do seu local"
ON public.categorias FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) AND local = get_user_local(auth.uid()));

CREATE POLICY "Admins podem deletar categorias do seu local"
ON public.categorias FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) AND local = get_user_local(auth.uid()));

CREATE TRIGGER update_categorias_updated_at
BEFORE UPDATE ON public.categorias
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.categorias (id, nome, icone, color_class, local) VALUES
  ('eletrica', 'MONTAGEM ELÉTRICA', 'Zap', 'electric', 'WEG ITAJAI'),
  ('mecanica', 'MONTAGEM MECÂNICA', 'Settings', 'mechanical', 'WEG ITAJAI'),
  ('processos', 'PROCESSOS', 'RefreshCw', 'process', 'WEG ITAJAI'),
  ('apts', 'APT''S', 'ClipboardList', 'apt', 'WEG ITAJAI')
ON CONFLICT (id) DO NOTHING;
