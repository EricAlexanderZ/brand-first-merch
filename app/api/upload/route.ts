import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * Accepted artwork, keyed by extension, with the content type it is stored as.
 *
 * Keyed by extension because browsers report Illustrator and EPS files
 * inconsistently: often "application/postscript", sometimes
 * "application/octet-stream", sometimes nothing. Checking the reported type
 * rejected exactly the files a print shop most wants. Both are stored as
 * application/postscript, which the Artwork bucket allows.
 */
const ALLOWED: Record<string, string> = {
  png:  "image/png",
  jpg:  "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  svg:  "image/svg+xml",
  pdf:  "application/pdf",
  ai:   "application/postscript",
  eps:  "application/postscript",
};
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const file = form.get("file") as File | null;
  // Customer uploads only ever go to Artwork. Proofs are uploaded by the admin
  // through their own route, so this one does not let the caller pick a bucket.
  const bucket = "Artwork";

  if (!file) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large. Max 10 MB." }, { status: 400 });
  }

  const ext         = (file.name.split(".").pop() ?? "").toLowerCase();
  const contentType = ALLOWED[ext];
  if (!contentType) {
    return NextResponse.json(
      { error: "Please upload a PNG, JPG, PDF, AI, EPS or SVG file." },
      { status: 400 }
    );
  }
  const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const bytes  = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, buffer, { contentType });

  if (error) {
    console.error("[api/upload] Supabase error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
