-- ============================================================
-- QR Product Traceability — Database Setup
-- Run this SQL in Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Anyone can READ products (public product page)
CREATE POLICY "Public read access" ON products
  FOR SELECT USING (true);

-- 4. Policy: Only authenticated (admin) users can INSERT
CREATE POLICY "Admin insert access" ON products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 5. Policy: Only authenticated (admin) users can UPDATE
CREATE POLICY "Admin update access" ON products
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 6. Policy: Only authenticated (admin) users can DELETE
CREATE POLICY "Admin delete access" ON products
  FOR DELETE USING (auth.role() = 'authenticated');

-- 7. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- ============================================================
-- Storage Setup (do this manually in Supabase Dashboard):
-- 1. Go to Storage > Create new bucket
-- 2. Name: "manuals"
-- 3. Set to PUBLIC
-- 4. Add policy: allow authenticated users to upload
-- 5. Add policy: allow public to download
-- ============================================================
