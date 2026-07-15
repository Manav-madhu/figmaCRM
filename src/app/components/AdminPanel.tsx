import React, { useState, useEffect } from "react";
import logoImg from "../../../logo.jpeg";
import { api } from "../api";
import {
  Users,
  CheckCircle,
  XCircle,
  Building,
  Mail,
  Calendar,
  ShieldAlert,
  ArrowLeft,
  Loader2,
  RefreshCw,
  LogOut
} from "lucide-react";

export function AdminPanel({
  onBack,
  onLogout
}: {
  onBack: () => void;
  onLogout: () => void;
}) {
  const [trials, setTrials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);

  const fetchTrials = async () => {
    setLoading(true);
    try {
      const data = await api.getTrials();
      setTrials(data);
    } catch (err) {
      console.error("Failed to fetch pending trials", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrials();
  }, []);

  const handleApprove = async (id: number) => {
    if (!confirm("Are you sure you want to approve this trial request? This will instantly activate their fresh CRM workspace.")) return;
    setActionId(id);
    try {
      await api.approveTrial(id);
      setTrials(prev => prev.filter(t => t.id !== id));
      alert("Trial request approved! User workspace activated.");
    } catch (err) {
      console.error(err);
      alert("Failed to approve trial.");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm("Are you sure you want to reject this request?")) return;
    setActionId(id);
    try {
      await api.rejectTrial(id);
      setTrials(prev => prev.filter(t => t.id !== id));
      alert("Trial request rejected.");
    } catch (err) {
      console.error(err);
      alert("Failed to reject trial.");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header Banner */}
      <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between sticky top-0 z-15 shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-800 transition-colors"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <div className="flex items-center gap-2">
            <img src={logoImg} className="w-8 h-8 rounded-lg object-cover" alt="ApniEstate Logo" />
            <h1 className="text-base font-black text-slate-900 tracking-tight" style={{ fontFamily: "Plus Jakarta Sans" }}>
              Admin console
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTrials}
            className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
            title="Refresh list"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 rounded-xl text-xs font-bold text-slate-700 transition-all"
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4 text-left">
            <div className="p-3.5 bg-violet-50 text-violet-600 rounded-2xl">
              <Users size={22} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Pending Approvals</span>
              <span className="text-2xl font-black text-slate-800 mt-1 block">{trials.length}</span>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4 text-left">
            <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
              <CheckCircle size={22} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Active Accounts</span>
              <span className="text-2xl font-black text-slate-800 mt-1 block">Live SaaS</span>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4 text-left">
            <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl">
              <ShieldAlert size={22} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">CRM Sandbox</span>
              <span className="text-2xl font-black text-slate-800 mt-1 block">Isolated</span>
            </div>
          </div>
        </div>

        {/* Pending Requests Section */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider" style={{ fontFamily: "Plus Jakarta Sans" }}>
              Pending Trial Activation Requests
            </h2>
            <span className="bg-violet-100 text-violet-700 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
              {trials.length} Awaiting
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {loading && trials.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-medium flex flex-col items-center gap-2">
                <Loader2 className="animate-spin text-violet-600" size={24} />
                <span>Loading pending requests...</span>
              </div>
            ) : trials.length === 0 ? (
              <div className="p-16 text-center space-y-2">
                <ShieldAlert size={36} className="text-slate-300 mx-auto" />
                <h3 className="font-extrabold text-sm text-slate-850">All caught up!</h3>
                <p className="text-xs text-slate-400 font-medium">No pending trial requests need approval right now.</p>
              </div>
            ) : (
              trials.map(trial => (
                <div key={trial.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/40 transition-colors">
                  <div className="space-y-2.5 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-900">{trial.name}</span>
                      <span className="text-[9px] font-bold bg-slate-100 border border-slate-200/80 text-slate-600 px-2 py-0.5 rounded-md uppercase">
                        Trial Request
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-1.5 text-slate-500 text-xs font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Mail size={13} className="text-slate-400" />
                        <span>{trial.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Building size={13} className="text-slate-400" />
                        <span>{trial.company || "Independent Workspace"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400" />
                        <span>Registered: {new Date(trial.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Building size={13} className="text-slate-400" />
                        <span>Title: {trial.job_title || "Real Estate Agent"} ({trial.city || "India"})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 md:self-center">
                    <button
                      disabled={actionId === trial.id}
                      onClick={() => handleReject(trial.id)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1 px-4 py-2 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 rounded-xl text-xs font-black text-slate-700 transition-all uppercase tracking-wider"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                    <button
                      disabled={actionId === trial.id}
                      onClick={() => handleApprove(trial.id)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all uppercase tracking-wider shadow-sm shadow-emerald-500/10"
                    >
                      {actionId === trial.id ? <Loader2 size={14} className="animate-spin" /> : <><CheckCircle size={14} /> Approve</>}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
