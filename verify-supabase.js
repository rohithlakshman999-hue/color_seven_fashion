const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load .env.local
const envPath = path.join(__dirname, ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("Error: .env.local file not found.");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let val = match[2] || "";
    if (val.length > 0 && val.charAt(0) === '"' && val.charAt(val.length - 1) === '"') {
      val = val.substring(1, val.length - 1);
    }
    env[key] = val.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Error: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verify() {
  console.log("Verifying Supabase Storage & DB...");

  // Check product-images bucket
  const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('product-images');
  if (bucketError) {
    console.error("❌ Error fetching bucket 'product-images':", bucketError.message);
  } else {
    console.log("✅ Bucket 'product-images' exists. Public:", bucketData.public);
    if (!bucketData.public) {
       console.log("⚠️ Bucket is not public. Trying to update...");
       const { error: updateError } = await supabase.storage.updateBucket('product-images', { public: true });
       if (updateError) console.error("❌ Failed to update bucket:", updateError.message);
       else console.log("✅ Bucket updated to public successfully.");
    }
  }

  // Check contact_info
  const { data: contact, error: contactErr } = await supabase.from('contact_info').select('*').eq('is_active', true);
  if (contactErr) {
    console.error("❌ Error fetching contact_info:", contactErr.message);
  } else {
    console.log("✅ contact_info rows:", contact.length);
    if (contact.length > 0) {
      console.log("   Phone:", contact[0].phone_number);
      console.log("   Location:", contact[0].city, contact[0].state);
    }
  }

  // Check product_images urls
  const { data: pimages, error: piErr } = await supabase.from('product_images').select('image_url').limit(3);
  if (piErr) {
     console.error("❌ Error fetching product_images:", piErr.message);
  } else {
     console.log("✅ Sample product image URLs from DB:");
     pimages.forEach(p => console.log("   ->", p.image_url));
  }
}

verify();
