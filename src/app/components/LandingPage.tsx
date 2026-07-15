import React from "react";
import {
  TrendingUp,
  Target,
  Building2,
  CalendarDays,
  IndianRupee,
  MessageCircle,
  Zap,
  ArrowRight,
  Sparkles
} from "lucide-react";

export function LandingPage({ onStartDemo }: { onStartDemo: () => void }) {
  const features = [
    {
      title: "Interactive CRM Dashboard",
      description: "Get real-time insights with metrics for active leads, properties, and direct calculations of total income, expenditures, and net profits.",
      icon: TrendingUp,
      color: "#7C5CFC",
      bg: "rgba(124, 92, 252, 0.08)"
    },
    {
      title: "Active Leads & Deal Pipeline",
      description: "Filter and prioritize leads. Transition them seamlessly across stages like New, Site Visit, Call Later, Send Details, and Booked Deals.",
      icon: Target,
      color: "#10B981",
      bg: "rgba(16, 185, 129, 0.08)"
    },
    {
      title: "Property & Inquiry Management",
      description: "Log property listings, manage inquiries, record site visits, and toggle favorite listings with dedicated visual cards.",
      icon: Building2,
      color: "#3B82F6",
      bg: "rgba(59, 130, 246, 0.08)"
    },
    {
      title: "Progress & Milestone Calendar",
      description: "Log daily progress reports (DPRs), track completion percentages, schedule client appointments, and attach progress milestones.",
      icon: CalendarDays,
      color: "#F59E0B",
      bg: "rgba(245, 158, 11, 0.08)"
    },
    {
      title: "Financial Ledger Ledger",
      description: "Log every transaction under Income or Expenditure to auto-calculate your total revenue, expenses, and net profit margins in real-time.",
      icon: IndianRupee,
      color: "#EC4899",
      bg: "rgba(236, 72, 153, 0.08)"
    },
    {
      title: "WhatsApp & Broadcast Hub",
      description: "Launch direct WhatsApp redirects, create message templates, and schedule broadcast templates to interact with leads instantly.",
      icon: MessageCircle,
      color: "#0891B2",
      bg: "rgba(8, 145, 178, 0.08)"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-x-hidden">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center text-white font-extrabold text-lg">
            A
          </div>
          <span className="text-slate-900 font-extrabold text-base tracking-tight" style={{ fontFamily: "Plus Jakarta Sans" }}>
            ApniEstate <span className="text-violet-600">CRM</span>
          </span>
        </div>
        <button
          onClick={onStartDemo}
          className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 active:scale-95 transition-all shadow-md shadow-violet-600/20"
        >
          Sign In
        </button>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-20 text-center bg-gradient-to-b from-white to-slate-50 border-b border-slate-100 flex-shrink-0">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 opacity-25 pointer-events-none">
          <div className="w-72 h-72 rounded-full bg-violet-400 blur-3xl" />
        </div>

        <div className="max-w-2xl mx-auto space-y-6 relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold text-violet-700 bg-violet-50 uppercase tracking-wider">
            <Sparkles size={12} /> Next-Gen Real Estate CRM
          </div>
          <h1
            className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight"
            style={{ fontFamily: "Plus Jakarta Sans" }}
          >
            The Command Cockpit for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
              Real Estate Pros
            </span>
          </h1>
          <p className="text-slate-500 text-sm md:text-base max-w-lg mx-auto font-medium">
            Manage your leads, track properties, log finances, record site visit progress, and direct-integrate broadcasts — all in one modern, reactive application.
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={onStartDemo}
              className="px-6 py-3.5 rounded-2xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 transition-all shadow-lg shadow-violet-600/30 flex items-center gap-2 active:scale-[0.98]"
            >
              Access Demo Cockpit <ArrowRight size={14} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-4xl mx-auto px-6 py-16 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: "Plus Jakarta Sans" }}>
            Unified Real Estate Workspace
          </h2>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
            Everything you need to close deals faster
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-4 hover:shadow-md transition-shadow"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: f.bg }}
              >
                <f.icon size={22} style={{ color: f.color }} />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-800 text-[15px]" style={{ fontFamily: "Plus Jakarta Sans" }}>
                  {f.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-10 px-6 border-t border-slate-800 text-center text-xs">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-center gap-2 text-white">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center font-extrabold">
              A
            </div>
            <span className="font-extrabold tracking-tight">ApniEstate CRM</span>
          </div>
          <p>© 2026 ApniEstate Technologies Private Limited. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
