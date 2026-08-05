import { NextRequest, NextResponse } from "next";
import { supabaseAdmin } from "../../../../lib/supabase";
import { verifyToken } from "../../../../lib/auth";

async function auth(req: NextRequest) {
  const h = req.headers.get("Authorization");
  if (!h) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const token = h.replace("Bearer ", "");
    const payload = verifyToken(token);
    if (payload.role !== "admin") throw new Error();
    return payload;
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await auth(req);
  if (admin instanceof NextResponse) return admin;
  const { id } = await params;
  const body = await req.json();
  const { data, error } = await supabaseAdmin
    .from("courses")
    .update(body)
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await auth(req);
  if (admin instanceof NextResponse) return admin;
  const { id } = await params;
  const { error } = await supabaseAdmin.from("courses").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
