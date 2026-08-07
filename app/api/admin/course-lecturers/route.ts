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

  const { data, error } = await supabaseAdmin
    .from("course_lecturers")
    .select("course_id, lecturer_id, courses(code, title), users(full_name, email)");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ assignments: data });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { course_id, lecturer_id } = body;

  if (!course_id || !lecturer_id) {
    return NextResponse.json({ error: "course_id and lecturer_id are required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("course_lecturers")
    .insert({ course_id, lecturer_id })
    .select("course_id, lecturer_id, courses(code, title), users(full_name, email)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ assignment: data });
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const course_id = searchParams.get("course_id");
  const lecturer_id = searchParams.get("lecturer_id");

  if (!course_id || !lecturer_id) {
    return NextResponse.json({ error: "course_id and lecturer_id are required" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("course_lecturers")
    .delete()
    .eq("course_id", course_id)
    .eq("lecturer_id", lecturer_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
