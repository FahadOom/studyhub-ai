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

type Faculty = {
  id: string;
  name: string;
  description: string | null;
};

type Department = {
  id: string;
  name: string;
  faculty_id: string;
  faculties?: { name: string } | null;
};

type Course = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  year_of_study: number | null;
  semester: number | null;
  department_id: string;
  departments?: { name: string } | null;
};

const NAV_ITEMS = [
  { key: "users", label: "Users", enabled: true },
  { key: "faculties", label: "Faculties", enabled: true },
  { key: "departments", label: "Departments", enabled: true },
  { key: "courses", label: "Courses", enabled: true },
  { key: "lecturers", label: "Assign Lecturers", enabled: true },
  { key: "announcements", label: "Announcements", enabled: false },
];

const ROLE_OPTIONS = ["student", "lecturer", "admin"];

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("users");

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  // Faculties state
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [facLoading, setFacLoading] = useState(true);
  const [facError, setFacError] = useState("");
  const [newFacName, setNewFacName] = useState("");
  const [newFacDesc, setNewFacDesc] = useState("");
  const [creatingFac, setCreatingFac] = useState(false);
  const [editingFacId, setEditingFacId] = useState<string | null>(null);
  const [editFacName, setEditFacName] = useState("");
  const [editFacDesc, setEditFacDesc] = useState("");

  // Departments state
  const [departments, setDepartments] = useState<Department[]>([]);
  const [deptLoading, setDeptLoading] = useState(true);
  const [deptError, setDeptError] = useState("");
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptFacultyId, setNewDeptFacultyId] = useState("");
  const [creatingDept, setCreatingDept] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [editDeptName, setEditDeptName] = useState("");
  const [editDeptFacultyId, setEditDeptFacultyId] = useState("");

  // Courses state
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseLoading, setCourseLoading] = useState(true);
  const [courseError, setCourseError] = useState("");
  const [newCourseCode, setNewCourseCode] = useState("");
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseDesc, setNewCourseDesc] = useState("");
  const [newCourseYear, setNewCourseYear] = useState("");
  const [newCourseSemester, setNewCourseSemester] = useState("");
  const [newCourseDeptId, setNewCourseDeptId] = useState("");
  const [creatingCourse, setCreatingCourse] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editCourseCode, setEditCourseCode] = useState("");
  const [editCourseTitle, setEditCourseTitle] = useState("");
  const [editCourseDesc, setEditCourseDesc] = useState("");
  const [editCourseYear, setEditCourseYear] = useState("");
  const [editCourseSemester, setEditCourseSemester] = useState("");
  const [editCourseDeptId, setEditCourseDeptId] = useState("");

  // Course-Lecturer assignment state
  const [assignments, setAssignments] = useState<any[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [assignLoading, setAssignLoading] = useState(true);
  const [assignCourseId, setAssignCourseId] = useState("");
  const [assignLecturerId, setAssignLecturerId] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/");
      return;
    }
    fetchUsers();
    fetchFaculties();
    fetchDepartments();
    fetchCourses();
    fetchAssignments();
  }, [user]);

  // Users functions
  async function fetchUsers() {
    try {
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load users");
      setUsers(data.users);
    } catch (err: any) {
      setUsersError(err.message);
    } finally {
      setUsersLoading(false);
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

  // Faculties functions
  async function fetchFaculties() {
    try {
      const res = await fetch("/api/admin/faculties", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load faculties");
      setFaculties(data.faculties);
    } catch (err: any) {
      setFacError(err.message);
    } finally {
      setFacLoading(false);
    }
  }

  async function createFaculty(e: React.FormEvent) {
    e.preventDefault();
    if (!newFacName.trim()) return;
    setCreatingFac(true);
    const res = await fetch("/api/admin/faculties", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newFacName, description: newFacDesc }),
    });
    if (res.ok) {
      setNewFacName("");
      setNewFacDesc("");
      await fetchFaculties();
    }
    setCreatingFac(false);
  }

  function startEditFaculty(f: Faculty) {
    setEditingFacId(f.id);
    setEditFacName(f.name);
    setEditFacDesc(f.description || "");
  }

  async function saveEditFaculty(id: string) {
    const res = await fetch(`/api/admin/faculties/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: editFacName, description: editFacDesc }),
    });
    if (res.ok) {
      setEditingFacId(null);
      await fetchFaculties();
    }
  }

  async function deleteFaculty(id: string) {
    if (!confirm("Delete this faculty permanently?")) return;
    const res = await fetch(`/api/admin/faculties/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) await fetchFaculties();
  }

  // Departments functions
  async function fetchDepartments() {
    try {
      const res = await fetch("/api/admin/departments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load departments");
      setDepartments(data.departments);
    } catch (err: any) {
      setDeptError(err.message);
    } finally {
      setDeptLoading(false);
    }
  }

  async function createDepartment(e: React.FormEvent) {
    e.preventDefault();
    if (!newDeptName.trim() || !newDeptFacultyId) return;
    setCreatingDept(true);
    const res = await fetch("/api/admin/departments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newDeptName, faculty_id: newDeptFacultyId }),
    });
    if (res.ok) {
      setNewDeptName("");
      setNewDeptFacultyId("");
      await fetchDepartments();
    }
    setCreatingDept(false);
  }

  function startEditDepartment(d: Department) {
    setEditingDeptId(d.id);
    setEditDeptName(d.name);
    setEditDeptFacultyId(d.faculty_id);
  }

  async function saveEditDepartment(id: string) {
    const res = await fetch(`/api/admin/departments/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: editDeptName, faculty_id: editDeptFacultyId }),
    });
    if (res.ok) {
      setEditingDeptId(null);
      await fetchDepartments();
    }
  }

  async function deleteDepartment(id: string) {
    if (!confirm("Delete this department permanently?")) return;
    const res = await fetch(`/api/admin/departments/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) await fetchDepartments();
  }

  // Courses functions
  async function fetchCourses() {
    try {
      const res = await fetch("/api/admin/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load courses");
      setCourses(data.courses);
    } catch (err: any) {
      setCourseError(err.message);
    } finally {
      setCourseLoading(false);
    }
  }

  async function createCourse(e: React.FormEvent) {
    e.preventDefault();
    if (!newCourseCode.trim() || !newCourseTitle.trim() || !newCourseDeptId) return;
    setCreatingCourse(true);
    const res = await fetch("/api/admin/courses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: newCourseCode,
        title: newCourseTitle,
        description: newCourseDesc,
        year_of_study: newCourseYear ? parseInt(newCourseYear) : null,
        semester: newCourseSemester ? parseInt(newCourseSemester) : null,
        department_id: newCourseDeptId,
      }),
    });
    if (res.ok) {
      setNewCourseCode("");
      setNewCourseTitle("");
      setNewCourseDesc("");
      setNewCourseYear("");
      setNewCourseSemester("");
      setNewCourseDeptId("");
      await fetchCourses();
    }
    setCreatingCourse(false);
  }

  function startEditCourse(c: Course) {
    setEditingCourseId(c.id);
    setEditCourseCode(c.code);
    setEditCourseTitle(c.title);
    setEditCourseDesc(c.description || "");
    setEditCourseYear(c.year_of_study ? String(c.year_of_study) : "");
    setEditCourseSemester(c.semester ? String(c.semester) : "");
    setEditCourseDeptId(c.department_id);
  }

  async function saveEditCourse(id: string) {
    const res = await fetch(`/api/admin/courses/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: editCourseCode,
        title: editCourseTitle,
        description: editCourseDesc,
        year_of_study: editCourseYear ? parseInt(editCourseYear) : null,
        semester: editCourseSemester ? parseInt(editCourseSemester) : null,
        department_id: editCourseDeptId,
      }),
    });
    if (res.ok) {
      setEditingCourseId(null);
      await fetchCourses();
    }
  }

  async function deleteCourse(id: string) {
    if (!confirm("Delete this course permanently?")) return;
    const res = await fetch(`/api/admin/courses/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) await fetchCourses();
  }

  async function fetchAssignments() {
    try {
      const res = await fetch("/api/admin/course-lecturers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setAssignments(data.assignments);

      const usersRes = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const usersData = await usersRes.json();
      if (usersRes.ok) {
        setLecturers(usersData.users.filter((u: any) => u.role === "lecturer"));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAssignLoading(false);
    }
  }

  async function createAssignment(e: React.FormEvent) {
    e.preventDefault();
    if (!assignCourseId || !assignLecturerId) return;
    setAssigning(true);
    const res = await fetch("/api/admin/course-lecturers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ course_id: assignCourseId, lecturer_id: assignLecturerId }),
    });
    if (res.ok) {
      setAssignCourseId("");
      setAssignLecturerId("");
      await fetchAssignments();
    }
    setAssigning(false);
  }

  async function deleteAssignment(course_id: string, lecturer_id: string) {
    if (!confirm("Remove this assignment?")) return;
    const res = await fetch(
      `/api/admin/course-lecturers?course_id=${course_id}&lecturer_id=${lecturer_id}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.ok) await fetchAssignments();
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
    <div className="min-h-screen bg-[#FAF8F4]">
      <header className="bg-white border-b border-black/5 sticky top-0 z-10">
        <div className="px-5 sm:px-10 pt-5 pb-3">
          <span className="text-lg font-bold text-[#1B2A4A]">StudyHub</span>
          <span className="text-lg font-bold text-[#C15B3E]">AI</span>
          <span className="text-xs text-[#1B2A4A]/50 ml-2">Admin Panel</span>
        </div>
        <nav className="flex gap-1 px-5 sm:px-10 overflow-x-auto pb-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => item.enabled && setActiveTab(item.key)}
              disabled={!item.enabled}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                activeTab === item.key
                  ? "bg-[#1B2A4A] text-white"
                  : item.enabled
                  ? "text-[#1B2A4A]/70 hover:bg-[#1B2A4A]/5"
                  : "text-[#1B2A4A]/30 cursor-not-allowed"
              }`}
            >
              {item.label}
              {!item.enabled && (
                <span className="ml-1.5 text-[10px] uppercase tracking-wide">soon</span>
              )}
            </button>
          ))}
        </nav>
      </header>

      <main className="px-5 py-8 sm:px-10">
        <div className="max-w-5xl mx-auto">
          {activeTab === "users" && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#1B2A4A]">User Management</h1>
                <p className="text-sm text-[#1B2A4A]/50 mt-1">
                  Approve lecturers, manage roles, and control account access.
                </p>
              </div>

              {usersLoading && (
                <div className="text-[#1B2A4A]/50 text-sm">Loading users...</div>
              )}

              {usersError && (
                <div className="p-4 rounded-lg bg-rose-50 text-rose-700 text-sm ring-1 ring-rose-200">
                  {usersError}
                </div>
              )}

              {!usersLoading && !usersError && (
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
            </>
          )}

          {activeTab === "faculties" && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#1B2A4A]">Faculties</h1>
                <p className="text-sm text-[#1B2A4A]/50 mt-1">
                  Create and manage the faculties in your institution.
                </p>
              </div>

              <form
                onSubmit={createFaculty}
                className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-6 mb-6 flex flex-col sm:flex-row gap-3"
              >
                <input
                  type="text"
                  placeholder="Faculty name"
                  value={newFacName}
                  onChange={(e) => setNewFacName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-black/10 text-sm outline-none focus:ring-2 focus:ring-[#1B2A4A]/20"
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={newFacDesc}
                  onChange={(e) => setNewFacDesc(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-black/10 text-sm outline-none focus:ring-2 focus:ring-[#1B2A4A]/20"
                />
                <button
                  type="submit"
                  disabled={creatingFac || !newFacName.trim()}
                  className="px-4 py-2 rounded-lg bg-[#1B2A4A] text-white text-sm font-medium disabled:opacity-50"
                >
                  {creatingFac ? "Adding..." : "Add Faculty"}
                </button>
              </form>

              {facLoading && (
                <div className="text-[#1B2A4A]/50 text-sm">Loading faculties...</div>
              )}

              {facError && (
                <div className="p-4 rounded-lg bg-rose-50 text-rose-700 text-sm ring-1 ring-rose-200">
                  {facError}
                </div>
              )}

              {!facLoading && !facError && (
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 divide-y divide-black/5">
                  {faculties.length === 0 && (
                    <div className="p-6 text-sm text-[#1B2A4A]/50">
                      No faculties yet. Add one above.
                    </div>
                  )}
                  {faculties.map((f) => (
                    <div key={f.id} className="p-5">
                      {editingFacId === f.id ? (
                        <div className="flex flex-col sm:flex-row gap-3">
                          <input
                            value={editFacName}
                            onChange={(e) => setEditFacName(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg border border-black/10 text-sm outline-none"
                          />
                          <input
                            value={editFacDesc}
                            onChange={(e) => setEditFacDesc(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg border border-black/10 text-sm outline-none"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveEditFaculty(f.id)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingFacId(null)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="font-medium text-[#1B2A4A]">{f.name}</div>
                            {f.description && (
                              <div className="text-sm text-[#1B2A4A]/50 mt-0.5">
                                {f.description}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => startEditFaculty(f)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteFaculty(f.id)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "departments" && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#1B2A4A]">Departments</h1>
                <p className="text-sm text-[#1B2A4A]/50 mt-1">
                  Create and manage departments within each faculty.
                </p>
              </div>

              <form
                onSubmit={createDepartment}
                className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-6 mb-6 flex flex-col sm:flex-row gap-3"
              >
                <input
                  type="text"
                  placeholder="Department name"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-black/10 text-sm outline-none focus:ring-2 focus:ring-[#1B2A4A]/20"
                />
                <select
                  value={newDeptFacultyId}
                  onChange={(e) => setNewDeptFacultyId(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-black/10 text-sm outline-none focus:ring-2 focus:ring-[#1B2A4A]/20"
                >
                  <option value="">Select faculty</option>
                  {faculties.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={creatingDept || !newDeptName.trim() || !newDeptFacultyId}
                  className="px-4 py-2 rounded-lg bg-[#1B2A4A] text-white text-sm font-medium disabled:opacity-50"
                >
                  {creatingDept ? "Adding..." : "Add Department"}
                </button>
              </form>

              {deptLoading && (
                <div className="text-[#1B2A4A]/50 text-sm">Loading departments...</div>
              )}

              {deptError && (
                <div className="p-4 rounded-lg bg-rose-50 text-rose-700 text-sm ring-1 ring-rose-200">
                  {deptError}
                </div>
              )}

              {!deptLoading && !deptError && (
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 divide-y divide-black/5">
                  {departments.length === 0 && (
                    <div className="p-6 text-sm text-[#1B2A4A]/50">
                      No departments yet. Add one above.
                    </div>
                  )}
                  {departments.map((d) => (
                    <div key={d.id} className="p-5">
                      {editingDeptId === d.id ? (
                        <div className="flex flex-col sm:flex-row gap-3">
                          <input
                            value={editDeptName}
                            onChange={(e) => setEditDeptName(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg border border-black/10 text-sm outline-none"
                          />
                          <select
                            value={editDeptFacultyId}
                            onChange={(e) => setEditDeptFacultyId(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg border border-black/10 text-sm outline-none"
                          >
                            {faculties.map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.name}
                              </option>
                            ))}
                          </select>
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveEditDepartment(d.id)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingDeptId(null)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="font-medium text-[#1B2A4A]">{d.name}</div>
                            <div className="text-sm text-[#1B2A4A]/50 mt-0.5">
                              {d.faculties?.name || "Unknown faculty"}
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => startEditDepartment(d)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteDepartment(d.id)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "courses" && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#1B2A4A]">Courses</h1>
                <p className="text-sm text-[#1B2A4A]/50 mt-1">
                  Create and manage courses across departments.
                </p>
              </div>

              <form
                onSubmit={createCourse}
                className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-6 mb-6 space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Course code"
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-black/10 text-sm outline-none focus:ring-2 focus:ring-[#1B2A4A]/20"
                  />
                  <input
                    type="text"
                    placeholder="Course title"
                    value={newCourseTitle}
                    onChange={(e) => setNewCourseTitle(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-black/10 text-sm outline-none focus:ring-2 focus:ring-[#1B2A4A]/20"
                  />
                  <select
                    value={newCourseDeptId}
                    onChange={(e) => setNewCourseDeptId(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-black/10 text-sm outline-none focus:ring-2 focus:ring-[#1B2A4A]/20"
                  >
                    <option value="">Select department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Year of study (optional)"
                    value={newCourseYear}
                    onChange={(e) => setNewCourseYear(e.target.value)}
                    min="1"
                    max="4"
                    className="px-3 py-2 rounded-lg border border-black/10 text-sm outline-none focus:ring-2 focus:ring-[#1B2A4A]/20"
                  />
                  <input
                    type="number"
                    placeholder="Semester (optional)"
                    value={newCourseSemester}
                    onChange={(e) => setNewCourseSemester(e.target.value)}
                    min="1"
                    max="2"
                    className="px-3 py-2 rounded-lg border border-black/10 text-sm outline-none focus:ring-2 focus:ring-[#1B2A4A]/20"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={newCourseDesc}
                  onChange={(e) => setNewCourseDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-black/10 text-sm outline-none focus:ring-2 focus:ring-[#1B2A4A]/20"
                />
                <button
                  type="submit"
                  disabled={creatingCourse || !newCourseCode.trim() || !newCourseTitle.trim() || !newCourseDeptId}
                  className="w-full px-4 py-2 rounded-lg bg-[#1B2A4A] text-white text-sm font-medium disabled:opacity-50"
                >
                  {creatingCourse ? "Adding..." : "Add Course"}
                </button>
              </form>

              {courseLoading && (
                <div className="text-[#1B2A4A]/50 text-sm">Loading courses...</div>
              )}

              {courseError && (
                <div className="p-4 rounded-lg bg-rose-50 text-rose-700 text-sm ring-1 ring-rose-200">
                  {courseError}
                </div>
              )}

              {!courseLoading && !courseError && (
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 divide-y divide-black/5">
                  {courses.length === 0 && (
                    <div className="p-6 text-sm text-[#1B2A4A]/50">
                      No courses yet. Add one above.
                    </div>
                  )}
                  {courses.map((c) => (
                    <div key={c.id} className="p-5">
                      {editingCourseId === c.id ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                              value={editCourseCode}
                              onChange={(e) => setEditCourseCode(e.target.value)}
                              className="px-3 py-2 rounded-lg border border-black/10 text-sm outline-none"
                            />
                            <input
                              value={editCourseTitle}
                              onChange={(e) => setEditCourseTitle(e.target.value)}
                              className="px-3 py-2 rounded-lg border border-black/10 text-sm outline-none"
                            />
                            <select
                              value={editCourseDeptId}
                              onChange={(e) => setEditCourseDeptId(e.target.value)}
                              className="px-3 py-2 rounded-lg border border-black/10 text-sm outline-none"
                            >
                              {departments.map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d.name}
                                </option>
                              ))}
                            </select>
                            <input
                              type="number"
                              value={editCourseYear}
                              onChange={(e) => setEditCourseYear(e.target.value)}
                              min="1"
                              max="4"
                              placeholder="Year"
                              className="px-3 py-2 rounded-lg border border-black/10 text-sm outline-none"
                            />
                            <input
                              type="number"
                              value={editCourseSemester}
                              onChange={(e) => setEditCourseSemester(e.target.value)}
                              min="1"
                              max="2"
                              placeholder="Semester"
                              className="px-3 py-2 rounded-lg border border-black/10 text-sm outline-none"
                            />
                          </div>
                          <input
                            value={editCourseDesc}
                            onChange={(e) => setEditCourseDesc(e.target.value)}
                            placeholder="Description"
                            className="w-full px-3 py-2 rounded-lg border border-black/10 text-sm outline-none"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveEditCourse(c.id)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingCourseId(null)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="font-semibold text-[#1B2A4A]">{c.code} — {c.title}</div>
                            <div className="text-sm text-[#1B2A4A]/50 mt-1">
                              {c.departments?.name || "Unknown department"}
                              {c.year_of_study && ` • Year ${c.year_of_study}`}
                              {c.semester && ` • Semester ${c.semester}`}
                            </div>
                            {c.description && (
                              <div className="text-sm text-[#1B2A4A]/60 mt-1.5">
                                {c.description}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => startEditCourse(c)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteCourse(c.id)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        {activeTab === "lecturers" && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#1B2A4A]">Assign Lecturers</h1>
                <p className="text-sm text-[#1B2A4A]/50 mt-1">
                  Assign lecturers to the courses they teach.
                </p>
              </div>

              <form
                onSubmit={createAssignment}
                className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-6 mb-6 flex flex-col sm:flex-row gap-3"
              >
                <select
                  value={assignCourseId}
                  onChange={(e) => setAssignCourseId(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-black/10 text-sm outline-none focus:ring-2 focus:ring-[#1B2A4A]/20"
                >
                  <option value="">Select course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.title}
                    </option>
                  ))}
                </select>
                <select
                  value={assignLecturerId}
                  onChange={(e) => setAssignLecturerId(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-black/10 text-sm outline-none focus:ring-2 focus:ring-[#1B2A4A]/20"
                >
                  <option value="">Select lecturer</option>
                  {lecturers.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.full_name} ({l.email})
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={assigning || !assignCourseId || !assignLecturerId}
                  className="px-4 py-2 rounded-lg bg-[#1B2A4A] text-white text-sm font-medium disabled:opacity-50"
                >
                  {assigning ? "Assigning..." : "Assign"}
                </button>
              </form>

              {assignLoading && (
                <div className="text-[#1B2A4A]/50 text-sm">Loading assignments...</div>
              )}

              {!assignLoading && (
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 divide-y divide-black/5">
                  {assignments.length === 0 && (
                    <div className="p-6 text-sm text-[#1B2A4A]/50">
                      No assignments yet. Assign one above.
                    </div>
                  )}
                  {assignments.map((a: any, i: number) => (
                    <div key={i} className="p-5 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-medium text-[#1B2A4A]">
                          {a.courses?.code} — {a.courses?.title}
                        </div>
                        <div className="text-sm text-[#1B2A4A]/50 mt-0.5">
                          {a.users?.full_name} ({a.users?.email})
                        </div>
                      </div>
                      <button
                        onClick={() => deleteAssignment(a.course_id, a.lecturer_id)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
