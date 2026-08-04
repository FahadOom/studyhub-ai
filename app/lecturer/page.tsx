"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type Course = { id: string; code: string; title: string };
type Material = {
  id: string;
  title: string;
  type: string;
  course_code: string;
  created_at: string;
};

export default function LecturerDashboard() {
  const { user, token, loading, logout } = useAuth();
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [fetching, setFetching] = useState(true);

  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("note");
  const [topic, setTopic] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && (!user || (user.role !== "lecturer" && user.role !== "admin"))) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!token) return;
    loadData();
  }, [token]);

  async function loadData() {
    setFetching(true);
    try {
      const [coursesRes, materialsRes] = await Promise.all([
        fetch("/api/lecturer/courses", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/materials", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const coursesData = await coursesRes.json();
      const materialsData = await materialsRes.json();
      setCourses(coursesData.courses || []);
      setMaterials(materialsData.materials || []);
      if (coursesData.courses?.length > 0 && !courseId) {
        setCourseId(coursesData.courses[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!file) {
      setError("Please choose a file to upload.");
      return;
    }
    if (!courseId) {
      setError("Please select a course.");
      return;
    }

    setUploading(true);
    try {
      // Step 1: upload the file itself
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        setError(uploadData.error || "Upload failed.");
        setUploading(false);
        return;
      }

      // Step 2: save the material record
      const materialRes = await fetch("/api/materials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
      const materialData = await materialRes.json();

      if (!materialRes.ok) {
        setError(materialData.error || "Could not save material.");
        setUploading(false);
        return;
      }

      setMessage("Material uploaded successfully.");
      setTitle("");
      setDescription("");
      setTopic("");
      setFile(null);
      loadData();
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  if (loading || !user) {
    return (
      <main className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
        <p className="text-[#1B2A4A]/50">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F4]">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#1B2A4A]/10 bg-white">
        <div className="font-display text-lg font-bold text-[#1B2A4A]">
          StudyHub<span className="text-[#C89B3C]">AI</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#1B2A4A]/70">{user.full_name}</span>
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
          <div className="p-4 mb-6 bg-[#C15B3E]/10
