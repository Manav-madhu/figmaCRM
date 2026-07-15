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

    // Check if user is a trial user to seed dummy data
    sqliteDb.get("SELECT plan FROM users WHERE id = ?", [idStr], (err, row) => {
      if (row && row.plan === 'trial') {
        newDb.get("SELECT COUNT(*) as count FROM leads", (err, leadRow) => {
          if (leadRow && leadRow.count === 0) {
            console.log(`Seeding 15-day trial user ${idStr} with dummy data...`);
            seedUserDummyData(newDb);
          }
        });
      }
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
    const isUsersQuery = text.toLowerCase().includes('users');
    const activeDb = isUsersQuery ? sqliteDb : getDbForUser(userId);

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
    const isUsersQuery = text.toLowerCase().includes('users');
    const activeDb = isUsersQuery ? sqliteDb : getDbForUser(userId);

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
      plan VARCHAR(50) DEFAULT 'premium',
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
      plan TEXT DEFAULT 'premium',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // Run table creations
  await run(createUsersTable);
}

export function seedUserDummyData(db) {
  db.serialize(() => {
    // 1. Seed Leads (one Booked, one Site Visit, one New)
    db.run(`
      INSERT INTO leads (name, initials, avatarBg, type, status, priority, project, city, tags, budget, lastContact, assigned, phone, email, task, taskDue)
      VALUES 
        ('Rohit Sharma', 'RS', '#7C5CFC', 'Buyer', 'Booked', 'High', 'Skyline Residences', 'Mumbai', '["Hot","Buyer"]', '₹80L', 'Today', 'You', '+91 98765 43210', 'rohit.sharma@gmail.com', 'Call back to discuss layout', 'Today'),
        ('Pooja Patel', 'PP', '#D97706', 'Buyer', 'Site Visit', 'High', 'Green Valley Villa', 'Pune', '["Hot","Buyer"]', '₹60L', 'Today', 'You', '+91 98765 43211', 'pooja.patel@outlook.com', 'Accompany for site tour', 'Today'),
        ('Amit Kumar', 'AK', '#EF4444', 'Buyer', 'New', 'Medium', 'Oak Park Flats', 'Delhi NCR', '["Investor"]', '₹1.2Cr', 'Yesterday', 'You', '+91 98765 43212', 'amit.kumar@ventures.co', 'Review discount offer', 'Tomorrow')
    `);

    // 2. Seed Properties
    db.run(`
      INSERT INTO properties (name, address, price, salePrice, type, beds, baths, sqft, status, statusColor, image, featured, inquiries, siteVisits, favorite)
      VALUES 
        ('Skyline Residences', '850 Marina Blvd, Mumbai', '₹80,000/mo', '₹85,00,000', 'Sale', 3, 3, '1,800 sqft', 'Available', '#10B981', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=260&fit=crop&auto=format', 1, 14, 8, 1),
        ('Green Valley Villa', 'Sector 15, Pune', '₹60,000/mo', '₹65,00,000', 'Both', 4, 4, '3,200 sqft', 'Available', '#10B981', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=260&fit=crop&auto=format', 0, 8, 3, 0),
        ('Oak Park Flats', 'Connaught Place, Delhi', '₹45,000/mo', '₹50,00,000', 'Rent', 2, 2, '1,100 sqft', 'Pending', '#F59E0B', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=260&fit=crop&auto=format', 0, 5, 2, 0)
    `);

    // 3. Seed Tasks
    db.run(`
      INSERT INTO tasks (title, dueDate, completed, priority, overdue)
      VALUES 
        ('Follow-up on Pooja Patel site visit', 'Today', 0, 'High', 0),
        ('Prepare agreement for Amit Kumar', 'Tomorrow', 0, 'Medium', 0),
        ('Submit monthly tax file', 'Yesterday', 1, 'Low', 0)
    `);

    // 4. Seed Appointments
    db.run(`
      INSERT INTO appointments (clientName, initials, color, type, time, date)
      VALUES 
        ('Pooja Patel', 'PP', '#D97706', 'viewing', '10:30 AM', 'Today'),
        ('Amit Kumar', 'AK', '#EF4444', 'meeting', '02:00 PM', 'Tomorrow')
    `);

    // 5. Seed Incomes (Booked lead Rohit Sharma paid booking amount)
    db.run(`
      INSERT INTO incomes (clientName, amountReceived, paymentMode, dealDate, leadId)
      VALUES 
        ('Rohit Sharma', 500000, 'Direct Transfer', '2026-07-14', 1),
        ('Rohit Sharma', 100000, 'UPI', '2026-07-15', 1)
    `);

    // 6. Seed Expenses
    db.run(`
      INSERT INTO expenses (vendorName, amount, paymentMode, expenseDate, category, invoiceNo)
      VALUES 
        ('Marketing Agency', 15000, 'Net Banking', '2026-07-12', 'Marketing', 'INV-2026-001'),
        ('Workspace Co-working', 45000, 'Direct Transfer', '2026-07-15', 'Rent', 'INV-2026-045')
    `);
  });
}
