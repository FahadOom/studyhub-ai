import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyToken } from "@/lib/auth";

async function requireAdmin(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.replace("Bearer ", "");
  try {
    const payload = verifyToken(token);
    if (payload.role !== "admin") return null;
    return payload;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const flaggedOnly = searchParams.get("flagged") === "true";

  let query = supabaseAdmin
    .from("materials")
    .select(
      `id, title, description, type, is_flagged, created_at,
       uploaded_by, course_id,
       users:uploaded_by ( full_name, email ),
       courses:course_id ( code, title )`
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (flaggedOnly) query = query.eq("is_flagged", true);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const materials = (data || []).map((m: any) => ({
    id: m.id,
    title: m.title,
    description: m.description,
    type: m.type,
    is_flagged: m.is_flagged,
    created_at: m.created_at,
    uploaded_by_name: m.users?.full_name || "Unknown",
    uploaded_by_email: m.users?.email || "",
    course_code: m.courses?.code || "",
    course_title: m.courses?.title || "",
  }));

  return NextResponse.json({ materials });
}
