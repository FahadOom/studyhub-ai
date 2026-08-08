"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

import NotificationBell from "@/components/NotificationBell";
type Material = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  topic: string | null;
  course_code: string;
  course_title: string;
  uploaded_by_name: string;
  like_count: number;
  comment_count: number;
  created_at: string;
};

export default function StudentDashboard() {
  const { user, token, loading, logout } = useAuth();
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!loading && (!user || user.role !== "student")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!token) return;
    fetchMaterials();
  }, [token]);

  async function fetchMaterials(searchTerm = "") {
    setFetching(true);
    try {
      const url = searchTerm
        ? `/api/materials?search=${encodeURIComponent(searchTerm)}`
        : "/api/materials";
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMaterials(data.materials || []);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchMaterials(search);
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
          <Link href="/student/courses" className="text-sm text-[#1B2A4A]/70 font-medium">
            Browse Courses
          </Link>
          <NotificationBell />
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

      <div className="px-6 py-8 max-w-4xl mx-auto">
        <h1 className="font-display text-2xl font-bold text-[#1B2A4A] mb-1">
          Your course materials
        </h1>
        <p className="text-[#1B2A4A]/60 mb-6">
          Everything your lecturers have shared, in one searchable place.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes, slides, topics…"
            className="input flex-1"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#1B2A4A] text-white rounded-md text-sm font-medium"
          >
            Search
          </button>
        </form>

        {fetching ? (
          <p className="text-[#1B2A4A]/50">Loading materials…</p>
        ) : materials.length === 0 ? (
          <div className="text-center py-16 bg-white border border-[#1B2A4A]/10 rounded-lg">
            <p className="text-[#1B2A4A]/60">
              No materials yet. Once you're enrolled in a course and your
              lecturer uploads something, it'll show up here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {materials.map((m) => (
              <Link
                key={m.id}
                href={`/student/materials/${m.id}`}
                className="block p-5 bg-white border border-[#1B2A4A]/10 rounded-lg hover:border-[#C89B3C]/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-block px-2 py-0.5 mb-2 text-xs font-medium bg-[#1B2A4A]/5 text-[#1B2A4A]/70 rounded">
                      {m.course_code} · {m.type}
                    </span>
                    <h3 className="font-semibold text-[#1B2A4A] mb-1">{m.title}</h3>
                    {m.description && (
                      <p className="text-sm text-[#1B2A4A]/60 line-clamp-2">
                        {m.description}
                      </p>
                    )}
                    <p className="text-xs text-[#1B2A4A]/40 mt-2">
                      {m.uploaded_by_name}
                    </p>
                  </div>
                  <div className="text-xs text-[#1B2A4A]/40 whitespace-nowrap">
                    ♥ {m.like_count} · 💬 {m.comment_count}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

