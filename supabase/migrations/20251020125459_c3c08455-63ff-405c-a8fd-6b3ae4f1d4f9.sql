-- Criar bucket de storage para PDFs das normas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'normas-pdfs',
  'normas-pdfs',
  true,
  20971520, -- 20MB
  ARRAY['application/pdf']
);

-- Política para permitir visualização pública dos PDFs
CREATE POLICY "Permitir visualização pública de PDFs"
ON storage.objects FOR SELECT
USING (bucket_id = 'normas-pdfs');

-- Política para permitir upload de PDFs (público para o painel admin)
CREATE POLICY "Permitir upload de PDFs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'normas-pdfs');

-- Política para permitir exclusão de PDFs
CREATE POLICY "Permitir exclusão de PDFs"
ON storage.objects FOR DELETE
USING (bucket_id = 'normas-pdfs');

-- Política para permitir atualização de PDFs
CREATE POLICY "Permitir atualização de PDFs"
ON storage.objects FOR UPDATE
USING (bucket_id = 'normas-pdfs');