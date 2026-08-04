import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FAF8F4]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-[#1B2A4A]/10">
        <div className="font-display text-xl font-bold text-[#1B2A4A]">
          StudyHub<span className="text-[#C89B3C]">AI</span>
        </div>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-[#1B2A4A] hover:opacity-70"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm font-medium bg-[#1B2A4A] text-[#FAF8F4] rounded-md hover:opacity-90"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-16 max-w-3xl mx-auto text-center">
        <div className="inline-block px-3 py-1 mb-6 text-xs font-semibold tracking-wide uppercase text-[#C89B3C] border border-[#C89B3C]/40 rounded-full">
          Built to replace scattered WhatsApp notes
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#1B2A4A] leading-tight mb-6">
          Every lecture note, organized. Every question, answered.
        </h1>
        <p className="text-lg text-[#1B2A4A]/70 mb-10 leading-relaxed">
          A central home for verified lecturers to share course materials, and
          for students to find them, ask questions, and study smarter with an
          AI assistant built into every page.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/register"
            className="px-6 py-3 bg-[#1B2A4A] text-[#FAF8F4] rounded-md font-medium hover:opacity-90"
          >
            Create your account
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 border border-[#1B2A4A]/20 text-[#1B2A4A] rounded-md font-medium hover:bg-[#1B2A4A]/5"
          >
            I already have an account
          </Link>
        </div>
      </section>

      {/* Feature grid */}
      <section className="px-6 py-16 max-w-5xl mx-auto grid sm:grid-cols-3 gap-6">
        <FeatureCard
          title="One organized library"
          body="Notes, slides, past papers, and assignments — sorted by course and topic, always searchable."
        />
        <FeatureCard
          title="AI study assistant"
          body="Ask questions about any material, get plain-language explanations, and generate practice quizzes."
        />
        <FeatureCard
          title="Verified lecturers only"
          body="Every lecturer account is checked by an administrator before they can upload anything."
        />
      </section>

      <footer className="px-6 py-8 text-center text-sm text-[#1B2A4A]/50 border-t border-[#1B2A4A]/10">
        StudyHub AI — a smarter way to run a university course.
      </footer>
    </main>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="p-6 bg-white border border-[#1B2A4A]/10 rounded-lg">
      <h3 className="font-display font-semibold text-[#1B2A4A] mb-2">{title}</h3>
      <p className="text-sm text-[#1B2A4A]/70 leading-relaxed">{body}</p>
    </div>
  );
}
