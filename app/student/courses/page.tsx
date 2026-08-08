"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import NotificationBell from "@/components/NotificationBell";

type Course = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  year_of_study: number | null;
  semester: number | null;
  departments?: { name: string } | null;
};

type Enrollment = {
  course_id: string;
};

export default function BrowseCoursesPage() {
  const { token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetchData();
  }, [token]);

  async function fetchData() {
    try {
      const [coursesRes, enrollRes] = await Promise.all([
        fetch("/api/courses", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/enrollments", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const coursesData = await coursesRes.json();
      const enrollData = await enrollRes.json();
      if (coursesRes.ok) setCourses(coursesData.courses);
      if (enrollRes.ok) {
        setEnrolledIds(new Set((enrollData.enrollments as Enrollment[]).map((e) => e.course_id)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleEnroll(courseId: string, isEnrolled: boolean) {
    setBusyId(courseId);
    try {
      if (isEnrolled) {
        await fetch(`/api/enrollments?courseId=${courseId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        setEnrolledIds((prev) => {
          const next = new Set(prev);
          next.delete(courseId);
          return next;
        });
      } else {
        await fetch("/api/enrollments", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ courseId }),
        });
        setEnrolledIds((prev) => new Set(prev).add(courseId));
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#FAF8F4]">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#1B2A4A]/10 bg-white">
        <div className="font-display text-lg font-bold text-[#1B2A4A]">
          StudyHub<span className="text-[#C89B3C]">AI</span>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <Link href="/student" className="text-sm text-[#1B2A4A]/70 font-medium">
            ← Back
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-[#1B2A4A] mb-1">Browse Courses</h1>
        <p className="text-sm text-[#1B2A4A]/50 mb-6">
          Enroll in courses to see materials your lecturers share.
        </p>

        {loading && <div className="text-[#1B2A4A]/50 text-sm">Loading courses...</div>}

        {!loading && courses.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-6 text-sm text-[#1B2A4A]/50 text-center">
            No courses available yet.
          </div>
        )}

        <div className="space-y-3">
          {courses.map((c) => {
            const isEnrolled = enrolledIds.has(c.id);
            return (
              <div key={c.id} className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-semibold text-[#1B2A4A]">
                      {c.code} — {c.title}
                    </div>
                    <div className="text-sm text-[#1B2A4A]/50 mt-0.5">
                      {c.departments?.name || "Unknown department"}
                      {c.year_of_study && ` • Year ${c.year_of_study}`}
                      {c.semester && ` • Semester ${c.semester}`}
                    </div>
                    {c.description && (
                      <div className="text-sm text-[#1B2A4A]/60 mt-1.5">{c.description}</div>
                    )}
                  </div>
                  <button
                    onClick={() => toggleEnroll(c.id, isEnrolled)}
                    disabled={busyId === c.id}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0 transition disabled:opacity-50 ${
                      isEnrolled
                        ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                        : "bg-[#1B2A4A] text-white"
                    }`}
                  >
                    {busyId === c.id ? "..." : isEnrolled ? "Unenroll" : "Enroll"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
