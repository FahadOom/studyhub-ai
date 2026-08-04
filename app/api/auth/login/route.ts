import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { comparePassword, signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const { data: user } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (!user || !(await comparePassword(password, user.password_hash))) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    if (user.status === "suspended") {
      return NextResponse.json({ error: "This account has been suspended." }, { status: 403 });
    }
    if (user.status === "pending") {
      return NextResponse.json({ error: "Your account is still pending verification." }, { status: 403 });
    }
    if (user.status === "rejected") {
      return NextResponse.json({ error: "Your account application was not approved." }, { status: 403 });
    }

    const token = signToken({ sub: user.id, role: user.role });
    const { password_hash, ...safeUser } = user;

    return NextResponse.json({ token, user: safeUser });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
