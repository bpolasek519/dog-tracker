INSERT INTO storage.buckets (id, name, public)
VALUES ('dog-photos', 'dog-photos', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Dog photos are publicly readable"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'dog-photos');

CREATE POLICY "Authenticated users can upload dog photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'dog-photos');

CREATE POLICY "Authenticated users can delete dog photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'dog-photos');
