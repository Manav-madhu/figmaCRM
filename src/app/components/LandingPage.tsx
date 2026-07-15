import React from "react";
import logoImg from "../../../logo.jpeg";
import tripuraLogo from "../../../tripura.png";
import startupIndiaLogo from "../../../startupindia.png";
import ditLogo from "../../../DIT.png";
import dpiitLogo from "../../../DPIIt.png";
import {
  TrendingUp,
  Building2,
  CalendarDays,
  IndianRupee,
  MessageCircle,
  Zap,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Check,
  User,
  Settings,
  Rocket,
  Plus,
  Play,
  Briefcase,
  Layers,
  ArrowUpRight
} from "lucide-react";

export function LandingPage({ onStartDemo }: { onStartDemo: () => void }) {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans overflow-x-hidden text-slate-800">
      {/* 1. Header */}
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-2">
          <img src={logoImg} className="w-8 h-8 rounded-lg object-cover" alt="Apni Estate Logo" />
          <span className="text-slate-900 font-black text-lg tracking-tight" style={{ fontFamily: "Plus Jakarta Sans" }}>
            Apni <span className="text-[#0B1E43]">Estate</span>
          </span>
        </div>
        
        {/* Navigation Middle Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <a href="#platform" onClick={onStartDemo} className="hover:text-slate-800 transition-colors">Platform</a>
          <a href="#solutions" onClick={onStartDemo} className="hover:text-slate-800 transition-colors">Solutions</a>
          <a href="#pricing" onClick={onStartDemo} className="hover:text-slate-800 transition-colors">Pricing</a>
          <a href="#about" onClick={onStartDemo} className="hover:text-slate-800 transition-colors">About</a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={onStartDemo}
            className="text-xs font-black text-slate-700 hover:text-slate-900 transition-colors"
          >
            Sign in
          </button>
          <button
            onClick={onStartDemo}
            className="px-4 py-2.5 rounded-xl text-xs font-black text-white bg-[#0B1E43] hover:bg-[#061229] transition-all flex items-center gap-1 shadow-sm active:scale-[0.98]"
          >
            Start Free Trial <ChevronRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="bg-gradient-to-b from-slate-50/50 to-white px-6 pt-16 pb-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black text-amber-800 bg-amber-50 border border-amber-100 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
              THE LEADING CRM PLATFORM FOR INDIAN REAL ESTATE BUILDERS
            </div>
            
            <h1
              className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1] text-[#0B1E43]"
              style={{ fontFamily: "Plus Jakarta Sans" }}
            >
              Sell Smarter. <br />
              <span className="text-amber-500">Manage Everything.</span>
            </h1>
            
            <p className="text-slate-500 text-sm md:text-base max-w-xl font-medium leading-relaxed">
              Apni Estate is the premium CRM built specifically for real estate developers and property builders to manage leads, track site visit bookings, monitor construction milestones, and optimize financial ledger receipts.
            </p>
            
            <div className="pt-4 flex flex-wrap gap-3">
              <button
                onClick={onStartDemo}
                className="px-6 py-4 rounded-2xl text-xs font-black text-white bg-[#0B1E43] hover:bg-[#061229] transition-all shadow-md shadow-slate-900/10 flex items-center gap-1.5 active:scale-[0.98]"
              >
                Start Selling Now <ArrowRight size={14} strokeWidth={2.5} />
              </button>
              <button
                onClick={onStartDemo}
                className="px-6 py-4 rounded-2xl text-xs font-black text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all active:scale-[0.98]"
              >
                Book a Demo
              </button>
            </div>

          </div>

          {/* Right Dashboard Mockup Column */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-200/20 to-amber-200/20 blur-3xl rounded-full" />
            <div className="bg-white rounded-3xl border border-slate-250/60 p-6 shadow-2xl relative overflow-hidden text-left space-y-5 animate-in slide-in-from-right-4 duration-500">
              
              {/* Mockup Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Apni Estate · Sales Command Center</p>
                  <h3 className="text-xs font-black text-slate-800 mt-0.5">Skyline Residences – Phase 2</h3>
                </div>
                <span className="bg-emerald-50 text-emerald-700 text-[8px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-0.5 border border-emerald-100">
                  <span className="w-1 h-1 rounded-full bg-emerald-500" /> On Track
                </span>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                  <span className="text-[8px] font-bold text-slate-450 uppercase block">Booking Rev</span>
                  <span className="text-sm font-black text-slate-850 block mt-0.5">₹1.2 Cr</span>
                </div>
                <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                  <span className="text-[8px] font-bold text-slate-450 uppercase block">Deals Closed</span>
                  <span className="text-sm font-black text-slate-850 block mt-0.5">14/20</span>
                </div>
                <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                  <span className="text-[8px] font-bold text-slate-450 uppercase block">Inquiries</span>
                  <span className="text-sm font-black text-slate-850 block mt-0.5">34</span>
                </div>
              </div>

              {/* Progress bars */}
              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-slate-500">Active Leads Reached</span>
                    <span className="text-slate-700">78%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-600 rounded-full" style={{ width: "78%" }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-slate-500">Site Visits Booked</span>
                    <span className="text-slate-700">91%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-600 rounded-full" style={{ width: "91%" }} />
                  </div>
                </div>
              </div>

              {/* Team Overviews */}
              <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-violet-200 border-2 border-white flex items-center justify-center text-[8px] font-black text-violet-700">SM</div>
                  <div className="w-6 h-6 rounded-full bg-emerald-200 border-2 border-white flex items-center justify-center text-[8px] font-black text-emerald-700">PP</div>
                  <div className="w-6 h-6 rounded-full bg-amber-200 border-2 border-white flex items-center justify-center text-[8px] font-black text-amber-700">AK</div>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Sales Agents</span>
                  <span className="text-[10px] font-black text-slate-750 block mt-0.5">1,240 Members Online</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Official Recognition Section */}
      <section className="px-6 py-16 bg-white max-w-7xl w-full mx-auto text-center space-y-10">
        <div className="space-y-2">
          <span className="text-[9px] font-black text-[#5B3FD9] bg-[#EDE9FF] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Official Recognition
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-[#0B1E43]" style={{ fontFamily: "Plus Jakarta Sans" }}>
            Recognised by
          </h2>
          <p className="text-slate-500 text-xs md:text-sm max-w-xl mx-auto font-medium">
            Apni Estate is officially registered and recognized for its commitment to digitizing Indian real estate CRM workflows and driving technological advancement.
          </p>
        </div>

        {/* Government Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 flex flex-col items-center text-center space-y-6">
            <div className="h-16 flex items-center justify-center">
              <img src={tripuraLogo} className="h-14 w-auto object-contain" alt="Startup Tripura" />
            </div>
            <div className="space-y-2">
              <h3 className="text-slate-800 font-extrabold text-[15px] tracking-tight" style={{ fontFamily: "Plus Jakarta Sans" }}>Startup Tripura</h3>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-[240px] mx-auto">
                Recognized by the Government of Tripura's Startup policy, reflecting our commitment to enterprise-grade innovation in the region.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 flex flex-col items-center text-center space-y-6">
            <div className="h-16 flex items-center justify-center">
              <img src={startupIndiaLogo} className="h-10 w-auto object-contain" alt="Startup India" />
            </div>
            <div className="space-y-2">
              <h3 className="text-slate-800 font-extrabold text-[15px] tracking-tight" style={{ fontFamily: "Plus Jakarta Sans" }}>Startup India</h3>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-[240px] mx-auto">
                Officially recognized by the Government of India's Startup India initiative — validating our legitimate, high-growth trajectory.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 flex flex-col items-center text-center space-y-6">
            <div className="h-16 flex items-center justify-center">
              <img src={ditLogo} className="h-14 w-auto object-contain" alt="DIT Tripura" />
            </div>
            <div className="space-y-2">
              <h3 className="text-slate-800 font-extrabold text-[15px] tracking-tight" style={{ fontFamily: "Plus Jakarta Sans" }}>DIT Tripura</h3>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-[240px] mx-auto">
                Acknowledged by the Directorate of Information Technology (Govt. of Tripura) for technological advancement in construction.
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 flex flex-col items-center text-center space-y-6">
            <div className="h-16 flex items-center justify-center">
              <img src={dpiitLogo} className="h-12 w-auto object-contain" alt="DPIIT" />
            </div>
            <div className="space-y-2">
              <h3 className="text-slate-800 font-extrabold text-[15px] tracking-tight" style={{ fontFamily: "Plus Jakarta Sans" }}>DPIIT</h3>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-[240px] mx-auto">
                Registered with the Department for Promotion of Industry and Internal Trade (Govt. of India) as an innovative prop-tech software.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Onboarding Flow Section */}
      <section className="px-6 py-16 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl w-full mx-auto text-center space-y-10">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-black text-[#0B1E43]" style={{ fontFamily: "Plus Jakarta Sans" }}>
              Start Managing in <span className="text-amber-500">Minutes</span>
            </h2>
            <p className="text-slate-500 text-xs md:text-sm max-w-xl mx-auto font-medium">
              Our onboarding flow is designed for speed. Get your sales team set up and running in minutes, not days.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Step 1 */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs relative overflow-hidden flex flex-col justify-between h-44">
              <div>
                <span className="text-3xl font-black text-violet-100 block">01</span>
                <h3 className="font-black text-slate-850 text-sm mt-2" style={{ fontFamily: "Plus Jakarta Sans" }}>Create Account</h3>
                <p className="text-xs text-slate-455 leading-relaxed font-medium mt-1">
                  Sign up to activate your custom builder CRM workspace. No credit card required.
                </p>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-violet-600 uppercase tracking-wider">
                <User size={14} /> Get Started
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs relative overflow-hidden flex flex-col justify-between h-44">
              <div>
                <span className="text-3xl font-black text-violet-100 block">02</span>
                <h3 className="font-black text-slate-850 text-sm mt-2" style={{ fontFamily: "Plus Jakarta Sans" }}>Setup Workspace</h3>
                <p className="text-xs text-slate-455 leading-relaxed font-medium mt-1">
                  Import your leads via CSV/Excel, configure stages, and list properties.
                </p>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-violet-600 uppercase tracking-wider">
                <Settings size={14} /> Adjust Options
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs relative overflow-hidden flex flex-col justify-between h-44">
              <div>
                <span className="text-3xl font-black text-violet-100 block">03</span>
                <h3 className="font-black text-slate-850 text-sm mt-2" style={{ fontFamily: "Plus Jakarta Sans" }}>Go Live</h3>
                <p className="text-xs text-slate-455 leading-relaxed font-medium mt-1">
                  Track client site visits, log task updates, and log collections in real time.
                </p>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-violet-600 uppercase tracking-wider">
                <Rocket size={14} /> Launch Live
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Dashboard Roles Section */}
      <section className="px-6 py-16 bg-white max-w-7xl w-full mx-auto text-center space-y-10">
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-black text-[#0B1E43]" style={{ fontFamily: "Plus Jakarta Sans" }}>
            A Dashboard for <span className="text-amber-500">Every Sales Role</span>
          </h2>
          <p className="text-slate-500 text-xs md:text-sm max-w-xl mx-auto font-medium">
            Apni Estate CRM gives each department purpose-built intelligence. No clutter – just what you need to close bookings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Role 1 */}
          <div className="bg-slate-50/50 rounded-3xl border border-slate-100 p-6 flex flex-col gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
              <Layers size={18} />
            </div>
            <div>
              <h3 className="font-black text-slate-850 text-sm" style={{ fontFamily: "Plus Jakarta Sans" }}>Sales & Relationship Cockpit</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium mt-2">
                Full client card tracking, pipeline stage transitions, callback follow-up logs, and automated WhatsApp broadcasts.
              </p>
            </div>
          </div>

          {/* Role 2 */}
          <div className="bg-slate-50/50 rounded-3xl border border-slate-100 p-6 flex flex-col gap-4">
            <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-750">
              <Briefcase size={18} />
            </div>
            <div>
              <h3 className="font-black text-slate-850 text-sm" style={{ fontFamily: "Plus Jakarta Sans" }}>Project Milestone Calendar</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium mt-2">
                Log task updates, schedule client site visits, record progress percentages, and attach updates to calendar dates.
              </p>
            </div>
          </div>

          {/* Role 3 */}
          <div className="bg-slate-50/50 rounded-3xl border border-slate-100 p-6 flex flex-col gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
              <IndianRupee size={18} />
            </div>
            <div>
              <h3 className="font-black text-slate-850 text-sm" style={{ fontFamily: "Plus Jakarta Sans" }}>Financial Profit Ledger</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium mt-2">
                Record booking collection incomes, log vendor/broker expenses, and monitor net profit margins dynamically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Deep Blue Comparison Rows Section */}
      <section className="bg-[#0B1E43] text-white px-6 py-20 border-b border-slate-900">
        <div className="max-w-7xl w-full mx-auto text-center space-y-12">
          
          <div className="space-y-2">
            <span className="text-[9px] font-black text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              The Real Cost of Doing Nothing
            </span>
            <h2 className="text-3xl md:text-4xl font-black" style={{ fontFamily: "Plus Jakarta Sans" }}>
              Builder Pipelines Lose <span className="text-amber-400">Deals Every Day</span>
            </h2>
            <p className="text-slate-355 text-xs md:text-sm max-w-xl mx-auto font-semibold">
              Every week without a central CRM is client revenue walking out the door. Here is how unmanaged leads look – and what Apni Estate CRM does.
            </p>
          </div>

          {/* Rows comparisons */}
          <div className="space-y-4 text-left">
            {/* Row 1 */}
            <div className="bg-[#0f2858] rounded-3xl p-6 border border-slate-700/60 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-5 space-y-2">
                <span className="text-[8px] font-black text-rose-400 uppercase tracking-widest">Leads Leaks</span>
                <h3 className="text-sm font-black tracking-tight text-white">Lost Leads & No Followups</h3>
                <p className="text-[11px] text-slate-300 font-semibold leading-relaxed">
                  Scattered WhatsApp lists and paper notes lead to forgotten client callbacks. Hot property leads go cold within 48 hours.
                </p>
              </div>
              
              <div className="hidden md:flex md:col-span-2 justify-center">
                <div className="w-8 h-8 rounded-full bg-[#0B1E43] border border-slate-700/50 flex items-center justify-center text-slate-500">
                  <ArrowRight size={14} />
                </div>
              </div>

              <div className="md:col-span-5 space-y-2 bg-[#091a3c] rounded-2xl p-5 border border-slate-800">
                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Apni Estate CRM Solution</span>
                <p className="text-xs font-bold text-white leading-relaxed">
                  Centralized interactive lead cards with automated callback reminders, templates, and seamless WhatsApp redirect messaging.
                </p>
              </div>
            </div>

            {/* Row 2 */}
            <div className="bg-[#0f2858] rounded-3xl p-6 border border-slate-700/60 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-5 space-y-2">
                <span className="text-[8px] font-black text-rose-400 uppercase tracking-widest">Engagement Management</span>
                <h3 className="text-sm font-black tracking-tight text-white">Disorganized Site Visits</h3>
                <p className="text-[11px] text-slate-300 font-semibold leading-relaxed">
                  Double-booked appointments and missed site visits destroy client trust. Difficult to track feedback on specific properties.
                </p>
              </div>
              
              <div className="hidden md:flex md:col-span-2 justify-center">
                <div className="w-8 h-8 rounded-full bg-[#0B1E43] border border-slate-700/50 flex items-center justify-center text-slate-500">
                  <ArrowRight size={14} />
                </div>
              </div>

              <div className="md:col-span-5 space-y-2 bg-[#091a3c] rounded-2xl p-5 border border-slate-800">
                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Apni Estate CRM Solution</span>
                <p className="text-xs font-bold text-white leading-relaxed">
                  Milestone calendar links site-visit schedules directly to property cards, logging progress updates and client requirements.
                </p>
              </div>
            </div>

            {/* Row 3 */}
            <div className="bg-[#0f2858] rounded-3xl p-6 border border-slate-700/60 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-5 space-y-2">
                <span className="text-[8px] font-black text-rose-400 uppercase tracking-widest">Payment Collections</span>
                <h3 className="text-sm font-black tracking-tight text-white">Blind Cashflow</h3>
                <p className="text-[11px] text-slate-300 font-semibold leading-relaxed">
                  Difficult to monitor builder payment plans, booking receipt collections, and broker commission expenses.
                </p>
              </div>
              
              <div className="hidden md:flex md:col-span-2 justify-center">
                <div className="w-8 h-8 rounded-full bg-[#0B1E43] border border-slate-700/50 flex items-center justify-center text-slate-500">
                  <ArrowRight size={14} />
                </div>
              </div>

              <div className="md:col-span-5 space-y-2 bg-[#091a3c] rounded-2xl p-5 border border-slate-800">
                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Apni Estate CRM Solution</span>
                <p className="text-xs font-bold text-white leading-relaxed">
                  Integrated ledger tracks every client booking installment and project expense to output exact net profit margins.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. "We didn't build yet another..." section */}
      <section className="bg-[#0B1E43] text-white px-6 py-16 border-t border-slate-800/80">
        <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-4 text-left">
            <span className="text-[9px] font-black text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Why Property Builders Choose Us
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white" style={{ fontFamily: "Plus Jakarta Sans" }}>
              We didn't build yet another generic CRM.
            </h2>
            <p className="text-slate-350 text-xs font-semibold leading-relaxed">
              We built the first property CRM designed specifically for Indian builders and real estate developers — fully equipped with bulk Excel lead imports and local WhatsApp messaging templates.
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
            <div className="bg-[#0f2858] rounded-3xl p-5 border border-slate-700/50 space-y-2">
              <span className="text-3xl font-black text-amber-400">3x</span>
              <h4 className="text-xs font-black text-white">Faster Lead Responses</h4>
              <p className="text-[10px] text-slate-300 font-semibold leading-relaxed">
                Send template WhatsApp broadcasts and initiate direct redirects to client chat lines instantly.
              </p>
            </div>
            <div className="bg-[#0f2858] rounded-3xl p-5 border border-slate-700/50 space-y-2">
              <span className="text-3xl font-black text-amber-400">12%</span>
              <h4 className="text-xs font-black text-white font-sans">Deal Conversion Increase</h4>
              <p className="text-[10px] text-slate-300 font-semibold leading-relaxed">
                Visual status pipelines ensure no site-visit or follow-up callback opportunity is ever lost.
              </p>
            </div>
            <div className="bg-[#0f2858] rounded-3xl p-5 border border-slate-700/50 space-y-2">
              <span className="text-3xl font-black text-amber-400">100%</span>
              <h4 className="text-xs font-black text-white">Payment Transparency</h4>
              <p className="text-[10px] text-slate-300 font-semibold leading-relaxed">
                Real-time tracking of booking cash receipts, broker payouts, and ledger updates.
              </p>
            </div>
            <div className="bg-[#0f2858] rounded-3xl p-5 border border-slate-700/50 space-y-2">
              <span className="text-3xl font-black text-amber-400">0</span>
              <h4 className="text-xs font-black text-white">Data Leak Incidents</h4>
              <p className="text-[10px] text-slate-300 font-semibold leading-relaxed">
                Cloud-secure isolated tenant databases keep your agency client lists safe and isolated.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Call to Action Banner */}
      <section className="px-6 py-16 bg-white max-w-7xl w-full mx-auto">
        <div className="bg-[#0B1E43] rounded-[40px] p-8 md:p-12 text-center text-white relative overflow-hidden space-y-6 shadow-xl">
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 rounded-full bg-white/5" />
          <div className="absolute left-0 top-0 -translate-x-12 -translate-y-12 w-64 h-64 rounded-full bg-white/5" />
          
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <ShieldCheck size={24} />
          </div>

          <h2 className="text-3xl md:text-4xl font-black" style={{ fontFamily: "Plus Jakarta Sans" }}>
            Ready to Sell <span className="text-amber-400">Smarter?</span>
          </h2>
          
          <p className="text-slate-350 text-xs md:text-sm max-w-lg mx-auto font-semibold">
            Join the leading real estate builders using Apni Estate CRM to manage client pipelines, schedule site visits, and optimize sales.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-3 relative z-10">
            <button
              onClick={onStartDemo}
              className="px-6 py-3.5 rounded-xl text-xs font-black text-[#0B1E43] bg-amber-500 hover:bg-amber-600 transition-all flex items-center gap-1 shadow-sm active:scale-[0.98]"
            >
              Start Free Trial <ArrowRight size={14} strokeWidth={2.5} />
            </button>
            <button
              onClick={onStartDemo}
              className="px-6 py-3.5 rounded-xl text-xs font-black text-white bg-transparent border border-slate-500 hover:bg-white/5 transition-all flex items-center gap-1.5 active:scale-[0.98]"
            >
              <Play size={12} fill="white" /> Watch Product Tour
            </button>
          </div>
        </div>
      </section>

      {/* 9. Footer Section */}
      <footer className="bg-slate-50 border-t border-slate-200/80 px-6 py-12 text-slate-500 text-xs">
        <div className="max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Logo and About column */}
          <div className="md:col-span-4 space-y-4 text-left">
            <div className="flex items-center gap-2">
              <img src={logoImg} className="w-8 h-8 rounded-lg object-cover" alt="Logo" />
              <span className="text-slate-900 font-black text-lg tracking-tight">Apni Estate</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400 font-semibold max-w-sm">
              The premium CRM built for Indian builders and real estate developers — managing pipelines, tracking site visits, and centralizing collections.
            </p>
            <div className="flex gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <a href="#" className="hover:text-slate-600">t</a>
              <a href="#" className="hover:text-slate-600">in</a>
              <a href="#" className="hover:text-slate-600">yt</a>
            </div>
          </div>

          {/* Product Links */}
          <div className="md:col-span-2 space-y-3 text-left">
            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Product</h4>
            <ul className="space-y-2 text-[11px] font-semibold text-slate-450">
              <li><a href="#" onClick={onStartDemo} className="hover:underline">Leads Management</a></li>
              <li><a href="#" onClick={onStartDemo} className="hover:underline">Site Visit Console</a></li>
              <li><a href="#" onClick={onStartDemo} className="hover:underline">Financial Ledger</a></li>
              <li><a href="#" onClick={onStartDemo} className="hover:underline">WhatsApp Broadcaster</a></li>
              <li><a href="#" onClick={onStartDemo} className="hover:underline">Milestone Calendars</a></li>
              <li><a href="#" onClick={onStartDemo} className="hover:underline">Reports & Analytics</a></li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="md:col-span-2 space-y-3 text-left">
            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Company</h4>
            <ul className="space-y-2 text-[11px] font-semibold text-slate-450">
              <li><a href="#" onClick={onStartDemo} className="hover:underline">About Apni Estate</a></li>
              <li><a href="#" onClick={onStartDemo} className="hover:underline">Blog</a></li>
              <li><a href="#" onClick={onStartDemo} className="hover:underline">Careers</a></li>
              <li><a href="#" onClick={onStartDemo} className="hover:underline">Press</a></li>
              <li><a href="#" onClick={onStartDemo} className="hover:underline">Partners</a></li>
              <li><a href="#" onClick={onStartDemo} className="hover:underline">Contact Us</a></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="md:col-span-4 space-y-3 text-left">
            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Legal</h4>
            <ul className="space-y-2 text-[11px] font-semibold text-slate-450">
              <li><a href="#" onClick={onStartDemo} className="hover:underline">Privacy Policy</a></li>
              <li><a href="#" onClick={onStartDemo} className="hover:underline">Terms of Service</a></li>
              <li><a href="#" onClick={onStartDemo} className="hover:underline">Data Security</a></li>
              <li><a href="#" onClick={onStartDemo} className="hover:underline">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="max-w-7xl w-full mx-auto mt-10 pt-6 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 font-semibold text-[10px] text-slate-400">
          <p>© 2026 Apni Estate. All rights reserved. | Registered under Startup India & Startup Tripura | Recognized by DST</p>
          <div className="flex items-center gap-1.5 text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            All systems operational
          </div>
        </div>
      </footer>
    </div>
  );
}
