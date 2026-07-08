import { useState, useEffect, createContext, useContext } from "react";
import { api } from "./api";
import {
  Home,
  Users,
  Building2,
  CalendarDays,
  User,
  Search,
  Bell,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  Clock,
  Star,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Plus,
  Filter,
  MoreHorizontal,
  MessageSquare,
  MessageCircle,
  Bed,
  Bath,
  Square,
  Zap,
  Target,
  DollarSign,
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
  setLeads: React.Dispatch<React.SetStateAction<any[]>>;
  setProperties: React.Dispatch<React.SetStateAction<any[]>>;
  setTasks: React.Dispatch<React.SetStateAction<any[]>>;
  setAppointments: React.Dispatch<React.SetStateAction<any[]>>;
  setFollowups: React.Dispatch<React.SetStateAction<any[]>>;
  setBroadcasts: React.Dispatch<React.SetStateAction<any[]>>;
  setStats: React.Dispatch<React.SetStateAction<any[]>>;
  refreshData: () => Promise<void>;
} | null>(null);

const STATUS_CONFIG = {
  New: { bg: "#EDE9FF", text: VIOLET },
  Contacted: { bg: "#EFF6FF", text: "#3B82F6" },
  Qualified: { bg: "#FFF7ED", text: "#B45309" },
  "Visit Scheduled": { bg: "#ECFDF5", text: "#059669" },
  Negotiation: { bg: "#FFF7E6", text: "#B45309", border: AMBER },
  Booked: { bg: "#D1FAE5", text: "#065F46" },
  Lost: { bg: "#FEE2E2", text: "#991B1B" },
} as const;

type LeadStatus = keyof typeof STATUS_CONFIG;
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
  | "import";

// ─── Mock data ────────────────────────────────────────────────────

const stats = [
  { label: "Active Leads", value: "142", delta: "+12%", icon: Target, color: "#7C5CFC", bg: "#EDE9FF" },
  { label: "Properties", value: "38", delta: "+4", icon: Building2, color: "#10B981", bg: "#D1FAE5" },
  { label: "Revenue", value: "$198k", delta: "+8%", icon: DollarSign, color: "#F59E0B", bg: "#FEF3C7" },
  { label: "Tasks Due", value: "17", delta: "Urgent", icon: Zap, color: "#EF4444", bg: "#FEE2E2" },
];

