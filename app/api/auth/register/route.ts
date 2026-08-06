import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { hashPassword, signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { fullName, email, password, role, registrationNo, staffId } = await req.json();

    if (!fullName || !email || !password || !role) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }
    if (!["student", "lecturer"].includes(role)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }

    const { data: existing } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const status = role === "lecturer" ? "pending" : "active";

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .insert({
        full_name: fullName,
        email,
        password_hash: passwordHash,
        role,
        status,
        registration_no: registrationNo || null,
        staff_id: staffId || null,
      })
      .select("id, full_name, email, role, status")
      .single();

    if (error) throw error;

    if (role === "lecturer") {
      return NextResponse.json({
        message: "Account created. An administrator will verify your staff ID before you can log in.",
        user,
      });
    }

const token = signToken({ id: user.id, email: user.email, role: user.role });    return NextResponse.json({ token, user });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
