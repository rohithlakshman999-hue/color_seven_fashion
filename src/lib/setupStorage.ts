import { supabase, isSupabaseConfigured } from "./supabase";
export { isSupabaseConfigured };

export interface StorageBucket {
  id: string;
  name: string;
  public: boolean;
  file_size_limit: number;
  allowed_mime_types: string[];
}

const REQUIRED_BUCKETS: StorageBucket[] = [
  {
    id: "product-images",
    name: "product-images",
    public: true,
    file_size_limit: 5242880, // 5MB
    allowed_mime_types: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },
  {
    id: "category-images",
    name: "category-images",
    public: true,
    file_size_limit: 5242880, // 5MB
    allowed_mime_types: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },
  {
    id: "brand-logos",
    name: "brand-logos",
    public: true,
    file_size_limit: 2097152, // 2MB
    allowed_mime_types: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
  },
  {
    id: "brand-banners",
    name: "brand-banners",
    public: true,
    file_size_limit: 5242880, // 5MB
    allowed_mime_types: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },
];

export async function checkStorageBuckets(): Promise<{
  configured: boolean;
  missing: string[];
  errors: string[];
}> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      configured: false,
      missing: REQUIRED_BUCKETS.map((b) => b.id),
      errors: ["Supabase is not configured. Check your .env.local file."],
    };
  }

  const missing: string[] = [];
  const errors: string[] = [];

  for (const bucket of REQUIRED_BUCKETS) {
    try {
      const { data, error } = await supabase.storage.getBucket(bucket.id);

      if (error || !data) {
        missing.push(bucket.id);
      }
    } catch (err) {
      errors.push(`Error checking bucket ${bucket.id}: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }

  return {
    configured: true,
    missing,
    errors,
  };
}

export async function setupStorageBuckets(): Promise<{
  success: boolean;
  created: string[];
  errors: string[];
  message: string;
}> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      created: [],
      errors: ["Supabase is not configured"],
      message: "ERROR: Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local",
    };
  }

  const created: string[] = [];
  const errors: string[] = [];

  for (const bucket of REQUIRED_BUCKETS) {
    try {
      // Check if bucket exists
      const { data: existing } = await supabase.storage.getBucket(bucket.id);

      if (existing) {
        continue; // Bucket already exists
      }

      // Create bucket
      const { data, error } = await supabase.storage.createBucket(bucket.id, {
        public: bucket.public,
      });

      if (error) {
        errors.push(`Failed to create bucket ${bucket.id}: ${error.message}`);
      } else {
        created.push(bucket.id);
      }
    } catch (err) {
      errors.push(`Error with bucket ${bucket.id}: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }

  const allExist = (await checkStorageBuckets()).missing.length === 0;

  return {
    success: allExist,
    created,
    errors,
    message: allExist
      ? `✓ All storage buckets are ready! (${created.length} created, others already existed)`
      : `⚠ Some buckets could not be created. Please create them manually in Supabase dashboard.\n\nMissing: ${(await checkStorageBuckets()).missing.join(", ")}`,
  };
}
