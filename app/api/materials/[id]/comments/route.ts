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
  void req;
  const { id } = await params;

  const { data, error } = await supabaseAdmin
    .from("comments")
    .select("id, body, user_id, parent_id, created_at, users(full_name)")
    .eq("material_id", id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ comments: data });
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
  const body = await req.json();
  const { body: commentBody, parent_id } = body;

  if (!commentBody || !commentBody.trim()) {
    return NextResponse.json({ error: "Comment body is required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("comments")
    .insert({
      material_id: id,
      user_id: auth.id,
      body: commentBody,
      parent_id: parent_id || null,
    })
    .select("id, body, user_id, parent_id, created_at, users(full_name)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ comment: data });
}
