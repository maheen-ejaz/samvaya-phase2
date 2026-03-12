-- Fix: Storage policies excluded super_admin role
-- Previously checked role = 'admin' instead of using is_admin() which covers both roles

-- Drop old policies
DROP POLICY IF EXISTS "Admins can read all photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can read all documents" ON storage.objects;

-- Recreate with both admin roles
CREATE POLICY "Admins can read all photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'photos' AND EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

CREATE POLICY "Admins can read all documents"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'documents' AND EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

-- Add admin write/delete policies (needed for document management)
CREATE POLICY "Admins can delete photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'photos' AND EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

CREATE POLICY "Admins can delete documents"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'documents' AND EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));
