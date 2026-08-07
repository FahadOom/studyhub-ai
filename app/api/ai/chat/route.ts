import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
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

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  const auth = getAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { question, context } = body;

  if (!question || !question.trim()) {
    return NextResponse.json({ error: "Question is required" }, { status: 400 });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const systemPrompt = context
      ? `You are a helpful study assistant. Answer the student's question based on this material context:\n\n${context}\n\nBe concise and clear.`
      : "You are a helpful study assistant. Answer the student's question clearly and concisely.";

    const result = await model.generateContent(`${systemPrompt}\n\nStudent question: ${question}`);
    const answer = result.response.text();

    return NextResponse.json({ answer });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "AI request failed" }, { status: 500 });
  }
}
