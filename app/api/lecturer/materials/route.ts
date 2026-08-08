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

export async function GET(req: NextRequest) {
  const auth = getAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("materials")
      .select(
        `id, title, description, type, topic, file_url, created_at, course_id,
         courses:course_id ( code, title )`
      )
      .eq("uploaded_by", auth.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const materialIds = (data || []).map((m: any) => m.id);

    let likeCounts: Record<string, number> = {};
    let commentCounts: Record<string, number> = {};

    if (materialIds.length > 0) {
      const { data: likes } = await supabaseAdmin
        .from("material_likes")
        .select("material_id")
        .in("material_id", materialIds);

      const { data: comments } = await supabaseAdmin
        .from("comments")
        .select("material_id")
        .in("material_id", materialIds);

      likeCounts = (likes || []).reduce((acc: Record<string, number>, l: any) => {
        acc[l.material_id] = (acc[l.material_id] || 0) + 1;
        return acc;
      }, {});

      commentCounts = (comments || []).reduce((acc: Record<string, number>, c: any) => {
        acc[c.material_id] = (acc[c.material_id] || 0) + 1;
        return acc;
      }, {});
    }

    const materials = (data || []).map((m: any) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      type: m.type,
      topic: m.topic,
      file_url: m.file_url,
      created_at: m.created_at,
      course_code: m.courses?.code || "",
      course_title: m.courses?.title || "",
      like_count: likeCounts[m.id] || 0,
      comment_count: commentCounts[m.id] || 0,
    }));

    const stats = {
      total_materials: materials.length,
      total_likes: materials.reduce((sum, m) => sum + m.like_count, 0),
      total_comments: materials.reduce((sum, m) => sum + m.comment_count, 0),
    };

    return NextResponse.json({ materials, stats });
  } catch (err) {
    console.error("GET /api/lecturer/materials crashed:", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
