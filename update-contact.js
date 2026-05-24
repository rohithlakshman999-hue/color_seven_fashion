const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, ".env.local");
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
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixContact() {
  console.log("Deleting all existing contact_info rows...");
  const { error: delErr } = await supabase.from('contact_info').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  if (delErr) {
    console.error("Delete error:", delErr);
  }

  console.log("Inserting fresh contact_info row...");
  const info = {
    whatsapp_number: '+91 8122228386',
    phone_number: '+91 8122228386',
    email: 'support@colourseven.com',
    address: '',
    city: 'Chennai',
    state: 'Thiruvottiyur',
    country: 'India',
    is_active: true
  };

  const { error: insErr } = await supabase.from('contact_info').insert(info);
  if (insErr) {
    console.error("Insert error:", insErr);
  } else {
    console.log("✅ Contact info successfully inserted!");
  }
}

fixContact();
