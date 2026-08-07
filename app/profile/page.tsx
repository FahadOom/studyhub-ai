"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NotificationBell from "@/components/NotificationBell";

type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
  avatar_url: string | null;
  staff_id?: string | null;
  registration_no?: string | null;
  created_at: string;
};

export default function ProfilePage() {
  const { token } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetchProfile();
  }, [token]);

  async function fetchProfile() {
    try {
      const res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load profile");
      setProfile(data.user);
      setFullName(data.user.full_name);
      setAvatarUrl(data.user.avatar_url || "");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ full_name: fullName, avatar_url: avatarUrl || null }),
    });
    if (res.ok) {
      setSaved(true);
      await fetchProfile();
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  const backHref = profile?.role === "lecturer" ? "/lecturer" : "/student";

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
        <p className="text-[#1B2A4A]/50 text-sm">Loading...</p>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
        <p className="text-rose-600 text-sm">{error || "Profile not found"}</p>
      </main>
    );
  }

  const roleStyles: Record<string, string> = {
    admin: "bg-[#1B2A4A] text-white",
    lecturer: "bg-[#C15B3E]/10 text-[#C15B3E]",
    student: "bg-slate-100 text-slate-600",
  };

  return (
    <main className="min-h-screen bg-[#FAF8F4]">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#1B2A4A]/10 bg-white">
        <div className="font-display text-lg font-bold text-[#1B2A4A]">
          StudyHub<span className="text-[#C89B3C]">AI</span>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <Link href={backHref} className="text-sm text-[#1B2A4A]/70 font-medium">
            ← Back
          </Link>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-[#1B2A4A]/10 flex items-center justify-center text-xl font-bold text-[#1B2A4A] overflow-hidden shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                profile.full_name?.charAt(0).toUpperCase() || "?"
              )}
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#1B2A4A]">{profile.full_name}</h1>
              <span
                className={`inline-block mt-1 text-xs font-semibold px-2.5 py-1 rounded-full ${roleStyles[profile.role] || "bg-slate-100 text-slate-600"}`}
              >
                {profile.role}
              </span>
            </div>
          </div>

          <form onSubmit={saveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1B2A4A]/70 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-black/10 text-sm outline-none focus:ring-2 focus:ring-[#1B2A4A]/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1B2A4A]/70 mb-1">
                Avatar URL (optional)
              </label>
              <input
                type="text"
                placeholder="https://..."
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-black/10 text-sm outline-none focus:ring-2 focus:ring-[#1B2A4A]/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1B2A4A]/70 mb-1">
                Email
              </label>
              <input
                type="text"
                value={profile.email}
                disabled
                className="w-full px-3 py-2 rounded-lg border border-black/10 text-sm bg-slate-50 text-[#1B2A4A]/50"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full px-4 py-2 rounded-lg bg-[#1B2A4A] text-white text-sm font-medium disabled:opacity-50"
            >
              {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
