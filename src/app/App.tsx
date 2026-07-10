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
  Interested: { bg: "#ECFDF5", text: "#10B981" },
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
  | "import"
  | "marketing-automation";

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

function DashboardTab({ go, openLead, onAddLead }: { go: (s: Screen) => void; openLead: (id: number) => void; onAddLead: () => void }) {
  const { leads, stats, tasks, refreshData, properties } = useContext(AppContext)!;
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLeads = searchQuery.trim() ? leads.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (l.phone && l.phone.includes(searchQuery)) ||
    (l.email && l.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (l.project && l.project.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (l.city && l.city.toLowerCase().includes(searchQuery.toLowerCase()))
  ) : [];

  const filteredProperties = searchQuery.trim() && properties ? properties.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.address && p.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.type && p.type.toLowerCase().includes(searchQuery.toLowerCase()))
  ) : [];

  const toggleTask = async (id: number) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    try {
      await api.toggleTask(id, !task.completed);
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

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
        className="px-5 pt-12 pb-8 relative"
        style={{ background: `linear-gradient(135deg, #5B3FD9 0%, ${VIOLET} 60%, #9D7FFF 100%)` }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-b-none">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10" style={{ background: "white", transform: "translate(30%, -30%)" }} />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-10" style={{ background: "white", transform: "translate(-30%, 30%)" }} />
        </div>
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
        <div className="flex items-center gap-3 bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-2.5 relative z-50">
          <Search size={16} className="text-white/60" />
          <input
            type="text"
            placeholder="Search leads, properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-white text-sm placeholder:text-white/50 w-full"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-white/60 hover:text-white flex-shrink-0">
              <X size={14} />
            </button>
          )}

          {/* Search Dropdown Overlay */}
          {searchQuery.trim() && (
            <div className="absolute top-12 left-0 right-0 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 space-y-3 z-50 max-h-80 overflow-y-auto text-left">
              {/* Leads */}
              <div>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider px-2 pt-1 pb-0.5">Leads</p>
                {filteredLeads.length > 0 ? (
                  filteredLeads.slice(0, 5).map(l => (
                    <div
                      key={l.id}
                      onClick={() => {
                        setSearchQuery("");
                        openLead(l.id);
                      }}
                      className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-slate-50 cursor-pointer active:scale-[0.98]"
                    >
                      <Avatar initials={l.initials} bg={l.avatarBg} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{l.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{l.phone} · {l.project}</p>
                      </div>
                      <ChevronRight size={10} className="text-muted-foreground" />
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-muted-foreground px-2 italic font-normal">No matching leads</p>
                )}
              </div>

              {/* Properties */}
              <div className="border-t border-slate-100 pt-2">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider px-2 pb-0.5">Properties</p>
                {filteredProperties.length > 0 ? (
                  filteredProperties.slice(0, 5).map(p => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSearchQuery("");
                        go("properties");
                      }}
                      className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-slate-50 cursor-pointer active:scale-[0.98]"
                    >
                      <img src={p.image} className="w-8 h-8 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{p.price} · {p.address}</p>
                      </div>
                      <ChevronRight size={10} className="text-muted-foreground" />
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-muted-foreground px-2 italic font-normal">No matching properties</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 -mt-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
            { label: "Automation", bg: "#EDE9FF", text: VIOLET, screen: "marketing-automation" as Screen },
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
              {a.label === "Automation" && <Zap size={12} />}
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

      {/* Grid container for Tasks and Recent Leads on Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
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
                <button
                  onClick={() => toggleTask(t.id)}
                  className="w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all hover:bg-slate-50 active:scale-90"
                  style={{ borderColor: t.overdue ? RD : VIOLET }}
                >
                  {t.completed && <Check size={10} style={{ color: GR }} />}
                </button>
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
              <div
                key={lead.id}
                onClick={() => openLead(lead.id)}
                className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 cursor-pointer transition-all hover:bg-slate-50 active:scale-[0.98]"
              >
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

function LeadsTab({ go, openLead, onAddLead, onScheduleVisit }: { go: (s: Screen) => void; openLead: (id: number) => void; onAddLead: () => void; onScheduleVisit: (lead: any) => void }) {
  const { leads, refreshData } = useContext(AppContext)!;
  const [search, setSearch] = useState("");
  const [activeStatus, setStatus] = useState<"All" | LeadStatus>("All");
  const [activeLeadDropdown, setActiveLeadDropdown] = useState<number | null>(null);

  const handleQuickStatus = async (leadId: number, status: LeadStatus) => {
    try {
      if (status === "Visit Scheduled") {
        const lead = leads.find(l => l.id === leadId);
        if (lead) {
          onScheduleVisit(lead);
          return;
        }
      }
      await api.updateLead(leadId, { status });
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };
  const statuses: ("All" | LeadStatus)[] = ["All", "New", "Contacted", "Interested", "Qualified", "Visit Scheduled", "Negotiation", "Booked", "Lost"];

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
              onClick={() => go("import")}
              className="flex items-center gap-1.5 px-3.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-95 active:scale-95 shadow-sm"
              style={{ backgroundColor: VIOLET, height: 38 }}
            >
              <Upload size={13} /> Import Leads
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
                className="bg-white rounded-2xl shadow-sm relative"
                style={{ borderLeft: lead.priority === "High" ? `3px solid ${AMBER}` : "3px solid transparent" }}
              >
                <div className="p-4 pb-3">
                  <div className="flex items-start gap-3">
                    <Avatar initials={lead.initials} bg={lead.avatarBg} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <span
                          onClick={() => openLead(lead.id)}
                          className="text-[15px] font-bold text-slate-800 hover:text-violet-700 hover:underline cursor-pointer transition-all"
                        >
                          {lead.name}
                        </span>
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
                  <button onClick={() => openWhatsApp(lead.phone)} className="flex-1 flex items-center justify-center gap-2 text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95 rounded-bl-2xl" style={{ backgroundColor: WA, height: 44 }}>
                    <MessageCircle size={15} /> WhatsApp
                  </button>
                  <a href={`tel:${lead.phone}`} className="flex-1 flex items-center justify-center gap-2 text-xs font-semibold border-l border-border hover:bg-slate-50 transition-all" style={{ color: VIOLET, height: 44 }}>
                    <Phone size={15} /> Call
                  </a>
                  <div className="relative">
                    <button
                      className="px-4 flex items-center justify-center border-l border-border text-muted-foreground hover:bg-slate-50 transition-all"
                      style={{ height: 44 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveLeadDropdown(activeLeadDropdown === lead.id ? null : lead.id);
                      }}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    {activeLeadDropdown === lead.id && (
                      <div className="absolute right-0 bottom-12 w-40 bg-white border border-slate-100 rounded-xl shadow-lg z-50 py-1 text-left">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveLeadDropdown(null);
                            handleQuickStatus(lead.id, "Interested");
                          }}
                          className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                        >
                          🟢 Interested
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveLeadDropdown(null);
                            handleQuickStatus(lead.id, "Lost");
                          }}
                          className="w-full px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-1.5 border-t border-slate-50"
                        >
                          🔴 Not Interested
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveLeadDropdown(null);
                            handleQuickStatus(lead.id, "Visit Scheduled");
                          }}
                          className="w-full px-3 py-2 text-xs font-semibold text-violet-600 hover:bg-violet-50 flex items-center gap-1.5 border-t border-slate-50"
                        >
                          📅 Site Visit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveLeadDropdown(null);
                            openLead(lead.id);
                          }}
                          className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 border-t border-slate-50"
                        >
                          👁 View Profile
                        </button>
                      </div>
                    )}
                  </div>
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
  const [showSharePropModal, setShowSharePropModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLocalScheduleVisit, setShowLocalScheduleVisit] = useState(false);
  const tabs = ["WhatsApp", "Timeline", "Notes", "Follow-ups", "Files"];

  const handleSharePropertySelect = (prop: any) => {
    const link = `${window.location.origin}/?view=public-property&propertyId=${prop.id}&leadId=${lead.id}`;
    const nameFirst = lead.name.split(" ")[0];
    setMsgText(`Hi ${nameFirst}, check out this property listing: "${prop.name}". Let me know your thoughts: ${link}`);
    setShowSharePropModal(false);
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

  const handleTemplateClick = async (temp: string) => {
    let text = "";
    let newStatus: LeadStatus | null = null;
    const nameFirst = lead.name.split(" ")[0];
    switch (temp) {
      case "Interested":
        text = `Hi ${nameFirst}, thank you for your interest! I'm glad you're looking into ${lead.project}. When would be a good time to discuss details?`;
        newStatus = "Interested";
        break;
      case "Not Interested":
        text = `Understood, ${nameFirst}. Thank you for letting me know. I'll update your status for ${lead.project}. Let me know if your requirements change in the future.`;
        newStatus = "Lost";
        break;
      case "Site Visit":
        text = `Hi ${nameFirst}, would you be available for a site visit this weekend to see the model unit at ${lead.project}?`;
        newStatus = "Visit Scheduled";
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
    setMsgText(text);

    if (newStatus) {
      try {
        await api.updateLead(lead.id, { status: newStatus });
        refreshData();
      } catch (err) {
        console.error("Failed to update lead status:", err);
      }
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
          <button onClick={() => setTab("WhatsApp")} className="flex-1 flex items-center justify-center gap-2 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95" style={{ backgroundColor: WA, height: 46 }}>
            <MessageCircle size={15} /> WhatsApp
          </button>
          <a href={`tel:${lead.phone}`} className="flex-1 flex items-center justify-center gap-2 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-all" style={{ border: `1.5px solid ${VIOLET}`, color: VIOLET, height: 46 }}>
            <Phone size={15} /> Call
          </a>
          <button className="flex-1 flex items-center justify-center gap-2 rounded-xl text-xs font-semibold opacity-40" style={{ border: `1.5px solid ${VIOLET}`, color: VIOLET, height: 46 }}>
            <Mail size={15} /> Email
          </button>
        </div>

        {/* Quick status responses */}
        <div className="flex gap-2 mt-3.5">
          <button
            onClick={async () => {
              try {
                await api.updateLead(lead.id, { status: "Interested" });
                refreshData();
              } catch (e) {
                console.error(e);
              }
            }}
            className="flex-1 py-2 px-3 rounded-xl text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-all border border-emerald-200/30 flex items-center justify-center gap-1 active:scale-95"
          >
            <span>🟢</span> Interested
          </button>
          <button
            onClick={async () => {
              try {
                await api.updateLead(lead.id, { status: "Lost" });
                refreshData();
              } catch (e) {
                console.error(e);
              }
            }}
            className="flex-1 py-2 px-3 rounded-xl text-[11px] font-bold text-red-700 bg-red-50 hover:bg-red-100 transition-all border border-red-200/30 flex items-center justify-center gap-1 active:scale-95"
          >
            <span>🔴</span> Not Interested
          </button>
          <button
            onClick={() => setShowLocalScheduleVisit(true)}
            className="flex-1 py-2 px-3 rounded-xl text-[11px] font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 transition-all border border-violet-200/30 flex items-center justify-center gap-1 active:scale-95"
          >
            <span>📅</span> Site Visit
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
              {["Interested", "Not Interested", "Site Visit", "Pricing Request", "Shared Brochure", "Follow up", "Share Property"].map((t, i) => (
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
                <option value="Contacted">Contacted</option>
                <option value="Interested">Interested</option>
                <option value="Qualified">Qualified</option>
                <option value="Visit Scheduled">Visit Scheduled</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Booked">Booked</option>
                <option value="Lost">Lost</option>
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
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) return;
    setSubmitting(true);
    try {
      await api.updateLead(lead.id, { status: "Visit Scheduled" });
      const appointmentTime = `${date} at ${time}`;
      await api.createAppointment({
        time: appointmentTime,
        title: `Site Visit: ${lead.project}`,
        sub: `Client: ${lead.name} (${lead.phone})`,
        type: "viewing",
        color: VIOLET
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
  return (
    <div className="absolute inset-0 bg-black/60 z-50 flex items-end justify-center">
      <div className="w-full bg-white rounded-t-[32px] p-5 pb-8 space-y-4 max-h-[80%] overflow-y-auto" style={{ borderTop: `4px solid ${VIOLET}` }}>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground">Select Property to Share</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"><X size={16} /></button>
        </div>
        <div className="space-y-2 mt-2">
          {properties.map(p => (
            <div
              key={p.id}
              onClick={() => onSelect(p)}
              className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-all active:scale-[0.98]"
            >
              <img src={p.image} className="w-12 h-12 rounded-xl object-cover" />
              <div className="flex-1 min-w-0 text-left">
                <div className="text-sm font-semibold text-foreground truncate">{p.name}</div>
                <div className="text-xs text-muted-foreground truncate">{p.address}</div>
                <div className="text-xs font-bold mt-0.5" style={{ color: VIOLET }}>{p.price}</div>
              </div>
            </div>
          ))}
          {properties.length === 0 && (
            <p className="text-xs text-muted-foreground italic text-center py-4">No properties available to share.</p>
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
    { stage: "Contacted" as LeadStatus, leads: leads.filter((l) => l.status === "Contacted") },
    { stage: "Interested" as LeadStatus, leads: leads.filter((l) => l.status === "Interested") },
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

function PropertiesTab({ onAddProperty, onEditProperty, onDeleteProperty }: { onAddProperty: () => void; onEditProperty: (prop: any) => void; onDeleteProperty: (id: number) => void }) {
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

      <div className="px-5 pt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                <button
                  onClick={() => onEditProperty(prop)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-all active:scale-95"
                  style={{ border: `1px solid ${VIOLET}`, color: VIOLET, height: 40 }}
                >
                  <Edit size={13} /> Edit
                </button>
                <button
                  onClick={() => onDeleteProperty(prop.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold hover:bg-red-100 transition-all active:scale-95"
                  style={{ backgroundColor: "#FEF2F2", color: RD, border: "1px solid #FECACA", height: 40 }}
                >
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

  // Generate current week dates dynamically (Monday through Sunday)
  const now = new Date();
  const currentDay = now.getDay();
  const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(now);
  monday.setDate(now.getDate() + distanceToMonday);

  const weekDatesObj = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    return d;
  });

  const initialTodayIdx = weekDatesObj.findIndex(d => d.toDateString() === now.toDateString());
  const [activeDay, setActiveDay] = useState(initialTodayIdx !== -1 ? initialTodayIdx : 0);

  const activeDate = weekDatesObj[activeDay];

  // Helper to match appointments to activeDate
  const isAppointmentOnDate = (apt: any, targetDate: Date) => {
    if (/^\d{4}-\d{2}-\d{2}/.test(apt.time)) {
      const aptDateStr = apt.time.substring(0, 10);
      const targetDateStr = targetDate.toISOString().substring(0, 10);
      return aptDateStr === targetDateStr;
    }
    // Treat legacy static times ("09:00", etc.) as today
    const todayStr = new Date().toDateString();
    return targetDate.toDateString() === todayStr;
  };

  const filteredAppointments = appointments.filter(apt => isAppointmentOnDate(apt, activeDate));

  return (
    <div className="flex-1 overflow-y-auto pb-24" style={{ scrollbarWidth: "none" }}>
      <div className="px-5 pt-12 pb-5 bg-white border-b border-border">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Calendar</h1>
          <p className="text-sm text-muted-foreground font-medium">
            {activeDate.toLocaleString("default", { month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-1">
          {weekDatesObj.map((d, i) => {
            const isToday = d.toDateString() === now.toDateString();
            const dayName = d.toLocaleString("default", { weekday: "short" });
            const dateNum = d.getDate();
            return (
              <button
                key={i}
                onClick={() => setActiveDay(i)}
                className="flex-1 flex flex-col items-center py-2 rounded-2xl transition-all"
                style={activeDay === i ? { backgroundColor: VIOLET } : {}}
              >
                <span className="text-[10px] font-semibold mb-1" style={{ color: activeDay === i ? "rgba(255,255,255,0.7)" : "#6B6B8A" }}>
                  {dayName}
                </span>
                <span className="text-sm font-bold" style={{ color: activeDay === i ? "white" : isToday ? VIOLET : "#1A1A2E" }}>
                  {dateNum}
                </span>
                {isToday && activeDay !== i && <div className="w-1 h-1 rounded-full mt-1" style={{ backgroundColor: VIOLET }} />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 pt-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-muted-foreground">
            {activeDate.toDateString() === now.toDateString() ? "Today" : activeDate.toLocaleString("default", { weekday: "short", day: "numeric", month: "short" })} — {filteredAppointments.length} events
          </p>
          <button onClick={onAddAppointment} className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:opacity-90 active:scale-95" style={{ backgroundColor: VIOLET }}>
            <Plus size={14} className="text-white" />
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {filteredAppointments.map((apt, i) => {
            const displayTime = /^\d{4}-\d{2}-\d{2}/.test(apt.time) ? apt.time.split(" at ")[1] || apt.time : apt.time;
            return (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm flex gap-4 border border-slate-50">
                <div className="flex flex-col items-center gap-2 pt-1">
                  <span className="text-xs font-bold" style={{ color: apt.color }}>{displayTime}</span>
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
            );
          })}
          {filteredAppointments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-white rounded-2xl p-6 border border-slate-50">
              <span className="text-3xl">📭</span>
              <p className="text-xs font-semibold text-slate-800 mt-2">No appointments scheduled</p>
              <p className="text-[10px] text-slate-500 mt-0.5">There are no tasks or viewings for this day.</p>
            </div>
          )}
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
        return <DashboardTab go={go} openLead={openLead} onAddLead={() => { setAddLeadStage("New"); setShowAddLeadModal(true); }} />;
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
      case "marketing-automation":
        return <MarketingAutomationScreen onBack={back} />;
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
        leads, properties, tasks, appointments, followups, broadcasts, stats, analytics,
        setLeads, setProperties, setTasks, setAppointments, setFollowups, setBroadcasts, setStats,
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
      leads, properties, tasks, appointments, followups, broadcasts, stats, analytics,
      setLeads, setProperties, setTasks, setAppointments, setFollowups, setBroadcasts, setStats,
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

function MarketingAutomationScreen({ onBack }: { onBack: () => void }) {
  const { leads, refreshData } = useContext(AppContext)!;
  const [selectedLeadId, setSelectedLeadId] = useState<string>("");
  const [selectedTrigger, setSelectedTrigger] = useState("Qualified");
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
    if (selectedTrigger === "Qualified") {
      messageText = `Hi ${lead.name.split(" ")[0]}, thank you for confirming your requirements. I've prepared a customized list of premium units in ${lead.project}. Let me know if you would like me to share it!`;
      setLogs(prev => [...prev, `🚀 Firing Meta WhatsApp Cloud API request payload to: ${lead.phone}`]);
      await sleep(1000);
      setLogs(prev => [...prev, `📨 Message Content: "${messageText}"`]);
      await sleep(600);
      setLogs(prev => [...prev, `✅ Meta response: 200 OK (wamid: ${Math.random().toString(36).substring(7)})`]);
    } else if (selectedTrigger === "Visit Scheduled") {
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
                <p className="text-xs font-semibold text-slate-800">Rule #1: Lead Status Qualified</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Send custom property listing introduction template.</p>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-800">Rule #2: Lead Status Visit Scheduled</p>
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
                <option value="Qualified">Qualified (Interested)</option>
                <option value="Visit Scheduled">Visit Scheduled</option>
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
      await api.updateLead(lead.id, { status: "Interested" });
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
      await api.updateLead(lead.id, { status: "Lost" });
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
      await api.updateLead(lead.id, { status: "Visit Scheduled" });

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
