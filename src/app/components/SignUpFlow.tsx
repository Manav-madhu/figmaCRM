import React, { useState } from "react";
import logoImg from "../../../logo.jpeg";
import { api } from "../api";
import {
  ArrowLeft,
  Lock,
  Mail,
  User,
  Building,
  Phone,
  Briefcase,
  MapPin,
  CheckCircle,
  CreditCard,
  Zap,
  Clock,
  ChevronRight,
  ShieldCheck,
  Check
} from "lucide-react";

type SetupStep = "SIGNUP" | "PROFILE" | "PLAN" | "PAYMENT" | "PENDING_APPROVAL";

export function SignUpFlow({
  onBack,
  onComplete
}: {
  onBack: () => void;
  onComplete: (user: any) => void;
}) {
  const [step, setStep] = useState<SetupStep>("SIGNUP");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Signup form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [createdUser, setCreatedUser] = useState<any>(null);

  // Profile setup states
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [city, setCity] = useState("");

  // Subscription plan states
  const [selectedPlan, setSelectedPlan] = useState<"trial" | "premium">("trial");

  // Payment mock states
  const [cardNumber, setCardNumber] = useState("4000 1234 5678 9010");
  const [expiry, setExpiry] = useState("12/28");
  const [cvv, setCvv] = useState("123");

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill all required fields");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const user = await api.signup({ name, email, password, company });
      setCreatedUser(user);
      // Save temp user for header context
      localStorage.setItem("crm_user", JSON.stringify(user));
      setStep("PROFILE");
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.profileSetup({
        userId: createdUser.id,
        phone,
        job_title: jobTitle,
        city
      });
      // Update temp user in localStorage
      const updatedUser = { ...createdUser, phone, job_title: jobTitle, city };
      setCreatedUser(updatedUser);
      localStorage.setItem("crm_user", JSON.stringify(updatedUser));
      setStep("PLAN");
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = async (plan: "trial" | "premium") => {
    if (plan === "premium") {
      setSelectedPlan("premium");
      setStep("PAYMENT");
    } else {
      setError("");
      setLoading(true);
      try {
        const response = await api.subscribe({
          userId: createdUser.id,
          plan: "trial"
        });
        const updatedUser = { ...createdUser, status: response.status };
        setCreatedUser(updatedUser);
        localStorage.setItem("crm_user", JSON.stringify(updatedUser));
        setStep("PENDING_APPROVAL");
      } catch (err: any) {
        setError(err.message || "Failed to request trial");
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Simulate payment delay
      setTimeout(async () => {
        try {
          const response = await api.subscribe({
            userId: createdUser.id,
            plan: "premium"
          });
          const updatedUser = { ...createdUser, status: response.status };
          setCreatedUser(updatedUser);
          localStorage.setItem("crm_user", JSON.stringify(updatedUser));
          setLoading(false);
          onComplete(updatedUser);
        } catch (err: any) {
          setError(err.message || "Subscription activation failed");
          setLoading(false);
        }
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Payment process failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-6 font-sans">
      {/* Back to Landing */}
      {step === "SIGNUP" && (
        <div className="absolute top-6 left-6">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-800 transition-colors shadow-xs"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center space-y-4">
          <img src={logoImg} className="mx-auto w-14 h-14 rounded-2xl object-cover shadow-md" alt="ApniEstate Logo" />
          
          {/* Step Indicators */}
          {step !== "PENDING_APPROVAL" && (
            <div className="flex items-center justify-center gap-2 max-w-[200px] mx-auto pt-2">
              <div className={`h-1.5 rounded-full transition-all duration-300 ${step === "SIGNUP" ? "w-8 bg-violet-600" : "w-3 bg-violet-200"}`} />
              <div className={`h-1.5 rounded-full transition-all duration-300 ${step === "PROFILE" ? "w-8 bg-violet-600" : "w-3 bg-violet-200"}`} />
              <div className={`h-1.5 rounded-full transition-all duration-300 ${step === "PLAN" || step === "PAYMENT" ? "w-8 bg-violet-600" : "w-3 bg-violet-200"}`} />
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-3xl border border-slate-100/85 p-8 shadow-xl shadow-slate-100/50">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-semibold text-rose-600 animate-shake">
              {error}
            </div>
          )}

          {/* STEP 1: SIGNUP CREDENTIALS */}
          {step === "SIGNUP" && (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight" style={{ fontFamily: "Plus Jakarta Sans" }}>
                  Create CRM Workspace
                </h2>
                <p className="text-slate-400 text-xs font-medium mt-1">
                  Start setting up your agent profile
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 focus:border-violet-500 focus:bg-white rounded-2xl pl-11 pr-4 py-3 text-xs font-bold outline-none text-slate-800 transition-all placeholder-slate-400"
                      placeholder="Sarah Mitchell"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 focus:border-violet-500 focus:bg-white rounded-2xl pl-11 pr-4 py-3 text-xs font-bold outline-none text-slate-800 transition-all placeholder-slate-400"
                      placeholder="sarah@agency.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
                    <input
                      required
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 focus:border-violet-500 focus:bg-white rounded-2xl pl-11 pr-4 py-3 text-xs font-bold outline-none text-slate-800 transition-all placeholder-slate-400"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Agency / Company Name</label>
                  <div className="relative">
                    <Building className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
                    <input
                      type="text"
                      value={company}
                      onChange={e => setCompany(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 focus:border-violet-500 focus:bg-white rounded-2xl pl-11 pr-4 py-3 text-xs font-bold outline-none text-slate-800 transition-all placeholder-slate-400"
                      placeholder="ApniEstate Realtors"
                    />
                  </div>
                </div>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full mt-2 py-3.5 bg-violet-600 hover:bg-violet-750 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-2xl flex items-center justify-center gap-1.5 shadow-md shadow-violet-500/10 transition-colors"
              >
                {loading ? "Registering..." : <>Continue to Profile <ChevronRight size={14} /></>}
              </button>
            </form>
          )}

          {/* STEP 2: PROFILE SETUP */}
          {step === "PROFILE" && (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight" style={{ fontFamily: "Plus Jakarta Sans" }}>
                  Configure Profile
                </h2>
                <p className="text-slate-400 text-xs font-medium mt-1">
                  Add work credentials to customize your CRM
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
                    <input
                      required
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 focus:border-violet-500 focus:bg-white rounded-2xl pl-11 pr-4 py-3 text-xs font-bold outline-none text-slate-800 transition-all placeholder-slate-400"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Job Title</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
                    <input
                      required
                      type="text"
                      value={jobTitle}
                      onChange={e => setJobTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 focus:border-violet-500 focus:bg-white rounded-2xl pl-11 pr-4 py-3 text-xs font-bold outline-none text-slate-800 transition-all placeholder-slate-400"
                      placeholder="Senior Property Consultant"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Location / City</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
                    <input
                      required
                      type="text"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 focus:border-violet-500 focus:bg-white rounded-2xl pl-11 pr-4 py-3 text-xs font-bold outline-none text-slate-800 transition-all placeholder-slate-400"
                      placeholder="Mumbai, IN"
                    />
                  </div>
                </div>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full mt-2 py-3.5 bg-violet-600 hover:bg-violet-750 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-2xl flex items-center justify-center gap-1.5 shadow-md shadow-violet-500/10 transition-colors"
              >
                {loading ? "Saving Profile..." : <>Next: Choose Membership <ChevronRight size={14} /></>}
              </button>
            </form>
          )}

          {/* STEP 3: PLAN SELECTION */}
          {step === "PLAN" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight" style={{ fontFamily: "Plus Jakarta Sans" }}>
                  Activate Account
                </h2>
                <p className="text-slate-400 text-xs font-medium mt-1">
                  Choose your subscription access option
                </p>
              </div>

              <div className="space-y-4">
                {/* Plan A: Trial */}
                <div
                  onClick={() => setSelectedPlan("trial")}
                  className={`p-5 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                    selectedPlan === "trial" ? "border-violet-600 bg-violet-50/10" : "border-slate-100 hover:border-slate-250 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${selectedPlan === "trial" ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                        <Clock size={16} />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-850">15-Day Free Trial</h3>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">Subject to Admin Approval</p>
                      </div>
                    </div>
                    {selectedPlan === "trial" && (
                      <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center text-white">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Plan B: Premium */}
                <div
                  onClick={() => setSelectedPlan("premium")}
                  className={`p-5 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                    selectedPlan === "premium" ? "border-violet-600 bg-violet-50/10" : "border-slate-100 hover:border-slate-250 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${selectedPlan === "premium" ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                        <Zap size={16} />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-855">Premium Subscription</h3>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">Instant Active Workspace Account</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <span className="font-black text-sm text-slate-800">₹2,999/mo</span>
                      {selectedPlan === "premium" && (
                        <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center text-white">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <button
                disabled={loading}
                onClick={() => handlePlanSelect(selectedPlan)}
                className="w-full mt-2 py-3.5 bg-violet-600 hover:bg-violet-750 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-2xl flex items-center justify-center gap-1.5 shadow-md shadow-violet-500/10 transition-colors"
              >
                {loading ? "Requesting Trial..." : selectedPlan === "premium" ? <>Proceed to Checkout <ChevronRight size={14} /></> : "Submit Trial Request"}
              </button>
            </div>
          )}

          {/* STEP 4: PAYMENT SCREEN */}
          {step === "PAYMENT" && (
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight" style={{ fontFamily: "Plus Jakarta Sans" }}>
                  Complete Payment
                </h2>
                <p className="text-slate-400 text-xs font-medium mt-1">
                  Activate premium instantly
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-900 rounded-2xl p-5 text-white flex flex-col justify-between h-40 shadow-lg relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 w-32 h-32 rounded-full bg-white/5" />
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black uppercase tracking-wider opacity-60">ApniEstate Pay</span>
                    <CreditCard size={24} className="opacity-80" />
                  </div>
                  <div>
                    <span className="font-mono text-sm tracking-widest">{cardNumber}</span>
                    <div className="flex justify-between mt-4">
                      <div>
                        <p className="text-[7px] font-bold uppercase opacity-40">Card Holder</p>
                        <p className="text-[9px] font-bold">{name}</p>
                      </div>
                      <div>
                        <p className="text-[7px] font-bold uppercase opacity-40">Expiry</p>
                        <p className="text-[9px] font-bold">{expiry}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Card Number</label>
                  <input
                    required
                    type="text"
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/80 focus:border-violet-500 focus:bg-white rounded-2xl px-4 py-3 text-xs font-bold outline-none text-slate-800 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Expiry Date</label>
                    <input
                      required
                      type="text"
                      value={expiry}
                      onChange={e => setExpiry(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 focus:border-violet-500 focus:bg-white rounded-2xl px-4 py-3 text-xs font-bold outline-none text-slate-800 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">CVV</label>
                    <input
                      required
                      type="password"
                      value={cvv}
                      onChange={e => setCvv(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 focus:border-violet-500 focus:bg-white rounded-2xl px-4 py-3 text-xs font-bold outline-none text-slate-800 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("PLAN")}
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-2xl transition-colors"
                >
                  Back
                </button>
                <button
                  disabled={loading}
                  type="submit"
                  className="flex-[2] py-3.5 bg-[#5B3FD9] hover:bg-violet-850 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-2xl flex items-center justify-center gap-1.5 shadow-md shadow-violet-500/10 transition-colors"
                >
                  {loading ? "Processing..." : <>Pay & Activate</>}
                </button>
              </div>
            </form>
          )}

          {/* STEP 5: PENDING APPROVAL */}
          {step === "PENDING_APPROVAL" && (
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 mx-auto animate-bounce">
                <Clock size={28} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight" style={{ fontFamily: "Plus Jakarta Sans" }}>
                  Trial Request Pending
                </h2>
                <p className="text-slate-500 text-xs leading-relaxed mt-2 px-2">
                  Thank you, <span className="font-extrabold text-slate-800">{name}</span>! Your 15-day free trial request has been submitted. Our admin team will review and approve it shortly.
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-[11px] text-slate-500 font-bold text-left space-y-1.5">
                <div className="flex justify-between"><span>Workspace Name:</span><span className="text-slate-800">{company || "ApniEstate CRM"}</span></div>
                <div className="flex justify-between"><span>Registered Email:</span><span className="text-slate-800">{email}</span></div>
                <div className="flex justify-between"><span>Status:</span><span className="text-amber-600 uppercase font-black">Awaiting Admin Approval</span></div>
              </div>
              <button
                onClick={onBack}
                className="w-full py-3.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-colors"
              >
                Return to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
