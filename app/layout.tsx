import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "StudyHub AI — Smart University Learning Portal",
  description: "Organized lecture materials, AI-powered study help, and course collaboration in one place.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#FAF8F4] text-[#1B2A4A]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
