"use client";
import { useState } from "react";
import { CoursesTab } from "./tabs/CoursesTab";

export default function AdminPage() {
  const [tab, setTab] = useState("courses");
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">StudyHubAI Admin</h1>
      <div className="flex gap-4 border-b mt-2">
        <button className={`px-3 py-1 ${tab === "courses" ? "border-b-2 border-blue-600" : ""}`} onClick={() => setTab("courses")}>Courses</button>
        <button className="px-3 py-1" onClick={() => setTab("other")}>Users</button>
      </div>
      {tab === "courses" && <CoursesTab />}
      {tab === "other" && <div className="p-4">Other tabs coming</div>}
    </div>
  );
}
