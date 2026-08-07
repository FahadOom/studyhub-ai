"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import NotificationBell from "@/components/NotificationBell";
import Link from "next/link";

type Material = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  topic: string | null;
  file_url: string;
  created_at: string;
  course_code: string;
  course_title: string;
  like_count: number;
  comment_count: number;
};

type Stats = {
  total_materials: number;
  total_likes: number;
  total_comments: number;
};

export default function LecturerDashboard() {
  const router = useRouter();
  const { user, token, logout } = useAuth();

  const [courses, setCourses] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  const [materials, setMaterials] = useState<Material[]>([]);
  const [stats, setStats] = useState<Stats>({ total_materials: 0, total_likes: 0, total_comments: 0 });
  const [materialsLoading, setMaterialsLoading] = useState(true);

  const [showUploadForm, setShowUploadForm] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("notes");
  const [topic, setTopic] = useState("");
  const [courseId, setCourseId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchCourses();
    fetchMaterials();
  }, [token]);

  async function fetchCourses() {
    try {
      const res = await fetch("/api/lecturer/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCourses(data.courses || []);
    } catch (err) {
      console.error("Failed to fetch courses", err);
    } finally {
      setFetching(false);
    }
  }

  async function fetchMaterials() {
    try {
      const res = await fetch("/api/lecturer/materials", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMaterials(data.materials);
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch materials", err);
    } finally {
      setMaterialsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !courseId) return;
    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: uploadFormData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "File upload failed");

      const res = await fetch("/api/materials", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          title,
          description,
          type,
          topic,
          fileUrl: uploadData.fileUrl,
          fileSize: uploadData.fileSize,
          fileMime: uploadData.fileMime,
        }),
      });

      if (!res.ok) throw new Error("Upload failed");

      setTitle("");
      setDescription("");
      setTopic("");
      setCourseId("");
      setFile(null);
      setShowUploadForm(false);
      await fetchMaterials();
    } catch (err) {
      console.error(err);
      alert("Something went wrong uploading the material.");
    } finally {
      setUploading(false);
    }
  }

  const typeLabels: Record<string, string> = {
    notes: "Notes",
    slides: "Slides",
    past_paper: "Past Paper",
    assignment: "Assignment",
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      <header className="flex justify-between items-center px-6 py-4 border-b border-[#1B2A4A]/10 bg-white">
        <div className="font-display text-lg font-bold text-[#1B2A4A]">
          StudyHub<span className="text-[#C89B3C]">AI</span>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <Link href="/profile" className="text-sm text-[#1B2A4A]/70 font-medium">
            {user?.full_name}
          </Link>
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="text-sm text-[#C15B3E] font-medium"
          >
            Log out
          </button>
        </div>
      </header>

      <div className="px-6 py-8 max-w-4xl mx-auto">
        <h1 className="font-display text-2xl font-bold text-[#1B2A4A] mb-1">
          Lecturer Dashboard
        </h1>
        <p className="text-[#1B2A4A]/60 mb-6">
          Manage your course materials and track engagement.
        </p>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-4">
            <div className="text-2xl font-bold text-[#1B2A4A]">{stats.total_materials}</div>
            <div className="text-xs text-[#1B2A4A]/50 mt-1">Materials</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-4">
            <div className="text-2xl font-bold text-[#C15B3E]">{stats.total_likes}</div>
            <div className="text-xs text-[#1B2A4A]/50 mt-1">Total Likes</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-4">
            <div className="text-2xl font-bold text-[#1B2A4A]">{stats.total_comments}</div>
            <div className="text-xs text-[#1B2A4A]/50 mt-1">Comments</div>
          </div>
        </div>

        {/* Assigned courses */}
        {!fetching && courses.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-[#1B2A4A]/70 mb-2">Your Courses</h2>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {courses.map((c) => (
                <span
                  key={c.id}
                  className="shrink-0 px-3 py-1.5 rounded-full bg-[#1B2A4A]/5 text-[#1B2A4A] text-xs font-medium"
                >
                  {c.code || c.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {courses.length === 0 && !fetching && (
          <div className="p-4 mb-6 bg-[#C15B3E]/10 border border-[#C15B3E]/30 rounded-lg text-[#C15B3E] text-sm">
            You aren't assigned to any courses yet. Contact an admin to get set up before uploading material.
          </div>
        )}

        {/* Upload toggle button */}
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="w-full mb-6 px-4 py-3 rounded-xl bg-[#1B2A4A] text-white text-sm font-medium flex items-center justify-center gap-2"
        >
          {showUploadForm ? "Cancel" : "+ Upload New Material"}
        </button>

        {/* Upload form (collapsible) */}
        {showUploadForm && (
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-6 mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full border border-[#1B2A4A]/20 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full border border-[#1B2A4A]/20 rounded-lg px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full border border-[#1B2A4A]/20 rounded-lg px-3 py-2"
                  >
                    <option value="notes">Notes</option>
                    <option value="slides">Slides</option>
                    <option value="past_paper">Past Paper</option>
                    <option value="assignment">Assignment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Topic</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full border border-[#1B2A4A]/20 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Course</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  required
                  className="w-full border border-[#1B2A4A]/20 rounded-lg px-3 py-2"
                >
                  <option value="">Select a course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1B2A4A] mb-1">File</label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                  className="w-full"
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="bg-[#1B2A4A] text-white px-5 py-2 rounded-lg font-medium disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload material"}
              </button>
            </form>
          </div>
        )}

        {/* Materials list */}
        <h2 className="text-sm font-semibold text-[#1B2A4A]/70 mb-3">Your Materials</h2>

        {materialsLoading && (
          <div className="text-[#1B2A4A]/50 text-sm">Loading materials...</div>
        )}

        {!materialsLoading && materials.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-6 text-sm text-[#1B2A4A]/50 text-center">
            No materials uploaded yet. Use the button above to share your first one.
          </div>
        )}

        <div className="space-y-3">
          {materials.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <span className="inline-block px-2 py-0.5 mb-2 text-xs font-medium bg-[#1B2A4A]/5 text-[#1B2A4A]/70 rounded">
                    {m.course_code} · {typeLabels[m.type] || m.type}
                  </span>
                  <h3 className="font-semibold text-[#1B2A4A] mb-1">{m.title}</h3>
                  {m.description && (
                    <p className="text-sm text-[#1B2A4A]/60 line-clamp-2">{m.description}</p>
                  )}
                  <p className="text-xs text-[#1B2A4A]/40 mt-2">
                    {new Date(m.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-xs text-[#1B2A4A]/50 whitespace-nowrap shrink-0 flex flex-col items-end gap-1">
                  <span>♥ {m.like_count}</span>
                  <span>💬 {m.comment_count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
