import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyToken } from "@/lib/auth";

function getAuthUser(req: Request) {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

// ---------- GET /api/materials ----------
export async function GET(req: Request) {
  const auth = getAuthUser(req);
  if (!auth) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  const search = searchParams.get("search");
  const type = searchParams.get("type");

  let query = supabaseAdmin
    .from("materials")
    .select(
      `id, title, description, type, topic, file_url, file_size_bytes, view_count, download_count, created_at,
       uploaded_by, course_id,
       users:uploaded_by ( full_name ),
       courses:course_id ( code, title )`
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (courseId) query = query.eq("course_id", courseId);
  if (type) query = query.eq("type", type);
  if (search) query = query.ilike("title", `%${search}%`);

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load materials." }, { status: 500 });
  }

  // Flatten the joined fields into the shape the frontend expects
  const materials = (data || []).map((m: any) => ({
    id: m.id,
    title: m.title,
    description: m.description,
    type: m.type,
    topic: m.topic,
    file_url: m.file_url,
    file_size_bytes: m.file_size_bytes,
    view_count: m.view_count,
    download_count: m.download_count,
    created_at: m.created_at,
    uploaded_by_name: m.users?.full_name || "Unknown",
    course_code: m.courses?.code || "",
    course_title: m.courses?.title || "",
    like_count: 0,
    comment_count: 0,
  }));

  return NextResponse.json({ materials });
}

// ---------- POST /api/materials (lecturer/admin only, metadata — file upload comes next) ----------
export async function POST(req: Request) {
  const auth = getAuthUser(req);
  if (!auth) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  if (auth.role !== "lecturer" && auth.role !== "admin") {
    return NextResponse.json({ error: "Only lecturers can upload materials." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { courseId, title, description, type, topic, fileUrl, fileSize, fileMime } = body;

    if (!courseId || !title || !type || !fileUrl) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("materials")
      .insert({
        course_id: courseId,
        
uploaded_by: auth.id,
        title,
        description: description || null,
        type,
        topic: topic || null,
        file_url: fileUrl,
        file_size_bytes: fileSize || null,
        file_mime: fileMime || null,
        virus_scanned: false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ material: data }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not create material." }, { status: 500 });
  }
}

