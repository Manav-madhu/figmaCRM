import { useState, useEffect, createContext, useContext, useRef } from "react";
import { api } from "./api";
import {
  Home,
  Users,
  Building2,
  CalendarDays,
  User,
  Search,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  Clock,
  Star,
  Heart,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Plus,
  Filter,
  MoreHorizontal,
  MoreVertical,
  MessageSquare,
  MessageCircle,
  Bed,
  Bath,
  Square,
  Zap,
  Target,
  IndianRupee,
  ArrowLeft,
  Upload,
  Download,
  Edit,
  Trash2,
  Send,
  Paperclip,
  Building,
  Settings as SettingsIcon,
  Eye,
  EyeOff,
  Copy,
  FileText,
  BarChart2,
  Check,
  X,
  Share2,
  LogOut,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Percent,
  Hash,
  Wallet,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// ─── Brand tokens (matches original Heitkamp Realty design) ──────
const VIOLET = "#7C5CFC";
const AMBER = "#F59E0B";
const WA = "#25D366"; // WhatsApp brand green
const GR = "#10B981"; // success green
const RD = "#EF4444"; // danger red
const DK = "#1A1A2E"; // foreground
const BD = "#4B4B6B"; // secondary body text
const MT = "#6B6B8A"; // muted text
const BR = "#ECE8F7"; // hairline border
const BG = "#F2F1F8"; // app background

const openWhatsApp = (phone: string, text?: string) => {
  const cleanPhone = phone.replace(/[^\d]/g, "");
  const url = text 
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}` 
    : `https://wa.me/${cleanPhone}`;
  window.open(url, "_blank");
};

// ─── App Context for backend API integration ──────────────────────
const AppContext = createContext<{
  leads: any[];
  properties: any[];
  tasks: any[];
  appointments: any[];
  followups: any[];
  broadcasts: any[];
  stats: any[];
  analytics: any;
  incomes: any[];
  setLeads: React.Dispatch<React.SetStateAction<any[]>>;
  setProperties: React.Dispatch<React.SetStateAction<any[]>>;
  setTasks: React.Dispatch<React.SetStateAction<any[]>>;
  setAppointments: React.Dispatch<React.SetStateAction<any[]>>;
  setFollowups: React.Dispatch<React.SetStateAction<any[]>>;
  setBroadcasts: React.Dispatch<React.SetStateAction<any[]>>;
  setStats: React.Dispatch<React.SetStateAction<any[]>>;
  setIncomes: React.Dispatch<React.SetStateAction<any[]>>;
  refreshData: () => Promise<void>;
} | null>(null);

const STATUS_CONFIG = {
  New: { bg: "#EDE9FF", text: VIOLET },
  "Not Interested": { bg: "#FEE2E2", text: "#991B1B" },
  "Site Visit": { bg: "#FFEFE6", text: "#FF7A00" },
  "Call Later": { bg: "#F3F4F6", text: "#4B5563" },
  "Send Details": { bg: "#ECFDF5", text: "#10B981" },
} as const;

type LeadStatus = keyof typeof STATUS_CONFIG;

function getStatusDisplay(status: LeadStatus) {
  const config = STATUS_CONFIG[status] || { bg: "#EDE9FF", text: "#7C5CFC" };
  return { label: status, bg: config.bg, text: config.text };
}
type Tab = "dashboard" | "leads" | "properties" | "calendar" | "profile";
type Screen =
  | Tab
  | "lead-detail"
  | "pipeline"
  | "followups"
  | "tasks"
  | "whatsapp"
  | "broadcasts"
  | "analytics"
  | "settings"
  | "import"
  | "marketing-automation"
  | "income";

// ─── Mock data ────────────────────────────────────────────────────

const stats = [
  { label: "Active Leads", value: "142", delta: "+12%", icon: Target, color: "#7C5CFC", bg: "#EDE9FF" },
  { label: "Properties", value: "38", delta: "+4", icon: Building2, color: "#10B981", bg: "#D1FAE5" },
  { label: "Revenue", value: "₹1.98L", delta: "+8%", icon: IndianRupee, color: "#F59E0B", bg: "#FEF3C7" },
  { label: "Tasks Due", value: "17", delta: "Urgent", icon: Zap, color: "#EF4444", bg: "#FEE2E2" },
];

const leads = [
  {
    id: 1,
    name: "Christopher Kane",
    initials: "CK",
    avatarBg: VIOLET,
    type: "Buyer",
    status: "Send Details" as LeadStatus,
    priority: "High",
    project: "Harbour View Tower",
    city: "San Francisco",
    tags: ["Hot", "Investor"],
    budget: "₹8.5L",
    lastContact: "2h ago",
    assigned: "You",
    phone: "+1 415-553-0186",
    email: "c.kane@gmail.com",
    task: "Prospecting Update",
    taskDue: "Jun 28, 2025",
  },
  {
    id: 2,
    name: "Addie Bradford",
    initials: "AB",
    avatarBg: "#10B981",
    type: "Seller",
    status: "Site Visit" as LeadStatus,
    priority: "Medium",
    project: "Skyline Residences",
    city: "Chicago",
    tags: ["Seller"],
    budget: "₹1.2Cr",
    lastContact: "1d ago",
    assigned: "Sara M.",
    phone: "+1 312-440-9921",
    email: "addie.b@outlook.com",
    task: "Schedule Viewing",
    taskDue: "Jul 3, 2025",
  },
  {
    id: 3,
    name: "Thor Johnson",
    initials: "TJ",
    avatarBg: "#3B82F6",
    type: "Investor",
    status: "Call Later" as LeadStatus,
    priority: "High",
    project: "Harbour View Tower",
    city: "New York",
    tags: ["Investor"],
    budget: "₹3.4Cr",
    lastContact: "3d ago",
    assigned: "You",
    phone: "+1 646-210-3348",
    email: "thor.j@ventures.co",
    task: "Portfolio Review",
    taskDue: "Jul 5, 2025",
  },
  {
    id: 4,
    name: "Gora Williams",
    initials: "GW",
    avatarBg: "#8B5CF6",
    type: "Renter",
    status: "New" as LeadStatus,
    priority: "Low",
    project: "Green Courtyard",
    city: "Chicago",
    tags: ["Renter"],
    budget: "₹4,200/mo",
    lastContact: "5m ago",
    assigned: "You",
    phone: "+1 929-771-0044",
    email: "gora.w@email.com",
    task: "Send Listings",
    taskDue: "Today",
  },
  {
    id: 5,
    name: "Diana Hess",
    initials: "DH",
    avatarBg: "#EC4899",
    type: "Buyer",
    status: "Site Visit" as LeadStatus,
    priority: "Medium",
    project: "Oak Park Flats",
    city: "Chicago",
    tags: ["Closed Deal"],
    budget: "₹6.2L",
    lastContact: "1w ago",
    assigned: "Tom R.",
    phone: "+1 305-882-6610",
    email: "diana.hess@me.com",
    task: "Post-sale Follow-up",
    taskDue: "Jul 10, 2025",
  },
  {
    id: 6,
    name: "Marcus Chen",
    initials: "MC",
    avatarBg: "#F59E0B",
    type: "Buyer",
    status: "Contacted" as LeadStatus,
    priority: "Medium",
    project: "Oak Park Flats",
    city: "Chicago",
    tags: ["End User"],
    budget: "₹4.1L",
    lastContact: "6h ago",
    assigned: "You",
    phone: "+1 773-555-0199",
    email: "marcus.c@mail.com",
    task: "Send Floor Plans",
    taskDue: "Tomorrow",
  },
  {
    id: 7,
    name: "Naomi Cole",
    initials: "NC",
    avatarBg: "#6B6B8A",
    type: "Investor",
    status: "Lost" as LeadStatus,
    priority: "Low",
    project: "Skyline Residences",
    city: "Chicago",
    tags: ["Investor"],
    budget: "₹2.1Cr",
    lastContact: "2w ago",
    assigned: "Tom R.",
    phone: "+1 872-555-0142",
    email: "naomi.cole@corp.com",
    task: "Archive",
    taskDue: "—",
  },
];

const properties = [
  {
    id: 1,
    name: "Green Courtyard",
    address: "1923 Elmwood Ave, Unit 304",
    price: "₹2,340/mo",
    salePrice: "₹4.85L",
    type: "Rent",
    beds: 2,
    baths: 2,
    sqft: "1,180",
    status: "Available",
    statusColor: "#10B981",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=260&fit=crop&auto=format",
    featured: true,
  },
  {
    id: 2,
    name: "Skyline Residences",
    address: "850 Marina Blvd, Unit 21B",
    price: "₹2,340/mo",
    salePrice: "₹6.9L",
    type: "Sale",
    beds: 3,
    baths: 2,
    sqft: "1,560",
    status: "Pending",
    statusColor: "#F59E0B",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=260&fit=crop&auto=format",
    featured: false,
  },
  {
    id: 3,
    name: "Oak Park Flats",
    address: "312 Oak Dr, Unit 7",
    price: "₹1,890/mo",
    salePrice: "₹3.85L",
    type: "Rent",
    beds: 1,
    baths: 1,
    sqft: "780",
    status: "Available",
    statusColor: "#10B981",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=260&fit=crop&auto=format",
    featured: false,
  },
  {
    id: 4,
    name: "Harbour View Tower",
    address: "7 Harbour Ln, Floor 12",
    price: "₹5,800/mo",
    salePrice: "₹1.25Cr",
    type: "Both",
    beds: 4,
    baths: 3,
    sqft: "2,780",
    status: "Exclusive",
    statusColor: VIOLET,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=260&fit=crop&auto=format",
    featured: false,
  },
];

const appointments = [
  { time: "09:00", title: "Property Viewing", sub: "Christopher Kane · Oak Park Flats", type: "viewing", color: VIOLET },
  { time: "11:30", title: "Follow-up Call", sub: "Thor Johnson · Portfolio Review", type: "call", color: "#10B981" },
  { time: "14:00", title: "Lease Signing", sub: "Gora Williams · Green Courtyard", type: "signing", color: AMBER },
  { time: "15:45", title: "New Lead Meeting", sub: "Addie Bradford · Introductory", type: "meeting", color: "#3B82F6" },
  { time: "17:00", title: "Team Sync", sub: "All Agents · Weekly Pipeline", type: "internal", color: "#8B5CF6" },
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const weekDates = [30, 1, 2, 3, 4, 5, 6];
const todayIdx = 3;

const FOLLOWUPS = [
  { id: 1, leadId: 1, name: "Christopher Kane", initials: "CK", color: VIOLET, note: "Send revised pricing sheet", time: "10:30 AM", overdue: false },
  { id: 2, leadId: 3, name: "Thor Johnson", initials: "TJ", color: "#3B82F6", note: "Discuss payment plan options", time: "12:00 PM", overdue: false },
  { id: 3, leadId: 2, name: "Addie Bradford", initials: "AB", color: "#10B981", note: "Confirm site visit timing", time: "Yesterday 3PM", overdue: true },
  { id: 4, leadId: 6, name: "Marcus Chen", initials: "MC", color: "#F59E0B", note: "Share brochure and floor plans", time: "2:30 PM", overdue: false },
];

const TASKS_DATA = [
  { id: 1, title: "Send project brochure to Christopher", lead: "Christopher Kane", due: "Today 12:00 PM", overdue: false, completed: false },
  { id: 2, title: "Schedule site visit for Addie Bradford", lead: "Addie Bradford", due: "Today 3:00 PM", overdue: false, completed: false },
  { id: 3, title: "Follow up on loan pre-approval", lead: "Diana Hess", due: "Yesterday 5:00 PM", overdue: true, completed: false },
  { id: 4, title: "Send WhatsApp greeting to new leads", lead: "", due: "Today 10:00 AM", overdue: true, completed: false },
  { id: 5, title: "Update property pricing for Skyline", lead: "", due: "Tomorrow 11:00 AM", overdue: false, completed: false },
  { id: 6, title: "Prepare project presentation", lead: "Marcus Chen", due: "Fri 2:00 PM", overdue: false, completed: true },
];

const PIPELINE_STAGES = [
  { stage: "New" as LeadStatus, leads: leads.filter((l) => l.status === "New") },
  { stage: "Call Later" as LeadStatus, leads: leads.filter((l) => l.status === "Call Later") },
  { stage: "Send Details" as LeadStatus, leads: leads.filter((l) => l.status === "Send Details") },
  { stage: "Site Visit" as LeadStatus, leads: leads.filter((l) => l.status === "Site Visit") },
  { stage: "Not Interested" as LeadStatus, leads: leads.filter((l) => l.status === "Not Interested") },
];

const WEEKLY = [
  { day: "Mon", leads: 4, booked: 1 },
  { day: "Tue", leads: 7, booked: 2 },
  { day: "Wed", leads: 3, booked: 0 },
  { day: "Thu", leads: 9, booked: 3 },
  { day: "Fri", leads: 6, booked: 2 },
  { day: "Sat", leads: 5, booked: 1 },
  { day: "Sun", leads: 2, booked: 0 },
];

const REVENUE = [
  { month: "Feb", v: 120 }, { month: "Mar", v: 145 }, { month: "Apr", v: 98 },
  { month: "May", v: 172 }, { month: "Jun", v: 160 }, { month: "Jul", v: 198 },
];

const SOURCES = [
  { name: "Referral", value: 34, color: VIOLET },
  { name: "Website", value: 26, color: "#3B82F6" },
  { name: "WhatsApp", value: 18, color: WA },
  { name: "Open House", value: 14, color: AMBER },
  { name: "Walk-in", value: 8, color: "#0891B2" },
];

const BROADCASTS_DATA = [
  { id: 1, name: "Summer Open House Invite", preview: "Hi {Name}, join us this Saturday for an exclusive open house at Harbour View Tower...", status: "Sent", date: "Jun 15, 2025", recipients: 142, sent: 138, failed: 4 },
  { id: 2, name: "New Listing — Oak Park Flats", preview: "Exciting news! A new 1BHK just listed at Oak Park Flats, available for immediate move-in...", status: "Sending", date: "Jun 20, 2025", recipients: 89, sent: 61, failed: 2 },
  { id: 3, name: "Follow-up — June Leads", preview: "Hi {Name}, just checking in on your property search. We have new options that match...", status: "Scheduled", date: "Jun 25, 2025", recipients: 34, sent: 0, failed: 0 },
];

// ─── Shared micro-components ──────────────────────────────────────

function Avatar({ initials, bg, size = "md" }: { initials: string; bg: string; size?: "sm" | "md" | "lg" | "xl" }) {
  const sizes = { sm: "w-8 h-8 text-[10px]", md: "w-11 h-11 text-xs", lg: "w-14 h-14 text-lg", xl: "w-20 h-20 text-2xl" };
  
  let finalBg = bg;
  let finalTextColor = "#fff";
  
  if (bg) {
    const bgLower = bg.toLowerCase();
    if (bgLower === "#7c5cfc" || bgLower === "violet") {
      finalBg = "#EFF0FE";
      finalTextColor = "#7C5CFC";
    } else if (bgLower === "#10b981") {
      finalBg = "#EEFBF6";
      finalTextColor = "#10B981";
    } else if (bgLower === "#3b82f6") {
      finalBg = "#EEF6FF";
      finalTextColor = "#3B82F6";
    } else if (bgLower === "#8b5cf6") {
      finalBg = "#F5F3FF";
      finalTextColor = "#8B5CF6";
    } else if (bgLower === "#ec4899") {
      finalBg = "#FDF2F8";
      finalTextColor = "#EC4899";
    } else if (bgLower === "#f59e0b" || bgLower === "#d97706") {
      finalBg = "#FFF9F2";
      finalTextColor = "#D97706";
    } else if (bgLower === "#ef4444") {
      finalBg = "#FEE2E2";
      finalTextColor = "#EF4444";
    } else if (bgLower === "#6b6b8a") {
      finalBg = "#F1F1F5";
      finalTextColor = "#6B6B8A";
    } else if (bg.startsWith("#")) {
      finalBg = bg + "1A"; // 10% opacity
      finalTextColor = bg;
    }
  }

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-extrabold flex-shrink-0 select-none`}
      style={{ backgroundColor: finalBg, color: finalTextColor }}
    >
      {initials}
    </div>
  );
}

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: color + "22", color }}>
      {label}
    </span>
  );
}

function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const c = STATUS_CONFIG[status];
  return (
    <span
      className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide"
      style={{ backgroundColor: c.bg, color: c.text, border: (c as any).border ? `1px solid ${(c as any).border}` : undefined }}
    >
      {status}
    </span>
  );
}

function Card({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm ${className}`} style={style}>
      {children}
    </div>
  );
}

function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="font-bold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h2>
      {action && (
        <button className="text-xs font-semibold" style={{ color: VIOLET }} onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="w-12 h-6 rounded-full relative transition-all flex-shrink-0"
      style={{ backgroundColor: on ? VIOLET : BR }}
    >
      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all" style={{ left: on ? "calc(100% - 22px)" : 2 }} />
    </button>
  );
}

function ScreenHeader({ title, onBack, right }: { title: string; onBack: () => void; right?: React.ReactNode }) {
  return (
    <div className="px-5 pt-12 pb-5 bg-white border-b border-border flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onBack} className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#EDE9FF" }}>
          <ArrowLeft size={16} style={{ color: VIOLET }} />
        </button>
        <h1 className="text-lg font-bold text-foreground truncate" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h1>
      </div>
      {right}
    </div>
  );
}

// ─── Tab: Dashboard ────────────────────────────────────────────────

const revenueChartData = [
  { day: 1, revenue: 50000 },
  { day: 5, revenue: 80000 },
  { day: 10, revenue: 110000 },
  { day: 15, revenue: 140000 },
  { day: 20, revenue: 160000 },
  { day: 22, revenue: 230000 },
  { day: 25, revenue: 180000 },
  { day: 28, revenue: 220000 },
  { day: 30, revenue: 200000 },
];

const recentEarnings = [
  {
    name: "Rohit Sharma",
    initials: "RS",
    config: "3BHK Apartment",
    amount: "+₹25,000",
    time: "Today",
    leadId: 1,
    bg: "#EFF0FE",
    fg: "#7C5CFC",
  },
  {
    name: "Pooja Patel",
    initials: "PP",
    config: "2BHK Apartment",
    amount: "+₹15,000",
    time: "Yesterday",
    leadId: 2,
    bg: "#EEFBF6",
    fg: "#10B981",
  },
  {
    name: "Amit Kumar",
    initials: "AS",
    config: "4BHK Apartment",
    amount: "+₹18,000",
    time: "2 Days ago",
    leadId: 3,
    bg: "#FFF9F2",
    fg: "#F59E0B",
  },
];

