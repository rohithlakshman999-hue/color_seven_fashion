import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "Supabase service role configuration is missing. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your environment."
  );
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

const ALLOWED_BUCKETS = [
  "product-images",
  "category-images",
  "brand-logos",
  "brand-banners",
] as const;

type AllowedBucket = (typeof ALLOWED_BUCKETS)[number];

async function ensureBucket(bucket: AllowedBucket) {
  const { data, error } = await supabaseAdmin.storage.getBucket(bucket);
  if (error) {
    const message = error.message?.toLowerCase() || "";
    if (message.includes("not found") || message.includes("could not find")) {
      const { error: createError } = await supabaseAdmin.storage.createBucket(bucket, {
        public: true,
      });
      if (createError) {
        throw new Error(createError.message || `Unable to create bucket ${bucket}`);
      }
      return;
    }
    throw new Error(error.message || `Unable to check bucket ${bucket}`);
  }

  if (data && data.public === false) {
    const { error: updateError } = await supabaseAdmin.storage.updateBucket(bucket, {
      public: true,
    });
    if (updateError) {
      throw new Error(updateError.message || `Unable to make bucket ${bucket} public`);
    }
  }

  return data;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const bucket = formData.get("bucket");
  const path = formData.get("path");
  const file = formData.get("file") as File | null;
  const remoteUrl = formData.get("url") as string | null;

  try {
    console.log("[upload-image] request received", { bucket, path, hasFile: !!file, remoteUrl: !!remoteUrl });
  } catch (e) {
    // ignore logging errors
  }

  if (!bucket || !path || (!file && !remoteUrl)) {
    return NextResponse.json(
      { error: "Missing upload parameters. bucket, path, and file or url are required." },
      { status: 400 }
    );
  }

  if (!ALLOWED_BUCKETS.includes(bucket as AllowedBucket)) {
    return NextResponse.json(
      { error: `Bucket ${bucket} is not allowed for admin image uploads.` },
      { status: 400 }
    );
  }

  try {
    await ensureBucket(bucket as AllowedBucket);

    // If client provided a remote URL, fetch it server-side and upload the bytes
    if (remoteUrl) {
      let res;
      try {
        res = await fetch(remoteUrl);
      } catch (err) {
        return NextResponse.json({ error: `Failed to fetch remote URL: ${err instanceof Error ? err.message : String(err)}` }, { status: 400 });
      }

      if (!res.ok) {
        const bodyText = await res.text().catch(() => "");
        return NextResponse.json({ error: `Failed to fetch remote URL: ${res.status} ${res.statusText}. ${bodyText.slice(0,200)}` }, { status: 400 });
      }

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.startsWith("image/")) {
        return NextResponse.json({ error: `Remote URL did not return an image. Content-Type: ${contentType}` }, { status: 400 });
      }

      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabaseAdmin.storage
        .from(bucket as AllowedBucket)
        .upload(path as string, buffer, { contentType });

      if (uploadError) {
        return NextResponse.json(
          { error: uploadError.message || "Storage upload failed." },
          { status: 500 }
        );
      }

      const { data } = await supabaseAdmin.storage
        .from(bucket as AllowedBucket)
        .getPublicUrl(path as string);

      if (!data?.publicUrl) {
        return NextResponse.json(
          { error: "Failed to get public image URL." },
          { status: 500 }
        );
      }

      return NextResponse.json({ publicUrl: data.publicUrl });
    }

    // Otherwise fall back to file upload from formData
    if (!file) {
      return NextResponse.json(
        { error: "Missing upload parameters. file or url is required." },
        { status: 400 }
      );
    }

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket as AllowedBucket)
      .upload(path as string, file);

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message || "Storage upload failed." },
        { status: 500 }
      );
    }

    const { data } = await supabaseAdmin.storage
      .from(bucket as AllowedBucket)
      .getPublicUrl(path as string);

    if (!data?.publicUrl) {
      return NextResponse.json(
        { error: "Failed to get public image URL." },
        { status: 500 }
      );
    }

    return NextResponse.json({ publicUrl: data.publicUrl });
  } catch (error) {
    try {
      console.error("[upload-image] error:", error);
    } catch (_) {}
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown server error." },
      { status: 500 }
    );
  }
}
