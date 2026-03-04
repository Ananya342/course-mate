import Link from "next/link";

const FEATURES = [
  { icon: "✨", title: "Smart matching", desc: "Compatibility based on course, schedule, and how you like to study.", color: "from-[var(--accent)] to-[var(--pink)]" },
  { icon: "💬", title: "Study groups", desc: "Chat with matches, share files, break the ice with fun questions.", color: "from-[var(--electric)] to-[var(--mint)]" },
  { icon: "Q&A", title: "Course Q&A", desc: "Ask and answer questions per course—Piazza-style, but cleaner.", color: "from-[var(--mint)] to-[var(--accent)]" },
  { icon: "📊", title: "Compatibility breakdown", desc: "See match scores for availability, study style, and skill level.", color: "from-[var(--pink)] to-[var(--coral)]" },
  { icon: "🗓️", title: "Tap availability", desc: "Pick your weekly time blocks in one tap—no spreadsheets.", color: "from-[var(--coral)] to-[var(--electric)]" },
  { icon: "🧊", title: "Icebreakers", desc: "When a study group forms, get a fun question to kick things off.", color: "from-[var(--electric)] to-[var(--accent)]" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-bold text-2xl text-[var(--text)] hover:text-[var(--accent)] transition-colors">
            CourseMate
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors shadow-lg shadow-purple-500/25"
            >
              Sign up
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 w-full px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
        {/* Hero: left = copy + CTA, right = Vibe tab */}
        <section className="max-w-6xl mx-auto mb-16 sm:mb-20 lg:mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-7 text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--text)] tracking-tight leading-tight">
                Find Your Perfect{" "}
                <span className="bg-gradient-to-r from-[var(--accent)] via-[var(--pink)] to-[var(--electric)] bg-clip-text text-transparent">
                  Study Partner
                </span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-[var(--muted)] max-w-xl lg:max-w-none mx-auto lg:mx-0">
                Match by course, availability, and study style. Form groups, chat, and share
                notes—without the chaos of mass group chats.
              </p>
              <div className="mt-10">
                <Link
                  href="/signup"
                  className="cta-glow inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--pink)] text-white font-semibold px-10 py-4 text-lg shadow-lg shadow-purple-500/30 hover:opacity-95 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                >
                  Get Started
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-extrabold text-[var(--text)] text-lg">Vibe</p>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/20">
                    Live preview
                  </span>
                </div>
                <div className="grid gap-3">
                  {[
                    { title: "CS 101 match", chip: "88% compatible", color: "from-[var(--accent)] to-[var(--pink)]" },
                    { title: "Group chat formed", chip: "Icebreaker ready", color: "from-[var(--electric)] to-[var(--mint)]" },
                    { title: "Q&A post trending", chip: "+15 upvotes", color: "from-[var(--mint)] to-[var(--accent)]" },
                  ].map((row) => (
                    <div key={row.title} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-hover)] p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-[var(--text)] truncate">{row.title}</p>
                        <p className="text-sm text-[var(--muted)] truncate">{row.chip}</p>
                      </div>
                      <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${row.color} shrink-0`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6 feature cards */}
        <section className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 hover:border-[var(--muted)] transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl sm:text-3xl mb-4`}>
                  {f.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-[var(--text)]">{f.title}</h3>
                <p className="text-[var(--muted)] mt-2 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