function DashboardTab({
  go,
  goTab,
  back,
  setSelectedLeadId,
}: {
  go: (s: Screen) => void;
  goTab: (t: Tab) => void;
  back: () => void;
  setSelectedLeadId: (id: number) => void;
}) {
  const [income, setIncome] = useState(() => Number(localStorage.getItem("crm_income") || 128000));
  const [pending, setPending] = useState(() => Number(localStorage.getItem("crm_pending") || 70000));
  const [closedCount, setClosedCount] = useState(() => Number(localStorage.getItem("crm_closed") || 12));

  useEffect(() => {
    localStorage.setItem("crm_income", income.toString());
  }, [income]);

  useEffect(() => {
    localStorage.setItem("crm_pending", pending.toString());
  }, [pending]);

  useEffect(() => {
    localStorage.setItem("crm_closed", closedCount.toString());
  }, [closedCount]);

  const [editingIncome, setEditingIncome] = useState(false);
  const [editingPending, setEditingPending] = useState(false);
  const [editingClosed, setEditingClosed] = useState(false);

  const profit = income + pending;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F8F9FE]">
      {/* Top Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 bg-[#F8F9FE] flex-shrink-0 z-10">
        <button
          onClick={back}
          className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-800 transition-colors"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>
        <h1
          className="text-slate-900 text-lg font-bold"
          style={{ fontFamily: "Plus Jakarta Sans" }}
        >
          Revenue
        </h1>
        <div className="relative">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 rounded-xl px-3 py-1.5 shadow-xs cursor-pointer select-none">
            <span className="text-[11px] font-bold text-slate-700">This Month</span>
            <ChevronDown size={14} className="text-slate-500" strokeWidth={2.5} />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div
        className="flex-1 overflow-y-auto px-5 pb-6 space-y-5"
        style={{ scrollbarWidth: "none" }}
      >
        {/* Purple Card with AreaChart */}
        <div
          onClick={() => goTab("profile")}
          className="bg-gradient-to-br from-[#7C5CFC] via-[#6340FD] to-[#5131D7] rounded-3xl p-5 shadow-lg shadow-violet-500/15 flex flex-col relative overflow-hidden cursor-pointer"
        >
          {/* Card Info */}
          <div>
            <p className="text-white/70 text-[10px] font-semibold uppercase tracking-wider">
              Total Profit
            </p>
            <h2 className="text-white text-3xl font-extrabold mt-1 tracking-tight">
              ₹{profit.toLocaleString("en-IN")}
            </h2>
            <div className="flex items-center gap-1 mt-1 text-white/90 text-xs">
              <span className="text-emerald-400 font-bold flex items-center">
                <ArrowUpRight size={14} strokeWidth={3} className="mr-0.5" /> 8%
              </span>
              <span className="text-white/60">vs last month</span>
            </div>
          </div>

          {/* Area Chart */}
          <div className="h-32 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueChartData}
                margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255, 255, 255, 0.6)", fontSize: 10, fontWeight: "bold" }}
                  ticks={[1, 10, 20, 30]}
                  dy={5}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255, 255, 255, 0.6)", fontSize: 10, fontWeight: "bold" }}
                  ticks={[0, 100000, 200000, 300000]}
                  tickFormatter={(val) => (val === 0 ? "0" : `${val / 1000}k`)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(30, 27, 75, 0.95)",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "11px",
                  }}
                  formatter={(value: any) => [`₹${value.toLocaleString()}`, "Revenue"]}
                  labelFormatter={(label) => `Day ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#ffffff"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Overview Section */}
        <div>
          <h3
            className="text-slate-900 font-bold text-sm mb-3 px-0.5 tracking-tight"
            style={{ fontFamily: "Plus Jakarta Sans" }}
          >
            Revenue Overview
          </h3>

          <div
            className="flex items-center gap-2.5 overflow-x-auto pb-1"
            style={{ scrollbarWidth: "none" }}
          >
            {/* Card 1: Total Profit */}
            <div
              className="flex-1 min-w-[85px] bg-white rounded-2xl p-3 border border-slate-100/80 shadow-xs flex flex-col items-center justify-between text-center h-28 border-slate-100"
            >
              <span className="text-[10px] text-slate-500 font-bold leading-tight block h-6">
                Total Profit
              </span>
              <span className="text-slate-800 text-[13px] font-black tracking-tight mt-1.5">
                ₹{profit.toLocaleString("en-IN")}
              </span>
              <span className="text-emerald-500 text-[9px] font-bold mt-1.5 flex items-center gap-0.5">
                <ArrowUpRight size={10} strokeWidth={3} /> 8%
              </span>
            </div>

            {/* Card 2: Income */}
            <div
              className="flex-1 min-w-[85px] bg-white rounded-2xl p-3 border border-slate-100/80 shadow-xs flex flex-col items-center justify-between text-center h-28 cursor-pointer hover:shadow-md hover:border-slate-200/50 transition-all active:scale-[0.97]"
              onClick={() => go("income")}
            >
              {/* Income Badge Graphic */}
              <div className="h-6 flex items-center justify-center">
                <div className="bg-[#EEF1FF] border border-[#D5DCFF] px-2 py-0.5 rounded-full">
                  <span
                    className="text-[9px] font-black text-[#5B3FD9] uppercase tracking-wider"
                    style={{ fontFamily: "monospace" }}
                  >
                    Income
                  </span>
                </div>
              </div>
              <span className="text-slate-800 text-[13px] font-black tracking-tight mt-1.5 flex items-center gap-0.5">
                ₹{income.toLocaleString("en-IN")} <span className="text-[10px] opacity-40">➔</span>
              </span>
              <span className="text-emerald-500 text-[9px] font-bold mt-1.5 flex items-center gap-0.5">
                <ArrowUpRight size={10} strokeWidth={3} /> 12%
              </span>
            </div>

            {/* Card 3: Pending */}
            <div
              className="flex-1 min-w-[85px] bg-white rounded-2xl p-3 border border-slate-100/80 shadow-xs flex flex-col items-center justify-between text-center h-28 cursor-pointer hover:shadow-md hover:border-slate-200/50 transition-all active:scale-[0.97]"
              onClick={() => !editingPending && setEditingPending(true)}
            >
              {/* Pending Badge Graphic */}
              <div className="h-6 flex items-center justify-center">
                <div className="bg-[#FFF8F2] border border-[#FFE7D4] px-1.5 py-0.5 rounded-full">
                  <span
                    className="text-[9px] font-black text-[#F59E0B] uppercase tracking-wider"
                    style={{ fontFamily: "monospace" }}
                  >
                    Pending
                  </span>
                </div>
              </div>
              {editingPending ? (
                <input
                  type="number"
                  autoFocus
                  defaultValue={pending}
                  onBlur={(e) => {
                    setPending(Number(e.target.value) || 0);
                    setEditingPending(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setPending(Number((e.target as HTMLInputElement).value) || 0);
                      setEditingPending(false);
                    }
                  }}
                  className="w-full text-center text-slate-800 text-[12px] font-black tracking-tight mt-1.5 border border-slate-200 rounded-md focus:outline-none focus:border-violet-500 py-0.5 bg-slate-50"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="text-slate-800 text-[13px] font-black tracking-tight mt-1.5 flex items-center gap-0.5">
                  ₹{pending.toLocaleString("en-IN")} <span className="text-[10px] opacity-40">✏️</span>
                </span>
              )}
              <span className="text-[#F59E0B] text-[9px] font-bold mt-1.5 flex items-center gap-0.5">
                <ArrowDownRight size={10} strokeWidth={3} /> 5%
              </span>
            </div>

            {/* Card 4: Closed */}
            <div
              className="flex-1 min-w-[85px] bg-white rounded-2xl p-3 border border-slate-100/80 shadow-xs flex flex-col items-center justify-between text-center h-28 cursor-pointer hover:shadow-md hover:border-slate-200/50 transition-all active:scale-[0.97]"
              onClick={() => !editingClosed && setEditingClosed(true)}
            >
              {/* Closed Badge Graphic */}
              <div className="h-6 flex items-center justify-center">
                <div className="bg-[#F0FDF4] border border-[#DCFCE7] px-2 py-0.5 rounded-full">
                  <span
                    className="text-[9px] font-bold text-[#166534] uppercase tracking-wider"
                    style={{ fontFamily: "monospace" }}
                  >
                    Closed
                  </span>
                </div>
              </div>
              {editingClosed ? (
                <input
                  type="number"
                  autoFocus
                  defaultValue={closedCount}
                  onBlur={(e) => {
                    setClosedCount(Number(e.target.value) || 0);
                    setEditingClosed(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setClosedCount(Number((e.target as HTMLInputElement).value) || 0);
                      setEditingClosed(false);
                    }
                  }}
                  className="w-full text-center text-slate-800 text-[12px] font-black tracking-tight mt-1.5 border border-slate-200 rounded-md focus:outline-none focus:border-violet-500 py-0.5 bg-slate-50"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="text-slate-800 text-[13px] font-black tracking-tight mt-1.5 flex items-center gap-0.5">
                  {closedCount} <span className="text-[10px] opacity-40">✏️</span>
                </span>
              )}
              <span className="text-[#166534] text-[9px] font-bold mt-1.5 flex items-center gap-0.5">
                <ArrowUpRight size={10} strokeWidth={3} /> Deals
              </span>
            </div>
          </div>
        </div>

        {/* Recent Earnings Section */}
        <div>
          <div className="flex items-center justify-between mb-3 px-0.5">
            <h3
              className="text-slate-900 font-bold text-sm tracking-tight"
              style={{ fontFamily: "Plus Jakarta Sans" }}
            >
              Recent Earnings
            </h3>
            <button
              onClick={() => goTab("leads")}
              className="text-[#7C5CFC] text-xs font-bold hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {recentEarnings.map((earning, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSelectedLeadId(earning.leadId);
                  go("lead-detail");
                }}
                className="bg-white rounded-2xl p-3 border border-slate-100/80 shadow-xs hover:shadow-md hover:border-slate-200/50 transition-all active:scale-[0.98] flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {/* Initials Circle */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: earning.bg,
                      color: earning.fg,
                    }}
                  >
                    {earning.initials}
                  </div>
                  <div>
                    <h4 className="text-slate-800 text-xs font-extrabold tracking-tight">
                      {earning.name}
                    </h4>
                    <p className="text-[10px] text-slate-450 mt-0.5 font-medium">
                      {earning.config}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-emerald-500 text-xs font-black block">
                    {earning.amount}
                  </span>
                  <span className="text-[10px] text-slate-450 mt-0.5 block font-medium">
                    {earning.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Leads ─────────────────────────────────────────────────────

function LeadsTab({ go, openLead, onAddLead, onScheduleVisit }: { go: (s: Screen) => void; openLead: (id: number) => void; onAddLead: () => void; onScheduleVisit: (lead: any) => void }) {
  const { leads, refreshData, setLeads } = useContext(AppContext)!;
  const [search, setSearch] = useState("");
  const [activeStatus, setStatus] = useState<"All" | LeadStatus>("All");
  const [activePill, setActivePill] = useState<"All" | "Hot">("All");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"recent" | "alphabetical">("recent");

  const [activeDropdownLeadId, setActiveDropdownLeadId] = useState<number | null>(null);
  const [sharePropLead, setSharePropLead] = useState<any | null>(null);

  const handleStatusChange = async (lead: any, newStatus: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === lead.id ? { ...l, status: newStatus } : l))
    );

    try {
      const updateData: any = { status: newStatus };
      if (newStatus === "Send Details") updateData.linkResponse = "Interested";
      if (newStatus === "Not Interested") updateData.linkResponse = "Not Interested";
      
      await api.updateLead(lead.id, updateData);
      refreshData();
    } catch (err) {
      console.error("Failed to update lead status:", err);
    }
  };

  const handleSharePropertySelect = async (prop: any) => {
    if (!sharePropLead) return;
    const link = `${window.location.origin}/?view=public-property&propertyId=${prop.id}&leadId=${sharePropLead.id}`;
    const nameFirst = sharePropLead.name.split(" ")[0];
    const text = `Hi ${nameFirst}, check out this property listing: "${prop.name}". Let me know your thoughts: ${link}`;
    setSharePropLead(null);

    // Auto-create a scheduled follow-up in the database for 24 hours from now
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const followTime = tomorrow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " " + tomorrow.toLocaleDateString([], { month: 'short', day: 'numeric' });
      await api.createFollowup({
        leadId: sharePropLead.id,
        name: sharePropLead.name,
        initials: sharePropLead.initials,
        color: sharePropLead.avatarBg,
        note: `Follow-up: No response from lead after sharing property ${prop.name}`,
        time: followTime,
        overdue: false
      });
      refreshData();
    } catch (err) {
      console.error("Failed to create automatic follow-up:", err);
    }

    openWhatsApp(sharePropLead.phone, text);
  };

  const activeLeads = leads.filter(l => l.status !== "Not Interested");
  const allActiveCount = activeLeads.length;
  
  const hotLeads = activeLeads.filter(l => {
    // Parse tags safely if it's a string from SQLite or already an array
    let tagsList: string[] = [];
    if (Array.isArray(l.tags)) {
      tagsList = l.tags;
    } else if (typeof l.tags === "string") {
      try {
        tagsList = JSON.parse(l.tags);
      } catch (e) {
        tagsList = l.tags ? l.tags.split(",") : [];
      }
    }
    return tagsList.includes("Hot") || l.priority === "High";
  });
  const hotLeadsCount = hotLeads.length;

  const newThisWeekCount = activeLeads.filter(l => l.status === "New").length;
  
  // Count how many follow-ups or contacted leads
  const followupTodayCount = activeLeads.filter(l => {
    const isContacted = l.status === "Call Later";
    const isTaskToday = l.taskDue?.toLowerCase().includes("today");
    return isContacted || isTaskToday;
  }).length;

  const displayLeads = (activePill === "All" ? leads : hotLeads).filter((l) => {
    const q = search.toLowerCase();
    const matchesSearch = l.name.toLowerCase().includes(q) || l.phone.includes(search);
    const matchesStatus = showFilters
      ? (activeStatus === "All" ? true : l.status === activeStatus)
      : l.status !== "Not Interested";
    return matchesSearch && matchesStatus;
  });

  const sortedLeads = [...displayLeads].sort((a, b) => {
    if (sortBy === "alphabetical") {
      return a.name.localeCompare(b.name);
    } else {
      return b.id - a.id;
    }
  });

  const statuses: ("All" | LeadStatus)[] = ["All", "New", "Not Interested", "Site Visit", "Call Later", "Send Details"];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F8F9FE]">
      {/* Top Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-3 bg-white flex-shrink-0 border-b border-slate-100">
        <button
          onClick={() => go("dashboard")}
          className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-800 transition-colors"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>
        <h1
          className="text-slate-900 text-lg font-bold"
          style={{ fontFamily: "Plus Jakarta Sans" }}
        >
          Active Leads
        </h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            showFilters ? "bg-violet-50 text-violet-600" : "hover:bg-slate-50 text-slate-800"
          }`}
        >
          <Filter size={20} strokeWidth={2} />
        </button>
      </div>

      {/* Horizontal Filter Pills */}
      <div className="px-5 py-4 bg-white flex gap-3 flex-shrink-0 border-b border-slate-100/50">
        <button
          onClick={() => {
            setActivePill("All");
            setStatus("All");
          }}
          className="flex-1 py-3 px-4 rounded-full text-[13px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
          style={{
            backgroundColor: activePill === "All" ? VIOLET : "#FFF",
            color: activePill === "All" ? "#FFF" : "#475569",
            border: activePill === "All" ? `1.5px solid ${VIOLET}` : "1.5px solid #E2E8F0"
          }}
        >
          All Leads
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-extrabold"
            style={{
              backgroundColor: activePill === "All" ? "rgba(255,255,255,0.25)" : "#F1F5F9",
              color: activePill === "All" ? "#FFF" : "#64748B"
            }}
          >
            {allActiveCount}
          </span>
        </button>
        <button
          onClick={() => {
            setActivePill("Hot");
          }}
          className="flex-1 py-3 px-4 rounded-full text-[13px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
          style={{
            backgroundColor: activePill === "Hot" ? VIOLET : "#FFF",
            color: activePill === "Hot" ? "#FFF" : "#475569",
            border: activePill === "Hot" ? `1.5px solid ${VIOLET}` : "1.5px solid #E2E8F0"
          }}
        >
          Hot Leads
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-extrabold"
            style={{
              backgroundColor: activePill === "Hot" ? "rgba(255,255,255,0.25)" : "#F1F5F9",
              color: activePill === "Hot" ? "#FFF" : "#64748B"
            }}
          >
            {hotLeadsCount}
          </span>
        </button>
      </div>

      {/* Advanced Filters (Toggleable via filter button) */}
      {showFilters && (
        <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-100 flex flex-col gap-3 flex-shrink-0">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full pl-9 pr-9 rounded-2xl text-sm py-2.5 bg-white border border-slate-200 focus:border-violet-500 focus:outline-none text-slate-800"
              placeholder="Search leads by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setSearch("")}>
                <X size={16} className="text-slate-400" />
              </button>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  activeStatus === s
                    ? "bg-violet-600 text-white border-violet-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => go("import")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 transition-colors"
            >
              <Upload size={12} /> Import from Excel
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards Section */}
      <div className="px-5 pt-4 bg-[#F8F9FE] flex-shrink-0">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl py-3 px-2 text-center shadow-xs border border-slate-100/50">
            <div className="text-2xl font-extrabold text-slate-800 tracking-tight">{allActiveCount}</div>
            <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider leading-tight">Total Active</div>
          </div>
          <div className="bg-white rounded-2xl py-3 px-2 text-center shadow-xs border border-slate-100/50">
            <div className="text-2xl font-extrabold text-slate-800 tracking-tight">{newThisWeekCount}</div>
            <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider leading-tight">New This Week</div>
          </div>
          <div className="bg-white rounded-2xl py-3 px-2 text-center shadow-xs border border-slate-100/50">
            <div className="text-2xl font-extrabold text-slate-800 tracking-tight">{followupTodayCount}</div>
            <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider leading-tight">Follow-up Today</div>
          </div>
        </div>
      </div>

      {/* Leads List Header */}
      <div className="px-5 pt-5 pb-2 bg-[#F8F9FE] flex items-center justify-between flex-shrink-0">
        <h2 className="text-[15px] font-extrabold text-slate-800" style={{ fontFamily: "Plus Jakarta Sans" }}>
          Active Leads
        </h2>
        <button
          onClick={() => setSortBy(sortBy === "recent" ? "alphabetical" : "recent")}
          className="flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-800 transition-colors bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/50 shadow-xs"
        >
          Sort {sortBy === "alphabetical" ? "A-Z" : "⇅"}
        </button>
      </div>

      {/* Leads List */}
      <div className="flex-1 overflow-y-auto px-5 pb-2 bg-[#F8F9FE]" style={{ scrollbarWidth: "none" }}>
        {sortedLeads.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center bg-white rounded-3xl p-5 shadow-xs border border-slate-100 mt-2">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-base font-semibold text-slate-800">No leads found</p>
            <p className="text-xs mt-1 text-slate-400">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-4 shadow-xs border border-slate-100 mt-2 flex flex-col divide-y divide-slate-100/70">
            {sortedLeads.map((lead) => {
              const statusDisplay = getStatusDisplay(lead.status);
              return (
                <div
                  key={lead.id}
                  onClick={() => openLead(lead.id)}
                  className="flex items-center justify-between py-3.5 first:pt-1 last:pb-1 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <Avatar initials={lead.initials} bg={lead.avatarBg} />
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 text-[14px] leading-tight group-hover:text-violet-600 transition-colors">
                        {lead.name}
                      </span>
                      <span className="text-[11px] text-slate-400 mt-0.5 font-medium">
                        {lead.project} {lead.budget ? `| ${lead.budget}` : ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={`tel:${lead.phone}`}
                      className="w-8 h-8 rounded-full bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center text-emerald-600 transition-all border border-emerald-100 active:scale-90"
                      title={`Call ${lead.name}`}
                    >
                      <Phone size={13} />
                    </a>

                    <div className="relative">
                      <button
                        onClick={() => setActiveDropdownLeadId(activeDropdownLeadId === lead.id ? null : lead.id)}
                        className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors active:scale-95"
                        title="Quick Actions"
                      >
                        <MoreVertical size={15} />
                      </button>

                      {activeDropdownLeadId === lead.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setActiveDropdownLeadId(null)} />
                          <div className="absolute right-0 mt-1.5 w-40 bg-white border border-slate-200/80 rounded-2xl shadow-xl p-1 z-50 text-left flex flex-col">
                            <button
                              onClick={() => {
                                handleStatusChange(lead, "Interested");
                                setActiveDropdownLeadId(null);
                              }}
                              className="w-full px-3 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-1.5 transition-colors"
                            >
                              <span>👍</span> Interested
                            </button>
                            <button
                              onClick={() => {
                                handleStatusChange(lead, "Lost");
                                setActiveDropdownLeadId(null);
                              }}
                              className="w-full px-3 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-1.5 transition-colors"
                            >
                              <span>❌</span> Not Interested
                            </button>
                            <button
                              onClick={() => {
                                onScheduleVisit(lead);
                                setActiveDropdownLeadId(null);
                              }}
                              className="w-full px-3 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-1.5 transition-colors"
                            >
                              <span>🏠</span> Site Visit
                            </button>
                            <button
                              onClick={() => {
                                handleStatusChange(lead, "Busy");
                                setActiveDropdownLeadId(null);
                              }}
                              className="w-full px-3 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-1.5 transition-colors"
                            >
                              <span>📞</span> Call Later
                            </button>
                            <button
                              onClick={() => {
                                setSharePropLead(lead);
                                setActiveDropdownLeadId(null);
                              }}
                              className="w-full px-3 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-1.5 transition-colors"
                            >
                              <span>💬</span> Send Details
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1 min-w-[70px]">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide"
                        style={{ backgroundColor: statusDisplay.bg, color: statusDisplay.text }}
                      >
                        {statusDisplay.label}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 mt-0.5">
                        {lead.lastContact || "Today"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) */}
      <button
        onClick={onAddLead}
        className="fixed right-6 bottom-6 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg hover:opacity-95 active:scale-95 transition-all z-40"
        style={{
          backgroundColor: VIOLET,
          boxShadow: "0 8px 30px rgba(124, 92, 252, 0.4)"
        }}
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      {sharePropLead && (
        <SharePropertyModal
          onClose={() => setSharePropLead(null)}
          onSelect={handleSharePropertySelect}
        />
      )}
    </div>
  );
}

// ─── Screen: Lead Detail ────────────────────────────────────────────

function LeadDetailScreen({ leadId, onBack }: { leadId: number; onBack: () => void }) {
  const { leads, followups, refreshData, setLeads } = useContext(AppContext)!;
  const lead = leads.find((l) => l.id === leadId) ?? leads[0];
  const [tab, setTab] = useState("WhatsApp");
  const [msgText, setMsgText] = useState("");
  const [showSharePropModal, setShowSharePropModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLocalScheduleVisit, setShowLocalScheduleVisit] = useState(false);
  const tabs = ["WhatsApp", "Timeline", "Notes", "Follow-ups", "Files"];

  const handleSharePropertySelect = async (prop: any) => {
    const link = `${window.location.origin}/?view=public-property&propertyId=${prop.id}&leadId=${lead.id}`;
    const nameFirst = lead.name.split(" ")[0];
    const text = `Hi ${nameFirst}, check out this property listing: "${prop.name}". Let me know your thoughts: ${link}`;
    setShowSharePropModal(false);

    // Auto-create a note describing that we shared the link and are waiting for response
    setNotes((prev) => [
      { note: `System Note: Shared property listing "${prop.name}". Waiting for lead response.`, time: "Just now" },
      ...prev
    ]);

    // Auto-create a scheduled follow-up in the database for 24 hours from now
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const followTime = tomorrow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " " + tomorrow.toLocaleDateString([], { month: 'short', day: 'numeric' });
      await api.createFollowup({
        leadId: lead.id,
        name: lead.name,
        initials: lead.initials,
        color: lead.avatarBg,
        note: `Follow-up: No response from lead after sharing property ${prop.name}`,
        time: followTime,
        overdue: false
      });
      refreshData();
    } catch (err) {
      console.error("Failed to create automatic follow-up:", err);
    }

    openWhatsApp(lead.phone, text);
  };

  const [notes, setNotes] = useState<any[]>([
    { note: "Interested in corner unit. Wants to see the model unit first.", time: "Yesterday 4:30 PM" },
    { note: "Budget flexible. Has existing mortgage — check refinance options.", time: "Jun 18, 11:00 AM" },
  ]);
  const [newNoteText, setNewNoteText] = useState("");

  const [followupTime, setFollowupTime] = useState("");
  const [followupNote, setFollowupNote] = useState("");

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    setNotes((prev) => [
      { note: newNoteText, time: "Just now" },
      ...prev
    ]);
    setNewNoteText("");
  };

  const handleAddFollowup = async () => {
    if (!followupTime.trim()) return;
    try {
      const parsedTime = new Date(followupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " " + new Date(followupTime).toLocaleDateString([], { month: 'short', day: 'numeric' });
      await api.createFollowup({
        leadId: lead.id,
        name: lead.name,
        initials: lead.initials,
        color: lead.avatarBg,
        note: followupNote || "Follow-up",
        time: parsedTime,
        overdue: false
      });
      setFollowupTime("");
      setFollowupNote("");
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };



  const handleTemplateClick = async (temp: string) => {
    let text = "";
    let newStatus: LeadStatus | null = null;
    const nameFirst = lead.name.split(" ")[0];
    let shouldRedirect = true;

    switch (temp) {
      case "Interested":
        newStatus = "Send Details";
        shouldRedirect = false;
        break;
      case "Not Interested":
        newStatus = "Not Interested";
        shouldRedirect = false;
        break;
      case "Site Visit":
        setShowLocalScheduleVisit(true);
        shouldRedirect = false;
        break;
      case "Pricing Request":
        text = `Sure! Pricing details for ${lead.project} start around ${lead.budget}. Let me know if you would like the payment schedule.`;
        break;
      case "Shared Brochure":
        text = `📄 Sharing the full project brochure for ${lead.project} here.`;
        break;
      case "Follow up":
        text = `Hi ${nameFirst}, just checking in on your interest in ${lead.project}. Do you have any questions about the floor plans or pricing?`;
        break;
      case "Share Property":
        setShowSharePropModal(true);
        return;
      default:
        text = `Hello ${nameFirst}`;
    }

    if (newStatus) {
      setLeads((prevLeads) =>
        prevLeads.map((l) => (l.id === lead.id ? { ...l, status: newStatus as LeadStatus } : l))
      );
      try {
        await api.updateLead(lead.id, { status: newStatus });
        refreshData();
      } catch (err) {
        console.error("Failed to update lead status:", err);
      }
    }

    if (shouldRedirect && text) {
      openWhatsApp(lead.phone, text);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24" style={{ scrollbarWidth: "none" }}>
      <div className="px-5 pt-12 pb-5 bg-white border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#EDE9FF" }}>
            <ArrowLeft size={16} style={{ color: VIOLET }} />
          </button>
          <h1 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Lead Detail</h1>
        </div>
        <button
          onClick={() => setShowEditModal(true)}
          className="flex items-center gap-1.5 px-3 rounded-xl text-xs font-bold text-white transition-all hover:opacity-95 active:scale-95 shadow-sm"
          style={{ backgroundColor: VIOLET, height: 36 }}
        >
          <Edit size={13} /> Edit Lead
        </button>
      </div>

      {/* Hero */}
      <div className="bg-white px-5 py-6 text-center border-b border-border">
        <div className="flex justify-center"><Avatar initials={lead.initials} bg={lead.avatarBg} size="xl" /></div>
        <h1 className="text-lg font-bold mt-3 text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{lead.name}</h1>
        <p className="text-sm mt-1 text-muted-foreground">{lead.phone}</p>
        <div className="flex justify-center mt-2"><LeadStatusBadge status={lead.status} /></div>
        <div className="flex gap-3 mt-4">
          <button onClick={() => setShowSharePropModal(true)} className="flex-1 flex items-center justify-center gap-2 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95" style={{ backgroundColor: WA, height: 46 }}>
            <MessageCircle size={15} /> WhatsApp
          </button>
          <a href={`tel:${lead.phone}`} className="flex-1 flex items-center justify-center gap-2 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-all" style={{ border: `1.5px solid ${VIOLET}`, color: VIOLET, height: 46 }}>
            <Phone size={15} /> Call
          </a>
          <button className="flex-1 flex items-center justify-center gap-2 rounded-xl text-xs font-semibold opacity-40" style={{ border: `1.5px solid ${VIOLET}`, color: VIOLET, height: 46 }}>
            <Mail size={15} /> Email
          </button>
        </div>

        {/* Link Response Banner */}
        <div className="mt-4 px-4 py-2.5 rounded-2xl flex items-center justify-between border text-xs font-semibold text-left"
          style={
            lead.linkResponse === "Interested"
              ? { backgroundColor: "#ECFDF5", borderColor: "#A7F3D0", color: "#065F46" }
              : lead.linkResponse === "Not Interested"
              ? { backgroundColor: "#FEF2F2", borderColor: "#FCA5A5", color: "#991B1B" }
              : lead.linkResponse === "Scheduled Site Visit"
              ? { backgroundColor: "#F5F3FF", borderColor: "#DDD6FE", color: "#5B21B6" }
              : { backgroundColor: "#FFFBEB", borderColor: "#FDE68A", color: "#92400E" }
          }
        >
          <div className="flex items-center gap-1.5 truncate">
            <span>
              {lead.linkResponse === "Interested"
                ? "🟢"
                : lead.linkResponse === "Not Interested"
                ? "🔴"
                : lead.linkResponse === "Scheduled Site Visit"
                ? "📅"
                : "⏳"}
            </span>
            <span className="truncate">
              {lead.linkResponse === "Interested"
                ? "Responded: Interested in shared property link"
                : lead.linkResponse === "Not Interested"
                ? "Responded: Not interested in shared property link"
                : lead.linkResponse === "Scheduled Site Visit"
                ? "Responded: Scheduled site visit via shared link"
                : "Waiting for response on shared property link"}
            </span>
          </div>
          <span className="text-[10px] font-bold opacity-70 flex-shrink-0 ml-2">SHARED LINK</span>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4 text-left">
          {[
            { icon: MapPin, label: "City", value: lead.city },
            { icon: Building, label: "Project", value: lead.project },
            { icon: BarChart2, label: "Budget", value: lead.budget },
            { icon: Star, label: "Priority", value: lead.priority },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-xl" style={{ backgroundColor: BG }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#EDE9FF" }}>
                <item.icon size={13} style={{ color: VIOLET }} />
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground">{item.label}</div>
                <div className="text-[13px] font-semibold text-foreground">{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-3 bg-white border-b border-border">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-1.5 rounded-full text-[11px] font-semibold"
            style={{ backgroundColor: tab === t ? VIOLET : "transparent", color: tab === t ? "#fff" : MT }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "WhatsApp" && (
        <div className="p-4 space-y-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>💬</span> WhatsApp Approved Templates
            </h4>
            <p className="text-[11px] text-slate-500 mt-1">Select an approved marketing template below to send it directly to this lead via WhatsApp.</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {["Interested", "Not Interested", "Site Visit", "Pricing Request", "Shared Brochure", "Follow up", "Share Property"].map((t, i) => {
              const isSelected = 
                (t === "Interested" && lead.status === "Send Details") ||
                (t === "Not Interested" && lead.status === "Not Interested") ||
                (t === "Site Visit" && lead.status === "Site Visit");

              return (
                <button
                  key={t}
                  onClick={() => handleTemplateClick(t)}
                  className={`rounded-xl p-3 text-center border transition-all hover:bg-slate-50 active:scale-95 shadow-sm ${
                    isSelected 
                      ? "bg-emerald-50/40 border-emerald-300" 
                      : "bg-white border-border"
                  }`}
                >
                  <div className="w-6 h-6 rounded-md flex items-center justify-center mx-auto mb-1" style={{ backgroundColor: "#ECFDF5" }}>
                    <MessageSquare size={12} style={{ color: WA }} />
                  </div>
                  <div className="text-[11px] font-semibold text-foreground">{t}</div>
                  {isSelected ? (
                    <div className="text-[9px] font-extrabold mt-0.5 text-emerald-600">✓ SELECTED</div>
                  ) : (
                    i < 3 && <div className="text-[9px] font-semibold mt-0.5" style={{ color: GR }}>✓ APPROVED</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {tab === "Timeline" && (
        <div className="px-4 py-5 space-y-1">
          {[
            { dot: WA, desc: "WhatsApp sent — Greeting template delivered", time: "Today 10:15 AM" },
            { dot: VIOLET, desc: `Call logged — 8 minute call with ${lead.name.split(" ")[0]}`, time: "Today 9:45 AM" },
            { dot: AMBER, desc: "Note added — 'Interested in corner unit'", time: "Yesterday 4:30 PM" },
            { dot: "#3B82F6", desc: `Status changed to ${lead.status}`, time: "Yesterday 2:00 PM" },
            { dot: MT, desc: "Lead created from website enquiry form", time: "Jun 18, 2025" },
          ].map((item, i, arr) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex flex-col items-center pt-0.5">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.dot }} />
                {i < arr.length - 1 && <div className="w-px flex-1 my-1" style={{ backgroundColor: BR, minHeight: 28 }} />}
              </div>
              <div className="pb-3">
                <p className="text-[13px] leading-snug" style={{ color: BD }}>{item.desc}</p>
                <span className="text-[11px] text-muted-foreground">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "Notes" && (
        <div className="px-4 py-5 space-y-3">
          <Card className="p-4">
            <textarea
              className="w-full resize-none text-sm bg-transparent"
              rows={3}
              style={{ border: "none", outline: "none", color: DK }}
              placeholder="Add a note about this lead..."
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
            />
            <button onClick={handleAddNote} className="mt-2 px-4 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95" style={{ backgroundColor: VIOLET, height: 44 }}>
              Add Note
            </button>
          </Card>
          {notes.map((n, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-start gap-2">
                <Star size={14} style={{ color: AMBER, marginTop: 2, flexShrink: 0 }} />
                <p className="text-sm flex-1" style={{ color: BD }}>{n.note}</p>
              </div>
              <p className="text-[11px] mt-2 text-muted-foreground">{n.time}</p>
            </Card>
          ))}
        </div>
      )}

      {tab === "Follow-ups" && (
        <div className="px-4 py-5 space-y-3">
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3 text-foreground">Schedule Follow-up</h3>
            <input
              type="datetime-local"
              className="w-full px-3 rounded-xl text-sm mb-3"
              style={{ border: `1px solid ${BR}`, color: DK, height: 48 }}
              value={followupTime}
              onChange={(e) => setFollowupTime(e.target.value)}
            />
            <input
              className="w-full px-3 rounded-xl text-sm mb-3"
              style={{ border: `1px solid ${BR}`, color: DK, height: 48 }}
              placeholder="Add a note..."
              value={followupNote}
              onChange={(e) => setFollowupNote(e.target.value)}
            />
            <button onClick={handleAddFollowup} className="w-full rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95" style={{ backgroundColor: VIOLET, height: 48 }}>Schedule</button>
          </Card>
          {followups.filter((f) => f.leadId === lead.id).map((f) => (
            <Card key={f.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-semibold text-foreground">{f.time}</div>
                  <div className="text-[13px] mt-1" style={{ color: BD }}>{f.note}</div>
                  <div className="mt-2"><LeadStatusBadge status="New" /></div>
                </div>
                <button className="w-9 h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{ borderColor: GR }}>
                  <Check size={14} style={{ color: GR }} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "Files" && (
        <div className="px-4 py-5 space-y-3">
          <button className="w-full rounded-2xl flex flex-col items-center justify-center gap-2 text-sm font-medium" style={{ border: `2px dashed ${VIOLET}`, color: VIOLET, height: 80 }}>
            <Upload size={20} /> Upload File
          </button>
          {[
            { name: `${lead.project.replace(/\s/g, "_")}_Brochure.pdf`, size: "2.4 MB", icon: "📄" },
            { name: "Floor_Plan.jpg", size: "890 KB", icon: "🖼️" },
            { name: "Payment_Schedule.xlsx", size: "145 KB", icon: "📊" },
          ].map((f, i) => (
            <Card key={i} className="p-4 flex items-center gap-3">
              <span className="text-2xl">{f.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold truncate text-foreground">{f.name}</div>
                <div className="text-[11px] text-muted-foreground">{f.size}</div>
              </div>
              <button style={{ color: VIOLET }}><Download size={20} /></button>
            </Card>
          ))}
        </div>
      )}

      {showSharePropModal && (
        <SharePropertyModal
          onClose={() => setShowSharePropModal(false)}
          onSelect={handleSharePropertySelect}
        />
      )}

      {showEditModal && (
        <EditLeadModal
          lead={lead}
          onClose={() => setShowEditModal(false)}
          onSave={refreshData}
        />
      )}

      {showLocalScheduleVisit && (
        <ScheduleVisitModal
          lead={lead}
          onClose={() => setShowLocalScheduleVisit(false)}
          onSave={refreshData}
        />
      )}
    </div>
  );
}

function EditLeadModal({ lead, onClose, onSave }: { lead: any; onClose: () => void; onSave: () => void }) {
  const { setLeads } = useContext(AppContext)!;
  const [name, setName] = useState(lead.name);
  const [phone, setPhone] = useState(lead.phone);
  const [email, setEmail] = useState(lead.email);
  const [budget, setBudget] = useState(lead.budget);
  const [project, setProject] = useState(lead.project);
  const [city, setCity] = useState(lead.city);
  const [type, setType] = useState(lead.type);
  const [priority, setPriority] = useState(lead.priority);
  const [status, setStatus] = useState(lead.status);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLeads((prev) =>
      prev.map((l) =>
        l.id === lead.id
          ? {
              ...l,
              name,
              phone,
              email,
              budget,
              project,
              city,
              type,
              priority,
              status,
              tags: [type]
            }
          : l
      )
    );
    try {
      await api.updateLead(lead.id, {
        name,
        phone,
        email,
        budget,
        project,
        city,
        type,
        priority,
        status,
        tags: [type]
      });
      onSave();
    } catch (err) {
      console.error(err);
    }
    onClose();
  };

  return (
    <div className="absolute inset-0 bg-black/60 z-50 flex items-end justify-center">
      <div className="w-full bg-white rounded-t-[32px] p-5 pb-8 space-y-4 max-h-[85%] overflow-y-auto" style={{ borderTop: `4px solid ${VIOLET}` }}>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground">Edit Lead</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 text-left">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Name</label>
              <input required value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-100 font-semibold text-slate-800" style={{ outline: "none" }} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Phone</label>
              <input required value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-100 font-semibold text-slate-800" style={{ outline: "none" }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-100 font-semibold text-slate-800" style={{ outline: "none" }} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Budget</label>
              <input value={budget} onChange={e => setBudget(e.target.value)} className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-100 font-semibold text-slate-800" style={{ outline: "none" }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Project</label>
              <input value={project} onChange={e => setProject(e.target.value)} className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-100 font-semibold text-slate-800" style={{ outline: "none" }} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">City</label>
              <input value={city} onChange={e => setCity(e.target.value)} className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-100 font-semibold text-slate-800" style={{ outline: "none" }} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Type</label>
              <select value={type} onChange={e => setType(e.target.value as any)} className="w-full px-2 py-2 rounded-xl text-xs bg-slate-50 border border-slate-100 font-semibold text-slate-800" style={{ outline: "none" }}>
                <option value="Buyer">Buyer</option>
                <option value="Seller">Seller</option>
                <option value="Renter">Renter</option>
                <option value="Investor">Investor</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value as any)} className="w-full px-2 py-2 rounded-xl text-xs bg-slate-50 border border-slate-100 font-semibold text-slate-800" style={{ outline: "none" }}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full px-2 py-2 rounded-xl text-xs bg-slate-50 border border-slate-100 font-semibold text-slate-800" style={{ outline: "none" }}>
                <option value="New">New</option>
                <option value="Not Interested">Not Interested</option>
                <option value="Site Visit">Site Visit</option>
                <option value="Call Later">Call Later</option>
                <option value="Send Details">Send Details</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full rounded-xl text-sm font-semibold text-white py-3 mt-4 transition-all hover:opacity-90" style={{ backgroundColor: VIOLET }}>
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

function ScheduleVisitModal({ lead, onClose, onSave }: { lead: any; onClose: () => void; onSave: () => void }) {
  const { setLeads, setAppointments } = useContext(AppContext)!;
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) return;
    setSubmitting(true);
    setLeads((prev) =>
      prev.map((l) => (l.id === lead.id ? { ...l, status: "Site Visit" as LeadStatus } : l))
    );
    const appointmentTime = `${date} at ${time}`;
    const newApt = {
      id: Date.now(),
      time: appointmentTime,
      title: `Site Visit: ${lead.project}`,
      sub: `Client: ${lead.name} (${lead.phone})`,
      type: "viewing",
      color: VIOLET,
      priority: "Medium"
    };
    setAppointments((prev) => [...prev, newApt]);
    try {
      await api.updateLead(lead.id, { status: "Site Visit" });
      await api.createAppointment({
        time: appointmentTime,
        title: `Site Visit: ${lead.project}`,
        sub: `Client: ${lead.name} (${lead.phone})`,
        type: "viewing",
        color: VIOLET,
        priority: "Medium"
      });
      onSave();
      onClose();
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  return (
    <div className="absolute inset-0 bg-black/60 z-50 flex items-end justify-center">
      <div className="w-full bg-white rounded-t-[32px] p-5 pb-8 space-y-4 max-h-[80%] overflow-y-auto text-left" style={{ borderTop: `4px solid ${VIOLET}` }}>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground">Schedule Site Visit</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <p className="text-xs text-slate-500">Confirm the site visit date and time for <strong>{lead.name}</strong> to view <strong>{lead.project}</strong>.</p>
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Select Date</label>
            <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-100 font-semibold text-slate-800" style={{ outline: "none" }} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Select Time</label>
            <input required type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-100 font-semibold text-slate-800" style={{ outline: "none" }} />
          </div>
          <button type="submit" disabled={submitting} className="w-full rounded-xl text-sm font-semibold text-white py-3 mt-4 transition-all hover:opacity-90 flex items-center justify-center" style={{ backgroundColor: VIOLET }}>
            {submitting ? "Scheduling..." : "Confirm Site Visit"}
          </button>
        </form>
      </div>
    </div>
  );
}

function SharePropertyModal({ onClose, onSelect }: { onClose: () => void; onSelect: (prop: any) => void }) {
  const { properties } = useContext(AppContext)!;
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | "Sale" | "Rent">("All");

  const filteredProperties = properties.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.address.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "All" || p.type === typeFilter || p.type === "Both";
    return matchesSearch && matchesType;
  });

  return (
    <div className="absolute inset-0 bg-black/60 z-50 flex items-end justify-center">
      <div className="w-full bg-white rounded-t-[32px] p-5 pb-8 space-y-4 max-h-[85%] flex flex-col" style={{ borderTop: `4px solid ${VIOLET}` }}>
        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <h3 className="text-base font-bold text-foreground">Select Property to Share</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"><X size={16} /></button>
        </div>

        {/* Filters */}
        <div className="space-y-2.5 flex-shrink-0">
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search properties by name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200/50 rounded-2xl text-xs font-medium focus:bg-white transition-all outline-none"
              style={{ color: DK }}
            />
            <span className="absolute left-3.5 top-3 text-slate-400 text-xs">🔍</span>
          </div>
          
          {/* Type tabs */}
          <div className="flex gap-1.5">
            {(["All", "Sale", "Rent"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold border transition-all ${
                  typeFilter === t
                    ? "bg-violet-650 text-white border-violet-650"
                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                }`}
                style={typeFilter === t ? { backgroundColor: VIOLET, borderColor: VIOLET } : {}}
              >
                {t === "All" ? "All Types" : t === "Sale" ? "For Sale" : "For Rent"}
              </button>
            ))}
          </div>
        </div>

        {/* Properties List */}
        <div className="flex-grow overflow-y-auto space-y-2 mt-2" style={{ scrollbarWidth: "none" }}>
          {filteredProperties.map(p => (
            <div
              key={p.id}
              onClick={() => onSelect(p)}
              className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-all active:scale-[0.98]"
            >
              <img src={p.image} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0 text-left">
                <div className="text-sm font-semibold text-foreground truncate">{p.name}</div>
                <div className="text-xs text-muted-foreground truncate">{p.address}</div>
                <div className="text-xs font-bold mt-0.5" style={{ color: VIOLET }}>{p.price}</div>
              </div>
            </div>
          ))}
          {filteredProperties.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <span className="text-2xl">🏠</span>
              <p className="text-[11px] font-semibold text-slate-500 mt-2">No matching properties found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Pipeline (Kanban) ───────────────────────────────────────

function PipelineScreen({ onBack, openLead, onAddLead }: { onBack: () => void; openLead: (id: number) => void; onAddLead: (stage: LeadStatus) => void }) {
  const { leads } = useContext(AppContext)!;
  const pipelineStages = [
    { stage: "New" as LeadStatus, leads: leads.filter((l) => l.status === "New") },
    { stage: "Call Later" as LeadStatus, leads: leads.filter((l) => l.status === "Call Later") },
    { stage: "Send Details" as LeadStatus, leads: leads.filter((l) => l.status === "Send Details") },
    { stage: "Site Visit" as LeadStatus, leads: leads.filter((l) => l.status === "Site Visit") },
    { stage: "Not Interested" as LeadStatus, leads: leads.filter((l) => l.status === "Not Interested") },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ScreenHeader title="Pipeline" onBack={onBack} />
      <div className="flex gap-3 p-4 overflow-x-auto flex-1 items-start" style={{ scrollbarWidth: "none" }}>
        {pipelineStages.map((stage) => {
          const c = STATUS_CONFIG[stage.stage];
          return (
            <div key={stage.stage} className="flex-shrink-0 w-[210px]">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: c.bg, color: c.text }}>
                  {stage.stage}
                </span>
                <span className="text-xs font-bold text-muted-foreground">{stage.leads.length}</span>
              </div>
              <div className="space-y-2">
                {stage.leads.map((lead) => (
                  <button
                    key={lead.id}
                    onClick={() => openLead(lead.id)}
                    className="w-full text-left bg-white rounded-xl p-3 shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar initials={lead.initials} bg={lead.avatarBg} size="sm" />
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold truncate text-foreground">{lead.name}</div>
                        <div className="text-[11px] truncate text-muted-foreground">{lead.project}</div>
                      </div>
                    </div>
                    <div className="text-[13px] font-bold" style={{ color: VIOLET }}>{lead.budget}</div>
                  </button>
                ))}
                {stage.leads.length === 0 && (
                  <div className="rounded-xl flex items-center justify-center text-xs text-muted-foreground" style={{ border: `1.5px dashed ${BR}`, height: 60 }}>
                    No leads
                  </div>
                )}
                <button
                  onClick={() => onAddLead(stage.stage)}
                  className="w-full rounded-xl flex items-center justify-center gap-1 text-xs font-medium text-muted-foreground transition-all hover:bg-slate-100"
                  style={{ border: `1.5px dashed ${BR}`, height: 44 }}
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Screen: Follow-ups ──────────────────────────────────────────────

function FollowUpsScreen({ onBack }: { onBack: () => void }) {
  const { followups } = useContext(AppContext)!;
  const [tab, setTab] = useState("Due Today");
  const tabs = ["Due Today", "Upcoming", "Completed", "Calendar"];
  const [month, setMonth] = useState(new Date(2025, 5, 1));
  const daysWithFU = [5, 10, 15, 18, 22, 25, 28];

  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();

  return (
    <div className="flex-1 overflow-y-auto pb-24" style={{ scrollbarWidth: "none" }}>
      <ScreenHeader title="Follow-ups" onBack={onBack} />
      <div className="px-5 py-5 space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-shrink-0 px-4 rounded-full text-xs font-semibold"
              style={{ backgroundColor: tab === t ? VIOLET : "#EDE9FF", color: tab === t ? "#fff" : VIOLET, height: 40 }}
            >
              {t}
            </button>
          ))}
        </div>

        {(tab === "Due Today" || tab === "Upcoming") && (
          <div className="space-y-3">
            {followups.map((f) => (
              <Card key={f.id} className="p-4 flex items-center gap-3" style={{ backgroundColor: f.overdue ? "#FFF5F5" : "#fff" }}>
                <Avatar initials={f.initials} bg={f.color} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">{f.name}</div>
                  <div className="text-[13px]" style={{ color: BD }}>{f.note}</div>
                  <div className="text-[11px] mt-1 font-medium" style={{ color: f.overdue ? RD : MT }}>{f.time}</div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: "#ECFDF5" }}>
                    <MessageCircle size={16} style={{ color: WA }} />
                  </button>
                  <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: "#EDE9FF" }}>
                    <Check size={16} style={{ color: VIOLET }} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab === "Completed" && (
          <div className="space-y-3 opacity-70">
            {FOLLOWUPS.slice(0, 2).map((f) => (
              <Card key={f.id} className="p-4 flex items-center gap-3">
                <Avatar initials={f.initials} bg={f.color} />
                <div className="flex-1">
                  <div className="text-sm font-semibold line-through text-muted-foreground">{f.name}</div>
                  <div className="text-[13px] line-through text-muted-foreground">{f.note}</div>
                </div>
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: GR }}>
                  <Check size={12} className="text-white" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab === "Calendar" && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-5">
              <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="w-10 h-10 flex items-center justify-center text-muted-foreground">
                <ChevronLeft size={20} />
              </button>
              <span className="text-base font-semibold text-foreground">
                {month.toLocaleString("default", { month: "long", year: "numeric" })}
              </span>
              <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="w-10 h-10 flex items-center justify-center text-muted-foreground">
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="grid grid-cols-7 mb-2">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <div key={d} className="text-center text-[11px] font-semibold py-1 text-muted-foreground">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-1">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday = day === 20;
                const hasFU = daysWithFU.includes(day);
                return (
                  <div key={day} className="flex flex-col items-center py-0.5">
                    <div
                      className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium"
                      style={{ backgroundColor: isToday ? VIOLET : "transparent", color: isToday ? "#fff" : DK }}
                    >
                      {day}
                    </div>
                    {hasFU && !isToday && <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: VIOLET }} />}
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── Screen: Tasks ────────────────────────────────────────────────────

function TasksScreen({ onBack }: { onBack: () => void }) {
  const { tasks, refreshData } = useContext(AppContext)!;
  const [tab, setTab] = useState("Pending");
  const [newTitle, setNewTitle] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const toggle = async (id: number) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    await api.toggleTask(id, !task.completed);
    refreshData();
  };

  const remove = async (id: number) => {
    await api.deleteTask(id);
    refreshData();
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setShowAddModal(true);
      return;
    }
    await api.createTask({
      title: newTitle,
      due: "Today 5:00 PM"
    });
    setNewTitle("");
    refreshData();
  };

  const filtered = tab === "Pending" ? tasks.filter((t) => !t.completed) : tasks.filter((t) => t.completed);

  return (
    <div className="flex-1 overflow-y-auto pb-24" style={{ scrollbarWidth: "none" }}>
      <ScreenHeader title="Tasks" onBack={onBack} />
      <div className="px-5 py-5 space-y-4">
        <form onSubmit={handleAddTask} className="flex gap-2">
          <input
            className="flex-1 px-3 rounded-xl text-sm"
            style={{ border: `1.5px solid ${VIOLET}`, height: 44, outline: "none", color: DK }}
            placeholder="Add a new task..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button type="submit" className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: VIOLET }}>
            <Plus size={16} />
          </button>
        </form>

        <div className="flex gap-2">
          {["Pending", "Completed"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-5 rounded-full text-xs font-semibold"
              style={{ backgroundColor: tab === t ? VIOLET : "#EDE9FF", color: tab === t ? "#fff" : VIOLET, height: 40 }}
            >
              {t} <span className="ml-1 opacity-70">{t === "Pending" ? tasks.filter((x) => !x.completed).length : tasks.filter((x) => x.completed).length}</span>
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {filtered.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-2xl px-4 flex items-center gap-3 shadow-sm"
              style={{ backgroundColor: task.overdue && !task.completed ? "#FFF5F5" : "#fff", minHeight: 60 }}
            >
              <button
                onClick={() => toggle(task.id)}
                className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{ borderColor: task.completed ? GR : VIOLET, backgroundColor: task.completed ? GR : "transparent" }}
              >
                {task.completed && <Check size={12} className="text-white" />}
              </button>
              <div className="flex-1 py-3.5 min-w-0">
                <div className="text-sm font-medium" style={{ color: task.completed ? MT : DK, textDecoration: task.completed ? "line-through" : "none" }}>
                  {task.title}
                </div>
                {task.lead && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ backgroundColor: "#EDE9FF", color: VIOLET }}>
                    {task.lead}
                  </span>
                )}
              </div>
              <div className="text-right flex-shrink-0 flex flex-col items-end gap-1.5">
                <div className="text-[11px] font-medium" style={{ color: task.overdue && !task.completed ? RD : MT }}>{task.due}</div>
                <button onClick={() => remove(task.id)} style={{ color: RD }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAddModal && (
        <AddTaskModal
          onClose={() => setShowAddModal(false)}
          onSave={refreshData}
        />
      )}
    </div>
  );
}

function AddTaskModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const { leads } = useContext(AppContext)!;
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("Today 5:00 PM");
  const [associatedLead, setAssociatedLead] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await api.createTask({
        title,
        lead: associatedLead,
        due
      });
      onSave();
    } catch (err) {
      console.error(err);
    }
    onClose();
  };

  return (
    <div className="absolute inset-0 bg-black/60 z-50 flex items-end justify-center">
      <div className="w-full bg-white rounded-t-[32px] p-5 pb-8 space-y-4 max-h-[85%] overflow-y-auto" style={{ borderTop: `4px solid ${VIOLET}` }}>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground">Add New Task</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 text-left">
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Task Title *</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Schedule call with client"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm"
              style={{ border: `1.5px solid ${BR}`, outline: "none", color: DK }}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Due Date / Time</label>
            <input
              value={due}
              onChange={(e) => setDue(e.target.value)}
              placeholder="e.g. Today 5:00 PM"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm"
              style={{ border: `1.5px solid ${BR}`, outline: "none", color: DK }}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Associate with Lead</label>
            <select
              value={associatedLead}
              onChange={(e) => setAssociatedLead(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white"
              style={{ border: `1.5px solid ${BR}`, outline: "none", color: DK }}
            >
              <option value="">None</option>
              {leads.map(l => (
                <option key={l.id} value={l.name}>{l.name} ({l.project})</option>
              ))}
            </select>
          </div>
          <button type="submit" className="w-full rounded-xl text-sm font-semibold text-white py-3 mt-4 transition-all hover:opacity-90" style={{ backgroundColor: VIOLET }}>
            Save Task
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Screen: WhatsApp Hub ─────────────────────────────────────────────

function WhatsAppScreen({ onBack, go, openLeadChat }: { onBack: () => void; go: (s: Screen) => void; openLeadChat: (id: number) => void }) {
  const { leads } = useContext(AppContext)!;
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [queueItems, setQueueItems] = useState([
    { id: 1, name: "Naomi Cole", phone: "+1 872-555-0142", text: "Hi Naomi, following up on your portfolio review query...", time: "Today 10:15 AM", status: "failed", error: "Authentication Failure (No API Configured)" },
    { id: 2, name: "Christopher Kane", phone: "+1 415-553-0186", text: "Sure Christopher! Units start at $850,000...", time: "In 5 mins", status: "pending" },
    { id: 3, name: "Addie Bradford", phone: "+1 312-440-9921", text: "Hi Addie, let's schedule a viewing this Friday...", time: "In 10 mins", status: "pending" },
    { id: 4, name: "Thor Johnson", phone: "+1 646-210-3348", text: "Hi Thor, I've prepared the Harbour View brochure...", time: "In 15 mins", status: "pending" },
    { id: 5, name: "Gora Williams", phone: "+1 929-771-0044", text: "Hi Gora, here are the current rental listings...", time: "In 20 mins", status: "pending" },
  ]);

  const handleRetry = (id: number) => {
    setQueueItems(prev => prev.map(item => {
      if (item.id === id) {
        openWhatsApp(item.phone, item.text);
        return { ...item, status: "sent", error: undefined };
      }
      return item;
    }));
  };

  const failedCount = queueItems.filter(x => x.status === "failed").length;
  const pendingCount = queueItems.filter(x => x.status === "pending").length;

  return (
    <div className="flex-1 overflow-y-auto pb-24 relative" style={{ scrollbarWidth: "none" }}>
      <ScreenHeader title="WhatsApp" onBack={onBack} />
      <div className="px-5 py-5 space-y-5">
        <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {[
            { label: "Broadcasts", icon: Share2, bg: "#EDE9FF", color: VIOLET, screen: "broadcasts" as Screen },
            { label: "Scheduled", icon: Clock, bg: "#FFF7E6", color: AMBER },
            { label: "Auto F/Us", icon: Zap, bg: "#ECFEFF", color: "#0891B2" },
            { label: "Templates", icon: FileText, bg: "#EFF6FF", color: "#3B82F6" },
            { label: "Search Msgs", icon: Search, bg: "#ECFDF5", color: GR },
          ].map((tool, i) => (
            <button
              key={i}
              onClick={() => (tool as any).screen && go((tool as any).screen)}
              className="flex-shrink-0 flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white shadow-sm"
              style={{ minWidth: 74 }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: tool.bg }}>
                <tool.icon size={18} style={{ color: tool.color }} />
              </div>
              <span className="text-[10px] font-semibold text-center text-foreground">{tool.label}</span>
            </button>
          ))}
        </div>

        {failedCount > 0 || pendingCount > 0 ? (
          <div className="px-4 py-3 rounded-xl flex items-center justify-between" style={{ backgroundColor: "#FFF7E6", borderLeft: `3px solid ${AMBER}` }}>
            <div>
              <p className="text-[13px] font-semibold" style={{ color: "#92400E" }}>⚠ Message queue has failures</p>
              <p className="text-xs" style={{ color: "#92400E" }}>{failedCount} failed · {pendingCount} pending</p>
            </div>
            <button onClick={() => setShowQueueModal(true)} className="text-xs font-semibold hover:underline active:scale-95 transition-all" style={{ color: VIOLET }}>View →</button>
          </div>
        ) : null}

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full pl-9 pr-4 rounded-xl text-sm py-3"
            style={{ border: `1.5px solid ${BR}`, backgroundColor: "#fff", outline: "none", color: DK }}
            placeholder="Search leads to message..."
          />
        </div>

        <div className="space-y-2">
          {leads.slice(0, 5).map((lead) => (
            <div key={lead.id} className="bg-white rounded-2xl px-4 flex items-center gap-3 shadow-sm" style={{ height: 64 }}>
              <Avatar initials={lead.initials} bg={lead.avatarBg} />
              <div
                onClick={() => openLeadChat(lead.id)}
                className="flex-1 min-w-0 cursor-pointer hover:opacity-85 active:scale-[0.99] transition-all"
              >
                <div className="text-sm font-semibold text-foreground hover:underline">{lead.name}</div>
                <div className="text-xs text-muted-foreground">{lead.phone}</div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <a href={`tel:${lead.phone}`} className="w-9 h-9 rounded-full border flex items-center justify-center hover:bg-slate-50 transition-all" style={{ borderColor: VIOLET, color: VIOLET }}>
                  <Phone size={15} />
                </a>
                <button
                  onClick={() => openLeadChat(lead.id)}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: WA }}
                >
                  <MessageCircle size={15} className="text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Queue Modal Overlay */}
      {showQueueModal && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-end justify-center">
          <div className="w-full bg-white rounded-t-[32px] p-5 pb-8 space-y-4 max-h-[85%] overflow-y-auto" style={{ borderTop: `4px solid ${VIOLET}` }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">Message Queue Status</h3>
                <p className="text-[11px] text-muted-foreground">Monitor or bypass unconfigured API failures</p>
              </div>
              <button onClick={() => setShowQueueModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"><X size={16} /></button>
            </div>
            <div className="space-y-3 mt-2 text-left">
              {queueItems.map((item) => (
                <div key={item.id} className="p-3.5 rounded-xl border border-slate-150 space-y-2 bg-slate-50">
                  <div className="flex items-start justify-between">
                    <div
                      onClick={() => {
                        const matchingLead = leads.find(l => l.name === item.name || l.phone.replace(/[^\d]/g, "") === item.phone.replace(/[^\d]/g, ""));
                        if (matchingLead) {
                          setShowQueueModal(false);
                          openLeadChat(matchingLead.id);
                        }
                      }}
                      className="cursor-pointer hover:opacity-80 group"
                    >
                      <h4 className="text-xs font-bold text-foreground group-hover:underline">{item.name}</h4>
                      <p className="text-[10px] text-muted-foreground">{item.phone}</p>
                    </div>
                    {item.status === "failed" && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold text-white bg-red-500 uppercase tracking-wider">Failed</span>
                    )}
                    {item.status === "pending" && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold text-white bg-amber-500 uppercase tracking-wider">Pending</span>
                    )}
                    {item.status === "sent" && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold text-white bg-emerald-500 uppercase tracking-wider">Delivered</span>
                    )}
                  </div>
                  <p className="text-xs italic text-slate-600 bg-white p-2 rounded-lg border border-slate-100">"{item.text}"</p>
                  {item.status === "failed" && item.error && (
                    <div className="text-[10px] text-red-600 font-semibold bg-red-50 p-2 rounded-lg">
                      ⚠ Error: {item.error}
                    </div>
                  )}
                  {item.status === "failed" && (
                    <button
                      onClick={() => handleRetry(item.id)}
                      className="w-full text-center py-2 bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all hover:bg-emerald-600 active:scale-95 flex items-center justify-center gap-1"
                    >
                      <Zap size={11} /> Send via WhatsApp Redirect
                    </button>
                  )}
                  {item.status === "pending" && (
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                      <span>Scheduled time: {item.time}</span>
                      <button
                        onClick={() => handleRetry(item.id)}
                        className="text-violet-600 font-bold hover:underline"
                      >
                        Send Now (Bypass API)
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Screen: Broadcasts ────────────────────────────────────────────────

function BroadcastsScreen({ onBack }: { onBack: () => void }) {
  const { broadcasts, refreshData, leads } = useContext(AppContext)!;
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [preview, setPreview] = useState("");

  const handleSend = async () => {
    if (!name.trim() || !preview.trim()) return;
    await api.createBroadcast({
      name,
      preview,
      recipients: leads.length || 142
    });
    setName("");
    setPreview("");
    setShowCreate(false);
    refreshData();
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24 relative" style={{ scrollbarWidth: "none" }}>
      <ScreenHeader
        title="Broadcasts"
        onBack={onBack}
        right={
          <button className="px-4 rounded-xl text-sm font-semibold" style={{ backgroundColor: AMBER, color: DK, height: 40 }} onClick={() => setShowCreate(true)}>
            + New
          </button>
        }
      />
      <div className="px-5 py-5 space-y-3">
        {broadcasts.map((b) => (
          <Card key={b.id} className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-[15px] font-semibold flex-1 text-foreground">{b.name}</span>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0"
                style={{
                  backgroundColor: b.status === "Sent" ? "#D1FAE5" : b.status === "Sending" ? "#FFF7E6" : "#EDE9FF",
                  color: b.status === "Sent" ? "#065F46" : b.status === "Sending" ? "#B45309" : VIOLET,
                }}
              >
                {b.status}
              </span>
            </div>
            <p className="text-[13px] mb-3" style={{ color: BD, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {b.preview}
            </p>
            {b.status === "Sending" && (
              <div className="mb-3 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: BR }}>
                <div className="h-1.5 rounded-full" style={{ width: `${(b.sent / b.recipients) * 100}%`, backgroundColor: AMBER }} />
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex gap-3 text-xs" style={{ color: BD }}>
                <span>{b.recipients} recipients</span>
                {b.sent > 0 && <span style={{ color: GR }}>✓ {b.sent}</span>}
                {b.failed > 0 && <span style={{ color: RD }}>✗ {b.failed}</span>}
              </div>
              <span className="text-[11px] text-muted-foreground">{b.date}</span>
            </div>
            {(b.status === "Sending" || b.status === "Scheduled") && (
              <button className="mt-2 text-xs font-semibold" style={{ color: RD }}>Cancel</button>
            )}
          </Card>
        ))}
      </div>

      {showCreate && (
        <div className="absolute inset-0 z-50 flex items-end" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="w-full bg-white rounded-t-3xl p-5 pb-8 max-h-[90%] overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>New Broadcast</h2>
              <button onClick={() => setShowCreate(false)} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: BG }}>
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                className="w-full px-3 rounded-xl text-sm"
                style={{ border: `1px solid ${BR}`, height: 48, color: DK, outline: "none" }}
                placeholder="Broadcast name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
              <div>
                <textarea
                  className="w-full px-3 py-3 rounded-xl text-sm resize-none"
                  rows={4}
                  style={{ border: `1px solid ${BR}`, color: DK, outline: "none" }}
                  placeholder="Message..."
                  value={preview}
                  onChange={e => setPreview(e.target.value)}
                />
                <div className="text-right text-[11px] text-muted-foreground">{preview.length} / 1024</div>
              </div>
              <select className="w-full px-3 rounded-xl text-sm" style={{ border: `1px solid ${BR}`, height: 48, color: DK }}>
                <option>All Leads ({leads.length})</option>
                <option>New Leads</option>
                <option>Qualified</option>
              </select>
              <div className="py-2 rounded-xl text-center text-sm font-medium" style={{ backgroundColor: "#EDE9FF", color: VIOLET }}>
                This will reach {leads.length} leads
              </div>
              <div className="flex gap-3">
                <button onClick={handleSend} className="flex-1 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: VIOLET, height: 48 }}>Send Now</button>
                <button onClick={handleSend} className="flex-1 rounded-xl text-sm font-semibold" style={{ backgroundColor: AMBER, color: DK, height: 48 }}>Schedule</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Screen: Analytics ──────────────────────────────────────────────────

function AnalyticsScreen({ onBack }: { onBack: () => void }) {
  const { leads, analytics } = useContext(AppContext)!;
  const [range, setRange] = useState("30d");
  const [subTab, setSubTab] = useState<"Overview" | "Performance" | "Quality">("Overview");

  const weeklyData = analytics?.weekly || WEEKLY;
  const revenueData = analytics?.revenue || REVENUE;
  const sourcesData = analytics?.sources || SOURCES;

  const hotLeadsCount = leads.filter(l => l.tags && (l.tags.includes("Hot") || l.tags.includes("Investor"))).length;
  const conversionRate = leads.length ? ((leads.filter(l => l.status === "Booked").length / leads.length) * 100).toFixed(1) + "%" : "12.3%";

  // Dynamically compute the pipeline funnel based on current database
  const totalInFunnel = leads.length || 1;
  const funnelStages = [
    { stage: "New", count: leads.filter(l => l.status === "New").length, color: VIOLET },
    { stage: "Call Later", count: leads.filter(l => l.status === "Call Later").length, color: "#3B82F6" },
    { stage: "Send Details", count: leads.filter(l => l.status === "Send Details").length, color: AMBER },
    { stage: "Site Visit", count: leads.filter(l => l.status === "Site Visit").length, color: GR },
    { stage: "Not Interested", count: leads.filter(l => l.status === "Not Interested").length, color: "#991B1B" },
  ].map(f => ({
    ...f,
    pct: Math.round((f.count / totalInFunnel) * 100)
  }));

  const handleDownloadPDF = () => {
    const style = document.createElement("style");
    style.id = "print-pdf-styles";
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        #analytics-pdf-content, #analytics-pdf-content * {
          visibility: visible;
        }
        #analytics-pdf-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          padding: 20px;
          background: white;
        }
        .no-print {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
    window.print();
    setTimeout(() => {
      const el = document.getElementById("print-pdf-styles");
      if (el) el.remove();
    }, 1000);
  };

  return (
    <div id="analytics-pdf-content" className="flex-1 overflow-y-auto pb-24" style={{ scrollbarWidth: "none" }}>
      <ScreenHeader
        title="Analytics"
        onBack={onBack}
        right={
          <div className="flex items-center gap-2">
            <div className="flex gap-1 p-1 rounded-full no-print" style={{ backgroundColor: "#EDE9FF" }}>
              {["30d", "90d", "12m"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className="px-3 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: range === r ? VIOLET : "transparent", color: range === r ? "#fff" : VIOLET, height: 28 }}
                >
                  {r}
                </button>
              ))}
            </div>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 active:scale-95 no-print"
              title="Download PDF Report"
              style={{ minWidth: 32 }}
            >
              <Download size={15} />
            </button>
          </div>
        }
      />
      <div className="px-5 py-5 space-y-5">
        
        {/* Sub tabs navigation */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl no-print">
          {["Overview", "Performance", "Quality"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSubTab(tab as any)}
              className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
              style={{
                backgroundColor: subTab === tab ? "white" : "transparent",
                color: subTab === tab ? VIOLET : "#6B6B8A",
                boxShadow: subTab === tab ? "0 1px 3px rgba(0,0,0,0.05)" : "none"
              }}
            >
              {tab === "Quality" ? "Quality & Bookings" : tab}
            </button>
          ))}
        </div>

        {/* 1. Overview Subtab */}
        {subTab === "Overview" && (
          <div className="space-y-5">
            <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {[
                { label: "Total Leads", value: String(leads.length), color: VIOLET },
                { label: "Revenue", value: "$198k", color: GR },
                { label: "Avg Deal", value: "$640k", color: "#3B82F6" },
                { label: "Conversion", value: conversionRate, color: GR },
                { label: "Hot Leads", value: String(hotLeadsCount), color: AMBER },
              ].map((k, i) => (
                <Card key={i} className="p-4 flex-shrink-0" style={{ minWidth: 110 }}>
                  <div className="text-xl font-bold leading-tight" style={{ color: k.color === AMBER ? DK : k.color }}>{k.value}</div>
                  <div className="text-[11px] mt-1 text-muted-foreground">{k.label}</div>
                </Card>
              ))}
            </div>

            <Card className="p-4">
              <h2 className="text-[15px] font-semibold mb-1 text-foreground">Weekly Trend</h2>
              <div className="flex gap-4 mb-3">
                {[{ color: VIOLET, label: "New Leads" }, { color: GR, label: "Booked" }].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                    <span className="text-[11px]" style={{ color: BD }}>{l.label}</span>
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <AreaChart data={weeklyData} margin={{ top: 5, right: 0, left: -28, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BR} vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: MT }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: MT }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${BR}` }} />
                  <Area type="monotone" dataKey="leads" stroke={VIOLET} fill={`${VIOLET}22`} strokeWidth={2} />
                  <Area type="monotone" dataKey="booked" stroke={GR} fill={`${GR}22`} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-4">
              <h2 className="text-[15px] font-semibold mb-4 text-foreground">Monthly Revenue Growth ($k)</h2>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={revenueData} margin={{ top: 5, right: 0, left: -28, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BR} vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: MT }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: MT }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${BR}` }} formatter={(v: any) => [`$${v}k`]} />
                  <Bar dataKey="v" radius={[4, 4, 0, 0]}>
                    {revenueData.map((_, i) => <Cell key={i} fill={i === revenueData.length - 1 ? GR : VIOLET} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-4">
              <h2 className="text-[15px] font-semibold mb-4 text-foreground">Lead Sources</h2>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={130} height={130}>
                  <PieChart>
                    <Pie data={sourcesData} cx="50%" cy="50%" innerRadius={38} outerRadius={62} dataKey="value" paddingAngle={3}>
                      {sourcesData.map((s, i) => <Cell key={i} fill={s.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 flex-1">
                  {sourcesData.map((s, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className="text-xs" style={{ color: BD }}>{s.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-foreground">{s.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h2 className="text-[15px] font-semibold mb-4 text-foreground">Sales Conversion Funnel</h2>
              <div className="space-y-2">
                {funnelStages.map((f) => (
                  <div key={f.stage} className="flex items-center gap-2">
                    <span className="text-[11px] w-24 flex-shrink-0 text-left" style={{ color: BD }}>{f.stage}</span>
                    <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ backgroundColor: BR }}>
                      <div className="h-full rounded-full flex items-center px-2" style={{ width: `${f.pct || 4}%`, backgroundColor: f.color, minWidth: 24 }}>
                        {f.pct > 12 && <span className="text-[10px] font-bold text-white truncate">{f.count}</span>}
                      </div>
                    </div>
                    <span className="text-[11px] w-7 text-right flex-shrink-0 text-muted-foreground">{f.pct}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* 2. Performance Subtab */}
        {subTab === "Performance" && (
          <div className="space-y-5">
            {/* Call Performance */}
            <Card className="p-4 space-y-4">
              <h2 className="text-[15px] font-bold text-foreground flex items-center gap-2 text-left">
                <span>📞</span> Call Performance Report
              </h2>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 p-2.5 rounded-2xl">
                  <div className="text-base font-bold text-slate-800">452</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">Total Dialed</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-2xl">
                  <div className="text-base font-bold text-emerald-600">82.4%</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">Answer Rate</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-2xl">
                  <div className="text-base font-bold text-violet-600">4.2 min</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">Avg Duration</div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Call Outcome Distribution</h3>
                {[
                  { label: "Interested / Qualified", pct: 45, count: 203, color: "#10B981" },
                  { label: "Scheduled Callbacks", pct: 30, count: 135, color: VIOLET },
                  { label: "Line Busy Outcomes", pct: 15, count: 68, color: AMBER },
                  { label: "No Answer / Lost Leads", pct: 10, count: 46, color: "#EF4444" }
                ].map(o => (
                  <div key={o.label} className="flex items-center gap-2 text-xs">
                    <span className="w-32 text-left text-slate-600 font-medium truncate">{o.label}</span>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${o.pct}%`, backgroundColor: o.color }} />
                    </div>
                    <span className="w-12 text-right text-slate-400 font-semibold">{o.pct}%</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Follow-up Performance */}
            <Card className="p-4 space-y-4">
              <h2 className="text-[15px] font-bold text-foreground flex items-center gap-2 text-left">
                <span>⏱️</span> Follow-up Performance
              </h2>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 p-2.5 rounded-2xl">
                  <div className="text-base font-bold text-slate-800">184</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">Callbacks Set</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-2xl">
                  <div className="text-base font-bold text-emerald-600">95.1%</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">On-Time Rate</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-2xl">
                  <div className="text-base font-bold text-rose-600">3.5%</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">Overdue Rate</div>
                </div>
              </div>
              <div className="bg-violet-50/40 border border-violet-100/50 p-3 rounded-2xl space-y-1 text-left">
                <h4 className="text-[11px] font-bold text-violet-800">💡 Follow-up Completion Insights</h4>
                <p className="text-[10px] text-violet-600 leading-normal">On-time follow-ups lead to a <b>2.4x</b> higher site visit booking rate compared to callbacks delayed by more than 2 hours.</p>
              </div>
            </Card>

            {/* Team Performance */}
            <Card className="p-4 space-y-3">
              <h2 className="text-[15px] font-bold text-foreground flex items-center gap-2 text-left">
                <span>👥</span> Team Performance Reports
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                      <th className="pb-2 text-left">Agent</th>
                      <th className="pb-2 text-right">Closed</th>
                      <th className="pb-2 text-right">Revenue</th>
                      <th className="pb-2 text-right">Response</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                    {[
                      { name: "Sarah Mitchell (You)", closed: 34, rev: "$142k", speed: "12 min" },
                      { name: "Jim Halpert", closed: 22, rev: "$84k", speed: "18 min" },
                      { name: "Michael Scott", closed: 12, rev: "$45k", speed: "42 min" },
                      { name: "Dwight Schrute", closed: 31, rev: "$110k", speed: "14 min" }
                    ].map((agent, i) => (
                      <tr key={i}>
                        <td className="py-2.5 text-left text-slate-800 font-bold">{agent.name}</td>
                        <td className="py-2.5 text-right text-emerald-600 font-bold">{agent.closed}</td>
                        <td className="py-2.5 text-right font-bold">{agent.rev}</td>
                        <td className="py-2.5 text-right text-slate-500">{agent.speed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* 3. Quality & Bookings Subtab */}
        {subTab === "Quality" && (
          <div className="space-y-5">
            {/* Lead Quality */}
            <Card className="p-4 space-y-4">
              <h2 className="text-[15px] font-bold text-foreground flex items-center gap-2 text-left">
                <span>⭐</span> Lead Quality Analytics
              </h2>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 p-2.5 rounded-2xl">
                  <div className="text-base font-bold text-slate-800">42%</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">Hot Ratio</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-2xl">
                  <div className="text-base font-bold text-emerald-600">8.4 / 10</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">Avg Score</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-2xl">
                  <div className="text-base font-bold text-violet-600">Portal</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">Top Source</div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Source Conversion Rates</h3>
                {[
                  { source: "WhatsApp Broadcasts", pct: 72, color: WA },
                  { source: "Real Estate Portals", pct: 54, color: VIOLET },
                  { source: "Cold Call Campaigns", pct: 28, color: AMBER },
                  { source: "Client Referrals", pct: 90, color: "#10B981" }
                ].map(s => (
                  <div key={s.source} className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-semibold text-left truncate">{s.source}</span>
                    <div className="flex items-center gap-2 flex-1 max-w-[150px] justify-end">
                      <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
                      </div>
                      <span className="w-7 text-right text-slate-500 font-bold">{s.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Booking Report */}
            <Card className="p-4 space-y-4">
              <h2 className="text-[15px] font-bold text-foreground flex items-center gap-2 text-left">
                <span>📅</span> Booking & Site Visit Report
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-2xl flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-base">84</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Total Visits</h4>
                    <p className="text-[9px] text-muted-foreground">Scheduled visits</p>
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-base">32</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Conversions</h4>
                    <p className="text-[9px] text-muted-foreground">Visits to deals</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Site Visit Progress Outcomes</h3>
                {[
                  { label: "Completed Site Visits", pct: 75, count: 63, color: "#10B981" },
                  { label: "Pending Scheduled Visits", pct: 15, count: 13, color: VIOLET },
                  { label: "Rescheduled / Delayed", pct: 7, count: 6, color: AMBER },
                  { label: "Cancelled Visits", pct: 3, count: 2, color: "#EF4444" }
                ].map(o => (
                  <div key={o.label} className="space-y-1 text-left">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                      <span>{o.label}</span>
                      <span>{o.count} ({o.pct}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${o.pct}%`, backgroundColor: o.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Hidden PDF print container */}
      <div id="analytics-print-report" style={{ display: "none" }} className="text-left space-y-6 p-6">
        {/* Print Title Header */}
        <div className="border-b-2 border-slate-800 pb-4 mb-6 text-left">
          <h1 className="text-xl font-bold text-slate-800 uppercase tracking-wide">Heitkamp Realty CRM</h1>
          <p className="text-sm font-bold text-slate-500 mt-1">Performance, Operations & Analytics Report</p>
          <p className="text-[10px] text-slate-400 mt-1">Generated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
        </div>

        {/* Section 1: Overview */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-1.5 uppercase text-left">1. Business Overview & Revenue</h2>
          
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: "Total Leads", value: String(leads.length) },
              { label: "Revenue Closed", value: "$198k" },
              { label: "Avg Deal Size", value: "$640k" },
              { label: "Conversion Rate", value: conversionRate },
              { label: "Hot Leads", value: String(hotLeadsCount) },
            ].map((k, i) => (
              <div key={i} className="border border-slate-200 p-3 rounded-2xl text-left">
                <div className="text-[10px] text-slate-500 font-semibold">{k.label}</div>
                <div className="text-base font-bold text-slate-800 mt-1">{k.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="border border-slate-200 p-4 rounded-2xl text-left">
              <h3 className="text-xs font-bold text-slate-800 mb-2">Monthly Revenue ($k)</h3>
              <div style={{ height: 150, width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData} margin={{ top: 5, right: 0, left: -28, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
                    <Bar dataKey="v" fill={VIOLET} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="border border-slate-200 p-4 rounded-2xl text-left">
              <h3 className="text-xs font-bold text-slate-800 mb-2">Sales Funnel Conversion</h3>
              <div className="space-y-1.5 mt-2">
                {funnelStages.map((f) => (
                  <div key={f.stage} className="flex items-center gap-2 text-[10px]">
                    <span className="w-20 text-slate-500 font-semibold text-left">{f.stage}</span>
                    <div className="flex-1 h-3 rounded-full overflow-hidden bg-slate-100">
                      <div className="h-full rounded-full" style={{ width: `${f.pct || 4}%`, backgroundColor: f.color }} />
                    </div>
                    <span className="w-8 text-right text-slate-600 font-bold">{f.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Call & Follow-up Performance */}
        <div className="page-break pt-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-1.5 uppercase text-left">2. Operations & Agent Performance</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-slate-200 p-4 rounded-2xl space-y-3 text-left">
              <h3 className="text-xs font-bold text-slate-800">Call Performance Outcomes</h3>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-2 rounded-xl">
                  <div className="font-bold text-slate-800">452</div>
                  <div className="text-[9px] text-slate-400">Dialed</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl">
                  <div className="font-bold text-emerald-600">82.4%</div>
                  <div className="text-[9px] text-slate-400">Answered</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl">
                  <div className="font-bold text-violet-600">4.2m</div>
                  <div className="text-[9px] text-slate-400">Duration</div>
                </div>
              </div>
              <div className="space-y-2 mt-2">
                {[
                  { label: "Interested / Qualified", pct: 45, color: "#10B981" },
                  { label: "Scheduled Callbacks", pct: 30, color: VIOLET },
                  { label: "Line Busy Outcomes", pct: 15, color: AMBER },
                  { label: "No Answer / Lost Leads", pct: 10, color: "#EF4444" }
                ].map(o => (
                  <div key={o.label} className="flex items-center gap-2 text-[10px]">
                    <span className="w-28 text-slate-500 font-semibold truncate text-left">{o.label}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${o.pct}%`, backgroundColor: o.color }} />
                    </div>
                    <span className="w-8 text-right text-slate-600 font-bold">{o.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-slate-200 p-4 rounded-2xl space-y-3 text-left">
              <h3 className="text-xs font-bold text-slate-800">Follow-up Completion Metrics</h3>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-2 rounded-xl">
                  <div className="font-bold text-slate-800">184</div>
                  <div className="text-[9px] text-slate-400">Scheduled</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl">
                  <div className="font-bold text-emerald-600">95.1%</div>
                  <div className="text-[9px] text-slate-400">On-Time</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl">
                  <div className="font-bold text-rose-600">3.5%</div>
                  <div className="text-[9px] text-slate-400">Overdue</div>
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl text-[10px] text-slate-600 leading-normal text-left">
                On-time follow-ups directly correlate to a 2.4x higher conversion rate in site visit bookings across all lead segments.
              </div>
            </div>
          </div>

          <div className="border border-slate-200 p-4 rounded-2xl text-left">
            <h3 className="text-xs font-bold text-slate-800 mb-3">Agent Conversion Leaderboard</h3>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] uppercase text-slate-400 font-bold">
                  <th className="pb-2 text-left">Agent Name</th>
                  <th className="pb-2 text-right">Closed Deals</th>
                  <th className="pb-2 text-right">Gross Revenue</th>
                  <th className="pb-2 text-right">Response Speed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {[
                  { name: "Sarah Mitchell (You)", closed: 34, rev: "$142,000", speed: "12 min" },
                  { name: "Jim Halpert", closed: 22, rev: "$84,000", speed: "18 min" },
                  { name: "Michael Scott", closed: 12, rev: "$45,000", speed: "42 min" },
                  { name: "Dwight Schrute", closed: 31, rev: "$110,000", speed: "14 min" }
                ].map((agent, i) => (
                  <tr key={i}>
                    <td className="py-2.5 text-slate-800 font-semibold text-left">{agent.name}</td>
                    <td className="py-2.5 text-right text-emerald-600 font-bold">{agent.closed}</td>
                    <td className="py-2.5 text-right font-semibold">{agent.rev}</td>
                    <td className="py-2.5 text-right text-slate-500">{agent.speed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Quality & Bookings */}
        <div className="page-break pt-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-1.5 uppercase text-left">3. Lead Quality & Bookings</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-slate-200 p-4 rounded-2xl space-y-3 text-left">
              <h3 className="text-xs font-bold text-slate-800 font-bold">Lead Quality Analytics</h3>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-2 rounded-xl">
                  <div className="font-bold text-slate-800">42%</div>
                  <div className="text-[9px] text-slate-400">Hot Ratio</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl">
                  <div className="font-bold text-emerald-600">8.4 / 10</div>
                  <div className="text-[9px] text-slate-400 font-medium">Lead Score</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl">
                  <div className="font-bold text-violet-600">Portal</div>
                  <div className="text-[9px] text-slate-400">Top Inflow</div>
                </div>
              </div>
              <div className="space-y-2 mt-2">
                {[
                  { source: "WhatsApp Broadcasts", pct: 72, color: WA },
                  { source: "Real Estate Portals", pct: 54, color: VIOLET },
                  { source: "Cold Call Campaigns", pct: 28, color: AMBER },
                  { source: "Client Referrals", pct: 90, color: "#10B981" }
                ].map(s => (
                  <div key={s.source} className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 font-semibold text-left">{s.source}</span>
                    <div className="flex items-center gap-2 flex-1 max-w-[120px] justify-end">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
                      </div>
                      <span className="w-7 text-right text-slate-600 font-bold">{s.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-slate-200 p-4 rounded-2xl space-y-3 text-left">
              <h3 className="text-xs font-bold text-slate-800">Booking & Site Visit Performance</h3>
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-2 rounded-xl">
                  <div className="font-bold text-slate-800">84</div>
                  <div className="text-[9px] text-slate-400">Total Visits</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl">
                  <div className="font-bold text-emerald-600">32</div>
                  <div className="text-[9px] text-slate-400">Conversions</div>
                </div>
              </div>
              <div className="space-y-2 mt-2">
                {[
                  { label: "Completed Site Visits", pct: 75, count: 63, color: "#10B981" },
                  { label: "Pending Scheduled Visits", pct: 15, count: 13, color: VIOLET },
                  { label: "Rescheduled / Delayed", pct: 7, count: 6, color: AMBER },
                  { label: "Cancelled Visits", pct: 3, count: 2, color: "#EF4444" }
                ].map(o => (
                  <div key={o.label} className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-slate-600">
                      <span className="text-left">{o.label}</span>
                      <span>{o.count} ({o.pct}%)</span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${o.pct}%`, backgroundColor: o.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Tab: Properties (unchanged from original design) ─────────────────

function PropertiesTab({ onAddProperty, onEditProperty, onDeleteProperty }: { onAddProperty: () => void; onEditProperty: (prop: any) => void; onDeleteProperty: (id: number) => void }) {
  const { properties, refreshData } = useContext(AppContext)!;
  const [activeTab, setActiveTab] = useState<"All" | "HighDemand" | "My">("HighDemand");
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState("All");

  const highDemandCount = properties.filter(p => (p.inquiries || 0) > 5).length;

  const displayProperties = properties.filter(p => {
    // Filter by Tab
    if (activeTab === "HighDemand") {
      if ((p.inquiries || 0) <= 5) return false;
    } else if (activeTab === "My") {
      // Mock "My Properties" with a subset (e.g. odd IDs)
      if (p.id % 2 === 0) return false;
    }

    // Filter by Advanced Filters (Type: Sale / Rent)
    if (showFilters && typeFilter !== "All") {
      if (p.type !== typeFilter && p.type !== "Both") return false;
    }

    return true;
  });

  const getPropertyTitle = (p: any) => {
    if (p.beds && p.beds > 0) {
      return `${p.beds}BHK Apartment`;
    }
    return "Residential Plot";
  };

  const toggleFavorite = async (e: React.MouseEvent, prop: any) => {
    e.stopPropagation();
    try {
      await api.updateProperty(prop.id, { favorite: prop.favorite ? 0 : 1 });
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  // Setup tabs config
  const tabs = [
    { id: "All" as const, label: "All Properties", count: properties.length },
    { id: "HighDemand" as const, label: "High Demand", count: highDemandCount },
    { id: "My" as const, label: "My Properties", count: Math.ceil(properties.length / 2) }
  ];

  const getTabHeader = () => {
    switch (activeTab) {
      case "HighDemand":
        return {
          title: "High Demand Properties",
          subtitle: "Properties with high interest & inquiries"
        };
      case "My":
        return {
          title: "My Properties",
          subtitle: "Listings managed by you"
        };
      default:
        return {
          title: "All Properties",
          subtitle: "Browse all available listings"
        };
    }
  };

  const headerInfo = getTabHeader();

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F8F9FE]">
      {/* Top Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-3 bg-white flex-shrink-0 border-b border-slate-100">
        <button
          onClick={() => {}} // Could trigger back or screen transitions if navigation is defined
          className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-800 transition-colors"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>
        <h1
          className="text-slate-900 text-lg font-bold"
          style={{ fontFamily: "Plus Jakarta Sans" }}
        >
          Properties
        </h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            showFilters ? "bg-violet-50 text-violet-600" : "hover:bg-slate-50 text-slate-800"
          }`}
        >
          <Filter size={20} strokeWidth={2} />
        </button>
      </div>

      {/* Horizontal Pill Tabs */}
      <div className="px-5 py-4 bg-white flex gap-3 flex-shrink-0 border-b border-slate-100/50 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {tabs.map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-shrink-0 py-3 px-4 rounded-full text-[13px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
              style={{
                backgroundColor: isSelected ? VIOLET : "#FFF",
                color: isSelected ? "#FFF" : "#475569",
                border: isSelected ? `1.5px solid ${VIOLET}` : "1.5px solid #E2E8F0"
              }}
            >
              {tab.label}
              {tab.id === "HighDemand" && (
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-extrabold"
                  style={{
                    backgroundColor: isSelected ? "rgba(255,255,255,0.25)" : "#F1F5F9",
                    color: isSelected ? "#FFF" : "#64748B"
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Advanced Filters (Toggleable via filter button) */}
      {showFilters && (
        <div className="px-5 py-3.5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2 flex-shrink-0">
          <span className="text-xs font-bold text-slate-500 mr-1 uppercase tracking-wider">Type:</span>
          {["All", "Sale", "Rent"].map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                typeFilter === f
                  ? "bg-violet-600 text-white border-violet-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {/* Active Tab Info Header */}
      <div className="px-5 pt-5 pb-2 bg-[#F8F9FE] flex-shrink-0">
        <h2 className="text-[17px] font-extrabold text-slate-800" style={{ fontFamily: "Plus Jakarta Sans" }}>
          {headerInfo.title}
        </h2>
        <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
          {headerInfo.subtitle}
        </p>
      </div>

      {/* Properties List */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 bg-[#F8F9FE]" style={{ scrollbarWidth: "none" }}>
        <div className="flex flex-col gap-4 mt-2">
          {displayProperties.map((prop) => {
            const displayTitle = getPropertyTitle(prop);
            return (
              <div
                key={prop.id}
                onClick={() => onEditProperty(prop)}
                className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100/50 flex gap-4 cursor-pointer hover:shadow-md transition-shadow relative"
              >
                {/* Heart Icon (Favorite) */}
                <button
                  onClick={(e) => toggleFavorite(e, prop)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors shadow-xs z-10"
                >
                  <Heart
                    size={16}
                    className={prop.favorite ? "text-red-500 fill-red-500" : "text-slate-400"}
                  />
                </button>

                {/* Left Thumbnail Image */}
                <div className="w-28 h-28 rounded-2xl overflow-hidden flex-shrink-0">
                  <img
                    src={prop.image}
                    alt={prop.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Right Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-[15px] leading-tight truncate">
                      {displayTitle}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 font-semibold truncate">
                      {prop.name}
                    </p>
                  </div>

                  <div>
                    <p className="font-extrabold text-slate-800 text-[15px] leading-none">
                      {prop.price}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                      <span>{prop.inquiries || 0} Inquiries</span>
                      <span className="text-slate-300">•</span>
                      <span>{prop.siteVisits || 0} Site Visit{prop.siteVisits === 1 ? "" : "s"}</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 bg-white border-t border-slate-100/80 flex-shrink-0">
        <button
          onClick={onAddProperty}
          className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm shadow-violet-500/10 text-sm"
        >
          <Plus size={18} strokeWidth={3} /> Add New Property
        </button>
      </div>
    </div>
  );
}

// ─── Tab: Calendar (unchanged) ──────────────────────────────────────────

function CalendarTab({ go, onAddAppointment }: { go: (s: Screen) => void; onAddAppointment: () => void }) {
  const { appointments } = useContext(AppContext)!;
  const [completedIds, setCompletedIds] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<"time" | "priority">("time");

  const totalTasks = appointments.length;
  const highPriorityCount = appointments.filter(a => a.priority === "High").length;
  
  // Tasks due today: all of them in this daily task view minus completed
  const dueTodayCount = appointments.length - completedIds.length;
  const completedCount = completedIds.length;

  const toggleCompleted = (id: number) => {
    setCompletedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const getPriorityWeight = (priority: string) => {
    switch (priority) {
      case "High": return 3;
      case "Medium": return 2;
      case "Low": return 1;
      default: return 0;
    }
  };

  const sortedTasks = [...appointments].sort((a, b) => {
    if (sortBy === "priority") {
      return getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
    } else {
      // Sort by time string (e.g. 10:00 AM)
      return a.time.localeCompare(b.time);
    }
  });

  const getTaskIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "call":
        return {
          icon: <Phone size={18} className="text-emerald-600" />,
          bg: "#E6F9F0"
        };
      case "viewing":
      case "site visit":
        return {
          icon: <MapPin size={18} className="text-blue-600" />,
          bg: "#EEF6FF"
        };
      case "document":
        return {
          icon: <FileText size={18} className="text-violet-600" />,
          bg: "#F5F3FF"
        };
      case "payment":
        return {
          icon: <IndianRupee size={18} className="text-emerald-600" />,
          bg: "#E6F9F0"
        };
      default:
        return {
          icon: <CalendarDays size={18} className="text-slate-600" />,
          bg: "#F1F5F9"
        };
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "High":
        return { bg: "#FEE2E2", text: "#EF4444" };
      case "Medium":
        return { bg: "#FFF3EB", text: "#D97706" };
      case "Low":
        return { bg: "#EEF6FF", text: "#3B82F6" };
      default:
        return { bg: "#F1F5F9", text: "#64748B" };
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F8F9FE]">
      {/* Top Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-3 bg-white flex-shrink-0 border-b border-slate-100">
        <button
          onClick={() => go("dashboard")}
          className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-800 transition-colors"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>
        <h1
          className="text-slate-900 text-lg font-bold"
          style={{ fontFamily: "Plus Jakarta Sans" }}
        >
          Tasks Due
        </h1>
        <button
          className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-800 transition-colors"
        >
          <MoreHorizontal size={20} strokeWidth={2} />
        </button>
      </div>

      {/* Horizontal Stats Cards */}
      <div className="px-5 py-4 bg-white flex gap-3 flex-shrink-0 border-b border-slate-100/50 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {/* Total Tasks Card (Purple Theme) */}
        <div className="flex-1 min-w-[76px] bg-[#F3F0FF] rounded-2xl py-3 px-1 text-center border border-[#E9E3FF]">
          <div className="text-2xl font-extrabold text-[#7C5CFC] tracking-tight">{totalTasks}</div>
          <div className="text-[10px] font-bold text-[#6D4AE7] mt-1 whitespace-nowrap leading-tight">Total Tasks</div>
        </div>
        {/* High Priority Card (Red Theme) */}
        <div className="flex-1 min-w-[76px] bg-[#FFF2F2] rounded-2xl py-3 px-1 text-center border border-[#FFE2E2]">
          <div className="text-2xl font-extrabold text-[#EF4444] tracking-tight">{highPriorityCount}</div>
          <div className="text-[10px] font-bold text-[#D32F2F] mt-1 whitespace-nowrap leading-tight">High Priority</div>
        </div>
        {/* Due Today Card (Orange Theme) */}
        <div className="flex-1 min-w-[76px] bg-[#FFF8F2] rounded-2xl py-3 px-1 text-center border border-[#FFEFE0]">
          <div className="text-2xl font-extrabold text-[#F59E0B] tracking-tight">{dueTodayCount}</div>
          <div className="text-[10px] font-bold text-[#D97706] mt-1 whitespace-nowrap leading-tight">Due Today</div>
        </div>
        {/* Completed Card (Green Theme) */}
        <div className="flex-1 min-w-[76px] bg-[#F0FDF4] rounded-2xl py-3 px-1 text-center border border-[#DCFCE7]">
          <div className="text-2xl font-extrabold text-[#10B981] tracking-tight">{completedCount}</div>
          <div className="text-[10px] font-bold text-[#15803D] mt-1 whitespace-nowrap leading-tight">Completed</div>
        </div>
      </div>

      {/* List Title & Sort */}
      <div className="px-5 pt-5 pb-2 bg-[#F8F9FE] flex items-center justify-between flex-shrink-0">
        <h2 className="text-[15px] font-extrabold text-slate-800" style={{ fontFamily: "Plus Jakarta Sans" }}>
          Today's Tasks
        </h2>
        <button
          onClick={() => setSortBy(sortBy === "time" ? "priority" : "time")}
          className="flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-800 transition-colors bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/50 shadow-xs"
        >
          Sort {sortBy === "priority" ? "Priority" : "Time"} ⇅
        </button>
      </div>

      {/* Tasks List Container */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 bg-[#F8F9FE]" style={{ scrollbarWidth: "none" }}>
        {sortedTasks.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center bg-white rounded-3xl p-5 shadow-xs border border-slate-100 mt-2">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-base font-semibold text-slate-800">No tasks due today</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-4 shadow-xs border border-slate-100/85 mt-2 flex flex-col divide-y divide-slate-100/70">
            {sortedTasks.map((apt) => {
              const isCompleted = completedIds.includes(apt.id);
              const taskStyle = getTaskIcon(apt.type);
              const priorityStyle = getPriorityStyle(apt.priority);

              return (
                <div
                  key={apt.id}
                  className="flex items-center justify-between py-3.5 first:pt-1 last:pb-1 group transition-all"
                  style={{ opacity: isCompleted ? 0.6 : 1 }}
                >
                  <div className="flex items-center gap-3">
                    {/* Left Circular Action Icon */}
                    <button
                      onClick={() => toggleCompleted(apt.id)}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-90 flex-shrink-0"
                      style={{ backgroundColor: isCompleted ? "#DCFCE7" : taskStyle.bg }}
                    >
                      {isCompleted ? (
                        <Check size={18} className="text-emerald-600" />
                      ) : (
                        taskStyle.icon
                      )}
                    </button>
                    <div className="flex flex-col">
                      <span className={`font-bold text-slate-800 text-[14px] leading-tight transition-all ${
                        isCompleted ? "line-through text-slate-400 font-medium" : ""
                      }`}>
                        {apt.title}
                      </span>
                      <span className="text-[11px] text-slate-400 mt-0.5 font-medium">
                        {apt.sub}
                      </span>
                    </div>
                  </div>
                  
                  {/* Right Details */}
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className="text-[11px] font-bold text-slate-700">
                      {apt.time}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider"
                      style={{ backgroundColor: priorityStyle.bg, color: priorityStyle.text }}
                    >
                      {apt.priority || "Medium"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Button Bar */}
      <div className="p-4 bg-white border-t border-slate-100/80 flex-shrink-0">
        <button
          onClick={onAddAppointment}
          className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm shadow-violet-500/10 text-sm"
        >
          <Plus size={18} strokeWidth={3} /> Add New Task
        </button>
      </div>
    </div>
  );
}

// ─── Tab: Profile (extended with links to all new features) ────────────

function ProfileTab({ go }: { go: (s: Screen) => void }) {
  const { leads, tasks } = useContext(AppContext)!;
  const activeLeadsCount = leads.filter((l) => l.status !== "Lost").length;
  const pendingTasksCount = tasks.filter((t) => !t.completed).length;
  const overdueTasksCount = tasks.filter((t) => t.overdue && !t.completed).length;

  const metrics = [
    { label: "Closed Deals", value: String(leads.filter(l => l.status === "Booked").length || 34), icon: CheckCircle2, color: "#10B981" },
    { label: "Active Leads", value: String(activeLeadsCount), icon: Users, color: VIOLET },
    { label: "Avg. Rating", value: "4.9", icon: Star, color: AMBER },
  ];
  const items: { label: string; sub: string; icon: typeof Building2; screen: Screen }[] = [
    { label: "Pipeline", sub: "Track deals by stage", icon: BarChart2, screen: "pipeline" },
    { label: "Follow-ups", sub: "Manage your callbacks", icon: Clock, screen: "followups" },
    { label: "Tasks", sub: `${overdueTasksCount} overdue, ${pendingTasksCount} pending`, icon: CheckCircle2, screen: "tasks" },
    { label: "Marketing Automation", sub: "Triggers, follow-ups & auto drip", icon: Zap, screen: "marketing-automation" },
    { label: "WhatsApp Hub", sub: "Broadcasts, templates & more", icon: MessageCircle, screen: "whatsapp" },
    { label: "Broadcasts", sub: "Send to many leads at once", icon: Share2, screen: "broadcasts" },
    { label: "Analytics", sub: "Performance & revenue", icon: TrendingUp, screen: "analytics" },
    { label: "Import Leads", sub: "Import from Excel/CSV", icon: Upload, screen: "import" },
    { label: "Settings", sub: "Business profile & WhatsApp API", icon: SettingsIcon, screen: "settings" },
  ];

  return (
    <div className="flex-1 overflow-y-auto pb-24" style={{ scrollbarWidth: "none" }}>
      <div className="px-5 pt-12 pb-8" style={{ background: `linear-gradient(135deg, #5B3FD9 0%, ${VIOLET} 100%)` }}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white text-xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            SM
          </div>
          <div>
            <h2 className="text-white text-lg font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Sarah Mitchell</h2>
            <p className="text-white/70 text-sm">Senior Real Estate Agent</p>
            <p className="text-white/50 text-xs">Heitkamp Realty · Chicago, IL</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {metrics.map((m) => (
            <div key={m.label} className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 text-center">
              <m.icon size={16} className="mx-auto mb-1 text-white" />
              <p className="text-white font-bold text-lg">{m.value}</p>
              <p className="text-white/60 text-[10px]">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 mt-5 flex flex-col gap-3">
        {items.map((item) => (
          <button
            key={item.label}
            onClick={() => go(item.screen)}
            className="bg-white rounded-2xl px-4 py-4 shadow-sm flex items-center gap-3 text-left w-full"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#EDE9FF" }}>
              <item.icon size={18} style={{ color: VIOLET }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.sub}</p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
        ))}

        <button className="mt-2 w-full py-4 rounded-2xl text-sm font-semibold text-red-500 bg-red-50">
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ─── Screen: Settings ───────────────────────────────────────────────────

function SettingsScreen({ onBack }: { onBack: () => void }) {
  const [darkMode, setDarkMode] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [notifs, setNotifs] = useState([true, true, false]);

  return (
    <div className="flex-1 overflow-y-auto pb-24" style={{ scrollbarWidth: "none" }}>
      <ScreenHeader title="Settings" onBack={onBack} />
      <div className="px-5 py-5 space-y-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-2 px-1 text-muted-foreground">Appearance</p>
          <Card>
            <div className="flex items-center justify-between px-4 py-4">
              <div>
                <div className="text-sm font-semibold text-foreground">Dark Mode</div>
                <div className="text-xs text-muted-foreground">Switch to dark theme</div>
              </div>
              <Toggle on={darkMode} onChange={setDarkMode} />
            </div>
          </Card>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-2 px-1 text-muted-foreground">Business Profile</p>
          <Card className="p-4 space-y-3">
            <input className="w-full px-3 rounded-xl text-sm" style={{ border: `1px solid ${BR}`, height: 48, color: DK, outline: "none" }} defaultValue="Heitkamp Realty" />
            <input className="w-full px-3 rounded-xl text-sm" style={{ border: `1px solid ${BR}`, height: 48, color: DK, outline: "none" }} defaultValue="+1 312-555-0100" />
          </Card>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-2 px-1 text-muted-foreground">WhatsApp Cloud API</p>
          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: GR }} />
              <span className="text-[13px] font-semibold" style={{ color: GR }}>Connected</span>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5 text-muted-foreground">Access Token</label>
              <div className="flex gap-2">
                <input
                  className="flex-1 px-3 rounded-xl text-sm"
                  style={{ border: `1px solid ${BR}`, height: 48, color: DK, outline: "none" }}
                  type={showToken ? "text" : "password"}
                  defaultValue="EAAGm0lbLBBQBAKZCtest123"
                />
                <button className="px-3 rounded-xl border border-border text-muted-foreground" onClick={() => setShowToken((v) => !v)}>
                  {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[["Phone Number ID", "1234567890"], ["WABA ID", "9876543210"]].map(([label, val]) => (
                <div key={label}>
                  <label className="text-xs font-medium block mb-1.5 text-muted-foreground">{label}</label>
                  <input className="w-full px-3 rounded-xl text-sm" style={{ border: `1px solid ${BR}`, height: 44, color: DK, outline: "none" }} defaultValue={val} />
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5 text-muted-foreground">Webhook URL</label>
              <div className="flex items-center gap-2 px-3 rounded-xl" style={{ backgroundColor: BG, border: `1px solid ${BR}`, height: 44 }}>
                <code className="flex-1 text-xs truncate" style={{ fontFamily: "monospace", color: VIOLET }}>https://api.heitkamprealty.com/webhook</code>
                <button className="text-muted-foreground"><Copy size={15} /></button>
              </div>
            </div>
            <button className="w-full rounded-xl text-sm font-semibold" style={{ border: `1.5px solid ${VIOLET}`, color: VIOLET, height: 48 }}>
              Test Connection
            </button>
          </Card>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-2 px-1 text-muted-foreground">Notifications</p>
          <Card>
            {[
              { label: "Follow-up Reminders", desc: "Get notified 30 min before follow-ups" },
              { label: "New Lead Alerts", desc: "Instant alert when a new lead arrives" },
              { label: "WhatsApp Failures", desc: "Alert when messages fail to deliver" },
            ].map((n, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-4" style={{ borderBottom: i < 2 ? `1px solid ${BR}` : "none" }}>
                <div>
                  <div className="text-sm font-semibold text-foreground">{n.label}</div>
                  <div className="text-xs text-muted-foreground">{n.desc}</div>
                </div>
                <Toggle on={notifs[i]} onChange={(v) => setNotifs((prev) => prev.map((x, idx) => (idx === i ? v : x)))} />
              </div>
            ))}
          </Card>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-2 px-1 text-muted-foreground">Account Security & Active Sessions</p>
          <Card className="divide-y divide-slate-100">
            <div className="p-4 space-y-2 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">1 User Session Restriction</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Strict protection prevents concurrent login sharing.</p>
                </div>
                <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full px-2.5 py-0.5">ENFORCED</span>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Active Device Sessions</h5>
              <div className="space-y-2.5">
                {[
                  { device: "MacBook Pro · Chrome (This Device)", ip: "192.168.1.45", location: "Chicago, IL", time: "Active Now", current: true },
                  { device: "iPhone 15 Pro · Safari Browser", ip: "172.56.21.90", location: "Chicago, IL", time: "Logged out 2 hours ago", current: false }
                ].map((s, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-0.5 text-left">
                      <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                        {s.device}
                        {s.current && <span className="text-[8px] bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded font-bold">CURRENT</span>}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">IP: {s.ip} · {s.location}</p>
                    </div>
                    <span className="text-[9px] font-semibold text-slate-500">{s.time}</span>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => alert("All other active device sessions have been successfully logged out.")}
                className="w-full text-center py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all hover:bg-slate-50 active:scale-95 mt-2"
              >
                Log Out Other Devices
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Import (Excel/CSV wizard) ──────────────────────────────────

function ImportScreen({ onBack }: { onBack: () => void }) {
  const { leads, refreshData } = useContext(AppContext)!;
  const [step, setStep] = useState(1);
  const stepLabels = ["Upload", "Map", "Validate", "Done"];

  // File Upload States
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);

  // Result States
  const [importSummary, setImportSummary] = useState({ created: 0, updated: 0, failed: 0, skipped: 0 });

  const targetColumns = ["Name", "Phone", "Email", "City", "Project", "Budget", "Status", "Source"];

  const handleFile = (file: File) => {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;
      // Split lines
      const lines = text.split(/\r?\n/).map(line => {
        // Simple CSV cell splitter (handles quotes)
        const cells: string[] = [];
        let current = "";
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            cells.push(current.trim());
            current = "";
          } else {
            current += char;
          }
        }
        cells.push(current.trim());
        return cells;
      }).filter(cells => cells.length > 0 && cells.some(c => c !== ""));

      if (lines.length > 0) {
        const fileHeaders = lines[0];
        setHeaders(fileHeaders);
        const dataRows = lines.slice(1);
        setParsedRows(dataRows);

        // Auto-map headers
        const initialMapping: Record<string, string> = {};
        fileHeaders.forEach((h) => {
          const cleanH = h.toLowerCase().replace(/[^a-z]/g, "");
          const match = targetColumns.find(col => {
            const cleanCol = col.toLowerCase().replace(/[^a-z]/g, "");
            return cleanH.includes(cleanCol) || cleanCol.includes(cleanH);
          });
          initialMapping[h] = match || "Ignore";
        });
        setColumnMapping(initialMapping);
        setStep(2);
      }
    };
    reader.readAsText(file);
  };

  const getMappedRows = () => {
    return parsedRows.map((row, index) => {
      const rowObj: any = { num: index + 1, valid: true, dup: false };
      headers.forEach((h, colIndex) => {
        const targetField = columnMapping[h];
        if (targetField && targetField !== "Ignore") {
          rowObj[targetField.toLowerCase()] = row[colIndex] || "";
        }
      });
      
      const phoneClean = (rowObj.phone || "").replace(/[^\d]/g, "");
      
      if (!rowObj.name || rowObj.name.trim() === "" || phoneClean.length < 7) {
        rowObj.valid = false;
      }
      
      const isDuplicate = leads.some(l => {
        const lp = l.phone.replace(/[^\d]/g, "");
        return lp === phoneClean && phoneClean !== "";
      });
      if (isDuplicate) {
        rowObj.dup = true;
      }
      
      return rowObj;
    });
  };

  const mappedRows = getMappedRows();
  const validCount = mappedRows.filter(r => r.valid).length;
  const invalidCount = mappedRows.filter(r => !r.valid).length;
  const duplicateCount = mappedRows.filter(r => r.valid && r.dup).length;

  const handleImport = async () => {
    const leadsToImport = mappedRows.filter(r => r.valid).map(r => ({
      name: r.name,
      phone: r.phone || "",
      email: r.email || "",
      city: r.city || "",
      project: r.project || "",
      budget: r.budget || "",
      status: r.status || "New",
      source: r.source || "Excel Import"
    }));

    if (leadsToImport.length === 0) {
      setImportSummary({ created: 0, updated: 0, failed: invalidCount, skipped: 0 });
      setStep(4);
      return;
    }

    try {
      const res = await api.importLeads(leadsToImport);
      setImportSummary({
        created: res.created || 0,
        updated: res.updated || 0,
        failed: (res.failed || 0) + invalidCount,
        skipped: res.skipped || 0
      });
      await refreshData();
    } catch (e) {
      console.error(e);
      setImportSummary({ created: 0, updated: 0, failed: leadsToImport.length + invalidCount, skipped: 0 });
    }
    setStep(4);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24" style={{ scrollbarWidth: "none" }}>
      <ScreenHeader title="Import Leads" onBack={onBack} />
      <div className="px-5 py-5 space-y-6">
        {/* Progress indicator */}
        <div className="flex items-center">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: i + 1 < step ? GR : i + 1 === step ? VIOLET : BR, color: i + 1 <= step ? "#fff" : MT }}
                >
                  {i + 1 < step ? <Check size={13} /> : i + 1}
                </div>
                <span className="text-[10px] mt-1 font-medium" style={{ color: i + 1 === step ? VIOLET : MT }}>{label}</span>
              </div>
              {i < stepLabels.length - 1 && <div className="flex-1 h-0.5 mb-4 mx-1" style={{ backgroundColor: i + 1 < step ? VIOLET : BR }} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <input
              type="file"
              id="excel-file-input"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            <div
              onClick={() => document.getElementById("excel-file-input")?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleFile(file);
              }}
              className="p-8 rounded-2xl flex flex-col items-center text-center bg-white cursor-pointer transition-all hover:bg-slate-50"
              style={{
                border: `2px dashed ${VIOLET}`,
                backgroundColor: isDragging ? "#F5F3FF" : "#fff"
              }}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "#EDE9FF" }}>
                <Upload size={28} style={{ color: VIOLET }} />
              </div>
              <p className="text-base font-semibold text-foreground">Drop your CSV file here</p>
              <p className="text-[13px] mt-1 text-muted-foreground">or tap to browse</p>
              <div className="flex gap-2 mt-4">
                {[".csv"].map((ext) => (
                  <span key={ext} className="px-2 py-1 rounded-full text-[11px] font-semibold" style={{ backgroundColor: "#EDE9FF", color: VIOLET }}>{ext}</span>
                ))}
              </div>
            </div>
            <Card className="p-4">
              <p className="text-[13px] font-semibold mb-3 text-foreground">Expected columns</p>
              <div className="flex flex-wrap gap-2">
                {["Name", "Phone", "Email", "City", "Project", "Budget", "Status", "Source"].map((c) => (
                  <span key={c} className="px-2 py-1 rounded-full text-[11px] font-medium" style={{ backgroundColor: BG, color: BD, border: `1px solid ${BR}` }}>{c}</span>
                ))}
              </div>
            </Card>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Map Your Columns</h2>
              <p className="text-[13px] text-muted-foreground">We detected {headers.length} columns in {fileName}</p>
            </div>
            <div className="space-y-2">
              {headers.map((h, i) => (
                <div key={i} className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground">{h}</div>
                    <div className="text-xs italic text-muted-foreground">e.g. "{parsedRows[0]?.[i] || ""}"</div>
                  </div>
                  <span className="text-muted-foreground">→</span>
                  <div className="flex items-center gap-1.5">
                    <select
                      className="px-2 rounded-lg text-[13px] font-medium bg-white"
                      style={{ border: `1px solid ${BR}`, color: DK, height: 44 }}
                      value={columnMapping[h] || "Ignore"}
                      onChange={(e) => setColumnMapping(prev => ({ ...prev, [h]: e.target.value }))}
                    >
                      <option value="Ignore">— Ignore —</option>
                      {targetColumns.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 rounded-xl text-sm font-semibold text-muted-foreground" style={{ border: `1.5px solid ${BR}`, height: 48 }}>← Back</button>
              <button onClick={() => setStep(3)} className="flex-1 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: VIOLET, height: 48 }}>Validate →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: "#D1FAE5", color: "#065F46" }}>✓ {validCount} Valid</span>
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: "#FEE2E2", color: "#991B1B" }}>✗ {invalidCount} Invalid</span>
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: "#FFF3CD", color: "#92400E" }}>⚠ {duplicateCount} Duplicate</span>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
              {mappedRows.map((r) => (
                <Card
                  key={r.num}
                  className="p-3"
                  style={{ borderLeft: !r.valid ? `3px solid ${RD}` : r.dup ? `3px solid ${AMBER}` : `3px solid ${GR}` }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-foreground">{r.name || "— Empty Name —"}</div>
                      <div className="text-xs text-muted-foreground">{(r.phone) || "— No Phone —"} {r.budget ? `· ${r.budget}` : ""}</div>
                    </div>
                    {!r.valid && <span className="text-[11px] font-semibold" style={{ color: RD }}>Invalid record</span>}
                    {r.valid && r.dup && <span className="text-[11px] font-semibold" style={{ color: AMBER }}>Duplicate (Will Update)</span>}
                    {r.valid && !r.dup && <Check size={16} style={{ color: GR }} />}
                  </div>
                </Card>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 rounded-xl text-sm font-semibold text-muted-foreground" style={{ border: `1.5px solid ${BR}`, height: 48 }}>← Back</button>
              <button onClick={handleImport} className="flex-1 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: VIOLET, height: 48 }}>Import {validCount} Leads</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: "#D1FAE5" }}>
              <Check size={36} style={{ color: GR }} />
            </div>
            <h2 className="text-xl font-bold mb-2 text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Import Complete!</h2>
            <p className="text-sm mb-6" style={{ color: BD }}>Processed {parsedRows.length} rows from {fileName}.</p>
            <div className="w-full grid grid-cols-2 gap-3 mb-6">
              {[
                { label: "Created", value: String(importSummary.created), color: VIOLET },
                { label: "Updated", value: String(importSummary.updated), color: GR },
                { label: "Skipped", value: String(importSummary.skipped), color: MT },
                { label: "Failed", value: String(importSummary.failed), color: RD },
              ].map((s, i) => (
                <Card key={i} className="py-4 text-center">
                  <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[13px] text-muted-foreground">{s.label}</div>
                </Card>
              ))}
            </div>
            <div className="w-full flex flex-col gap-3">
              <button onClick={onBack} className="w-full rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: VIOLET, height: 48 }}>View All Leads</button>
              <button onClick={() => setStep(1)} className="w-full rounded-xl text-sm font-semibold" style={{ border: `1.5px solid ${VIOLET}`, color: VIOLET, height: 48 }}>Import More</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Bottom Nav ──────────────────────────────────────────────────────────

const navItems: { key: Tab; label: string; icon: typeof Home }[] = [
  { key: "dashboard", label: "Home", icon: Home },
  { key: "leads", label: "Leads", icon: Users },
  { key: "properties", label: "Properties", icon: Building2 },
  { key: "calendar", label: "Calendar", icon: CalendarDays },
  { key: "profile", label: "Profile", icon: User },
];

// ─── Modals: Add Lead, Add Property, Add Appointment ───────────────────

function AddLeadModal({ stage, onClose, onSave }: { stage: LeadStatus; onClose: () => void; onSave: () => void }) {
  const { leads } = useContext(AppContext)!;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [budget, setBudget] = useState("");
  const [project, setProject] = useState("");
  const [city, setCity] = useState("");
  const [type, setType] = useState<"Buyer" | "Seller" | "Renter" | "Investor">("Buyer");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    const phoneClean = phone.replace(/[^\d]/g, "");
    const isDuplicate = leads.some(l => l.phone.replace(/[^\d]/g, "") === phoneClean && phoneClean !== "");
    if (isDuplicate) {
      alert("A lead with this phone number already exists! Duplicate leads are automatically filtered out.");
      return;
    }

    try {
      await api.createLead({
        name,
        phone,
        email,
        budget,
        project,
        city,
        type,
        priority,
        status: stage,
        tags: [type]
      });
      onSave();
    } catch (err) {
      console.error(err);
    }
    onClose();
  };

  return (
    <div className="absolute inset-0 bg-black/60 z-50 flex items-end justify-center">
      <div className="w-full bg-white rounded-t-[32px] p-5 pb-8 space-y-4 max-h-[85%] overflow-y-auto" style={{ borderTop: `4px solid ${VIOLET}` }}>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground">Add New Lead ({stage})</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 text-left">
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Name *</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="w-full px-3.5 py-2.5 rounded-xl text-sm" style={{ border: `1.5px solid ${BR}`, outline: "none", color: DK }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="w-full px-3.5 py-2.5 rounded-xl text-sm" style={{ border: `1.5px solid ${BR}`, outline: "none", color: DK }} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full px-3.5 py-2.5 rounded-xl text-sm" style={{ border: `1.5px solid ${BR}`, outline: "none", color: DK }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Budget</label>
              <input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. $850,000" className="w-full px-3.5 py-2.5 rounded-xl text-sm" style={{ border: `1.5px solid ${BR}`, outline: "none", color: DK }} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">City</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="w-full px-3.5 py-2.5 rounded-xl text-sm" style={{ border: `1.5px solid ${BR}`, outline: "none", color: DK }} />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Project Interest</label>
            <input value={project} onChange={(e) => setProject(e.target.value)} placeholder="e.g. Harbour View Tower" className="w-full px-3.5 py-2.5 rounded-xl text-sm" style={{ border: `1.5px solid ${BR}`, outline: "none", color: DK }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Type</label>
              <select value={type} onChange={(e: any) => setType(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm bg-white" style={{ border: `1.5px solid ${BR}`, outline: "none", color: DK }}>
                <option value="Buyer">Buyer</option>
                <option value="Seller">Seller</option>
                <option value="Renter">Renter</option>
                <option value="Investor">Investor</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Priority</label>
              <select value={priority} onChange={(e: any) => setPriority(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm bg-white" style={{ border: `1.5px solid ${BR}`, outline: "none", color: DK }}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full rounded-xl text-sm font-semibold text-white py-3 mt-4 transition-all hover:opacity-90" style={{ backgroundColor: VIOLET }}>
            Save Lead
          </button>
        </form>
      </div>
    </div>
  );
}

function AddPropertyModal({ onClose, onSave, propertyToEdit }: { onClose: () => void; onSave: () => void; propertyToEdit?: any }) {
  const presets = [
    { name: "House", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=260&fit=crop&auto=format" },
    { name: "Villa", url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=260&fit=crop&auto=format" },
    { name: "Apartment", url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=260&fit=crop&auto=format" },
    { name: "Condo", url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=260&fit=crop&auto=format" },
  ];

  const [name, setName] = useState(propertyToEdit?.name ?? "");
  const [address, setAddress] = useState(propertyToEdit?.address ?? "");
  const [price, setPrice] = useState(propertyToEdit?.price ?? "");
  const [salePrice, setSalePrice] = useState(propertyToEdit?.salePrice ?? "");
  const [type, setType] = useState<"Sale" | "Rent" | "Both">(propertyToEdit?.type ?? "Sale");
  const [beds, setBeds] = useState(propertyToEdit?.beds ?? 2);
  const [baths, setBaths] = useState(propertyToEdit?.baths ?? 2);
  const [sqft, setSqft] = useState(propertyToEdit?.sqft ?? "");
  const [status, setStatus] = useState(propertyToEdit?.status ?? "Available");
  const [image, setImage] = useState(propertyToEdit?.image ?? presets[0].url);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      if (propertyToEdit) {
        await api.updateProperty(propertyToEdit.id, {
          name,
          address,
          price,
          salePrice: salePrice || price,
          type,
          beds,
          baths,
          sqft,
          status,
          image
        });
      } else {
        await api.createProperty({
          name,
          address,
          price,
          salePrice: salePrice || price,
          type,
          beds,
          baths,
          sqft,
          status,
          image,
          featured: false
        });
      }
      onSave();
    } catch (err) {
      console.error(err);
    }
    onClose();
  };

  return (
    <div className="absolute inset-0 bg-black/60 z-50 flex items-end justify-center">
      <div className="w-full bg-white rounded-t-[32px] p-5 pb-8 space-y-4 max-h-[85%] overflow-y-auto" style={{ borderTop: `4px solid ${VIOLET}` }}>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground">Add New Property</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 text-left">
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Property Name *</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Skyline Residences" className="w-full px-3.5 py-2.5 rounded-xl text-sm" style={{ border: `1.5px solid ${BR}`, outline: "none", color: DK }} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Address</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. 850 Marina Blvd" className="w-full px-3.5 py-2.5 rounded-xl text-sm" style={{ border: `1.5px solid ${BR}`, outline: "none", color: DK }} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Property Photo</label>
            <div className="flex gap-2 mb-2 items-center">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleImageFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 w-16 h-12 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground hover:bg-slate-50 transition-all active:scale-95"
                style={{ borderColor: image.startsWith("data:image/") ? VIOLET : BR }}
              >
                <Upload size={14} className="text-muted-foreground" />
                <span className="text-[7px] font-bold mt-1 text-muted-foreground">Upload</span>
              </button>
              
              <div className="flex gap-2 overflow-x-auto pb-1 flex-1" style={{ scrollbarWidth: "none" }}>
                {presets.map((p) => (
                  <button
                    type="button"
                    key={p.url}
                    onClick={() => setImage(p.url)}
                    className="flex-shrink-0 relative w-16 h-12 rounded-lg overflow-hidden border-2 transition-all active:scale-95"
                    style={{ borderColor: image === p.url ? VIOLET : "transparent" }}
                  >
                    <img src={p.url} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <span className="text-[8px] text-white font-bold">{p.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="Or paste any custom image URL..."
              className="w-full px-3.5 py-2.5 rounded-xl text-sm"
              style={{ border: `1.5px solid ${BR}`, outline: "none", color: DK }}
            />
            {image && (
              <div className="mt-2 w-full h-28 rounded-xl overflow-hidden border border-border relative bg-slate-50 flex items-center justify-center">
                <img src={image} className="max-w-full max-h-full object-contain" />
                <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full text-[9px] font-bold text-white">
                  Preview
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Price (e.g. Rent)</label>
              <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. $2,400/mo" className="w-full px-3.5 py-2.5 rounded-xl text-sm" style={{ border: `1.5px solid ${BR}`, outline: "none", color: DK }} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Sale Price</label>
              <input value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="e.g. $450,000" className="w-full px-3.5 py-2.5 rounded-xl text-sm" style={{ border: `1.5px solid ${BR}`, outline: "none", color: DK }} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Beds</label>
              <input type="number" value={beds} onChange={(e) => setBeds(Number(e.target.value))} className="w-full px-3.5 py-2.5 rounded-xl text-sm" style={{ border: `1.5px solid ${BR}`, outline: "none", color: DK }} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Baths</label>
              <input type="number" value={baths} onChange={(e) => setBaths(Number(e.target.value))} className="w-full px-3.5 py-2.5 rounded-xl text-sm" style={{ border: `1.5px solid ${BR}`, outline: "none", color: DK }} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Sqft</label>
              <input value={sqft} onChange={(e) => setSqft(e.target.value)} placeholder="e.g. 1,200" className="w-full px-3.5 py-2.5 rounded-xl text-sm" style={{ border: `1.5px solid ${BR}`, outline: "none", color: DK }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Type</label>
              <select value={type} onChange={(e: any) => setType(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white" style={{ border: `1.5px solid ${BR}`, outline: "none", color: DK }}>
                <option value="Sale">For Sale</option>
                <option value="Rent">For Rent</option>
                <option value="Both">Both</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white" style={{ border: `1.5px solid ${BR}`, outline: "none", color: DK }}>
                <option value="Available">Available</option>
                <option value="Pending">Pending</option>
                <option value="Exclusive">Exclusive</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full rounded-xl text-sm font-semibold text-white py-3 mt-4 transition-all hover:opacity-90" style={{ backgroundColor: VIOLET }}>
            Save Property
          </button>
        </form>
      </div>
    </div>
  );
}


function AddAppointmentModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [title, setTitle] = useState("");
  const [sub, setSub] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState<"viewing" | "call" | "meeting" | "signing" | "internal">("viewing");

  const colors = {
    viewing: "#7C5CFC",
    call: "#10B981",
    signing: "#F59E0B",
    meeting: "#3B82F6",
    internal: "#8B5CF6"
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !time.trim()) return;
    try {
      await api.createAppointment({
        title,
        sub,
        time,
        type,
        color: colors[type]
      });
      onSave();
    } catch (err) {
      console.error(err);
    }
    onClose();
  };

  return (
    <div className="absolute inset-0 bg-black/60 z-50 flex items-end justify-center">
      <div className="w-full bg-white rounded-t-[32px] p-5 pb-8 space-y-4 max-h-[85%] overflow-y-auto" style={{ borderTop: `4px solid ${VIOLET}` }}>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground">Add Appointment</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 text-left">
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Event Title *</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Property Viewing" className="w-full px-3.5 py-2.5 rounded-xl text-sm" style={{ border: `1.5px solid ${BR}`, outline: "none", color: DK }} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Details / Subtitle</label>
            <input value={sub} onChange={(e) => setSub(e.target.value)} placeholder="e.g. Rohan Mehta · Skyline Residences" className="w-full px-3.5 py-2.5 rounded-xl text-sm" style={{ border: `1.5px solid ${BR}`, outline: "none", color: DK }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Time *</label>
              <input required value={time} onChange={(e) => setTime(e.target.value)} placeholder="e.g. 10:30 AM" className="w-full px-3.5 py-2.5 rounded-xl text-sm" style={{ border: `1.5px solid ${BR}`, outline: "none", color: DK }} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Event Type</label>
              <select value={type} onChange={(e: any) => setType(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white" style={{ border: `1.5px solid ${BR}`, outline: "none", color: DK }}>
                <option value="viewing">Property Viewing</option>
                <option value="call">Follow-up Call</option>
                <option value="meeting">Meeting</option>
                <option value="signing">Lease Signing</option>
                <option value="internal">Internal Sync</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full rounded-xl text-sm font-semibold text-white py-3 mt-4 transition-all hover:opacity-90" style={{ backgroundColor: VIOLET }}>
            Save Appointment
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────

export default function App() {
  const [leads, setLeads] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [followups, setFollowups] = useState<any[]>([]);
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [incomes, setIncomes] = useState<any[]>([]);

  const [screen, setScreen] = useState<Screen>("dashboard");
  const [history, setHistory] = useState<Screen[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<number>(1);

  // Modal Visibility States
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [addLeadStage, setAddLeadStage] = useState<LeadStatus>("New");
  const [schedulingLead, setSchedulingLead] = useState<any | null>(null);
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [showAddAppointmentModal, setShowAddAppointmentModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);

  const refreshData = async () => {
    try {
      const data = await api.getAnalytics();
      if (data && Array.isArray(data.stats)) {
        setStats(data.stats);
        setAnalytics(data);
      }
    } catch (e) {
      console.error("Error loading analytics:", e);
    }

    try {
      const leadsData = await api.getLeads();
      if (Array.isArray(leadsData)) {
        setLeads(leadsData);
      }
    } catch (e) {
      console.error("Error loading leads:", e);
    }

    try {
      const propsData = await api.getProperties();
      if (Array.isArray(propsData)) {
        setProperties(propsData);
      }
    } catch (e) {
      console.error("Error loading properties:", e);
    }

    try {
      const tasksData = await api.getTasks();
      if (Array.isArray(tasksData)) {
        setTasks(tasksData);
      }
    } catch (e) {
      console.error("Error loading tasks:", e);
    }

    try {
      const aptsData = await api.getAppointments();
      if (Array.isArray(aptsData)) {
        setAppointments(aptsData);
      }
    } catch (e) {
      console.error("Error loading appointments:", e);
    }

    try {
      const fupsData = await api.getFollowups();
      if (Array.isArray(fupsData)) {
        setFollowups(fupsData);
      }
    } catch (e) {
      console.error("Error loading followups:", e);
    }

    try {
      const bcastsData = await api.getBroadcasts();
      if (Array.isArray(bcastsData)) {
        setBroadcasts(bcastsData);
      }
    } catch (e) {
      console.error("Error loading broadcasts:", e);
    }

    try {
      const incomesData = await api.getIncomes();
      if (Array.isArray(incomesData)) {
        setIncomes(incomesData);
      }
    } catch (e) {
      console.error("Error loading incomes:", e);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const rootTabs: Screen[] = ["dashboard", "leads", "properties", "calendar", "profile"];
  const isRootTab = (s: Screen): s is Tab => rootTabs.includes(s);

  const go = (s: Screen) => {
    setHistory((h) => [...h, screen]);
    setScreen(s);
  };

  const goTab = (t: Tab) => {
    setHistory([]);
    setScreen(t);
  };

  const back = () => {
    setHistory((h) => {
      if (h.length === 0) {
        setScreen("dashboard");
        return h;
      }
      setScreen(h[h.length - 1]);
      return h.slice(0, -1);
    });
  };

  const openLead = (id: number) => {
    setSelectedLeadId(id);
    go("lead-detail");
  };

  const renderScreen = () => {
    switch (screen) {
      case "dashboard":
        return (
          <DashboardTab
            go={go}
            goTab={goTab}
            back={back}
            setSelectedLeadId={setSelectedLeadId}
          />
        );
      case "leads":
        return (
          <LeadsTab
            go={go}
            openLead={openLead}
            onAddLead={() => { setAddLeadStage("New"); setShowAddLeadModal(true); }}
            onScheduleVisit={(lead) => setSchedulingLead(lead)}
          />
        );
      case "properties":
        return (
          <PropertiesTab
            onAddProperty={() => {
              setEditingProperty(null);
              setShowAddPropertyModal(true);
            }}
            onEditProperty={(prop) => {
              setEditingProperty(prop);
              setShowAddPropertyModal(true);
            }}
            onDeleteProperty={async (id) => {
              if (confirm("Are you sure you want to delete this property?")) {
                try {
                  await api.deleteProperty(id);
                  refreshData();
                } catch (err) {
                  console.error(err);
                }
              }
            }}
          />
        );
      case "calendar":
        return <CalendarTab go={go} onAddAppointment={() => setShowAddAppointmentModal(true)} />;
      case "profile":
        return <ProfileTab go={go} />;
      case "lead-detail":
        return <LeadDetailScreen leadId={selectedLeadId} onBack={back} />;
      case "pipeline":
        return <PipelineScreen onBack={back} openLead={openLead} onAddLead={(stage) => { setAddLeadStage(stage); setShowAddLeadModal(true); }} />;
      case "followups":
        return <FollowUpsScreen onBack={back} />;
      case "tasks":
        return <TasksScreen onBack={back} />;
      case "whatsapp":
        return <WhatsAppScreen onBack={back} go={go} openLeadChat={(id) => { setSelectedLeadId(id); go("lead-detail"); }} />;
      case "broadcasts":
        return <BroadcastsScreen onBack={back} />;
      case "analytics":
        return <AnalyticsScreen onBack={back} />;
      case "settings":
        return <SettingsScreen onBack={back} />;
      case "import":
        return <ImportScreen onBack={back} />;
      case "marketing-automation":
        return <MarketingAutomationScreen onBack={back} />;
      case "income":
        return <IncomeScreen onBack={back} />;
      default:
        return <DashboardTab go={go} openLead={openLead} onAddLead={() => { setAddLeadStage("New"); setShowAddLeadModal(true); }} />;
    }
  };

  const params = new URLSearchParams(window.location.search);
  const viewParam = params.get("view");
  const propertyIdParam = params.get("propertyId");
  const leadIdParam = params.get("leadId");

  if (viewParam === "public-property" && propertyIdParam && leadIdParam) {
    return (
      <AppContext.Provider value={{
        leads, properties, tasks, appointments, followups, broadcasts, stats, analytics, incomes,
        setLeads, setProperties, setTasks, setAppointments, setFollowups, setBroadcasts, setStats, setIncomes,
        refreshData
      }}>
        <PublicPropertyView
          propertyId={parseInt(propertyIdParam)}
          leadId={parseInt(leadIdParam)}
        />
      </AppContext.Provider>
    );
  }



  return (
    <AppContext.Provider value={{
      leads, properties, tasks, appointments, followups, broadcasts, stats, analytics, incomes,
      setLeads, setProperties, setTasks, setAppointments, setFollowups, setBroadcasts, setStats, setIncomes,
      refreshData
    }}>
      <div className="fixed inset-0 bg-white flex flex-col overflow-hidden">
        <div
          className="relative flex flex-col overflow-hidden w-full h-full bg-white"
          style={{
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {/* Content */}
          <div className="flex-1 flex flex-col overflow-hidden">{renderScreen()}</div>

          {/* Bottom Nav */}
          <div className="flex-shrink-0 bg-white border-t border-border" style={{ paddingBottom: "calc(8px + env(safe-area-inset-bottom, 0px))" }}>
            <div className="flex items-center">
              {navItems.map(({ key, label, icon: Icon }) => {
                const active = screen === key;
                return (
                  <button key={key} onClick={() => goTab(key)} className="flex-1 flex flex-col items-center gap-1 pt-3 pb-1 transition-all">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all" style={active ? { backgroundColor: VIOLET } : {}}>
                      <Icon size={20} style={{ color: active ? "white" : "#6B6B8A" }} strokeWidth={active ? 2.5 : 1.8} />
                    </div>
                    <span className="text-[10px] font-semibold transition-all" style={{ color: active ? VIOLET : "#6B6B8A" }}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modals overlay */}
          {showAddLeadModal && (
            <AddLeadModal
              stage={addLeadStage}
              onClose={() => setShowAddLeadModal(false)}
              onSave={refreshData}
            />
          )}
          {schedulingLead && (
            <ScheduleVisitModal
              lead={schedulingLead}
              onClose={() => setSchedulingLead(null)}
              onSave={refreshData}
            />
          )}
          {showAddPropertyModal && (
            <AddPropertyModal
              propertyToEdit={editingProperty}
              onClose={() => {
                setShowAddPropertyModal(false);
                setEditingProperty(null);
              }}
              onSave={refreshData}
            />
          )}
          {showAddAppointmentModal && (
            <AddAppointmentModal
              onClose={() => setShowAddAppointmentModal(false)}
              onSave={refreshData}
            />
          )}
        </div>
      </div>
    </AppContext.Provider>
  );
}

function IncomeScreen({ onBack }: { onBack: () => void }) {
  const { incomes, refreshData, setIncomes } = useContext(AppContext)!;
  const [collapsed, setCollapsed] = useState(false);

  // Form Fields
  const [customerName, setCustomerName] = useState("");
  const [propertyName, setPropertyName] = useState("");
  const [paymentDate, setPaymentDate] = useState(() => {
    const today = new Date();
    const day = today.getDate();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[today.getMonth()];
    const year = today.getFullYear();
    return `${day} ${month} ${year}`;
  });
  const [amountReceived, setAmountReceived] = useState("");
  const [paymentMode, setPaymentMode] = useState("UPI");
  const [commission, setCommission] = useState("2");
  const [receivedFrom, setReceivedFrom] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [notes, setNotes] = useState("");
  const [receiptFile, setReceiptFile] = useState("receipt.jpg");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !propertyName || !amountReceived) {
      alert("Please fill in Customer Name, Property Name, and Amount Received.");
      return;
    }

    setSubmitting(true);
    const amount = Number(amountReceived) || 0;
    const commVal = Number(commission) || 0;

    const payload = {
      customerName,
      propertyName,
      paymentDate,
      amountReceived: amount,
      paymentMode,
      commission: commVal,
      receivedFrom: receivedFrom || customerName,
      transactionId,
      notes,
      receiptFile
    };

    // Optimistic UI Update
    const mockId = Date.now();
    setIncomes(prev => [{ id: mockId, ...payload }, ...prev]);

    // Update LocalStorage crm_income to sync with Dashboard Tab
    const currentIncomeVal = Number(localStorage.getItem("crm_income") || 128000);
    localStorage.setItem("crm_income", (currentIncomeVal + amount).toString());

    try {
      await api.createIncome(payload);
      refreshData();
      // Clear form
      setCustomerName("");
      setPropertyName("");
      setAmountReceived("");
      setReceivedFrom("");
      setTransactionId("");
      setNotes("");
      alert("Income record saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save income. Please try again.");
    }
    setSubmitting(false);
  };

  // Calculations for Hero Card
  const totalIncome = incomes.reduce((acc, curr) => acc + (curr.amountReceived || 0), 0);
  const todaysDateStr = (() => {
    const today = new Date();
    const day = today.getDate();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[today.getMonth()];
    const year = today.getFullYear();
    return `${day} ${month} ${year}`;
  })();
  const todaysIncome = incomes
    .filter(inc => (inc.paymentDate && inc.paymentDate.toLowerCase().includes("today")) || inc.paymentDate === todaysDateStr)
    .reduce((acc, curr) => acc + (curr.amountReceived || 0), 0) || 25000;
  
  const totalEarnings = totalIncome + 677000;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-3 bg-white flex-shrink-0 border-b border-slate-100">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-800 transition-colors"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>
        <span className="text-slate-800 text-[16px] font-black tracking-tight">Income</span>
        <button className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-800 transition-colors">
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 pb-24 space-y-5" style={{ scrollbarWidth: "none" }}>
        
        {/* Total Income Purple Card */}
        <div className="bg-gradient-to-br from-[#7C5CFC] via-[#6340FD] to-[#5131D7] rounded-3xl p-5 shadow-lg shadow-violet-500/10 text-white flex justify-between items-center relative overflow-hidden">
          <div className="text-left space-y-1">
            <span className="text-white/70 text-[10px] font-bold uppercase tracking-wider block">Total Income</span>
            <span className="text-3xl font-black tracking-tight block">₹{totalIncome.toLocaleString("en-IN")}</span>
            <span className="text-white/60 text-[10px] font-semibold block">This Month</span>
          </div>

          <div className="w-[1px] h-12 bg-white/20 mx-4" />

          <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                  <Wallet size={12} />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[8px] text-white/60 font-bold uppercase tracking-wider">Today's Income</span>
                  <span className="text-xs font-black">₹{todaysIncome.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                  <SlidersHorizontal size={12} />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[8px] text-white/60 font-bold uppercase tracking-wider">Total Earnings</span>
                  <span className="text-xs font-black">₹{totalEarnings.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Add Income Form Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
          <div 
            onClick={() => setCollapsed(!collapsed)}
            className="px-5 py-4 flex items-center justify-between border-b border-slate-50 cursor-pointer hover:bg-slate-50/40 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-[#5B3FD9]">
                <Wallet size={16} />
              </span>
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Add Income</span>
            </div>
            <button className="flex items-center gap-1 text-[10px] font-bold text-violet-600">
              {collapsed ? "Expand" : "Collapse"} {collapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
            </button>
          </div>

          {!collapsed && (
            <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                {/* Customer Name */}
                <div className="bg-white rounded-2xl border border-slate-100 p-3.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-50/50 flex items-center justify-center text-violet-600 flex-shrink-0">
                    <User size={14} />
                  </div>
                  <div className="flex-1 flex flex-col text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer Name</span>
                    <input
                      required
                      type="text"
                      placeholder="Rohit Sharma"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="text-slate-800 text-[13px] font-black mt-0.5 focus:outline-none w-full bg-transparent"
                    />
                  </div>
                </div>

                {/* Property Name */}
                <div className="bg-white rounded-2xl border border-slate-100 p-3.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-50/50 flex items-center justify-center text-violet-600 flex-shrink-0">
                    <Building2 size={14} />
                  </div>
                  <div className="flex-1 flex flex-col text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Property Name</span>
                    <input
                      required
                      type="text"
                      placeholder="3BHK Apartment"
                      value={propertyName}
                      onChange={e => setPropertyName(e.target.value)}
                      className="text-slate-800 text-[13px] font-black mt-0.5 focus:outline-none w-full bg-transparent"
                    />
                  </div>
                </div>

                {/* Payment Date */}
                <div className="bg-white rounded-2xl border border-slate-100 p-3.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-50/50 flex items-center justify-center text-violet-600 flex-shrink-0">
                    <CalendarDays size={14} />
                  </div>
                  <div className="flex-1 flex flex-col text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Date</span>
                    <input
                      required
                      type="text"
                      value={paymentDate}
                      onChange={e => setPaymentDate(e.target.value)}
                      className="text-slate-800 text-[13px] font-black mt-0.5 focus:outline-none w-full bg-transparent"
                    />
                  </div>
                </div>

                {/* Amount Received */}
                <div className="bg-white rounded-2xl border border-slate-100 p-3.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-50/50 flex items-center justify-center text-violet-600 flex-shrink-0">
                    <IndianRupee size={14} />
                  </div>
                  <div className="flex-1 flex flex-col text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount Received</span>
                    <input
                      required
                      type="number"
                      placeholder="25000"
                      value={amountReceived}
                      onChange={e => setAmountReceived(e.target.value)}
                      className="text-slate-800 text-[13px] font-black mt-0.5 focus:outline-none w-full bg-transparent"
                    />
                  </div>
                </div>

                {/* Payment Mode */}
                <div className="bg-white rounded-2xl border border-slate-100 p-3.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-50/50 flex items-center justify-center text-violet-600 flex-shrink-0">
                    <Wallet size={14} />
                  </div>
                  <div className="flex-1 flex flex-col text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Mode</span>
                    <select
                      value={paymentMode}
                      onChange={e => setPaymentMode(e.target.value)}
                      className="text-slate-800 text-[13px] font-black mt-0.5 focus:outline-none w-full bg-transparent border-none p-0 cursor-pointer"
                    >
                      <option value="UPI">UPI</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                    </select>
                  </div>
                </div>

                {/* Commission (%) */}
                <div className="bg-white rounded-2xl border border-slate-100 p-3.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-50/50 flex items-center justify-center text-violet-600 flex-shrink-0">
                    <Percent size={14} />
                  </div>
                  <div className="flex-1 flex flex-col text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Commission (%)</span>
                    <input
                      type="text"
                      placeholder="2%"
                      value={commission}
                      onChange={e => setCommission(e.target.value)}
                      className="text-slate-800 text-[13px] font-black mt-0.5 focus:outline-none w-full bg-transparent"
                    />
                  </div>
                </div>

                {/* Received From */}
                <div className="bg-white rounded-2xl border border-slate-100 p-3.5 flex items-center gap-3 col-span-2 text-left">
                  <div className="w-8 h-8 rounded-full bg-violet-50/50 flex items-center justify-center text-violet-600 flex-shrink-0">
                    <User size={14} />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Received From</span>
                    <input
                      type="text"
                      placeholder="Rohit Sharma"
                      value={receivedFrom}
                      onChange={e => setReceivedFrom(e.target.value)}
                      className="text-slate-800 text-[13px] font-black mt-0.5 focus:outline-none w-full bg-transparent"
                    />
                  </div>
                </div>

                {/* Transaction ID */}
                <div className="bg-white rounded-2xl border border-slate-100 p-3.5 flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-full bg-violet-50/50 flex items-center justify-center text-violet-600 flex-shrink-0">
                    <Hash size={14} />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transaction ID</span>
                    <input
                      type="text"
                      placeholder="UPI/1234567890"
                      value={transactionId}
                      onChange={e => setTransactionId(e.target.value)}
                      className="text-slate-800 text-[13px] font-black mt-0.5 focus:outline-none w-full bg-transparent"
                    />
                  </div>
                </div>

                {/* Notes (Optional) */}
                <div className="bg-white rounded-2xl border border-slate-100 p-3.5 flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-full bg-violet-50/50 flex items-center justify-center text-violet-600 flex-shrink-0">
                    <FileText size={14} />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notes (Optional)</span>
                    <input
                      type="text"
                      placeholder="Token Amount"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      className="text-slate-800 text-[13px] font-black mt-0.5 focus:outline-none w-full bg-transparent"
                    />
                  </div>
                </div>

                {/* Upload Receipt */}
                <div className="bg-white rounded-2xl border border-slate-100 p-3.5 flex items-center justify-between gap-3 col-span-2 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-violet-50/50 flex items-center justify-center text-violet-600 flex-shrink-0">
                      <FileText size={14} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Upload Receipt</span>
                      <input
                        type="text"
                        value={receiptFile}
                        onChange={e => setReceiptFile(e.target.value)}
                        className="text-slate-800 text-[13px] font-black mt-0.5 focus:outline-none bg-transparent"
                      />
                    </div>
                  </div>
                  <button type="button" className="text-violet-600 hover:text-violet-800 p-1">
                    <Upload size={16} />
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#5B3FD9] text-white rounded-xl py-3.5 font-bold text-xs uppercase tracking-wider hover:bg-violet-800 transition-colors shadow-sm mt-3"
              >
                {submitting ? "Saving..." : "+ Save Income"}
              </button>
            </form>
          )}
        </div>

        {/* Recent Transactions List */}
        <div className="mt-4">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3 text-left px-1">Recent Transactions</h3>
          {incomes.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-6">No transactions recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {incomes.map((inc) => (
                <div key={inc.id} className="bg-white p-4 rounded-3xl border border-slate-100/80 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#10B981] font-bold">
                      ₹
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800">{inc.customerName}</h4>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">{inc.propertyName} • {inc.paymentDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-[#10B981] bg-emerald-50/50 px-2.5 py-1 rounded-full border border-emerald-100/55">
                      +₹{(inc.amountReceived || 0).toLocaleString("en-IN")}
                    </span>
                    <p className="text-[9px] text-slate-400 font-bold mt-1.5 uppercase tracking-wider">{inc.paymentMode}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function MarketingAutomationScreen({ onBack }: { onBack: () => void }) {
  const { leads, refreshData } = useContext(AppContext)!;
  const [selectedLeadId, setSelectedLeadId] = useState<string>("");
  const [selectedTrigger, setSelectedTrigger] = useState("Send Details");
  const [logs, setLogs] = useState<string[]>([]);
  const [simulating, setSimulating] = useState(false);
  const [campaigns, setCampaigns] = useState([
    { id: 1, name: "New Lead Welcome Sequence", description: "Triggered on new lead addition. Sends brochure & checks back in 2 days.", steps: 3, enabled: true },
    { id: 2, name: "Post-Viewing Nurturer", description: "Triggered when site visit is completed. Drives negotiations.", steps: 4, enabled: true },
    { id: 3, name: "Cold Re-engagement", description: "Triggered after 14 days of no contact. Shares pricing drops.", steps: 2, enabled: false }
  ]);

  const toggleCampaign = (id: number) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
  };

  const handleSimulate = async () => {
    if (!selectedLeadId) {
      alert("Please select a lead first!");
      return;
    }
    const lead = leads.find(l => l.id === parseInt(selectedLeadId));
    if (!lead) return;

    setSimulating(true);
    setLogs([]);
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

    setLogs(prev => [...prev, `⏳ Listening for triggers on lead: "${lead.name}"...`]);
    await sleep(600);
    setLogs(prev => [...prev, `⚡ Trigger detected: Lead Status changed to "${selectedTrigger}"`]);
    await sleep(800);
    setLogs(prev => [...prev, `🔍 Matching active automation rules for status "${selectedTrigger}"...`]);
    await sleep(700);

    let messageText = "";
    if (selectedTrigger === "Send Details") {
      messageText = `Hi ${lead.name.split(" ")[0]}, thank you for confirming your requirements. I've prepared a customized list of premium units in ${lead.project}. Let me know if you would like me to share it!`;
      setLogs(prev => [...prev, `🚀 Firing Meta WhatsApp Cloud API request payload to: ${lead.phone}`]);
      await sleep(1000);
      setLogs(prev => [...prev, `📨 Message Content: "${messageText}"`]);
      await sleep(600);
      setLogs(prev => [...prev, `✅ Meta response: 200 OK (wamid: ${Math.random().toString(36).substring(7)})`]);
    } else if (selectedTrigger === "Site Visit") {
      messageText = `Hi ${lead.name.split(" ")[0]}, looking forward to meeting you for the site visit at ${lead.project}. Please ensure you carry a valid ID card. See you soon!`;
      setLogs(prev => [...prev, `🚀 Firing Meta WhatsApp Cloud API request payload to: ${lead.phone}`]);
      await sleep(1000);
      setLogs(prev => [...prev, `📨 Message Content: "${messageText}"`]);
      await sleep(600);
      setLogs(prev => [...prev, `✅ Meta response: 200 OK (wamid: ${Math.random().toString(36).substring(7)})`]);
      await sleep(500);
      setLogs(prev => [...prev, `📅 Creating automatic Calendar reminder...`]);
      try {
        await api.createAppointment({
          time: "Tomorrow at 10:00 AM",
          title: `Auto-Remind: Site Visit with ${lead.name}`,
          sub: `Confirm client is on the way to ${lead.project}`,
          type: "call",
          color: "#10B981"
        });
        setLogs(prev => [...prev, `✅ Added to calendar: "Auto-Remind: Site Visit with ${lead.name}"`]);
      } catch (err) {
        console.error(err);
      }
    } else {
      setLogs(prev => [...prev, `⚠️ No matching WhatsApp API template configured for: ${selectedTrigger}`]);
    }

    await sleep(500);
    setLogs(prev => [...prev, `🏁 Automation run complete.`]);
    setSimulating(false);
    refreshData();
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 pb-24" style={{ scrollbarWidth: "none" }}>
      <ScreenHeader title="Marketing & Automation" onBack={onBack} />
      <div className="px-5 py-5 space-y-6">
        
        {/* Campaigns Panel */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Drip Campaigns</h3>
          <div className="space-y-3">
            {campaigns.map(c => (
              <div key={c.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-800">{c.name}</h4>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={c.enabled ? { backgroundColor: "#ECFDF5", color: "#059669" } : { backgroundColor: "#F1F5F9", color: "#64748B" }}>
                      {c.enabled ? "ACTIVE" : "PAUSED"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{c.description}</p>
                  <p className="text-[10px] font-semibold text-violet-600 uppercase tracking-wider">{c.steps} automated steps</p>
                </div>
                <button
                  onClick={() => toggleCampaign(c.id)}
                  className="px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all"
                  style={c.enabled ? { backgroundColor: "#FEE2E2", color: "#EF4444" } : { backgroundColor: VIOLET, color: "white" }}
                >
                  {c.enabled ? "Pause" : "Activate"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Triggers Panel */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>System Triggers</h3>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <div>
                <p className="text-xs font-semibold text-slate-800">Rule #1: Lead Status Send Details</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Send custom property listing introduction template.</p>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-800">Rule #2: Lead Status Site Visit</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Send preparation templates and schedule calendar callbacks.</p>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
          </div>
        </div>

        {/* Simulator Panel */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Automation Simulator</h3>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4 text-left">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Select Lead</label>
              <select
                value={selectedLeadId}
                onChange={e => setSelectedLeadId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-100 font-semibold text-slate-800"
                style={{ outline: "none" }}
              >
                <option value="">Choose a Lead...</option>
                {leads.map(l => (
                  <option key={l.id} value={l.id}>{l.name} ({l.phone})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Simulate Status Transition</label>
              <select
                value={selectedTrigger}
                onChange={e => setSelectedTrigger(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-100 font-semibold text-slate-800"
                style={{ outline: "none" }}
              >
                <option value="Send Details">Send Details</option>
                <option value="Site Visit">Site Visit</option>
              </select>
            </div>
            <button
              onClick={handleSimulate}
              disabled={simulating}
              className="w-full rounded-xl text-xs font-bold text-white py-3 transition-all hover:opacity-95 flex items-center justify-center gap-1.5 shadow-sm"
              style={{ backgroundColor: VIOLET }}
            >
              <Zap size={13} /> {simulating ? "Simulating..." : "Trigger Simulated Event"}
            </button>

            {/* Live Logs Console */}
            {logs.length > 0 && (
              <div className="bg-slate-900 rounded-xl p-4 font-mono text-[10px] text-emerald-400 space-y-1.5 overflow-hidden max-h-60 overflow-y-auto">
                <p className="text-slate-400 border-b border-slate-800 pb-1 mb-2">Automation Console Output:</p>
                {logs.map((log, index) => (
                  <p key={index} className="leading-relaxed">{log}</p>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function AuthPortalScreen({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [step, setStep] = useState<"register" | "subscription" | "checkout" | "success">("register");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpField, setShowOtpField] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  
  const plans = [
    { name: "Starter Plan", price: "$29", desc: "Best for individual brokers. 1 User account limit.", features: ["Up to 100 Leads", "10 Properties", "WhatsApp Template Sync", "1 Device Login Session"] },
    { name: "Professional Plan", price: "$79", desc: "For growth-focused brokers. Custom branding.", features: ["Unlimited Leads", "50 Properties", "Site Visit Reminders", "Dedicated Session Security"] },
    { name: "Enterprise Plan", price: "$199", desc: "Full features & integrations.", features: ["Unlimited Leads & Properties", "Advanced Marketing automation", "Full Call Log Analytics", "IP-restricted Secure Session"] }
  ];

  const handleRegisterOrLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !phone) return;
    if (!showOtpField) {
      setShowOtpField(true);
      alert("Verification OTP sent! Enter 1234 to verify.");
    } else {
      if (otp === "1234") {
        setStep("subscription");
      } else {
        alert("Invalid OTP code. Please enter 1234.");
      }
    }
  };

  const handlePlanSelect = (plan: any) => {
    setSelectedPlan(plan);
    setStep("checkout");
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("success");
  };

  return (
    <div className="fixed inset-0 bg-slate-50 flex items-center justify-center p-4 z-50 overflow-y-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6 border border-slate-100 text-center space-y-6">
        
        {/* Step 1: Register / Login */}
        {step === "register" && (
          <form onSubmit={handleRegisterOrLogin} className="space-y-4 text-left">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto text-violet-600 font-bold text-lg">H</div>
              <h2 className="text-xl font-bold text-slate-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Welcome to Heitkamp CRM</h2>
              <p className="text-xs text-slate-500">Register or Sign in with email or mobile number to continue.</p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Email Address</label>
              <input required type="email" placeholder="sarah@example.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-100 font-semibold text-slate-800" style={{ outline: "none" }} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Mobile Number</label>
              <input required type="tel" placeholder="+1 555 123 4567" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-100 font-semibold text-slate-800" style={{ outline: "none" }} />
            </div>
            {showOtpField && (
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">OTP Verification Code</label>
                <input required type="text" placeholder="Enter 1234" value={otp} onChange={e => setOtp(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-100 font-semibold text-slate-800" style={{ outline: "none" }} />
              </div>
            )}
            <button type="submit" className="w-full rounded-xl text-xs font-bold text-white py-3 transition-all hover:opacity-95 shadow-sm" style={{ backgroundColor: VIOLET }}>
              {showOtpField ? "Verify and Log In" : "Send OTP"}
            </button>
          </form>
        )}

        {/* Step 2: Choose Subscription */}
        {step === "subscription" && (
          <div className="space-y-4 text-left">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-slate-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Choose Your Plan</h2>
              <p className="text-xs text-slate-500">All subscriptions follow the strict 1 User Session policy.</p>
            </div>
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {plans.map(p => (
                <div key={p.name} onClick={() => handlePlanSelect(p)} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-violet-300 transition-all cursor-pointer space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800">{p.name}</h4>
                    <span className="text-sm font-bold text-violet-600">{p.price}<span className="text-[9px] font-medium text-slate-400">/mo</span></span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">{p.desc}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.features.map(f => (
                      <span key={f} className="text-[8px] font-semibold bg-white border border-slate-100 rounded-full px-2 py-0.5 text-slate-600">{f}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Checkout Simulator */}
        {step === "checkout" && selectedPlan && (
          <form onSubmit={handlePaymentSubmit} className="space-y-4 text-left">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-slate-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Complete Subscription</h2>
              <p className="text-xs text-slate-500">Subscribe to {selectedPlan.name} for {selectedPlan.price}/month.</p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Cardholder Name</label>
              <input required type="text" placeholder="Sarah Mitchell" className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-100 font-semibold text-slate-800" style={{ outline: "none" }} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Card Number</label>
              <input required type="text" placeholder="4242 4242 4242 4242" className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-100 font-semibold text-slate-800" style={{ outline: "none" }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Expiry Date</label>
                <input required type="text" placeholder="MM/YY" className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-100 font-semibold text-slate-800" style={{ outline: "none" }} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">CVC Code</label>
                <input required type="text" placeholder="123" className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-100 font-semibold text-slate-800" style={{ outline: "none" }} />
              </div>
            </div>
            <button type="submit" className="w-full rounded-xl text-xs font-bold text-white py-3 transition-all hover:opacity-95 shadow-sm mt-2" style={{ backgroundColor: VIOLET }}>
              Pay & Subscribe
            </button>
          </form>
        )}

        {/* Step 4: Success */}
        {step === "success" && (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 text-lg">✓</div>
            <h2 className="text-lg font-bold text-slate-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Payment Successful!</h2>
            <p className="text-xs text-slate-500">Your subscription is active. Login sessions are locked to this device.</p>
            <button onClick={onLoginSuccess} className="w-full rounded-xl text-xs font-bold text-white py-3 transition-all hover:opacity-95 shadow-sm" style={{ backgroundColor: VIOLET }}>
              Enter CRM Workspace
            </button>
          </div>
        )}
        
      </div>
    </div>
  );
}

function PublicPropertyView({ propertyId, leadId }: { propertyId: number; leadId: number }) {
  const { leads, properties, refreshData } = useContext(AppContext)!;
  const [statusMsg, setStatusMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const lead = leads.find((l) => l.id === leadId);
  const property = properties.find((p) => p.id === propertyId);

  if (!lead || !property) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-600 mb-4" />
        <h3 className="text-base font-semibold text-slate-800">Loading Property Review Listing...</h3>
        <p className="text-xs text-slate-500 mt-1">Fetching property details from CRM database.</p>
      </div>
    );
  }

  const handleInterested = async () => {
    setSubmitting(true);
    try {
      await api.updateLead(lead.id, { status: "Interested", linkResponse: "Interested" });
      setStatusMsg("Thank you! We have registered your interest in this property. Sarah Mitchell (your agent) has been notified and will reach out to you soon.");
      refreshData();
    } catch (e) {
      console.error(e);
      setStatusMsg("Failed to submit status update. Please try again.");
    }
    setSubmitting(false);
  };

  const handleNotInterested = async () => {
    setSubmitting(true);
    try {
      await api.updateLead(lead.id, { status: "Lost", linkResponse: "Not Interested" });
      setStatusMsg("Thank you for your feedback. We have recorded your response and will update your search preferences accordingly.");
      refreshData();
    } catch (e) {
      console.error(e);
      setStatusMsg("Failed to submit status update. Please try again.");
    }
    setSubmitting(false);
  };

  const handleScheduleVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) return;
    setSubmitting(true);
    try {
      await api.updateLead(lead.id, { status: "Site Visit", linkResponse: "Scheduled Site Visit" });

      const appointmentTime = `${date} at ${time}`;
      await api.createAppointment({
        time: appointmentTime,
        title: `Site Visit: ${property.name}`,
        sub: `Client: ${lead.name} (${lead.phone})`,
        type: "viewing",
        color: VIOLET
      });

      setStatusMsg(`Site visit scheduled! We have blocked your calendar and notified Sarah Mitchell for ${date} at ${time}.`);
      setShowSchedule(false);
      refreshData();
    } catch (e) {
      console.error(e);
      setStatusMsg("Failed to schedule site visit. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 pb-12 w-full max-w-lg mx-auto min-h-screen">
      <div className="bg-white border-b border-border py-4 px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: VIOLET }}>H</div>
          <div>
            <h1 className="text-sm font-bold text-slate-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Heitkamp Realty</h1>
            <p className="text-[10px] text-muted-foreground">Property Review Desk</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-muted-foreground uppercase">Your Agent</p>
          <p className="text-xs font-semibold text-slate-800">Sarah Mitchell</p>
        </div>
      </div>

      <div className="relative">
        <img src={property.image} alt={property.name} className="w-full h-64 object-cover" />
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm shadow-sm rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800">
          {property.type}
        </div>
      </div>

      <div className="bg-white p-6 shadow-sm border-b border-slate-100">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{property.name}</h2>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">📍 {property.address}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Asking Price</p>
            <p className="text-xl font-black" style={{ color: VIOLET }}>{property.price}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-6 border-t border-slate-50 pt-5">
          <div className="bg-slate-50 rounded-2xl p-3 text-center">
            <p className="text-[10px] font-semibold text-slate-400 uppercase">Bedrooms</p>
            <p className="text-base font-bold text-slate-800 mt-0.5">🛏 {property.beds} Beds</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-3 text-center">
            <p className="text-[10px] font-semibold text-slate-400 uppercase">Bathrooms</p>
            <p className="text-base font-bold text-slate-800 mt-0.5">🚿 {property.baths} Baths</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-3 text-center">
            <p className="text-[10px] font-semibold text-slate-400 uppercase">Area Size</p>
            <p className="text-base font-bold text-slate-800 mt-0.5">📐 {property.sqft} sqft</p>
          </div>
        </div>
      </div>

      <div className="bg-violet-50/50 p-6 border-b border-violet-100/50">
        <p className="text-sm text-slate-800 leading-relaxed">
          Hello <strong>{lead.name}</strong>, Sarah Mitchell has shared this property listing with you. Please review the details and let us know your level of interest using the options below:
        </p>
      </div>

      {statusMsg && (
        <div className="mx-6 mt-6 p-4 rounded-2xl border bg-emerald-50 border-emerald-100 text-emerald-800 text-sm font-medium">
          🎉 {statusMsg}
        </div>
      )}

      {!statusMsg && !showSchedule && (
        <div className="px-6 mt-6 space-y-3">
          <button
            onClick={handleInterested}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white py-3.5 transition-all hover:opacity-95 active:scale-[0.99]"
            style={{ backgroundColor: GR }}
          >
            🟢 I'm Interested
          </button>
          <button
            onClick={() => setShowSchedule(true)}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white py-3.5 transition-all hover:opacity-95 active:scale-[0.99]"
            style={{ backgroundColor: VIOLET }}
          >
            📅 Schedule Site Visit
          </button>
          <button
            onClick={handleNotInterested}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100/70 py-3.5 transition-all active:scale-[0.99]"
          >
            🔴 Not Interested
          </button>
        </div>
      )}

      {showSchedule && (
        <form onSubmit={handleScheduleVisit} className="mx-6 mt-6 p-5 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Select Date & Time</h3>
            <button type="button" onClick={() => setShowSchedule(false)} className="text-slate-400 hover:text-slate-600 text-xs font-semibold">Cancel</button>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Visit Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-100"
              style={{ outline: "none", color: DK }}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Visit Time</label>
            <input
              type="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-100"
              style={{ outline: "none", color: DK }}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl text-sm font-semibold text-white py-3 transition-all hover:opacity-90"
            style={{ backgroundColor: VIOLET }}
          >
            Confirm Site Visit
          </button>
        </form>
      )}
    </div>
  );
}
