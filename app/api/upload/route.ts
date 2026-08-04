import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyToken } from "@/lib/auth";

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "video/mp4",
  "video/quicktime",
  "image/png",
  "image/jpeg",
]);

const MAX_SIZE = 25 * 1024 * 1024; // 25MB

export async function POST(req: Request) {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let auth;
  try {
    auth = verifyToken(token);
  } catch {
    return NextResponse.json({ error: "Invalid session." }, { status: 401 });
  }

  if (auth.role !== "lecturer" && auth.role !== "admin") {
    return NextResponse.json({ error: "Only lecturers can upload materials." }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Allowed: PDF, Word, PowerPoint, MP4/MOV video, PNG/JPG." },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File is too large. Max 25MB." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;

    const { data, error } = await supabaseAdmin.storage
      .from("materials")
      .upload(fileName, buffer, { contentType: file.type });

    if (error) throw error;

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("materials")
      .getPublicUrl(data.path);

    return NextResponse.json({
      fileUrl: publicUrlData.publicUrl,
      fileSize: file.size,
      fileMime: file.type,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
