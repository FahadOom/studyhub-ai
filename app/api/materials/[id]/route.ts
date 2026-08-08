import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyToken } from "@/lib/auth";

function getAuth(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.replace("Bearer ", "");
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { data, error } = await supabaseAdmin
      .from("materials")
      .select(
        `id, title, description, type, topic, file_url, file_mime, file_size_bytes, view_count, download_count, created_at,
         uploaded_by, course_id,
         users:uploaded_by ( full_name ),
         courses:course_id ( code, title )`
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Material not found." }, { status: 404 });
    }

    const { count: likeCount } = await supabaseAdmin
      .from("material_likes")
      .select("*", { count: "exact", head: true })
      .eq("material_id", id);

    const material = {
      id: data.id,
      title: data.title,
      description: data.description,
      type: data.type,
      topic: data.topic,
      file_url: data.file_url,
      file_mime: data.file_mime,
      uploaded_by_name: (data as any).users?.full_name || "Unknown",
      course_code: (data as any).courses?.code || "",
      course_title: (data as any).courses?.title || "",
      like_count: likeCount || 0,
      created_at: data.created_at,
    };

    return NextResponse.json({ material });
  } catch (err) {
    console.error("GET /api/materials/[id] crashed:", err);
    return NextResponse.json({ error: "Server error loading material." }, { status: 500 });
  }
}
