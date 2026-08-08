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

  const { data, error } = await supabaseAdmin
    .from("announcements")
    .select("id, title, body, course_id, created_at, users:posted_by ( full_name )")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const announcements = (data || []).map((a: any) => ({
    id: a.id,
    title: a.title,
    body: a.body,
    course_id: a.course_id,
    created_at: a.created_at,
    posted_by_name: a.users?.full_name || "Admin",
  }));

  return NextResponse.json({ announcements });
}

export async function POST(req: NextRequest) {
  const auth = getAuth(req);
  if (!auth || auth.role !== "admin") {
    return NextResponse.json({ error: "Only admins can post announcements" }, { status: 403 });
  }

  const body = await req.json();
  const { title, announcementBody, courseId } = body;

  if (!title || !announcementBody) {
    return NextResponse.json({ error: "Title and body are required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("announcements")
    .insert({
      title,
      body: announcementBody,
      course_id: courseId || null,
      posted_by: auth.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Notify all students (broad platform-wide notify)
  const { data: students } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("role", "student")
    .eq("status", "active");

  if (students && students.length > 0) {
    const notifications = students.map((s: any) => ({
      user_id: s.id,
      type: "announcement",
      title: `Announcement: ${title}`,
      body: announcementBody.slice(0, 100),
      link_url: null,
      is_read: false,
    }));
    await supabaseAdmin.from("notifications").insert(notifications);
  }

  return NextResponse.json({ announcement: data });
}
