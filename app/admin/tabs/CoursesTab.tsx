"use client";
import { useState, useEffect } from "react";

export function CoursesTab() {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ department_id: "", code: "", title: "", description: "", year_of_study: "", semester: "" });

  const load = async () => {
    setLoading(true);
    try {
      const [c, d] = await Promise.all([
        fetch("/api/admin/courses").then(r => r.json()),
        fetch("/api/admin/departments").then(r => r.json())
      ]);
      setCourses(c);
      setDepartments(d);
    } catch (e) { console.error(e) }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const reset = () => { setEditId(null); setForm({ department_id: "", code: "", title: "", description: "", year_of_study: "", semester: "" }); };

  const submit = async (e) => {
    e.preventDefault();
    const url = editId ? `/api/admin/courses/${editId}` : "/api/admin/courses";
    const method = editId ? "PATCH" : "POST";
    const payload = { ...form, year_of_study: parseInt(form.year_of_study) || null, semester: parseInt(form.semester) || null };
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) { reset(); load(); } else alert((await res.json()).error);
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{editId ? "Edit" : "Add"} Course</h2>
      <form onSubmit={submit} className="space-y-3 max-w-xl">
        <select className="w-full p-2 border rounded" value={form.department_id} onChange={e => setForm({ ...form, department_id: e.target.value })} required>
          <option value="">Select Department</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <input className="w-full p-2 border rounded" placeholder="Code (e.g. CS101)" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
        <input className="w-full p-2 border rounded" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
        <textarea className="w-full p-2 border rounded" placeholder="Description" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <div className="flex gap-2">
          <select className="w-1/2 p-2 border rounded" value={form.year_of_study} onChange={e => setForm({ ...form, year_of_study: e.target.value })}>
            <option value="">Year</option>
            {[1,2,3,4,5,6].map(y => <option key={y} value={y}>Year {y}</option>)}
          </select>
          <select className="w-1/2 p-2 border rounded" value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })}>
            <option value="">Semester</option>
            <option value="1">1</option><option value="2">2</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">{editId ? "Update" : "Create"}</button>
          {editId && <button type="button" className="px-4 py-2 border rounded" onClick={reset}>Cancel</button>}
        </div>
      </form>

      <div className="mt-6">
        <table className="w-full border">
          <thead><tr className="bg-gray-100"><th className="p-2 text-left">Code</th><th className="p-2 text-left">Title</th><th className="p-2 text-left">Department</th><th className="p-2 text-right">Actions</th></tr></thead>
          <tbody>
            {courses.length === 0 ? <tr><td colSpan="4" className="p-4 text-center">No courses</td></tr> :
              courses.map(c => (
                <tr key={c.id} className="border-t"><td className="p-2">{c.code}</td><td className="p-2">{c.title}</td><td className="p-2">{c.department?.name || "—"}</td>
                <td className="p-2 text-right space-x-2">
                  <button className="px-2 py-1 border rounded" onClick={() => { setEditId(c.id); setForm({ department_id: c.department_id, code: c.code, title: c.title, description: c.description || "", year_of_study: c.year_of_study?.toString() || "", semester: c.semester?.toString() || "" }); }}>Edit</button>
                  <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={async () => { if (confirm("Delete?")) { await fetch(`/api/admin/courses/${c.id}`, { method: "DELETE" }); load(); } }}>Delete</button>
                </td></tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
