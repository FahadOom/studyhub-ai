"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      login(data.token, data.user);

      if (data.user.role === "admin") router.push("/admin");
      else if (data.user.role === "lecturer") router.push("/lecturer");
      else router.push("/student");
    } catch (err) {
      setError("Could not reach the server. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FAF8F4] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="font-display text-xl font-bold text-[#1B2A4A] block text-center mb-8">
          StudyHub<span className="text-[#C89B3C]">AI</span>
        </Link>

        <div className="bg-white border border-[#1B2A4A]/10 rounded-lg p-6">
          <h1 className="font-display text-xl font-bold text-[#1B2A4A] mb-6">
            Log in to your account
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <label className="block">
              <span className="block text-sm font-medium text-[#1B2A4A] mb-1">Password</span>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Your password"
              />
            </label>

            {error && <p className="text-sm text-[#C15B3E]">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#1B2A4A] text-white rounded-md font-medium hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Logging in…" : "Log in"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#1B2A4A]/70 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#C89B3C] font-medium">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
