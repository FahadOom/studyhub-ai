"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [role, setRole] = useState<"student" | "lecturer">("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");
  const [staffId, setStaffId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingMessage, setPendingMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          password,
          role,
          registrationNo: role === "student" ? registrationNo : undefined,
          staffId: role === "lecturer" ? staffId : undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      if (data.token) {
        login(data.token, data.user);
        router.push(data.user.role === "student" ? "/student" : "/lecturer");
      } else {
        setPendingMessage(data.message);
      }
    } catch (err) {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (pendingMessage) {
    return (
      <main className="min-h-screen bg-[#FAF8F4] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="font-display text-2xl font-bold text-[#1B2A4A] mb-4">
            Account created
          </h1>
          <p className="text-[#1B2A4A]/70 mb-6">{pendingMessage}</p>
          <Link href="/login" className="text-[#C89B3C] font-medium">
            Back to login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F4] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="font-display text-xl font-bold text-[#1B2A4A] block text-center mb-8">
          StudyHub<span className="text-[#C89B3C]">AI</span>
        </Link>

        <div className="bg-white border border-[#1B2A4A]/10 rounded-lg p-6">
          <h1 className="font-display text-xl font-bold text-[#1B2A4A] mb-6">
            Create your account
          </h1>

          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`flex-1 py-2 text-sm font-medium rounded-md border ${
                role === "student"
                  ? "bg-[#1B2A4A] text-white border-[#1B2A4A]"
                  : "border-[#1B2A4A]/20 text-[#1B2A4A]"
              }`}
            >
              I'm a Student
            </button>
            <button
              type="button"
              onClick={() => setRole("lecturer")}
              className={`flex-
