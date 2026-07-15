import sqlite3 from 'sqlite3';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { AsyncLocalStorage } from 'async_hooks';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = !!process.env.DATABASE_URL;
let pgPool = null;
let sqliteDb = null;
export let useSQLite = !isProd;
export const userContext = new AsyncLocalStorage();

const userDbs = {};

export function getDbForUser(userId) {
  if (!useSQLite) return sqliteDb;

  const idStr = String(userId);
  if (idStr === '1') {
    return sqliteDb;
  }

  if (!userDbs[idStr]) {
    const dbPath = path.join(__dirname, `database_user_${idStr}.db`);
    const newDb = new sqlite3.Database(dbPath);
    userDbs[idStr] = newDb;

    newDb.serialize(() => {
      newDb.run(`
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
          linkResponse TEXT
        )
      `);
      newDb.run(`
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
          inquiries INTEGER DEFAULT 0,
          siteVisits INTEGER DEFAULT 0,
          favorite INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      newDb.run(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT,
          dueDate TEXT,
          completed INTEGER,
          priority TEXT,
          overdue INTEGER
        )
      `);
      newDb.run(`
        CREATE TABLE IF NOT EXISTS appointments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          clientName TEXT,
          initials TEXT,
          color TEXT,
          type TEXT,
          time TEXT,
          date TEXT
        )
      `);
      newDb.run(`
        CREATE TABLE IF NOT EXISTS followups (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          leadId INTEGER,
          name TEXT,
          initials TEXT,
          color TEXT,
          note TEXT,
          time TEXT,
          overdue INTEGER
        )
      `);
      newDb.run(`
        CREATE TABLE IF NOT EXISTS broadcasts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          preview TEXT,
          status TEXT,
          date TEXT,
          recipients INTEGER,
          sent INTEGER,
          failed INTEGER
        )
      `);
      newDb.run(`
        CREATE TABLE IF NOT EXISTS incomes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          clientName TEXT,
          amountReceived INTEGER,
          paymentMode TEXT,
          dealDate TEXT,
          leadId INTEGER
        )
      `);
      newDb.run(`
        CREATE TABLE IF NOT EXISTS expenses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          vendorName TEXT,
          amount INTEGER,
          paymentMode TEXT,
          expenseDate TEXT,
          category TEXT,
          invoiceNo TEXT,
          billPhotoUrl TEXT
        )
      `);
      newDb.run(`
        CREATE TABLE IF NOT EXISTS sites (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT
        )
      `);
      newDb.run(`INSERT OR IGNORE INTO sites (id, name) VALUES (1, 'Green Valley Farms'), (2, 'Oak Park Flats'), (3, 'Pinecrest Residency'), (4, 'Harbour View')`);
      newDb.run(`
        CREATE TABLE IF NOT EXISTS milestones (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          target_date TEXT,
          status TEXT,
          progress_percentage INTEGER
        )
      `);
      newDb.run(`
        CREATE TABLE IF NOT EXISTS dprs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          report_date TEXT,
          summary TEXT,
          photos TEXT,
          milestone_id INTEGER,
          completion_percentage INTEGER,
          site_id INTEGER
        )
      `);
    });
  }

  return userDbs[idStr];
}

function initSQLite() {
  const dbPath = path.join(__dirname, 'database.db');
  sqliteDb = new sqlite3.Database(dbPath);
  useSQLite = true;
  console.log('Resilient DB: Local SQLite database initialized.');
}

if (isProd) {
  try {
    pgPool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      },
      connectionTimeoutMillis: 4000
    });
  } catch (e) {
    console.error('Failed to create pg Pool, falling back to SQLite:', e);
    initSQLite();
  }
} else {
  initSQLite();
}

