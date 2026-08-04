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
              I&apos;m a Student
            </button>
            <button
              type="button"
              onClick={() => setRole("lecturer")}
              className={`flex-1 py-2 text-sm font-medium rounded-md border ${
                role === "lecturer"
                  ? "bg-[#1B2A4A] text-white border-[#1B2A4A]"
                  : "border-[#1B2A4A]/20 text-[#1B2A4A]"
              }`}
            >
              I&apos;m a Lecturer
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="block text-sm font-medium text-[#1B2A4A] mb-1">Full name</span>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input"
                placeholder="Jane Nakato"
              />
            </label>

            <label className="block">
              <span className="block text-sm font-medium text-[#1B2A4A] mb-1">Email</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@university.ac.ug"
              />
            </label>

            {role === "student" && (
              <label className="block">
                <span className="block text-sm font-medium text-[#1B2A4A] mb-1">
                  Registration number (optional)
                </span>
                <input
                  value={registrationNo}
                  onChange={(e) => setRegistrationNo(e.target.value)}
                  className="input"
                  placeholder="REG-24-0001"
                />
              </label>
            )}

            {role === "lecturer" && (
              <label className="block">
                <span className="block text-sm font-medium text-[#1B2A4A] mb-1">Staff ID</span>
                <input
                  required
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  className="input"
                  placeholder="STF-2201"
                />
              </label>
            )}

            <label className="block">
              <span className="block text-sm font-medium text-[#1B2A4A] mb-1">Password</span>
              <input
                required
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="At least 8 characters"
              />
            </label>

            {error && <p className="text-sm text-[#C15B3E]">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#1B2A4A] text-white rounded-md font-medium hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          {role === "lecturer" && (
            <p className="text-xs text-[#1B2A4A]/50 mt-4">
              Lecturer accounts are reviewed by an administrator before you can log in.
            </p>
          )}
        </div>

        <p className="text-center text-sm text-[#1B2A4A]/70 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-[#C89B3C] font-medium">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