const leads = [
  {
    id: 1,
    name: "Christopher Kane",
    initials: "CK",
    avatarBg: VIOLET,
    type: "Buyer",
    status: "Negotiation" as LeadStatus,
    priority: "High",
    project: "Harbour View Tower",
    city: "San Francisco",
    tags: ["Hot", "Investor"],
    budget: "$850,000",
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
    status: "Visit Scheduled" as LeadStatus,
    priority: "Medium",
    project: "Skyline Residences",
    city: "Chicago",
    tags: ["Seller"],
    budget: "$1.2M",
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
    status: "Qualified" as LeadStatus,
    priority: "High",
    project: "Harbour View Tower",
    city: "New York",
    tags: ["Investor"],
    budget: "$3.4M",
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
    budget: "$4,200/mo",
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
    status: "Booked" as LeadStatus,
    priority: "Medium",
    project: "Oak Park Flats",
    city: "Chicago",
    tags: ["Closed Deal"],
    budget: "$620,000",
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
    budget: "$410,000",
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
    budget: "$2.1M",
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
    price: "$2,340/mo",
    salePrice: "$485,000",
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
    price: "$2,340/mo",
    salePrice: "$690,000",
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
    price: "$1,890/mo",
    salePrice: "$385,000",
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
    price: "$5,800/mo",
    salePrice: "$1,250,000",
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
  { stage: "Contacted" as LeadStatus, leads: leads.filter((l) => l.status === "Contacted") },
  { stage: "Qualified" as LeadStatus, leads: leads.filter((l) => l.status === "Qualified") },
  { stage: "Visit Scheduled" as LeadStatus, leads: leads.filter((l) => l.status === "Visit Scheduled") },
  { stage: "Negotiation" as LeadStatus, leads: leads.filter((l) => l.status === "Negotiation") },
  { stage: "Booked" as LeadStatus, leads: leads.filter((l) => l.status === "Booked") },
  { stage: "Lost" as LeadStatus, leads: leads.filter((l) => l.status === "Lost") },
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
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-lg", xl: "w-20 h-20 text-2xl" };
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{ backgroundColor: bg }}
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

function DashboardTab({ go, onAddLead }: { go: (s: Screen) => void; onAddLead: () => void }) {
  const { leads, stats, tasks } = useContext(AppContext)!;

  const [greeting] = useState(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  });

  const getIcon = (label: string) => {
    switch (label) {
      case "Active Leads": return Target;
      case "Properties": return Building2;
      case "Revenue": return DollarSign;
      case "Tasks Due": return Zap;
      default: return Target;
    }
  };

  const pipelineStages = [
    { stage: "New" as LeadStatus, leads: leads.filter((l) => l.status === "New") },
    { stage: "Contacted" as LeadStatus, leads: leads.filter((l) => l.status === "Contacted") },
    { stage: "Qualified" as LeadStatus, leads: leads.filter((l) => l.status === "Qualified") },
    { stage: "Visit Scheduled" as LeadStatus, leads: leads.filter((l) => l.status === "Visit Scheduled") },
    { stage: "Negotiation" as LeadStatus, leads: leads.filter((l) => l.status === "Negotiation") },
    { stage: "Booked" as LeadStatus, leads: leads.filter((l) => l.status === "Booked") },
    { stage: "Lost" as LeadStatus, leads: leads.filter((l) => l.status === "Lost") },
  ];

  const maxPipeline = Math.max(...pipelineStages.map((p) => p.leads.length));

  return (
    <div className="flex-1 overflow-y-auto pb-24" style={{ scrollbarWidth: "none" }}>
      {/* Header */}
      <div
        className="px-5 pt-12 pb-8 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, #5B3FD9 0%, ${VIOLET} 60%, #9D7FFF 100%)` }}
      >
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10" style={{ background: "white", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-10" style={{ background: "white", transform: "translate(-30%, 30%)" }} />
        <div className="flex items-start justify-between mb-6 relative">
          <div>
            <p className="text-white/70 text-sm font-medium">{greeting}</p>
            <h1 className="text-white text-2xl font-bold mt-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Sarah Mitchell
            </h1>
            <p className="text-white/60 text-xs mt-0.5">Senior Agent · Heitkamp Realty</p>
          </div>
          <div className="relative">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Bell size={18} className="text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full flex items-center justify-center">
              <span className="text-[8px] text-white font-bold">5</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3 relative">
          <Search size={16} className="text-white/60" />
          <span className="text-white/50 text-sm">Search leads, properties...</span>
          <div className="ml-auto w-7 h-7 bg-white/20 rounded-xl flex items-center justify-center">
            <Filter size={12} className="text-white" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 -mt-5">
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => {
            const Icon = getIcon(s.label);
            return (
              <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                    <Icon size={16} style={{ color: s.color }} />
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: s.bg, color: s.color }}>
                    {s.delta}
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-5 mt-6">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {[
            { label: "+ Lead", bg: VIOLET, text: "#fff", action: onAddLead },
            { label: "+ Task", bg: "#fff", text: VIOLET, border: true, screen: "tasks" as Screen },
            { label: "Import Excel", bg: "#fff", text: VIOLET, border: true, screen: "import" as Screen },
            { label: "WhatsApp Hub", bg: WA, text: "#fff", screen: "whatsapp" as Screen },
          ].map((a, i) => (
            <button
              key={i}
              onClick={() => a.action ? a.action() : a.screen && go(a.screen)}
              className="flex-shrink-0 px-4 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: a.bg, color: a.text, border: a.border ? `1.5px solid ${VIOLET}` : "none", height: 40 }}
            >
              {a.label === "Import Excel" && <Upload size={12} />}
              {a.label === "WhatsApp Hub" && <MessageCircle size={12} />}
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pipeline */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Lead Pipeline</h2>
          <button className="text-xs font-semibold" style={{ color: VIOLET }} onClick={() => go("pipeline")}>Kanban →</button>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="space-y-2.5">
            {pipelineStages.map((s) => {
              const pct = maxPipeline > 0 ? (s.leads.length / maxPipeline) * 100 : 0;
              const barCol = s.stage === "Negotiation" ? AMBER : s.stage === "Booked" ? GR : s.stage === "Lost" ? MT : VIOLET;
              return (
                <div key={s.stage} className="flex items-center gap-3">
                  <span className="text-xs w-28 flex-shrink-0 text-muted-foreground">{s.stage}</span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: BR }}>
                    <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: barCol, transition: "width 0.6s ease-in-out" }} />
                  </div>
                  <span className="text-xs font-semibold w-4 text-right flex-shrink-0 text-foreground">{s.leads.length}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tasks Due */}
      <div className="px-5 mt-6">
        <SectionHeader title="Tasks Due Today" action="View all →" onAction={() => go("tasks")} />
        <Card>
          {tasks.filter((t) => !t.completed).slice(0, 3).map((t, i, arr) => (
            <div
              key={t.id}
              className="flex items-start gap-3 px-4 py-3"
              style={{ backgroundColor: t.overdue ? "#FFF5F5" : "#fff", borderBottom: i < arr.length - 1 ? `1px solid ${BR}` : "none" }}
            >
              <div className="w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5" style={{ borderColor: t.overdue ? RD : VIOLET }} />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-foreground">{t.title}</div>
                {t.lead && (
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold" style={{ backgroundColor: "#EDE9FF", color: VIOLET }}>
                    {t.lead}
                  </span>
                )}
              </div>
              <span className="text-[11px] flex-shrink-0" style={{ color: t.overdue ? RD : MT }}>{t.due}</span>
            </div>
          ))}
        </Card>
      </div>

      {/* Recent Leads */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Recent Leads</h2>
          <button className="text-xs font-semibold" style={{ color: VIOLET }} onClick={() => go("leads")}>See all</button>
        </div>
        <div className="flex flex-col gap-3">
          {leads.slice(0, 3).map((lead) => (
            <div key={lead.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <Avatar initials={lead.initials} bg={lead.avatarBg} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-foreground truncate">{lead.name}</p>
                  <LeadStatusBadge status={lead.status} />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{lead.type} · {lead.budget}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[10px] text-muted-foreground">{lead.lastContact}</p>
                <div className="w-7 h-7 rounded-full flex items-center justify-center mt-1" style={{ backgroundColor: "#EDE9FF" }}>
                  <MessageSquare size={12} style={{ color: VIOLET }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Queue */}
      <div className="px-5 mt-6">
        <SectionHeader title="Message Queue" action="WhatsApp Hub →" onAction={() => go("whatsapp")} />
        <Card className="p-4">
          <div className="mb-3 px-3 py-2.5 rounded-xl text-xs font-medium" style={{ backgroundColor: "#FFF7E6", borderLeft: `3px solid ${AMBER}`, color: "#92400E" }}>
            ⚠ 1 message failed to send
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Pending", value: "4", color: VIOLET },
              { label: "Processing", value: "1", color: AMBER },
              { label: "Failed", value: "1", color: RD },
              { label: "Sent Today", value: "28", color: GR },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-xl font-bold leading-tight" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[10px] mt-0.5 text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Today's Appointments */}
      <div className="px-5 mt-6 mb-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Today's Schedule</h2>
          <button className="text-xs font-semibold" style={{ color: VIOLET }} onClick={() => go("calendar")}>Full calendar</button>
        </div>
        <div className="flex flex-col gap-2">
          {appointments.slice(0, 3).map((apt) => (
            <div key={apt.time} className="bg-white rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3">
              <div className="text-center w-12 flex-shrink-0">
                <p className="text-xs font-bold" style={{ color: apt.color }}>{apt.time}</p>
              </div>
              <div className="w-0.5 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: apt.color + "40" }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{apt.title}</p>
                <p className="text-xs text-muted-foreground truncate">{apt.sub}</p>
              </div>
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: apt.color + "15" }}>
                <ChevronRight size={12} style={{ color: apt.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Leads ─────────────────────────────────────────────────────

function LeadsTab({ go, openLead, onAddLead }: { go: (s: Screen) => void; openLead: (id: number) => void; onAddLead: () => void }) {
  const { leads } = useContext(AppContext)!;
  const [search, setSearch] = useState("");
  const [activeStatus, setStatus] = useState<"All" | LeadStatus>("All");
  const statuses: ("All" | LeadStatus)[] = ["All", "New", "Contacted", "Qualified", "Visit Scheduled", "Negotiation", "Booked", "Lost"];

  const filtered = leads.filter((l) => {
    const q = search.toLowerCase();
    return (
      (activeStatus === "All" || l.status === activeStatus) &&
      (l.name.toLowerCase().includes(q) || l.phone.includes(search))
    );
  });

  return (
    <div className="flex-1 overflow-y-auto pb-24" style={{ scrollbarWidth: "none" }}>
      <div className="px-5 pt-12 pb-5 bg-white border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Leads</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: "#EDE9FF", color: VIOLET }}>{leads.length}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onAddLead}
              className="flex items-center justify-center w-9 h-9 rounded-xl text-white transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: VIOLET }}
            >
              <Plus size={16} />
            </button>
            <button
              onClick={() => go("import")}
              className="flex items-center gap-1.5 px-3 rounded-xl text-xs font-semibold"
              style={{ border: `1.5px solid ${VIOLET}`, color: VIOLET, height: 38 }}
            >
              <Upload size={13} /> Import
            </button>
          </div>
        </div>

        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full pl-9 pr-9 rounded-2xl text-sm py-3"
            style={{ border: `1.5px solid ${search ? VIOLET : BR}`, backgroundColor: "#fff", outline: "none", color: DK }}
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setSearch("")}>
              <X size={16} className="text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className="flex-shrink-0 px-3 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: activeStatus === s ? VIOLET : "#EDE9FF",
                color: activeStatus === s ? "#fff" : VIOLET,
                height: 32,
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pt-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-base font-semibold text-foreground">No leads found</p>
            <p className="text-xs mt-1 text-muted-foreground">Try adjusting your filters</p>
            <button
              onClick={() => go("import")}
              className="mt-6 px-6 rounded-xl font-semibold text-sm flex items-center gap-2"
              style={{ backgroundColor: AMBER, color: DK, height: 48 }}
            >
              <Upload size={14} /> Import from Excel
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((lead) => (
              <div
                key={lead.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm"
                style={{ borderLeft: lead.priority === "High" ? `3px solid ${AMBER}` : "3px solid transparent" }}
              >
                <div className="p-4 pb-3">
                  <div className="flex items-start gap-3">
                    <Avatar initials={lead.initials} bg={lead.avatarBg} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <span className="text-[15px] font-semibold text-foreground">{lead.name}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[13px] font-bold" style={{ color: VIOLET }}>{lead.budget}</span>
                          <LeadStatusBadge status={lead.status} />
                        </div>
                      </div>
                      <div className="text-xs mt-0.5 text-muted-foreground">{lead.phone}</div>
                      <div className="text-xs mt-0.5" style={{ color: BD }}>{lead.project} · {lead.city}</div>
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {lead.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            style={{ backgroundColor: tag === "Hot" ? AMBER : "#EDE9FF", color: tag === "Hot" ? DK : VIOLET }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex border-t border-border">
                  <button onClick={() => openWhatsApp(lead.phone)} className="flex-1 flex items-center justify-center gap-2 text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95" style={{ backgroundColor: WA, height: 44 }}>
                    <MessageCircle size={15} /> WhatsApp
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 text-xs font-semibold border-l border-border" style={{ color: VIOLET, height: 44 }}>
                    <Phone size={15} /> Call
                  </button>
                  <button
                    className="px-4 flex items-center justify-center border-l border-border text-muted-foreground"
                    style={{ height: 44 }}
                    onClick={() => openLead(lead.id)}
                  >
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Screen: Lead Detail ────────────────────────────────────────────

function LeadDetailScreen({ leadId, onBack }: { leadId: number; onBack: () => void }) {
  const { leads, followups, refreshData } = useContext(AppContext)!;
  const lead = leads.find((l) => l.id === leadId) ?? leads[0];
  const [tab, setTab] = useState("WhatsApp");
  const [msgText, setMsgText] = useState("");
  const tabs = ["WhatsApp", "Timeline", "Notes", "Follow-ups", "Files"];

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

  const [chatMessages, setChatMessages] = useState<any[]>([
    { id: 1, sent: true, text: `Hello ${lead.name.split(" ")[0]}! Thank you for your interest in ${lead.project}. I'm Sarah from Heitkamp Realty.`, time: "10:02 AM", st: "read" },
    { id: 2, sent: false, text: "Hi! Yes, I saw the listing online. Can you share the pricing details?", time: "10:05 AM", st: "" },
    { id: 3, sent: true, text: `Sure! Units start at ${lead.budget}. Shall I send the full brochure?`, time: "10:08 AM", st: "read" },
    { id: 4, sent: false, text: "Yes please, and the floor plan too.", time: "10:12 AM", st: "" },
    { id: 5, sent: true, text: "📄 Brochure.pdf\nFloor plans coming separately.", time: "10:15 AM", st: "delivered" },
    { id: 6, sent: true, text: "Available for a site visit this weekend?", time: "10:16 AM", st: "failed" },
  ]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const newMsg = {
      id: Date.now(),
      sent: true,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      st: "sent"
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setMsgText("");
    openWhatsApp(lead.phone, text);

    // Simulate checkmarks updating
    setTimeout(() => {
      setChatMessages((prev) =>
        prev.map((m) => (m.id === newMsg.id ? { ...m, st: "delivered" } : m))
      );
    }, 1000);

    setTimeout(() => {
      setChatMessages((prev) =>
        prev.map((m) => (m.id === newMsg.id ? { ...m, st: "read" } : m))
      );
    }, 2000);

    // Simulate mock reply after 3 seconds
    setTimeout(() => {
      const reply = {
        id: Date.now() + 1,
        sent: false,
        text: `Thanks for the update! I will review this and get back to you shortly.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        st: ""
      };
      setChatMessages((prev) => [...prev, reply]);
    }, 3500);
  };

  const handleTemplateClick = (temp: string) => {
    let text = "";
    const nameFirst = lead.name.split(" ")[0];
    switch (temp) {
      case "Greeting":
        text = `Hi ${nameFirst}, hope you are doing well! Sarah here from Heitkamp Realty. Let me know how I can assist with your search!`;
        break;
      case "Schedule Visit":
        text = `Hi ${nameFirst}, would you be available for a site visit this weekend to see the model unit at ${lead.project}?`;
        break;
      case "Pricing":
        text = `Sure! Pricing details for ${lead.project} start around ${lead.budget}. Let me know if you would like the payment schedule.`;
        break;
      case "Brochure":
        text = `📄 Sharing the full project brochure for ${lead.project}.`;
        break;
      case "Location":
        text = `📍 Here is the location for ${lead.project} in ${lead.city}: https://maps.google.com/?q=${encodeURIComponent(lead.project)}`;
        break;
      case "Thank You":
        text = `Thank you for your time, ${nameFirst}. Have a wonderful day!`;
        break;
      default:
        text = `Hello ${nameFirst}`;
    }
    setMsgText(text);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24" style={{ scrollbarWidth: "none" }}>
      <div className="px-5 pt-12 pb-5 bg-white border-b border-border flex items-center gap-3">
        <button onClick={onBack} className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#EDE9FF" }}>
          <ArrowLeft size={16} style={{ color: VIOLET }} />
        </button>
        <h1 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Lead Detail</h1>
      </div>

      {/* Hero */}
      <div className="bg-white px-5 py-6 text-center border-b border-border">
        <div className="flex justify-center"><Avatar initials={lead.initials} bg={lead.avatarBg} size="xl" /></div>
        <h1 className="text-lg font-bold mt-3 text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{lead.name}</h1>
        <p className="text-sm mt-1 text-muted-foreground">{lead.phone}</p>
        <div className="flex justify-center mt-2"><LeadStatusBadge status={lead.status} /></div>
        <div className="flex gap-3 mt-4">
          <button onClick={() => setTab("WhatsApp")} className="flex-1 flex items-center justify-center gap-2 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95" style={{ backgroundColor: WA, height: 46 }}>
            <MessageCircle size={15} /> WhatsApp
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 rounded-xl text-xs font-semibold" style={{ border: `1.5px solid ${VIOLET}`, color: VIOLET, height: 46 }}>
            <Phone size={15} /> Call
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 rounded-xl text-xs font-semibold opacity-40" style={{ border: `1.5px solid ${VIOLET}`, color: VIOLET, height: 46 }}>
            <Mail size={15} /> Email
          </button>
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
        <div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-2">
              {["Greeting", "Schedule Visit", "Pricing", "Brochure", "Location", "Thank You"].map((t, i) => (
                <button
                  key={t}
                  onClick={() => handleTemplateClick(t)}
                  className="bg-white rounded-xl p-3 text-center border border-border transition-all hover:bg-slate-50 active:scale-95"
                >
                  <div className="w-6 h-6 rounded-md flex items-center justify-center mx-auto mb-1" style={{ backgroundColor: "#ECFDF5" }}>
                    <MessageSquare size={12} style={{ color: WA }} />
                  </div>
                  <div className="text-[11px] font-semibold text-foreground">{t}</div>
                  {i < 3 && <div className="text-[9px] font-semibold mt-0.5" style={{ color: GR }}>✓ APPROVED</div>}
                </button>
              ))}
            </div>
          </div>
          <div className="px-4 pb-4 space-y-3">
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sent ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[80%] px-3 py-2.5 rounded-2xl"
                  style={{
                    backgroundColor: msg.sent ? "#EDE9FF" : "#F5F5F5",
                    borderTopLeftRadius: msg.sent ? 16 : 4,
                    borderTopRightRadius: msg.sent ? 4 : 16,
                    border: msg.st === "failed" ? `1px solid ${RD}` : "none",
                  }}
                >
                  <p className="text-sm whitespace-pre-line text-foreground">{msg.text}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                    {msg.st === "read" && <span className="text-[10px]" style={{ color: VIOLET }}>✓✓</span>}
                    {msg.st === "delivered" && <span className="text-[10px] text-muted-foreground">✓✓</span>}
                    {msg.st === "failed" && <span className="text-[10px]" style={{ color: RD }}>✗ Failed · <u>Retry</u></span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 px-4 pb-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {["Sure!", "Send brochure", "Call you soon", "Site visit?"].map((r) => (
              <button
                key={r}
                onClick={() => sendMessage(r)}
                className="flex-shrink-0 px-3 rounded-full text-xs font-medium bg-white transition-all hover:bg-slate-50 active:scale-95"
                style={{ border: `1px solid ${VIOLET}`, color: VIOLET, height: 34 }}
              >
                {r}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(msgText);
            }}
            className="flex items-center gap-2 px-4 py-3 bg-white border-t border-border"
          >
            <button type="button" className="text-muted-foreground"><Paperclip size={20} /></button>
            <input
              className="flex-1 px-3 rounded-xl text-sm"
              style={{ border: `1px solid ${BR}`, height: 44, outline: "none", color: DK }}
              placeholder="Type a message..."
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
            />
            <button
              type="submit"
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: WA }}
            >
              <Send size={15} style={{ transform: "translateX(1px)" }} />
            </button>
          </form>
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
    </div>
  );
}

// ─── Screen: Pipeline (Kanban) ───────────────────────────────────────

function PipelineScreen({ onBack, openLead, onAddLead }: { onBack: () => void; openLead: (id: number) => void; onAddLead: (stage: LeadStatus) => void }) {
  const { leads } = useContext(AppContext)!;
  const pipelineStages = [
    { stage: "New" as LeadStatus, leads: leads.filter((l) => l.status === "New") },
    { stage: "Contacted" as LeadStatus, leads: leads.filter((l) => l.status === "Contacted") },
    { stage: "Qualified" as LeadStatus, leads: leads.filter((l) => l.status === "Qualified") },
    { stage: "Visit Scheduled" as LeadStatus, leads: leads.filter((l) => l.status === "Visit Scheduled") },
    { stage: "Negotiation" as LeadStatus, leads: leads.filter((l) => l.status === "Negotiation") },
    { stage: "Booked" as LeadStatus, leads: leads.filter((l) => l.status === "Booked") },
    { stage: "Lost" as LeadStatus, leads: leads.filter((l) => l.status === "Lost") },
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
    if (!newTitle.trim()) return;
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
            style={{ border: `1px solid ${BR}`, height: 44, outline: "none", color: DK }}
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
    </div>
  );
}

// ─── Screen: WhatsApp Hub ─────────────────────────────────────────────

function WhatsAppScreen({ onBack, go, openLeadChat }: { onBack: () => void; go: (s: Screen) => void; openLeadChat: (id: number) => void }) {
  const { leads } = useContext(AppContext)!;
  return (
    <div className="flex-1 overflow-y-auto pb-24" style={{ scrollbarWidth: "none" }}>
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

        <div className="px-4 py-3 rounded-xl flex items-center justify-between" style={{ backgroundColor: "#FFF7E6", borderLeft: `3px solid ${AMBER}` }}>
          <div>
            <p className="text-[13px] font-semibold" style={{ color: "#92400E" }}>⚠ Message queue has failures</p>
            <p className="text-xs" style={{ color: "#92400E" }}>1 failed · 4 pending</p>
          </div>
          <button className="text-xs font-semibold" style={{ color: VIOLET }}>View →</button>
        </div>

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
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">{lead.name}</div>
                <div className="text-xs text-muted-foreground">{lead.phone}</div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button className="w-9 h-9 rounded-full border flex items-center justify-center" style={{ borderColor: VIOLET, color: VIOLET }}>
                  <Phone size={15} />
                </button>
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

  const weeklyData = analytics?.weekly || WEEKLY;
  const revenueData = analytics?.revenue || REVENUE;
  const sourcesData = analytics?.sources || SOURCES;

  const hotLeadsCount = leads.filter(l => l.tags && (l.tags.includes("Hot") || l.tags.includes("Investor"))).length;
  const conversionRate = leads.length ? ((leads.filter(l => l.status === "Booked").length / leads.length) * 100).toFixed(1) + "%" : "12.3%";

  // Dynamically compute the pipeline funnel based on current database
  const totalInFunnel = leads.length || 1;
  const funnelStages = [
    { stage: "New", count: leads.filter(l => l.status === "New").length, color: VIOLET },
    { stage: "Contacted", count: leads.filter(l => l.status === "Contacted").length, color: "#3B82F6" },
    { stage: "Qualified", count: leads.filter(l => l.status === "Qualified").length, color: "#B45309" },
    { stage: "Visit Scheduled", count: leads.filter(l => l.status === "Visit Scheduled").length, color: GR },
    { stage: "Negotiation", count: leads.filter(l => l.status === "Negotiation").length, color: AMBER },
    { stage: "Booked", count: leads.filter(l => l.status === "Booked").length, color: "#065F46" },
  ].map(f => ({
    ...f,
    pct: Math.round((f.count / totalInFunnel) * 100)
  }));

  return (
    <div className="flex-1 overflow-y-auto pb-24" style={{ scrollbarWidth: "none" }}>
      <ScreenHeader
        title="Analytics"
        onBack={onBack}
        right={
          <div className="flex gap-1 p-1 rounded-full" style={{ backgroundColor: "#EDE9FF" }}>
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
        }
      />
      <div className="px-5 py-5 space-y-5">
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
          <h2 className="text-[15px] font-semibold mb-4 text-foreground">Monthly Revenue ($k)</h2>
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
          <h2 className="text-[15px] font-semibold mb-4 text-foreground">Sales Funnel</h2>
          <div className="space-y-2">
            {funnelStages.map((f) => (
              <div key={f.stage} className="flex items-center gap-2">
                <span className="text-[11px] w-24 flex-shrink-0" style={{ color: BD }}>{f.stage}</span>
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
    </div>
  );
}

// ─── Tab: Properties (unchanged from original design) ─────────────────

function PropertiesTab({ onAddProperty }: { onAddProperty: () => void }) {
  const { properties } = useContext(AppContext)!;
  const [typeFilter, setTypeFilter] = useState("All");

  const filtered = properties.filter((p) => typeFilter === "All" || p.type === typeFilter || p.type === "Both");

  return (
    <div className="flex-1 overflow-y-auto pb-24" style={{ scrollbarWidth: "none" }}>
      <div className="px-5 pt-12 pb-5 bg-white border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Properties</h1>
          <button onClick={onAddProperty} className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:opacity-90 active:scale-95" style={{ backgroundColor: VIOLET }}>
            <Plus size={16} className="text-white" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-2 flex-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {["All", "Sale", "Rent"].map((f) => (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className="flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-full transition-all"
                style={typeFilter === f ? { backgroundColor: VIOLET, color: "white" } : { backgroundColor: "#EDE9FF", color: VIOLET }}
              >
                {f}
              </button>
            ))}
          </div>
          <button className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#EDE9FF" }}>
            <Filter size={14} style={{ color: VIOLET }} />
          </button>
        </div>
      </div>

      <div className="px-5 pt-4 flex flex-col gap-4">
        {filtered.map((prop) => (
          <div key={prop.id} className="bg-white rounded-3xl overflow-hidden shadow-sm">
            <div className="relative">
              <img src={prop.image} alt={prop.name} className="w-full h-44 object-cover" />
              {prop.featured && (
                <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ backgroundColor: VIOLET }}>
                  <Star size={10} className="text-white fill-white" />
                  <span className="text-white text-[10px] font-bold">Featured</span>
                </div>
              )}
              <div className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: prop.statusColor + "22", color: prop.statusColor }}>
                {prop.status}
              </div>
              <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl backdrop-blur-md" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                <p className="text-white font-bold text-base">{prop.price}</p>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h3 className="font-bold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{prop.name}</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin size={10} className="text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">{prop.address}</p>
                  </div>
                </div>
                <button className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "#EDE9FF" }}>
                  <MoreHorizontal size={14} style={{ color: VIOLET }} />
                </button>
              </div>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-1">
                  <Bed size={12} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{prop.beds} Beds</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bath size={12} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{prop.baths} Baths</span>
                </div>
                <div className="flex items-center gap-1">
                  <Square size={12} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{prop.sqft} sqft</span>
                </div>
                <span className="ml-auto text-[10px] font-bold px-2 py-1 rounded-lg" style={{ backgroundColor: "#EDE9FF", color: VIOLET }}>
                  {prop.type}
                </span>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                <button className="flex-1 flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold" style={{ border: `1px solid ${VIOLET}`, color: VIOLET, height: 40 }}>
                  <Edit size={13} /> Edit
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold" style={{ backgroundColor: "#FEF2F2", color: RD, border: "1px solid #FECACA", height: 40 }}>
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Calendar (unchanged) ──────────────────────────────────────────

function CalendarTab({ onAddAppointment }: { onAddAppointment: () => void }) {
  const { appointments } = useContext(AppContext)!;
  const [activeDay, setActiveDay] = useState(todayIdx);

  return (
    <div className="flex-1 overflow-y-auto pb-24" style={{ scrollbarWidth: "none" }}>
      <div className="px-5 pt-12 pb-5 bg-white border-b border-border">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Calendar</h1>
          <p className="text-sm text-muted-foreground font-medium">July 2025</p>
        </div>
        <div className="flex gap-1">
          {weekDays.map((day, i) => (
            <button
              key={day}
              onClick={() => setActiveDay(i)}
              className="flex-1 flex flex-col items-center py-2 rounded-2xl transition-all"
              style={activeDay === i ? { backgroundColor: VIOLET } : {}}
            >
              <span className="text-[10px] font-semibold mb-1" style={{ color: activeDay === i ? "rgba(255,255,255,0.7)" : "#6B6B8A" }}>
                {day}
              </span>
              <span className="text-sm font-bold" style={{ color: activeDay === i ? "white" : i === todayIdx ? VIOLET : "#1A1A2E" }}>
                {weekDates[i]}
              </span>
              {i === todayIdx && activeDay !== todayIdx && <div className="w-1 h-1 rounded-full mt-1" style={{ backgroundColor: VIOLET }} />}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pt-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-muted-foreground">
            {activeDay === todayIdx ? "Today" : weekDays[activeDay] + " · " + weekDates[activeDay] + " Jul"} — {appointments.length} events
          </p>
          <button onClick={onAddAppointment} className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:opacity-90 active:scale-95" style={{ backgroundColor: VIOLET }}>
            <Plus size={14} className="text-white" />
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {appointments.map((apt, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm flex gap-4">
              <div className="flex flex-col items-center gap-2 pt-1">
                <span className="text-xs font-bold" style={{ color: apt.color }}>{apt.time}</span>
                <div className="w-0.5 flex-1 rounded-full min-h-6" style={{ backgroundColor: apt.color + "30" }} />
              </div>
              <div className="w-1 rounded-full flex-shrink-0" style={{ backgroundColor: apt.color }} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{apt.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{apt.sub}</p>
                <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-2" style={{ backgroundColor: apt.color + "15", color: apt.color }}>
                  {apt.type.charAt(0).toUpperCase() + apt.type.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
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
      </div>
    </div>
  );
}

// ─── Screen: Import (Excel/CSV wizard) ──────────────────────────────────

function ImportScreen({ onBack }: { onBack: () => void }) {
  const { refreshData } = useContext(AppContext)!;
  const [step, setStep] = useState(1);
  const stepLabels = ["Upload", "Map", "Validate", "Done"];

  const rows = [
    { num: 1, name: "Rohan Mehta", phone: "+1 646-555-0134", budget: "$520,000", valid: true, dup: false },
    { num: 2, name: "Anjali Kapoor", phone: "+1 312-555-0198", budget: "$800,000", valid: true, dup: false },
    { num: 3, name: "Invalid Name", phone: "invalid-phone", budget: "—", valid: false, dup: false },
    { num: 4, name: "Suresh Kumar", phone: "+1 773-555-0177", budget: "$350,000", valid: true, dup: true },
  ];

  const handleImport = async () => {
    const validRows = rows.filter(r => r.valid).map(r => ({
      name: r.name,
      phone: r.phone,
      budget: r.budget,
      project: "Harbour View Tower",
      city: "San Francisco",
      status: "New"
    }));
    try {
      await api.importLeads(validRows);
      await refreshData();
    } catch (e) {
      console.error(e);
    }
    setStep(4);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24" style={{ scrollbarWidth: "none" }}>
      <ScreenHeader title="Import from Excel" onBack={onBack} />
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
            <div className="p-8 rounded-2xl flex flex-col items-center text-center bg-white" style={{ border: `2px dashed ${VIOLET}` }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "#EDE9FF" }}>
                <Upload size={28} style={{ color: VIOLET }} />
              </div>
              <p className="text-base font-semibold text-foreground">Drop your Excel file here</p>
              <p className="text-[13px] mt-1 text-muted-foreground">or tap to browse</p>
              <div className="flex gap-2 mt-4">
                {[".xlsx", ".xls", ".csv"].map((ext) => (
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
            <button onClick={() => setStep(2)} className="w-full rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: VIOLET, height: 48 }}>
              Continue →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Map Your Columns</h2>
              <p className="text-[13px] text-muted-foreground">We detected 6 columns in your Excel file</p>
            </div>
            <div className="space-y-2">
              {[
                { excel: "Customer Name", example: "Rohan Mehta", mapped: "Name", auto: true, ignored: false },
                { excel: "Mobile No", example: "+1 646-555-0134", mapped: "Phone", auto: true, ignored: false },
                { excel: "Project Interest", example: "Harbour View Tower", mapped: "Project", auto: false, ignored: false },
                { excel: "Budget Range", example: "$500k–600k", mapped: "Budget", auto: false, ignored: false },
                { excel: "Email ID", example: "rohan@gmail.com", mapped: "Email", auto: true, ignored: false },
                { excel: "Source Channel", example: "Facebook", mapped: "— Ignore —", auto: false, ignored: true },
              ].map((row, i) => (
                <div key={i} className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm" style={{ opacity: row.ignored ? 0.5 : 1 }}>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground">{row.excel}</div>
                    <div className="text-xs italic text-muted-foreground">e.g. "{row.example}"</div>
                  </div>
                  <span className="text-muted-foreground">→</span>
                  <div className="flex items-center gap-1.5">
                    <select
                      className="px-2 rounded-lg text-[13px] font-medium bg-white"
                      style={{ border: `1px solid ${BR}`, color: DK, height: 44 }}
                      defaultValue={row.mapped}
                    >
                      <option>— Ignore —</option>
                      <option>Name</option><option>Phone</option><option>Email</option>
                      <option>City</option><option>Project</option><option>Budget</option>
                    </select>
                    {row.auto && <span className="text-sm" style={{ color: GR }}>✓</span>}
                    {!row.auto && !row.ignored && <span style={{ color: AMBER }}>●</span>}
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
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: "#D1FAE5", color: "#065F46" }}>✓ 18 Valid</span>
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: "#FEE2E2", color: "#991B1B" }}>✗ 4 Invalid</span>
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: "#FFF3CD", color: "#92400E" }}>⚠ 2 Duplicate</span>
            </div>
            <div className="space-y-2">
              {rows.map((r) => (
                <Card
                  key={r.num}
                  className="p-3"
                  style={{ borderLeft: !r.valid ? `3px solid ${RD}` : r.dup ? `3px solid ${AMBER}` : `3px solid ${GR}` }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-foreground">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{r.phone} · {r.budget}</div>
                    </div>
                    {!r.valid && <span className="text-[11px] font-semibold" style={{ color: RD }}>Invalid phone</span>}
                    {r.valid && r.dup && <span className="text-[11px] font-semibold" style={{ color: AMBER }}>Duplicate</span>}
                    {r.valid && !r.dup && <Check size={16} style={{ color: GR }} />}
                  </div>
                </Card>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 rounded-xl text-sm font-semibold text-muted-foreground" style={{ border: `1.5px solid ${BR}`, height: 48 }}>← Back</button>
              <button onClick={handleImport} className="flex-1 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: VIOLET, height: 48 }}>Import 18 Leads</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: "#D1FAE5" }}>
              <Check size={36} style={{ color: GR }} />
            </div>
            <h2 className="text-xl font-bold mb-2 text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Import Complete!</h2>
            <p className="text-sm mb-6" style={{ color: BD }}>Processed 24 rows from your Excel file.</p>
            <div className="w-full grid grid-cols-2 gap-3 mb-6">
              {[
                { label: "Created", value: "18", color: VIOLET },
                { label: "Updated", value: "3", color: GR },
                { label: "Skipped", value: "2", color: MT },
                { label: "Failed", value: "1", color: RD },
              ].map((s, i) => (
                <Card key={i} className="py-4 text-center">
                  <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[13px] text-muted-foreground">{s.label}</div>
                </Card>
              ))}
            </div>
            <div className="w-full mb-1">
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: BR }}>
                <div className="h-2 rounded-full" style={{ width: "87%", backgroundColor: VIOLET }} />
              </div>
            </div>
            <p className="text-xs mb-6 text-muted-foreground">87% success rate</p>
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

function AddPropertyModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [type, setType] = useState<"Sale" | "Rent" | "Both">("Sale");
  const [beds, setBeds] = useState(2);
  const [baths, setBaths] = useState(2);
  const [sqft, setSqft] = useState("");
  const [status, setStatus] = useState("Available");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
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
        featured: false
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

  const [screen, setScreen] = useState<Screen>("dashboard");
  const [history, setHistory] = useState<Screen[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<number>(1);

  // Modal Visibility States
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [addLeadStage, setAddLeadStage] = useState<LeadStatus>("New");
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [showAddAppointmentModal, setShowAddAppointmentModal] = useState(false);

  const refreshData = async () => {
    try {
      const data = await api.getAnalytics();
      if (data && Array.isArray(data.stats)) {
        setStats(data.stats);
        setAnalytics(data);
      }

      const leadsData = await api.getLeads();
      if (Array.isArray(leadsData)) {
        setLeads(leadsData);
      }

      const propsData = await api.getProperties();
      if (Array.isArray(propsData)) {
        setProperties(propsData);
      }

      const tasksData = await api.getTasks();
      if (Array.isArray(tasksData)) {
        setTasks(tasksData);
      }

      const aptsData = await api.getAppointments();
      if (Array.isArray(aptsData)) {
        setAppointments(aptsData);
      }

      const fupsData = await api.getFollowups();
      if (Array.isArray(fupsData)) {
        setFollowups(fupsData);
      }

      const bcastsData = await api.getBroadcasts();
      if (Array.isArray(bcastsData)) {
        setBroadcasts(bcastsData);
      }
    } catch (e) {
      console.error("Error loading data from backend API:", e);
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
        return <DashboardTab go={go} onAddLead={() => { setAddLeadStage("New"); setShowAddLeadModal(true); }} />;
      case "leads":
        return <LeadsTab go={go} openLead={openLead} onAddLead={() => { setAddLeadStage("New"); setShowAddLeadModal(true); }} />;
      case "properties":
        return <PropertiesTab onAddProperty={() => setShowAddPropertyModal(true)} />;
      case "calendar":
        return <CalendarTab onAddAppointment={() => setShowAddAppointmentModal(true)} />;
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
      default:
        return <DashboardTab go={go} onAddLead={() => { setAddLeadStage("New"); setShowAddLeadModal(true); }} />;
    }
  };

  return (
    <AppContext.Provider value={{
      leads, properties, tasks, appointments, followups, broadcasts, stats, analytics,
      setLeads, setProperties, setTasks, setAppointments, setFollowups, setBroadcasts, setStats,
      refreshData
    }}>
      <div className="size-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 p-4">
        <div
          className="relative flex flex-col overflow-hidden shadow-2xl"
          style={{
            width: "min(390px, 100%)",
            height: "min(844px, 100%)",
            borderRadius: "44px",
            backgroundColor: "#F2F1F8",
            fontFamily: "'Inter', sans-serif",
            boxShadow: "0 40px 80px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.1)",
          }}
        >
          {/* Phone status bar */}
          <div className="flex items-center justify-between px-8 py-3 flex-shrink-0" style={{ backgroundColor: "#5B3FD9", paddingTop: "16px" }}>
            <span className="text-white text-xs font-semibold">9:41</span>
            <div className="w-24 h-5 bg-black rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2.5" />
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5 items-end">
                {[3, 5, 7, 9].map((h, i) => (
                  <div key={i} className="w-1 rounded-sm bg-white" style={{ height: h, opacity: i < 3 ? 1 : 0.4 }} />
                ))}
              </div>
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                <path d="M8 2.5C9.9 2.5 11.6 3.3 12.8 4.6L14 3.4C12.5 1.9 10.4 1 8 1C5.6 1 3.5 1.9 2 3.4L3.2 4.6C4.4 3.3 6.1 2.5 8 2.5Z" fill="white" />
                <path d="M8 5.5C9.1 5.5 10.2 5.9 11 6.7L12.2 5.5C11.1 4.5 9.6 3.9 8 3.9C6.4 3.9 4.9 4.5 3.8 5.5L5 6.7C5.8 5.9 6.9 5.5 8 5.5Z" fill="white" />
                <circle cx="8" cy="10" r="1.5" fill="white" />
              </svg>
              <div className="flex items-center gap-0.5">
                <div className="w-5 h-2.5 border border-white/70 rounded-sm p-0.5">
                  <div className="w-3/4 h-full bg-white rounded-[1px]" />
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col overflow-hidden">{renderScreen()}</div>

          {/* Bottom Nav */}
          <div className="flex-shrink-0 bg-white border-t border-border" style={{ paddingBottom: "24px", borderRadius: "0 0 44px 44px" }}>
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
          {showAddPropertyModal && (
            <AddPropertyModal
              onClose={() => setShowAddPropertyModal(false)}
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