// Promise-based query function (primarily for SELECT or queries returning rows)
export function query(text, params = []) {
  return new Promise((resolve, reject) => {
    const userId = userContext.getStore() || '1';
    const activeDb = getDbForUser(userId);

    if (!useSQLite) {
      let index = 1;
      const pgText = text.replace(/\?/g, () => `$${index++}`);
      pgPool.query(pgText, params, (err, res) => {
        if (err) return reject(err);
        resolve({ rows: res.rows, rowCount: res.rowCount });
      });
    } else {
      activeDb.all(text, params, function(err, rows) {
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
    const userId = userContext.getStore() || '1';
    const activeDb = getDbForUser(userId);

    if (!useSQLite) {
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
      activeDb.run(text, params, function(err) {
        if (err) return reject(err);
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    }
  });
}

// Database schema setup and seeding
export async function initDb() {
  if (isProd && !useSQLite) {
    try {
      // Test PostgreSQL connection
      await pgPool.query('SELECT 1');
      console.log('Connected to PostgreSQL successfully.');
    } catch (err) {
      console.error('PostgreSQL connection test failed. Falling back to SQLite. Error:', err.message);
      initSQLite();
    }
  }

  const createLeadsTable = !useSQLite ? `
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
      linkResponse VARCHAR(100),
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
      linkResponse TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createPropertiesTable = !useSQLite ? `
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
      inquiries INTEGER DEFAULT 0,
      siteVisits INTEGER DEFAULT 0,
      favorite BOOLEAN DEFAULT FALSE,
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
      inquiries INTEGER DEFAULT 0,
      siteVisits INTEGER DEFAULT 0,
      favorite INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createTasksTable = !useSQLite ? `
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

  const createAppointmentsTable = !useSQLite ? `
    CREATE TABLE IF NOT EXISTS appointments (
      id SERIAL PRIMARY KEY,
      time VARCHAR(50),
      title VARCHAR(255),
      sub VARCHAR(255),
      type VARCHAR(50),
      color VARCHAR(50),
      priority VARCHAR(50),
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
      priority TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createFollowupsTable = !useSQLite ? `
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

  const createBroadcastsTable = !useSQLite ? `
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

  const createIncomesTable = !useSQLite ? `
    CREATE TABLE IF NOT EXISTS incomes (
      id SERIAL PRIMARY KEY,
      customerName VARCHAR(255),
      propertyName VARCHAR(255),
      paymentDate VARCHAR(100),
      amountReceived INTEGER,
      paymentMode VARCHAR(50),
      commission INTEGER,
      receivedFrom VARCHAR(255),
      transactionId VARCHAR(100),
      notes TEXT,
      receiptFile TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  ` : `
    CREATE TABLE IF NOT EXISTS incomes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerName TEXT,
      propertyName TEXT,
      paymentDate TEXT,
      amountReceived INTEGER,
      paymentMode TEXT,
      commission INTEGER,
      receivedFrom TEXT,
      transactionId TEXT,
      notes TEXT,
      receiptFile TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createExpensesTable = !useSQLite ? `
    CREATE TABLE IF NOT EXISTS expenses (
      id SERIAL PRIMARY KEY,
      category VARCHAR(100),
      vendorName VARCHAR(255),
      expenseDate VARCHAR(100),
      amount INTEGER,
      paymentMode VARCHAR(50),
      invoiceNo VARCHAR(100),
      notes TEXT,
      billFile TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  ` : `
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT,
      vendorName TEXT,
      expenseDate TEXT,
      amount INTEGER,
      paymentMode TEXT,
      invoiceNo TEXT,
      notes TEXT,
      billFile TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createSitesTable = !useSQLite ? `
    CREATE TABLE IF NOT EXISTS sites (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255)
    );
  ` : `
    CREATE TABLE IF NOT EXISTS sites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT
    );
  `;

  const createMilestonesTable = !useSQLite ? `
    CREATE TABLE IF NOT EXISTS milestones (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      target_date VARCHAR(100),
      status VARCHAR(50),
      progress_percentage INTEGER
    );
  ` : `
    CREATE TABLE IF NOT EXISTS milestones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      target_date TEXT,
      status TEXT,
      progress_percentage INTEGER
    );
  `;

  const createDprsTable = !useSQLite ? `
    CREATE TABLE IF NOT EXISTS dprs (
      id SERIAL PRIMARY KEY,
      report_date VARCHAR(100),
      summary TEXT,
      photos TEXT,
      milestone_id INTEGER,
      completion_percentage INTEGER,
      site_id INTEGER
    );
  ` : `
    CREATE TABLE IF NOT EXISTS dprs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_date TEXT,
      summary TEXT,
      photos TEXT,
      milestone_id INTEGER,
      completion_percentage INTEGER,
      site_id INTEGER
    );
  `;

  const createUsersTable = !useSQLite ? `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      company VARCHAR(255),
      phone VARCHAR(255),
      job_title VARCHAR(255),
      city VARCHAR(255),
      status VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  ` : `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      company TEXT,
      phone TEXT,
      job_title TEXT,
      city TEXT,
      status TEXT,
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
  await run(createIncomesTable);
  await run(createExpensesTable);
  await run(createSitesTable);
  await run(createMilestonesTable);
  await run(createDprsTable);
  await run(createUsersTable);

  // Check if seeding is needed
  const leadsCount = await query('SELECT COUNT(*) as count FROM leads');
  const count = leadsCount.rows[0].count;

  if (parseInt(count) === 0) {
    console.log('Seeding initial mock data...');

    // Seed Leads
    const VIOLET = "#7C5CFC";
    const initialLeads = [
      {
        name: "Rohit Sharma",
        initials: "RS",
        avatarBg: "#7C5CFC",
        type: "Buyer",
        status: "New",
        priority: "High",
        project: "3BHK Apartment",
        city: "Mumbai",
        tags: JSON.stringify(["Hot", "Buyer"]),
        budget: "₹80L",
        lastContact: "Today",
        assigned: "You",
        phone: "+91 98765 43210",
        email: "rohit.sharma@gmail.com",
        task: "Call back to discuss layout",
        taskDue: "Today"
      },
      {
        name: "Pooja Patel",
        initials: "PP",
        avatarBg: "#D97706",
        type: "Buyer",
        status: "Site Visit",
        priority: "High",
        project: "2BHK Apartment",
        city: "Pune",
        tags: JSON.stringify(["Hot", "Buyer"]),
        budget: "₹60L",
        lastContact: "Today",
        assigned: "You",
        phone: "+91 98765 43211",
        email: "pooja.patel@outlook.com",
        task: "Accompany for site tour",
        taskDue: "Today"
      },
      {
        name: "Amit Kumar",
        initials: "AK",
        avatarBg: "#EF4444",
        type: "Buyer",
        status: "Send Details",
        priority: "Medium",
        project: "4BHK Apartment",
        city: "Delhi NCR",
        tags: JSON.stringify(["Investor"]),
        budget: "₹1.2Cr",
        lastContact: "Yesterday",
        assigned: "You",
        phone: "+91 98765 43212",
        email: "amit.kumar@ventures.co",
        task: "Review discount offer",
        taskDue: "Tomorrow"
      },
      {
        name: "Neha Tiwari",
        initials: "NT",
        avatarBg: "#8B5CF6",
        type: "Buyer",
        status: "New",
        priority: "Low",
        project: "2BHK Apartment",
        city: "Bangalore",
        tags: JSON.stringify(["Buyer"]),
        budget: "₹55L",
        lastContact: "2 Days ago",
        assigned: "You",
        phone: "+91 98765 43213",
        email: "neha.tiwari@gmail.com",
        task: "Send property brochures",
        taskDue: "Today"
      },
      {
        name: "Vikram Singh",
        initials: "VK",
        avatarBg: "#10B981",
        type: "Buyer",
        status: "Call Later",
        priority: "Medium",
        project: "3BHK Apartment",
        city: "Noida",
        tags: JSON.stringify(["Buyer"]),
        budget: "₹70L",
        lastContact: "2 Days ago",
        assigned: "You",
        phone: "+91 98765 43214",
        email: "vikram.singh@mail.com",
        task: "WhatsApp project details",
        taskDue: "Today"
      },
      {
        name: "Arjun Singh",
        initials: "AS",
        avatarBg: "#6B6B8A",
        type: "Buyer",
        status: "New",
        priority: "Low",
        project: "Residential Plot",
        city: "Gurugram",
        tags: JSON.stringify(["Buyer"]),
        budget: "₹45L",
        lastContact: "3 Days ago",
        assigned: "You",
        phone: "+91 98765 43215",
        email: "arjun.singh@gmail.com",
        task: "Verify plot map availability",
        taskDue: "Today"
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
        name: "Green Valley Residency",
        address: "Sector 45, Gurgaon",
        price: "₹85 Lakh",
        salePrice: "₹85 Lakh",
        type: "Sale",
        beds: 3,
        baths: 3,
        sqft: "1,550",
        status: "Available",
        statusColor: "#10B981",
        image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=260&fit=crop&auto=format",
        featured: !useSQLite ? true : 1,
        inquiries: 12,
        siteVisits: 3,
        favorite: !useSQLite ? false : 0
      },
      {
        name: "Sunrise Enclave",
        address: "Kharadi, Pune",
        price: "₹62 Lakh",
        salePrice: "₹62 Lakh",
        type: "Sale",
        beds: 2,
        baths: 2,
        sqft: "1,120",
        status: "Available",
        statusColor: "#10B981",
        image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=260&fit=crop&auto=format",
        featured: !useSQLite ? false : 0,
        inquiries: 8,
        siteVisits: 2,
        favorite: !useSQLite ? false : 0
      },
      {
        name: "Lakeview Heights",
        address: "Whitefield, Bangalore",
        price: "₹1.25 Cr",
        salePrice: "₹1.25 Cr",
        type: "Sale",
        beds: 4,
        baths: 4,
        sqft: "2,450",
        status: "Available",
        statusColor: "#10B981",
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=260&fit=crop&auto=format",
        featured: !useSQLite ? true : 1,
        inquiries: 15,
        siteVisits: 4,
        favorite: !useSQLite ? true : 1
      },
      {
        name: "City Prime Plots",
        address: "Super Corridor, Indore",
        price: "₹48 Lakh",
        salePrice: "₹48 Lakh",
        type: "Sale",
        beds: 0,
        baths: 0,
        sqft: "1,800",
        status: "Available",
        statusColor: "#10B981",
        image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=260&fit=crop&auto=format",
        featured: !useSQLite ? false : 0,
        inquiries: 10,
        siteVisits: 1,
        favorite: !useSQLite ? false : 0
      }
    ];

    for (const prop of initialProperties) {
      await run(`
        INSERT INTO properties (name, address, price, salePrice, type, beds, baths, sqft, status, statusColor, image, featured, inquiries, siteVisits, favorite)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        prop.name, prop.address, prop.price, prop.salePrice, prop.type,
        prop.beds, prop.baths, prop.sqft, prop.status, prop.statusColor,
        prop.image, prop.featured, prop.inquiries, prop.siteVisits, prop.favorite
      ]);
    }

    // Seed Appointments
    const initialAppointments = [
      { time: "10:00 AM", title: "Call Rohit Sharma", sub: "Follow-up for 3BHK Apartment", type: "call", color: "#10B981", priority: "High" },
      { time: "11:30 AM", title: "Site Visit at Green Valley", sub: "3BHK Apartment", type: "viewing", color: "#3B82F6", priority: "Medium" },
      { time: "01:00 PM", title: "Follow-up with Pooja Patel", sub: "Discuss pricing & offers", type: "call", color: "#EF4444", priority: "High" },
      { time: "03:30 PM", title: "Document Verification", sub: "Amit Kumar - Agreement", type: "document", color: "#8B5CF6", priority: "Low" },
      { time: "05:00 PM", title: "Payment Follow-up", sub: "Check payment from Vikram Singh", type: "payment", color: "#25D366", priority: "Medium" }
    ];

    for (const apt of initialAppointments) {
      await run(`
        INSERT INTO appointments (time, title, sub, type, color, priority)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [apt.time, apt.title, apt.sub, apt.type, apt.color, apt.priority]);
    }

    // Seed Follow-ups
    const initialFollowups = [
      { leadId: 1, name: "Christopher Kane", initials: "CK", color: VIOLET, note: "Send revised pricing sheet", time: "10:30 AM", overdue: !useSQLite ? false : 0 },
      { leadId: 3, name: "Thor Johnson", initials: "TJ", color: "#3B82F6", note: "Discuss payment plan options", time: "12:00 PM", overdue: !useSQLite ? false : 0 },
      { leadId: 2, name: "Addie Bradford", initials: "AB", color: "#10B981", note: "Confirm site visit timing", time: "Yesterday 3PM", overdue: !useSQLite ? true : 1 },
      { leadId: 6, name: "Marcus Chen", initials: "MC", color: "#F59E0B", note: "Share brochure and floor plans", time: "2:30 PM", overdue: !useSQLite ? false : 0 }
    ];

    for (const f of initialFollowups) {
      await run(`
        INSERT INTO followups (leadId, name, initials, color, note, time, overdue)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [f.leadId, f.name, f.initials, f.color, f.note, f.time, f.overdue]);
    }

    // Seed Tasks
    const initialTasks = [
      { title: "Send project brochure to Christopher", lead: "Christopher Kane", due: "Today 12:00 PM", overdue: !useSQLite ? false : 0, completed: !useSQLite ? false : 0 },
      { title: "Schedule site visit for Addie Bradford", lead: "Addie Bradford", due: "Today 3:00 PM", overdue: !useSQLite ? false : 0, completed: !useSQLite ? false : 0 },
      { title: "Follow up on loan pre-approval", lead: "Diana Hess", due: "Yesterday 5:00 PM", overdue: !useSQLite ? true : 1, completed: !useSQLite ? false : 0 },
      { title: "Send WhatsApp greeting to new leads", lead: "", due: "Today 10:00 AM", overdue: !useSQLite ? true : 1, completed: !useSQLite ? false : 0 },
      { title: "Update property pricing for Skyline", lead: "", due: "Tomorrow 11:00 AM", overdue: !useSQLite ? false : 0, completed: !useSQLite ? false : 0 },
      { title: "Prepare project presentation", lead: "Marcus Chen", due: "Fri 2:00 PM", overdue: !useSQLite ? false : 0, completed: !useSQLite ? true : 1 }
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

    // Seed Incomes
    const initialIncomes = [
      {
        customerName: "Rohit Sharma",
        propertyName: "3BHK Apartment",
        paymentDate: "16 Jul 2025",
        amountReceived: 25000,
        paymentMode: "UPI",
        commission: 2,
        receivedFrom: "Rohit Sharma",
        transactionId: "UPI/1234567890",
        notes: "Token Amount",
        receiptFile: "receipt.jpg"
      }
    ];

    for (const inc of initialIncomes) {
      await run(`
        INSERT INTO incomes (customerName, propertyName, paymentDate, amountReceived, paymentMode, commission, receivedFrom, transactionId, notes, receiptFile)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [inc.customerName, inc.propertyName, inc.paymentDate, inc.amountReceived, inc.paymentMode, inc.commission, inc.receivedFrom, inc.transactionId, inc.notes, inc.receiptFile]);
    }

    // Seed Expenses
    const initialExpenses = [
      {
        category: "Fuel",
        vendorName: "Indian Oil Petrol Pump",
        expenseDate: "16 Jul 2025",
        amount: 2500,
        paymentMode: "Card",
        invoiceNo: "INV-7856",
        notes: "Fuel for site visit",
        billFile: "bill.jpg"
      }
    ];

    for (const exp of initialExpenses) {
      await run(`
        INSERT INTO expenses (category, vendorName, expenseDate, amount, paymentMode, invoiceNo, notes, billFile)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [exp.category, exp.vendorName, exp.expenseDate, exp.amount, exp.paymentMode, exp.invoiceNo, exp.notes, exp.billFile]);
    }

    // Seed Sites
    const initialSites = [
      { name: "Skyline Residency" },
      { name: "Harbour View Tower" }
    ];
    for (const s of initialSites) {
      await run(`INSERT INTO sites (name) VALUES (?)`, [s.name]);
    }

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');

    // Seed Milestones
    const initialMilestones = [
      { name: "Excavation & Shoring", target_date: `${yyyy}-${mm}-05`, status: "COMPLETED", progress_percentage: 100 },
      { name: "Foundation Pouring", target_date: `${yyyy}-${mm}-10`, status: "COMPLETED", progress_percentage: 100 },
      { name: "Ground Floor Column Reinforcement", target_date: `${yyyy}-${mm}-14`, status: "IN_PROGRESS", progress_percentage: 60 },
      { name: "First Floor Slab Casting", target_date: `${yyyy}-${mm}-22`, status: "PENDING", progress_percentage: 0 }
    ];
    for (const m of initialMilestones) {
      await run(`
        INSERT INTO milestones (name, target_date, status, progress_percentage)
        VALUES (?, ?, ?, ?)
      `, [m.name, m.target_date, m.status, m.progress_percentage]);
    }

    // Seed DPRs
    const initialDprs = [
      { report_date: `${yyyy}-${mm}-05`, summary: "Excavation finished ahead of schedule. Shoring completed for Sector A.", photos: JSON.stringify(["https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80"]), milestone_id: 1, completion_percentage: 100, site_id: 1 },
      { report_date: `${yyyy}-${mm}-10`, summary: "Foundation pour complete. Quality testing report attached. Curing started.", photos: JSON.stringify(["https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=600&q=80"]), milestone_id: 2, completion_percentage: 100, site_id: 1 },
      { report_date: `${yyyy}-${mm}-14`, summary: "Ground floor column reinforcement underway. 60% rebars tied. Inspections scheduled for tomorrow.", photos: JSON.stringify([]), milestone_id: 3, completion_percentage: 60, site_id: 1 }
    ];
    for (const d of initialDprs) {
      await run(`
        INSERT INTO dprs (report_date, summary, photos, milestone_id, completion_percentage, site_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [d.report_date, d.summary, d.photos, d.milestone_id, d.completion_percentage, d.site_id]);
    }

    console.log('Database seeded successfully.');
  } else {
    console.log('Database already has data. Skipping seed.');
  }
}
