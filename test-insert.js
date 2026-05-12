const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('products').insert([{
    name: "Test Product",
    category: "Other",
    gst_number: "test",
    batch_number: "test",
    serial_number: "test",
    manufacture_date: "2024-01-01",
    expiry_date: "2025-01-01",
    description: "test",
    created_by: "test-user"
  }]).select();
  console.log("Data:", data);
  console.log("Error:", error);
}
test();
