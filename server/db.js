import sqlite3 from 'sqlite3';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = !!process.env.DATABASE_URL;
let pgPool = null;
let sqliteDb = null;

if (isProd) {
  pgPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  const dbPath = path.join(__dirname, 'database.db');
  sqliteDb = new sqlite3.Database(dbPath);
}

// Promise-based query function (primarily for SELECT or queries returning rows)
export function query(text, params = []) {
  return new Promise((resolve, reject) => {
    if (isProd) {
      let index = 1;
      const pgText = text.replace(/\?/g, () => `$${index++}`);
      pgPool.query(pgText, params, (err, res) => {
        if (err) return reject(err);
        resolve({ rows: res.rows, rowCount: res.rowCount });
      });
    } else {
      sqliteDb.all(text, params, function(err, rows) {
        if (err) return reject(err);
        resolve({
          rows: rows || [],
          rowCount: rows ? rows.length : 0
        });
      });
    }
  });
}

// Promise-based run function (for INSERT, UPDATE, DELETE where we want lastID/changes)
export function run(text, params = []) {
  return new Promise((resolve, reject) => {
    if (isProd) {
      // In PG, we use query. If there's a RETURNING clause, the rows will be in res.rows.
      let index = 1;
      const pgText = text.replace(/\?/g, () => `$${index++}`);
      pgPool.query(pgText, params, (err, res) => {
        if (err) return reject(err);
        // Map PG insert results to return an object similar to SQLite's run
        const lastID = res.rows && res.rows[0] ? res.rows[0].id : null;
        resolve({ lastID, changes: res.rowCount });
      });
    } else {
      sqliteDb.run(text, params, function(err) {
        if (err) return reject(err);
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    }
  });
}

// Database schema setup and seeding
export async function initDb() {
  const createLeadsTable = isProd ? `
    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      initials VARCHAR(10),
      avatarBg VARCHAR(50),
      type VARCHAR(50),
      status VARCHAR(50),
      priority VARCHAR(50),
      project VARCHAR(255),
      city VARCHAR(255),
      tags TEXT,
      budget VARCHAR(50),
      lastContact VARCHAR(100),
      assigned VARCHAR(100),
      phone VARCHAR(50),
      email VARCHAR(255),
      task VARCHAR(255),
      taskDue VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  ` : `
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      initials TEXT,
      avatarBg TEXT,
      type TEXT,
      status TEXT,
      priority TEXT,
      project TEXT,
      city TEXT,
      tags TEXT,
      budget TEXT,
      lastContact TEXT,
      assigned TEXT,
      phone TEXT,
      email TEXT,
      task TEXT,
      taskDue TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createPropertiesTable = isProd ? `
    CREATE TABLE IF NOT EXISTS properties (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      address TEXT,
      price VARCHAR(50),
      salePrice VARCHAR(50),
      type VARCHAR(50),
      beds INTEGER,
      baths INTEGER,
      sqft VARCHAR(50),
      status VARCHAR(50),
      statusColor VARCHAR(50),
      image TEXT,
      featured BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  ` : `
    CREATE TABLE IF NOT EXISTS properties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT,
      price TEXT,
      salePrice TEXT,
      type TEXT,
      beds INTEGER,
      baths INTEGER,
      sqft TEXT,
      status TEXT,
      statusColor TEXT,
      image TEXT,
      featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createTasksTable = isProd ? `
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      lead VARCHAR(255),
      due VARCHAR(100),
      overdue BOOLEAN DEFAULT FALSE,
      completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  ` : `
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      lead TEXT,
      due TEXT,
      overdue INTEGER DEFAULT 0,
      completed INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createAppointmentsTable = isProd ? `
    CREATE TABLE IF NOT EXISTS appointments (
      id SERIAL PRIMARY KEY,
      time VARCHAR(50),
      title VARCHAR(255),
      sub VARCHAR(255),
      type VARCHAR(50),
      color VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  ` : `
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      time TEXT,
      title TEXT,
      sub TEXT,
      type TEXT,
      color TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createFollowupsTable = isProd ? `
    CREATE TABLE IF NOT EXISTS followups (
      id SERIAL PRIMARY KEY,
      leadId INTEGER,
      name VARCHAR(255),
      initials VARCHAR(10),
      color VARCHAR(50),
      note TEXT,
      time VARCHAR(100),
      overdue BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  ` : `
    CREATE TABLE IF NOT EXISTS followups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      leadId INTEGER,
      name TEXT,
      initials TEXT,
      color TEXT,
      note TEXT,
      time TEXT,
      overdue INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createBroadcastsTable = isProd ? `
    CREATE TABLE IF NOT EXISTS broadcasts (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      preview TEXT,
      status VARCHAR(50),
      date VARCHAR(100),
      recipients INTEGER DEFAULT 0,
      sent INTEGER DEFAULT 0,
      failed INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  ` : `
    CREATE TABLE IF NOT EXISTS broadcasts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      preview TEXT,
      status TEXT,
      date TEXT,
      recipients INTEGER DEFAULT 0,
      sent INTEGER DEFAULT 0,
      failed INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // Run table creations
  await run(createLeadsTable);
  await run(createPropertiesTable);
  await run(createTasksTable);
  await run(createAppointmentsTable);
  await run(createFollowupsTable);
  await run(createBroadcastsTable);

  // Check if seeding is needed
  const leadsCount = await query('SELECT COUNT(*) as count FROM leads');
  const count = leadsCount.rows[0].count;

  if (parseInt(count) === 0) {
    console.log('Seeding initial mock data...');

    // Seed Leads
    const VIOLET = "#7C5CFC";
    const initialLeads = [
      {
        name: "Christopher Kane",
        initials: "CK",
        avatarBg: VIOLET,
        type: "Buyer",
        status: "Negotiation",
        priority: "High",
        project: "Harbour View Tower",
        city: "San Francisco",
        tags: JSON.stringify(["Hot", "Investor"]),
        budget: "$850,000",
        lastContact: "2h ago",
        assigned: "You",
        phone: "+1 415-553-0186",
        email: "c.kane@gmail.com",
        task: "Prospecting Update",
        taskDue: "Jun 28, 2025"
      },
      {
        name: "Addie Bradford",
        initials: "AB",
        avatarBg: "#10B981",
        type: "Seller",
        status: "Visit Scheduled",
        priority: "Medium",
        project: "Skyline Residences",
        city: "Chicago",
        tags: JSON.stringify(["Seller"]),
        budget: "$1.2M",
        lastContact: "1d ago",
        assigned: "Sara M.",
        phone: "+1 312-440-9921",
        email: "addie.b@outlook.com",
        task: "Schedule Viewing",
        taskDue: "Jul 3, 2025"
      },
      {
        name: "Thor Johnson",
        initials: "TJ",
        avatarBg: "#3B82F6",
        type: "Investor",
        status: "Qualified",
        priority: "High",
        project: "Harbour View Tower",
        city: "New York",
        tags: JSON.stringify(["Investor"]),
        budget: "$3.4M",
        lastContact: "3d ago",
        assigned: "You",
        phone: "+1 646-210-3348",
        email: "thor.j@ventures.co",
        task: "Portfolio Review",
        taskDue: "Jul 5, 2025"
      },
      {
        name: "Gora Williams",
        initials: "GW",
        avatarBg: "#8B5CF6",
        type: "Renter",
        status: "New",
        priority: "Low",
        project: "Green Courtyard",
        city: "Chicago",
        tags: JSON.stringify(["Renter"]),
        budget: "$4,200/mo",
        lastContact: "5m ago",
        assigned: "You",
        phone: "+1 929-771-0044",
        email: "gora.w@email.com",
        task: "Send Listings",
        taskDue: "Today"
      },
      {
        name: "Diana Hess",
        initials: "DH",
        avatarBg: "#EC4899",
        type: "Buyer",
        status: "Booked",
        priority: "Medium",
        project: "Oak Park Flats",
        city: "Chicago",
        tags: JSON.stringify(["Closed Deal"]),
        budget: "$620,000",
        lastContact: "1w ago",
        assigned: "Tom R.",
        phone: "+1 305-882-6610",
        email: "diana.hess@me.com",
        task: "Post-sale Follow-up",
        taskDue: "Jul 10, 2025"
      },
      {
        name: "Marcus Chen",
        initials: "MC",
        avatarBg: "#F59E0B",
        type: "Buyer",
        status: "Contacted",
        priority: "Medium",
        project: "Oak Park Flats",
        city: "Chicago",
        tags: JSON.stringify(["End User"]),
        budget: "$410,000",
        lastContact: "6h ago",
        assigned: "You",
        phone: "+1 773-555-0199",
        email: "marcus.c@mail.com",
        task: "Send Floor Plans",
        taskDue: "Tomorrow"
      },
      {
        name: "Naomi Cole",
        initials: "NC",
        avatarBg: "#6B6B8A",
        type: "Investor",
        status: "Lost",
        priority: "Low",
        project: "Skyline Residences",
        city: "Chicago",
        tags: JSON.stringify(["Investor"]),
        budget: "$2.1M",
        lastContact: "2w ago",
        assigned: "Tom R.",
        phone: "+1 872-555-0142",
        email: "naomi.cole@corp.com",
        task: "Archive",
        taskDue: "—"
      }
    ];

    for (const lead of initialLeads) {
      await run(`
        INSERT INTO leads (name, initials, avatarBg, type, status, priority, project, city, tags, budget, lastContact, assigned, phone, email, task, taskDue)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        lead.name, lead.initials, lead.avatarBg, lead.type, lead.status, lead.priority,
        lead.project, lead.city, lead.tags, lead.budget, lead.lastContact, lead.assigned,
        lead.phone, lead.email, lead.task, lead.taskDue
      ]);
    }

    // Seed Properties
    const initialProperties = [
      {
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
        featured: isProd ? true : 1
      },
      {
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
        featured: isProd ? false : 0
      },
      {
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
        featured: isProd ? false : 0
      },
      {
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
        featured: isProd ? false : 0
      }
    ];

    for (const prop of initialProperties) {
      await run(`
        INSERT INTO properties (name, address, price, salePrice, type, beds, baths, sqft, status, statusColor, image, featured)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        prop.name, prop.address, prop.price, prop.salePrice, prop.type,
        prop.beds, prop.baths, prop.sqft, prop.status, prop.statusColor,
        prop.image, prop.featured
      ]);
    }

    // Seed Appointments
    const initialAppointments = [
      { time: "09:00", title: "Property Viewing", sub: "Christopher Kane · Oak Park Flats", type: "viewing", color: VIOLET },
      { time: "11:30", title: "Follow-up Call", sub: "Thor Johnson · Portfolio Review", type: "call", color: "#10B981" },
      { time: "14:00", title: "Lease Signing", sub: "Gora Williams · Green Courtyard", type: "signing", color: "#F59E0B" },
      { time: "15:45", title: "New Lead Meeting", sub: "Addie Bradford · Introductory", type: "meeting", color: "#3B82F6" },
      { time: "17:00", title: "Team Sync", sub: "All Agents · Weekly Pipeline", type: "internal", color: "#8B5CF6" }
    ];

    for (const apt of initialAppointments) {
      await run(`
        INSERT INTO appointments (time, title, sub, type, color)
        VALUES (?, ?, ?, ?, ?)
      `, [apt.time, apt.title, apt.sub, apt.type, apt.color]);
    }

    // Seed Follow-ups
    const initialFollowups = [
      { leadId: 1, name: "Christopher Kane", initials: "CK", color: VIOLET, note: "Send revised pricing sheet", time: "10:30 AM", overdue: isProd ? false : 0 },
      { leadId: 3, name: "Thor Johnson", initials: "TJ", color: "#3B82F6", note: "Discuss payment plan options", time: "12:00 PM", overdue: isProd ? false : 0 },
      { leadId: 2, name: "Addie Bradford", initials: "AB", color: "#10B981", note: "Confirm site visit timing", time: "Yesterday 3PM", overdue: isProd ? true : 1 },
      { leadId: 6, name: "Marcus Chen", initials: "MC", color: "#F59E0B", note: "Share brochure and floor plans", time: "2:30 PM", overdue: isProd ? false : 0 }
    ];

    for (const f of initialFollowups) {
      await run(`
        INSERT INTO followups (leadId, name, initials, color, note, time, overdue)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [f.leadId, f.name, f.initials, f.color, f.note, f.time, f.overdue]);
    }

    // Seed Tasks
    const initialTasks = [
      { title: "Send project brochure to Christopher", lead: "Christopher Kane", due: "Today 12:00 PM", overdue: isProd ? false : 0, completed: isProd ? false : 0 },
      { title: "Schedule site visit for Addie Bradford", lead: "Addie Bradford", due: "Today 3:00 PM", overdue: isProd ? false : 0, completed: isProd ? false : 0 },
      { title: "Follow up on loan pre-approval", lead: "Diana Hess", due: "Yesterday 5:00 PM", overdue: isProd ? true : 1, completed: isProd ? false : 0 },
      { title: "Send WhatsApp greeting to new leads", lead: "", due: "Today 10:00 AM", overdue: isProd ? true : 1, completed: isProd ? false : 0 },
      { title: "Update property pricing for Skyline", lead: "", due: "Tomorrow 11:00 AM", overdue: isProd ? false : 0, completed: isProd ? false : 0 },
      { title: "Prepare project presentation", lead: "Marcus Chen", due: "Fri 2:00 PM", overdue: isProd ? false : 0, completed: isProd ? true : 1 }
    ];

    for (const t of initialTasks) {
      await run(`
        INSERT INTO tasks (title, lead, due, overdue, completed)
        VALUES (?, ?, ?, ?, ?)
      `, [t.title, t.lead, t.due, t.overdue, t.completed]);
    }

    // Seed Broadcasts
    const initialBroadcasts = [
      { name: "Summer Open House Invite", preview: "Hi {Name}, join us this Saturday for an exclusive open house at Harbour View Tower...", status: "Sent", date: "Jun 15, 2025", recipients: 142, sent: 138, failed: 4 },
      { name: "New Listing — Oak Park Flats", preview: "Exciting news! A new 1BHK just listed at Oak Park Flats, available for immediate move-in...", status: "Sending", date: "Jun 20, 2025", recipients: 89, sent: 61, failed: 2 },
      { name: "Follow-up — June Leads", preview: "Hi {Name}, just checking in on your property search. We have new options that match...", status: "Scheduled", date: "Jun 25, 2025", recipients: 34, sent: 0, failed: 0 }
    ];

    for (const b of initialBroadcasts) {
      await run(`
        INSERT INTO broadcasts (name, preview, status, date, recipients, sent, failed)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [b.name, b.preview, b.status, b.date, b.recipients, b.sent, b.failed]);
    }

    console.log('Database seeded successfully.');
  } else {
    console.log('Database already has data. Skipping seed.');
  }
}
