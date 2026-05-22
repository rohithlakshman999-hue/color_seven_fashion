export type AdminUploadBucket =
  | "product-images"
  | "category-images"
  | "brand-logos"
  | "brand-banners";

export async function uploadAdminImage(
  file: File,
  bucket: AdminUploadBucket,
  folder: string
): Promise<string> {
  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const path = `${folder}/${fileName}`;

  const formData = new FormData();
  formData.append("bucket", bucket);
  formData.append("path", path);
  formData.append("file", file);

  const response = await fetch("/api/upload-image", {
    method: "POST",
    body: formData,
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body?.error || "Upload failed");
  }

  return body.publicUrl as string;
}

export async function uploadAdminRemoteUrl(
  url: string,
  bucket: AdminUploadBucket,
  folder: string
): Promise<string> {
  const fileName = `${Date.now()}-${url.split("/").pop() || "remote"}`;
  const path = `${folder}/${fileName}`;

  const formData = new FormData();
  formData.append("bucket", bucket);
  formData.append("path", path);
  formData.append("url", url);

  const response = await fetch("/api/upload-image", {
    method: "POST",
    body: formData,
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body?.error || "Upload failed");
  }

  return body.publicUrl as string;
}
