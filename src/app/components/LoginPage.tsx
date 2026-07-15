import React, { useState } from "react";
import logoImg from "../../../logo.jpeg";
import { ArrowLeft, Lock, Mail, Eye, EyeOff } from "lucide-react";

export function LoginPage({ onLogin, onBack }: { onLogin: () => void; onBack: () => void }) {
  const [email, setEmail] = useState("admin@apniestate.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-6 font-sans">
      <div className="absolute top-6 left-6">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-800 transition-colors shadow-xs"
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        <img src={logoImg} className="mx-auto w-16 h-16 rounded-2xl object-cover shadow-md animate-in zoom-in duration-300" alt="ApniEstate Logo" />
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight" style={{ fontFamily: "Plus Jakarta Sans" }}>
            Welcome Back
          </h2>
          <p className="text-slate-500 text-xs font-semibold mt-1">
            Access your real estate dashboard cockpit
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-100/80 rounded-[32px] space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600 transition-all"
                  style={{ borderColor: "#E2E8F0" }}
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                <a href="#" className="text-[11px] font-bold text-violet-600 hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-2xl text-sm border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600 transition-all"
                  style={{ borderColor: "#E2E8F0" }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-lg transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-slate-350 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs font-semibold text-slate-600 cursor-pointer">
                Remember my session
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md shadow-violet-500/10 text-sm disabled:opacity-75"
            >
              {loading ? "Authenticating..." : "Sign In & Enter CRM"}
            </button>
          </form>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Demo Credentials</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          <div className="bg-violet-50/50 border border-violet-100 p-4 rounded-2xl text-center space-y-1">
            <p className="text-[11px] font-semibold text-violet-800">No account required</p>
            <p className="text-[10px] text-violet-600 font-semibold leading-relaxed">
              Tap "Sign In" directly to access the high-fidelity demo environment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
