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
  const { id } = await params;

  const { count } = await supabaseAdmin
    .from("material_likes")
    .select("*", { count: "exact", head: true })
    .eq("material_id", id);

  let liked = false;
  if (auth) {
    const { data } = await supabaseAdmin
      .from("material_likes")
      .select("material_id")
      .eq("material_id", id)
      .eq("student_id", auth.id)
      .maybeSingle();
    liked = !!data;
  }

  return NextResponse.json({ count: count || 0, liked });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { data: existing } = await supabaseAdmin
    .from("material_likes")
    .select("material_id")
    .eq("material_id", id)
    .eq("student_id", auth.id)
    .maybeSingle();

  if (existing) {
    await supabaseAdmin
      .from("material_likes")
      .delete()
      .eq("material_id", id)
      .eq("student_id", auth.id);
    return NextResponse.json({ liked: false });
  } else {
    await supabaseAdmin
      .from("material_likes")
      .insert({ material_id: id, student_id: auth.id });
    return NextResponse.json({ liked: true });
  }
}
