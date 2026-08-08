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

const TYPE_META: Record<string, { label: string; icon: string; color: string }> = {
  notes: { label: "Notes", icon: "📝", color: "bg-blue-50 text-blue-700" },
  slides: { label: "Slides", icon: "📊", color: "bg-purple-50 text-purple-700" },
  past_paper: { label: "Past Paper", icon: "📄", color: "bg-amber-50 text-amber-700" },
  assignment: { label: "Assignment", icon: "✍️", color: "bg-emerald-50 text-emerald-700" },
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "notes", label: "Notes" },
  { key: "slides", label: "Slides" },
  { key: "past_paper", label: "Past Papers" },
  { key: "assignment", label: "Assignments" },
];

export default function StudentDashboard() {
  const { user, token, loading, logout } = useAuth();
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

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

  const filteredMaterials =
    activeFilter === "all" ? materials : materials.filter((m) => m.type === activeFilter);

  if (loading || !user) {
    return (
      <main className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
        <p className="text-[#1B2A4A]/50">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F4]">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-[#1B2A4A]/10">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="font-display text-lg font-bold text-[#1B2A4A]">
            StudyHub<span className="text-[#C89B3C]">AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/student/courses" className="text-sm text-[#1B2A4A]/70 font-medium hidden sm:block">
              Browse Courses
            </Link>
            <NotificationBell />
            <Link href="/profile" className="h-8 w-8 rounded-full bg-[#1B2A4A]/10 flex items-center justify-center text-xs font-bold text-[#1B2A4A]">
              {user.full_name?.charAt(0).toUpperCase() || "?"}
            </Link>
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="text-sm text-[#C15B3E] font-medium hidden sm:block"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1B2A4A] to-[#1B2A4A]/90 px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-1">
            Welcome back, {user.full_name?.split(" ")[0]}
          </h1>
          <p className="text-white/60 mb-6">
            Everything your lecturers have shared, in one searchable place.
          </p>

          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes, slides, topics…"
              className="flex-1 px-4 py-2.5 rounded-xl border-0 outline-none focus:ring-2 focus:ring-[#C89B3C] text-sm"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#C89B3C] text-[#1B2A4A] rounded-xl text-sm font-semibold"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="px-6 py-6 max-w-4xl mx-auto">
        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition ${
                activeFilter === f.key
                  ? "bg-[#1B2A4A] text-white"
                  : "bg-white text-[#1B2A4A]/70 ring-1 ring-black/5"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {fetching ? (
          <p className="text-[#1B2A4A]/50 text-sm">Loading materials…</p>
        ) : filteredMaterials.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm ring-1 ring-black/5">
            <p className="text-[#1B2A4A]/60 text-sm px-6">
              {materials.length === 0
                ? "No materials yet. Once you're enrolled in a course and your lecturer uploads something, it'll show up here."
                : "No materials match this filter."}
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredMaterials.map((m) => {
              const meta = TYPE_META[m.type] || { label: m.type, icon: "📁", color: "bg-slate-50 text-slate-700" };
              return (
                <Link
                  key={m.id}
                  href={`/student/materials/${m.id}`}
                  className="block p-5 bg-white rounded-2xl shadow-sm ring-1 ring-black/5 hover:ring-[#C89B3C]/50 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${meta.color}`}>
                      {meta.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs font-medium text-[#1B2A4A]/50">
                          {m.course_code}
                        </span>
                        <span className="text-xs text-[#1B2A4A]/30">·</span>
                        <span className="text-xs font-medium text-[#1B2A4A]/50">{meta.label}</span>
                      </div>
                      <h3 className="font-semibold text-[#1B2A4A] mb-1 truncate">{m.title}</h3>
                      {m.description && (
                        <p className="text-sm text-[#1B2A4A]/60 line-clamp-2 mb-2">
                          {m.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-[#1B2A4A]/40">{m.uploaded_by_name}</p>
                        <div className="text-xs text-[#1B2A4A]/40 whitespace-nowrap flex items-center gap-2">
                          <span>♥ {m.like_count}</span>
                          <span>💬 {m.comment_count}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
