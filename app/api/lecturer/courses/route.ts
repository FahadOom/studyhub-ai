import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
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

  if (auth.role === "admin") {
    // Admins can see all courses
    const { data, error } = await supabaseAdmin
      .from("courses")
      .select("id, code, title")
      .order("code");
    if (error) return NextResponse.json({ error: "Could not load courses." }, { status: 500 });
    return NextResponse.json({ courses: data });
  }

  if (auth.role !== "lecturer") {
    return NextResponse.json({ error: "Only lecturers can view this." }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from("course_lecturers")
    .select("courses ( id, code, title )")
.eq("lecturer_id", auth.id);
  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load courses." }, { status: 500 });
  }

  const courses = (data || []).map((row: any) => row.courses).filter(Boolean);
  return NextResponse.json({ courses });
}

