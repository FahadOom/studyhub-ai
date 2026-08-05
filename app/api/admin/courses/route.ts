import { NextRequest, NextResponse } from "next";
import { supabaseAdmin } from "../../../lib/supabase";
import { verifyToken } from "../../../lib/auth";

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

export async function GET(req: NextRequest) {
  const admin = await auth(req);
  if (admin instanceof NextResponse) return admin;
  const { data, error } = await supabaseAdmin
    .from("courses")
    .select(`*, department:departments (id, name, faculty:faculties (id, name))`)
    .order("code");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const admin = await auth(req);
  if (admin instanceof NextResponse) return admin;
  const body = await req.json();
  if (!body.department_id || !body.code || !body.title) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const { data, error } = await supabaseAdmin
    .from("courses")
    .insert({ ...body, code: body.code.toUpperCase().trim(), created_by: admin.id })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
