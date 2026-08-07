import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
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

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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
    const systemPrompt = context
      ? `You are a helpful study assistant. Answer the student's question based on this material context:\n\n${context}\n\nBe concise and clear.`
      : "You are a helpful study assistant. Answer the student's question clearly and concisely.";

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: question }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    const answer = textBlock && "text" in textBlock ? textBlock.text : "";

    return NextResponse.json({ answer });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "AI request failed" }, { status: 500 });
  }
}
