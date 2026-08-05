"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LecturerDashboard() {
  const router = useRouter();
  const { user, token, logout } = useAuth();

  const [courses, setCourses] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("notes");
  const [topic, setTopic] = useState("");
  const [courseId, setCourseId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
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
    if (token) fetchCourses();
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !courseId) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("type", type);
      formData.append("topic", topic);
      formData.append("courseId", courseId);
      formData.append("file", file);

      const res = await fetch("/api/materials", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      setTitle("");
      setDescription("");
      setTopic("");
      setCourseId("");
      setFile(null);
      alert("Material uploaded successfully.");
    } catch (err) {
      console.error(err);
      alert("Something went wrong uploading the material.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <header className="flex justify-between items-center px-6 py-4 border-b border-[#1B2A4A]/10">
        <div className="font-display text-lg font-bold text-[#1B2A4A]">StudyHub AI</div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#1B2A4A]/70">{user?.full_name}</span>
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

      <div className="px-6 py-8 max-w-3xl mx-auto">
        <h1 className="font-display text-2xl font-bold text-[#1B2A4A] mb-1">
          Upload course material
        </h1>
        <p className="text-[#1B2A4A]/60 mb-6">
          Share notes, slides, or assignments with your enrolled students.
        </p>

        {courses.length === 0 && !fetching && (
          <div className="p-4 mb-6 bg-[#C15B3E]/10 border border-[#C15B3E]/30 rounded-lg text-[#C15B3E] text-sm">
            You aren't assigned to any courses yet. Contact an admin to get set up before uploading material.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
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
    </div>
  );
}

