"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

type Material = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  topic: string | null;
  file_url: string;
  course_code?: string;
  uploaded_by_name?: string;
  like_count: number;
  comment_count: number;
  created_at: string;
};

type Comment = {
  id: string;
  body: string;
  user_id: string;
  parent_id: string | null;
  created_at: string;
  users?: { full_name: string } | null;
};

export default function MaterialDetailPage() {
  const params = useParams();
  const { user, token } = useAuth();
  const materialId = params.id as string;

  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  async function askAI(e: React.FormEvent) {
    e.preventDefault();
    if (!aiQuestion.trim()) return;
    setAiLoading(true);
    setAiError("");
    setAiAnswer("");
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: aiQuestion,
          context: material ? `Material: ${material.title}. ${material.description || ""}` : "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI request failed");
      setAiAnswer(data.answer);
    } catch (err: any) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  }

  useEffect(() => {
    if (!materialId) return;
    fetchMaterial();
    fetchComments();
    fetchLikeStatus();
  }, [materialId]);

  async function fetchLikeStatus() {
    const res = await fetch(`/api/materials/${materialId}/like`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      setLiked(data.liked);
      setLikeCount(data.count);
    }
  }

  async function fetchMaterial() {
    try {
      const res = await fetch(`/api/materials/${materialId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load material");
      setMaterial(data.material);
      setLikeCount(data.material.like_count || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchComments() {
    try {
      const res = await fetch(`/api/materials/${materialId}/comments`);
      const data = await res.json();
      if (res.ok) setComments(data.comments);
    } catch (err) {
      console.error(err);
    } finally {
      setCommentsLoading(false);
    }
  }

  async function postComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setPosting(true);
    const res = await fetch(`/api/materials/${materialId}/comments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ body: newComment }),
    });
    if (res.ok) {
      setNewComment("");
      await fetchComments();
    }
    setPosting(false);
  }

  async function deleteComment(id: string) {
    if (!confirm("Delete this comment?")) return;
    const res = await fetch(`/api/comments/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) await fetchComments();
  }

  async function toggleLike() {
    const prevLiked = liked;
    setLiked(!prevLiked);
    setLikeCount((prev) => (prevLiked ? prev - 1 : prev + 1));

    const res = await fetch(`/api/materials/${materialId}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      setLiked(prevLiked);
      setLikeCount((prev) => (prevLiked ? prev + 1 : prev - 1));
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
        <p className="text-[#1B2A4A]/50 text-sm">Loading...</p>
      </main>
    );
  }

  if (error || !material) {
    return (
      <main className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
        <p className="text-rose-600 text-sm">{error || "Material not found"}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F4]">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#1B2A4A]/10 bg-white">
        <div className="font-display text-lg font-bold text-[#1B2A4A]">
          StudyHub<span className="text-[#C89B3C]">AI</span>
        </div>
        <Link href="/student" className="text-sm text-[#1B2A4A]/70 font-medium">
          ← Back
        </Link>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-6 mb-6">
          <span className="inline-block px-2 py-0.5 mb-2 text-xs font-medium bg-[#1B2A4A]/5 text-[#1B2A4A]/70 rounded">
            {material.course_code} · {material.type}
          </span>
          <h1 className="text-xl font-bold text-[#1B2A4A] mb-2">{material.title}</h1>
          {material.description && (
            <p className="text-sm text-[#1B2A4A]/60 mb-4">{material.description}</p>
          )}
          <p className="text-xs text-[#1B2A4A]/40 mb-4">
            Uploaded by {material.uploaded_by_name}
          </p>

          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={toggleLike}
              className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition ${
                liked
                  ? "bg-rose-50 text-rose-600"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {liked ? "♥" : "♡"} {likeCount}
            </button>
            <span className="text-sm text-[#1B2A4A]/50">
              💬 {comments.length}
            </span>
          </div>

          <a
            href={material.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 rounded-lg bg-[#1B2A4A] text-white text-sm font-medium"
          >
            Open Material
          </a>
        </div>

        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-6">
          <h2 className="text-sm font-semibold text-[#1B2A4A] mb-4">Comments</h2>

          <form onSubmit={postComment} className="flex gap-2 mb-6">
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-black/10 text-sm outline-none focus:ring-2 focus:ring-[#1B2A4A]/20"
            />
            <button
              type="submit"
              disabled={posting || !newComment.trim()}
              className="px-4 py-2 rounded-lg bg-[#1B2A4A] text-white text-sm font-medium disabled:opacity-50"
            >
              {posting ? "..." : "Post"}
            </button>
          </form>

          {commentsLoading && (
            <p className="text-sm text-[#1B2A4A]/50">Loading comments...</p>
          )}

          {!commentsLoading && comments.length === 0 && (
            <p className="text-sm text-[#1B2A4A]/50">
              No comments yet. Be the first to comment!
            </p>
          )}

          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c.id} className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="text-sm font-medium text-[#1B2A4A]">
                    {c.users?.full_name || "Unknown"}
                  </div>
                  <div className="text-sm text-[#1B2A4A]/70 mt-0.5">{c.body}</div>
                  <div className="text-[10px] text-[#1B2A4A]/40 mt-1">
                    {new Date(c.created_at).toLocaleDateString()}
                  </div>
                </div>
                {user && (c.user_id === user.id || user.role === "admin") && (
                  <button
                    onClick={() => deleteComment(c.id)}
                    className="text-xs text-rose-600 font-medium shrink-0"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-6 mt-6">
          <h2 className="text-sm font-semibold text-[#1B2A4A] mb-4">Ask AI about this material</h2>
          <form onSubmit={askAI} className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Ask a question..."
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-black/10 text-sm outline-none focus:ring-2 focus:ring-[#1B2A4A]/20"
            />
            <button
              type="submit"
              disabled={aiLoading || !aiQuestion.trim()}
              className="px-4 py-2 rounded-lg bg-[#C15B3E] text-white text-sm font-medium disabled:opacity-50"
            >
              {aiLoading ? "..." : "Ask"}
            </button>
          </form>
          {aiError && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-sm ring-1 ring-rose-200 mb-3">
              {aiError}
            </div>
          )}
          {aiAnswer && (
            <div className="p-4 rounded-lg bg-[#1B2A4A]/[0.03] text-sm text-[#1B2A4A]/80 whitespace-pre-wrap">
              {aiAnswer}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
