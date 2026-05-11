-- ============================================================
-- QR Product Traceability — COMPLETE Database Setup
-- Run this ENTIRE SQL in Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  short_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  gst_number TEXT DEFAULT '',
  batch_number TEXT DEFAULT '',
  serial_number TEXT DEFAULT '',
  manufacture_date DATE,
  expiry_date DATE,
  description TEXT DEFAULT '',
  manual_url TEXT,
  additional_info JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if re-running
DROP POLICY IF EXISTS "Public read access" ON products;
DROP POLICY IF EXISTS "Admin insert access" ON products;
DROP POLICY IF EXISTS "Admin update access" ON products;
DROP POLICY IF EXISTS "Admin delete access" ON products;

-- 4. Policy: Anyone can READ products (public product page / QR scans)
CREATE POLICY "Public read access" ON products
  FOR SELECT USING (true);

-- 5. Policy: Authenticated users can INSERT
CREATE POLICY "Admin insert access" ON products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 6. Policy: Authenticated users can UPDATE
CREATE POLICY "Admin update access" ON products
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 7. Policy: Authenticated users can DELETE
CREATE POLICY "Admin delete access" ON products
  FOR DELETE USING (auth.role() = 'authenticated');

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- ============================================================
-- 9. Create storage bucket for PDF manuals
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'manuals',
  'manuals',
  true,
  10485760, -- 10MB max
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- 10. Storage policies: authenticated users can upload
DROP POLICY IF EXISTS "Authenticated users can upload manuals" ON storage.objects;
CREATE POLICY "Authenticated users can upload manuals" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'manuals'
    AND auth.role() = 'authenticated'
  );

-- 11. Storage policies: anyone can download/view manuals (public)
DROP POLICY IF EXISTS "Public can view manuals" ON storage.objects;
CREATE POLICY "Public can view manuals" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'manuals');

-- 12. Storage policies: authenticated users can delete manuals
DROP POLICY IF EXISTS "Authenticated users can delete manuals" ON storage.objects;
CREATE POLICY "Authenticated users can delete manuals" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'manuals'
    AND auth.role() = 'authenticated'
  );

-- ============================================================
-- DONE! Now go to Authentication > Users > Add User
-- to create your admin accounts.
-- ============================================================
