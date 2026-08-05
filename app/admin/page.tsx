"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
};

const NAV_ITEMS = [
  { key: "users", label: "Users", enabled: true },
  { key: "courses", label: "Courses", enabled: false },
  { key: "faculties", label: "Faculties", enabled: false },
  { key: "announcements", label: "Announcements", enabled: false },
];

const ROLE_OPTIONS = ["student", "lecturer", "admin"];

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/");
      return;
    }
    fetchUsers();
  }, [user]);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load users");
      setUsers(data.users);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateUser(id: string, updates: Partial<User>) {
    setSavingId(id);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });
    if (res.ok) await fetchUsers();
    setSavingId(null);
  }

  async function deleteUser(id: string) {
    if (!confirm("Delete this user permanently?")) return;
    setSavingId(id);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) await fetchUsers();
    setSavingId(null);
  }

  const statusStyles: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    suspended: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  };

  const roleStyles: Record<string, string> = {
    admin: "bg-[#1B2A4A] text-white",
    lecturer: "bg-[#C15B3E]/10 text-[#C15B3E]",
    student: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-black/5 bg-white px-4 py-6 hidden sm:block">
        <div className="mb-8 px-2">
          <span className="text-lg font-bold text-[#1B2A4A]">StudyHub</span>
          <span className="text-lg font-bold text-[#C15B3E]">AI</span>
          <p className="text-xs text-[#1B2A4A]/50 mt-1">Admin Panel</p>
        </div>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => item.enabled && setActiveTab(item.key)}
              disabled={!item.enabled}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === item.key
                  ? "bg-[#1B2A4A] text-white"
                  : item.enabled
                  ? "text-[#1B2A4A]/70 hover:bg-[#1B2A4A]/5"
                  : "text-[#1B2A4A]/30 cursor-not-allowed"
              }`}
            >
              {item.label}
              {!item.enabled && (
                <span className="ml-2 text-[10px] uppercase tracking-wide">soon</span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 px-5 py-8 sm:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#1B2A4A]">User Management</h1>
            <p className="text-sm text-[#1B2A4A]/50 mt-1">
              Approve lecturers, manage roles, and control account access.
            </p>
          </div>

          {loading && (
            <div className="text-[#1B2A4A]/50 text-sm">Loading users...</div>
          )}

          {error && (
            <div className="p-4 rounded-lg bg-rose-50 text-rose-700 text-sm ring-1 ring-rose-200">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-black/5 bg-[#1B2A4A]/[0.02]">
                      <th className="text-left font-semibold text-[#1B2A4A]/60 px-6 py-3">Name</th>
                      <th className="text-left font-semibold text-[#1B2A4A]/60 px-6 py-3">Email</th>
                      <th className="text-left font-semibold text-[#1B2A4A]/60 px-6 py-3">Role</th>
                      <th className="text-left font-semibold text-[#1B2A4A]/60 px-6 py-3">Status</th>
                      <th className="text-right font-semibold text-[#1B2A4A]/60 px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b border-black/5 last:border-0 hover:bg-[#1B2A4A]/[0.015] transition"
                      >
                        <td className="px-6 py-4 font-medium text-[#1B2A4A]">{u.full_name}</td>
                        <td className="px-6 py-4 text-[#1B2A4A]/70">{u.email}</td>
                        <td className="px-6 py-4">
                          <select
                            value={u.role}
                            disabled={savingId === u.id}
                            onChange={(e) => updateUser(u.id, { role: e.target.value })}
                            className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border-0 outline-none cursor-pointer ${roleStyles[u.role] || "bg-slate-100 text-slate-600"}`}
                          >
                            {ROLE_OPTIONS.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[u.status] || "bg-slate-100 text-slate-600"}`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2 flex-wrap">
                            {u.status === "pending" && (
                              <button
                                onClick={() => updateUser(u.id, { status: "active" })}
                                disabled={savingId === u.id}
                                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-50"
                              >
                                Approve
                              </button>
                            )}
                            {u.status === "active" && (
                              <button
                                onClick={() => updateUser(u.id, { status: "suspended" })}
                                disabled={savingId === u.id}
                                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition disabled:opacity-50"
                              >
                                Suspend
                              </button>
                            )}
                            {u.status === "suspended" && (
                              <button
                                onClick={() => updateUser(u.id, { status: "active" })}
                                disabled={savingId === u.id}
                                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-50"
                              >
                                Reactivate
                              </button>
                            )}
                            <button
                              onClick={() => deleteUser(u.id)}
                              disabled={savingId === u.id}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
