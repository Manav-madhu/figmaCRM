import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, run, initDb, useSQLite } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize database
initDb()
  .then(() => console.log('Database initialized successfully.'))
  .catch((err) => console.error('Database initialization failed:', err));

// ─── LEADS ROUTES ──────────────────────────────────────────────────────────

// GET all leads
app.get('/api/leads', async (req, res) => {
  try {
    const result = await query('SELECT * FROM leads ORDER BY id DESC');
    // Parse tags JSON string if SQLite
    const leads = result.rows.map(lead => {
      if (typeof lead.tags === 'string') {
        try {
          lead.tags = JSON.parse(lead.tags);
        } catch (e) {
          lead.tags = lead.tags ? lead.tags.split(',') : [];
        }
      }
      return lead;
    });
    res.json(leads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// GET single lead
app.get('/api/leads/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM leads WHERE id = ?', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    const lead = result.rows[0];
    if (typeof lead.tags === 'string') {
      try {
        lead.tags = JSON.parse(lead.tags);
      } catch (e) {
        lead.tags = lead.tags ? lead.tags.split(',') : [];
      }
    }
    res.json(lead);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
});

// POST new lead
app.post('/api/leads', async (req, res) => {
  const {
    name, type = 'Buyer', status = 'New', priority = 'Medium',
    project = '', city = '', tags = [], budget = '',
    lastContact = 'Just now', assigned = 'You', phone = '', email = '',
    task = '', taskDue = ''
  } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  // Derive initials
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Random color for avatar background
  const colors = ['#7C5CFC', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#6B6B8A'];
  const avatarBg = colors[Math.floor(Math.random() * colors.length)];

  const tagsStr = JSON.stringify(tags);

  try {
    const insertSQL = `
      INSERT INTO leads (name, initials, avatarBg, type, status, priority, project, city, tags, budget, lastContact, assigned, phone, email, task, taskDue)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await run(insertSQL, [
      name, initials, avatarBg, type, status, priority,
      project, city, tagsStr, budget, lastContact, assigned,
      phone, email, task, taskDue
    ]);

    // Insert task automatically if task details are provided
    if (task) {
      await run(`
        INSERT INTO tasks (title, lead, due, overdue, completed)
        VALUES (?, ?, ?, 0, 0)
      `, [task, name, taskDue || 'Today']);
    }

    // Insert into followups if needed
    if (status === 'Contacted' || status === 'Qualified') {
      await run(`
        INSERT INTO followups (leadId, name, initials, color, note, time, overdue)
        VALUES (?, ?, ?, ?, ?, 'Tomorrow', 0)
      `, [result.lastID, name, initials, avatarBg, `Follow up with ${name}`, 'Tomorrow']);
    }

    res.status(201).json({ id: result.lastID, name, initials, avatarBg, type, status, priority });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

// PUT update lead
app.put('/api/leads/:id', async (req, res) => {
  const {
    name, type, status, priority, project, city, tags, budget,
    lastContact, assigned, phone, email, task, taskDue, linkResponse
  } = req.body;

  try {
    // Get existing lead
    const checkLead = await query('SELECT * FROM leads WHERE id = ?', [req.params.id]);
    if (checkLead.rowCount === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    const current = checkLead.rows[0];

    const updatedName = name !== undefined ? name : current.name;
    const updatedInitials = name !== undefined ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : current.initials;
    const updatedType = type !== undefined ? type : current.type;
    const updatedStatus = status !== undefined ? status : current.status;
    const updatedPriority = priority !== undefined ? priority : current.priority;
    const updatedProject = project !== undefined ? project : current.project;
    const updatedCity = city !== undefined ? city : current.city;
    const updatedTags = tags !== undefined ? JSON.stringify(tags) : current.tags;
    const updatedBudget = budget !== undefined ? budget : current.budget;
    const updatedLastContact = lastContact !== undefined ? lastContact : current.lastContact;
    const updatedAssigned = assigned !== undefined ? assigned : current.assigned;
    const updatedPhone = phone !== undefined ? phone : current.phone;
    const updatedEmail = email !== undefined ? email : current.email;
    const updatedTask = task !== undefined ? task : current.task;
    const updatedTaskDue = taskDue !== undefined ? taskDue : current.taskDue;
    const updatedLinkResponse = linkResponse !== undefined ? linkResponse : current.linkResponse;

    const updateSQL = `
      UPDATE leads
      SET name = ?, initials = ?, type = ?, status = ?, priority = ?, project = ?, city = ?, tags = ?, budget = ?, lastContact = ?, assigned = ?, phone = ?, email = ?, task = ?, taskDue = ?, linkResponse = ?
      WHERE id = ?
    `;
    await run(updateSQL, [
      updatedName, updatedInitials, updatedType, updatedStatus, updatedPriority,
      updatedProject, updatedCity, updatedTags, updatedBudget, updatedLastContact,
      updatedAssigned, updatedPhone, updatedEmail, updatedTask, updatedTaskDue,
      updatedLinkResponse, req.params.id
    ]);

    // If status changed to Negotiation/Booked, add follow-ups or complete tasks
    if (status && status !== current.status) {
      await run(`
        INSERT INTO followups (leadId, name, initials, color, note, time, overdue)
        VALUES (?, ?, ?, ?, ?, 'Just now', 0)
      `, [req.params.id, updatedName, updatedInitials, current.avatarBg, `Status changed to ${status}`, 'Just now']);
    }

    // Clear automatic "No response" followups if lead responded
    if (status && ['Send Details', 'Not Interested', 'Site Visit'].includes(status)) {
      await run(`
        DELETE FROM followups 
        WHERE leadId = ? AND note LIKE '%No response from lead%'
      `, [req.params.id]);
    }

    res.json({ message: 'Lead updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

// DELETE lead
app.delete('/api/leads/:id', async (req, res) => {
  try {
    const checkLead = await query('SELECT * FROM leads WHERE id = ?', [req.params.id]);
    if (checkLead.rowCount === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    const lead = checkLead.rows[0];

    await run('DELETE FROM leads WHERE id = ?', [req.params.id]);
    await run('DELETE FROM followups WHERE leadId = ?', [req.params.id]);
    await run('DELETE FROM tasks WHERE lead = ?', [lead.name]);

    res.json({ message: 'Lead deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

// POST Bulk import leads
app.post('/api/leads/import', async (req, res) => {
  const { leads: importLeads } = req.body;
  if (!Array.isArray(importLeads) || importLeads.length === 0) {
    return res.status(400).json({ error: 'Invalid leads list' });
  }

  let created = 0;
  let skipped = 0;
  let updated = 0;
  let failed = 0;

  const colors = ['#7C5CFC', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#6B6B8A'];

  for (const lead of importLeads) {
    const { name, phone, email = '', budget = '', project = '', city = '', source = 'Website', status = 'New' } = lead;

    if (!name || !phone) {
      failed++;
      continue;
    }

    // Check duplicate phone
    try {
      const duplicate = await query('SELECT id FROM leads WHERE phone = ?', [phone]);
      if (duplicate.rowCount > 0) {
        // Update existing lead instead
        await run(`
          UPDATE leads
          SET name = ?, budget = ?, project = ?, city = ?, email = ?
          WHERE phone = ?
        `, [name, budget, project, city, email, phone]);
        updated++;
      } else {
        // Create new
        const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
        const avatarBg = colors[Math.floor(Math.random() * colors.length)];
        const tags = JSON.stringify([status === 'Booked' ? 'Closed Deal' : 'Hot']);

        await run(`
          INSERT INTO leads (name, initials, avatarBg, type, status, priority, project, city, tags, budget, lastContact, assigned, phone, email, task, taskDue)
          VALUES (?, ?, ?, 'Buyer', ?, 'Medium', ?, ?, ?, ?, 'Just imported', 'You', ?, ?, 'Introductory WhatsApp', 'Today')
        `, [name, initials, avatarBg, status, project, city, tags, budget, phone, email]);

        created++;
      }
    } catch (e) {
      console.error(e);
      failed++;
    }
  }

  res.json({
    created,
    updated,
    skipped,
    failed,
    total: importLeads.length
  });
});

// ─── PROPERTIES ROUTES ──────────────────────────────────────────────────────

app.get('/api/properties', async (req, res) => {
  try {
    const result = await query('SELECT * FROM properties ORDER BY id DESC');
    // Map featured to boolean
    const props = result.rows.map(p => {
      p.featured = !!p.featured;
      return p;
    });
    res.json(props);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

app.post('/api/properties', async (req, res) => {
  const { name, address, price, salePrice, type, beds, baths, sqft, status = 'Available', image, featured = false } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Property name is required' });
  }

  const statusColor = status === 'Available' ? '#10B981' : status === 'Pending' ? '#F59E0B' : '#7C5CFC';
  const imgUrl = image || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=260&fit=crop&auto=format';
  const featVal = !useSQLite ? featured : (featured ? 1 : 0);

  try {
    const result = await run(`
      INSERT INTO properties (name, address, price, salePrice, type, beds, baths, sqft, status, statusColor, image, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, address, price, salePrice, type, beds, baths, sqft, status, statusColor, imgUrl, featVal]);

    res.status(201).json({ id: result.lastID, name, address, price, type });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create property' });
  }
});

// PUT update property
app.put('/api/properties/:id', async (req, res) => {
  const { name, address, price, salePrice, type, beds, baths, sqft, status, featured, inquiries, siteVisits, favorite } = req.body;
  try {
    const checkProp = await query('SELECT * FROM properties WHERE id = ?', [req.params.id]);
    if (checkProp.rowCount === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }
    const current = checkProp.rows[0];

    const updatedName = name !== undefined ? name : current.name;
    const updatedAddress = address !== undefined ? address : current.address;
    const updatedPrice = price !== undefined ? price : current.price;
    const updatedSalePrice = salePrice !== undefined ? salePrice : current.salePrice;
    const updatedType = type !== undefined ? type : current.type;
    const updatedBeds = beds !== undefined ? beds : current.beds;
    const updatedBaths = baths !== undefined ? baths : current.baths;
    const updatedSqft = sqft !== undefined ? sqft : current.sqft;
    const updatedStatus = status !== undefined ? status : current.status;
    const updatedStatusColor = updatedStatus === 'Available' ? '#10B981' : updatedStatus === 'Pending' ? '#F59E0B' : '#7C5CFC';
    const updatedFeatured = featured !== undefined ? (!useSQLite ? featured : (featured ? 1 : 0)) : current.featured;
    const updatedInquiries = inquiries !== undefined ? inquiries : (current.inquiries || 0);
    const updatedSiteVisits = siteVisits !== undefined ? siteVisits : (current.siteVisits || 0);
    const updatedFavorite = favorite !== undefined ? (!useSQLite ? favorite : (favorite ? 1 : 0)) : current.favorite;

    await run(`
      UPDATE properties
      SET name = ?, address = ?, price = ?, salePrice = ?, type = ?, beds = ?, baths = ?, sqft = ?, status = ?, statusColor = ?, featured = ?, inquiries = ?, siteVisits = ?, favorite = ?
      WHERE id = ?
    `, [
      updatedName, updatedAddress, updatedPrice, updatedSalePrice, updatedType,
      updatedBeds, updatedBaths, updatedSqft, updatedStatus, updatedStatusColor, updatedFeatured,
      updatedInquiries, updatedSiteVisits, updatedFavorite,
      req.params.id
    ]);

    res.json({ message: 'Property updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update property' });
  }
});

// DELETE property
app.delete('/api/properties/:id', async (req, res) => {
  try {
    await run('DELETE FROM properties WHERE id = ?', [req.params.id]);
    res.json({ message: 'Property deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

// ─── TASKS ROUTES ───────────────────────────────────────────────────────────

app.get('/api/tasks', async (req, res) => {
  try {
    const result = await query('SELECT * FROM tasks ORDER BY id DESC');
    const tasks = result.rows.map(t => {
      t.completed = !!t.completed;
      t.overdue = !!t.overdue;
      return t;
    });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.post('/api/tasks', async (req, res) => {
  const { title, lead = '', due = 'Today 5:00 PM', overdue = false } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  const odVal = !useSQLite ? overdue : (overdue ? 1 : 0);

  try {
    const result = await run(`
      INSERT INTO tasks (title, lead, due, overdue, completed)
      VALUES (?, ?, ?, ?, 0)
    `, [title, lead, due, odVal]);

    res.status(201).json({ id: result.lastID, title, lead, due, completed: false, overdue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Toggle/update task
app.put('/api/tasks/:id', async (req, res) => {
  const { completed } = req.body;
  try {
    const checkTask = await query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (checkTask.rowCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (completed !== undefined) {
      const compVal = !useSQLite ? completed : (completed ? 1 : 0);
      await run('UPDATE tasks SET completed = ? WHERE id = ?', [compVal, req.params.id]);
    }

    res.json({ message: 'Task updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update task', details: err.message, stack: err.stack });
  }
});

// DELETE task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await run('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// POST /api/whatsapp/send
app.post('/api/whatsapp/send', async (req, res) => {
  const { phone, message } = req.body;
  if (!phone || !message) {
    return res.status(400).json({ error: 'Phone and message are required' });
  }

  console.log(`[WhatsApp API Output] Programmatic send to ${phone}: ${message}`);

  const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
  const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

  if (WHATSAPP_TOKEN && PHONE_NUMBER_ID) {
    try {
      const url = `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone.replace(/[^\d]/g, ''),
          type: 'text',
          text: { body: message }
        })
      });
      const responseData = await response.json();
      console.log('Meta WhatsApp response:', responseData);
    } catch (err) {
      console.error('Failed to post to Meta Graph API:', err);
    }
  }

  res.json({ success: true, message: 'Message sent via WhatsApp Cloud API successfully', sentMessage: message });
});

// ─── APPOINTMENTS ROUTES ─────────────────────────────────────────────────────

app.get('/api/appointments', async (req, res) => {
  try {
    const result = await query('SELECT * FROM appointments ORDER BY time ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

app.post('/api/appointments', async (req, res) => {
  const { time, title, sub, type, color = '#7C5CFC', priority = 'Medium' } = req.body;
  if (!title || !time) {
    return res.status(400).json({ error: 'Title and time are required' });
  }

  try {
    const result = await run(`
      INSERT INTO appointments (time, title, sub, type, color, priority)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [time, title, sub || '', type || 'viewing', color, priority]);

    res.status(201).json({ id: result.lastID, time, title, sub, type, color, priority });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// ─── FOLLOW-UPS ROUTES ───────────────────────────────────────────────────────

app.get('/api/followups', async (req, res) => {
  try {
    const result = await query('SELECT * FROM followups ORDER BY id DESC');
    const fup = result.rows.map(f => {
      f.overdue = !!f.overdue;
      return f;
    });
    res.json(fup);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch follow-ups' });
  }
});

app.post('/api/followups', async (req, res) => {
  const { leadId, name, initials, color, note, time, overdue = false } = req.body;
  if (!name || !time) {
    return res.status(400).json({ error: 'Name and time are required' });
  }

  const odVal = !useSQLite ? overdue : (overdue ? 1 : 0);

  try {
    const result = await run(`
      INSERT INTO followups (leadId, name, initials, color, note, time, overdue)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [leadId || null, name, initials || '', color || '#7C5CFC', note || '', time, odVal]);

    res.status(201).json({ id: result.lastID, leadId, name, time });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create follow-up' });
  }
});

// ─── BROADCASTS ROUTES ───────────────────────────────────────────────────────

app.get('/api/broadcasts', async (req, res) => {
  try {
    const result = await query('SELECT * FROM broadcasts ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch broadcasts' });
  }
});

app.post('/api/broadcasts', async (req, res) => {
  const { name, preview, recipients = 50 } = req.body;
  if (!name || !preview) {
    return res.status(400).json({ error: 'Name and preview are required' });
  }

  const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const sent = Math.floor(recipients * 0.96);
  const failed = recipients - sent;

  try {
    const result = await run(`
      INSERT INTO broadcasts (name, preview, status, date, recipients, sent, failed)
      VALUES (?, ?, 'Sent', ?, ?, ?, ?)
    `, [name, preview, date, recipients, sent, failed]);

    res.status(201).json({ id: result.lastID, name, preview, status: 'Sent', date, recipients, sent, failed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create broadcast' });
  }
});

// ─── ANALYTICS / STATS ROUTE ────────────────────────────────────────────────

app.get('/api/analytics', async (req, res) => {
  try {
    const leadsRes = await query('SELECT * FROM leads');
    const propsRes = await query('SELECT COUNT(*) as count FROM properties');
    const tasksRes = await query('SELECT COUNT(*) as count FROM tasks WHERE completed = 0 OR completed = false');

    const totalLeads = leadsRes.rowCount;
    const activeLeads = leadsRes.rows.filter(l => l.status !== 'Lost').length;
    const propertiesCount = parseInt(propsRes.rows[0].count);
    const tasksDue = parseInt(tasksRes.rows[0].count);

    // Calculate pipeline stage distribution
    const pipeline = {
      'New': 0, 'Contacted': 0, 'Qualified': 0, 'Visit Scheduled': 0,
      'Negotiation': 0, 'Booked': 0, 'Lost': 0
    };
    leadsRes.rows.forEach(l => {
      if (pipeline[l.status] !== undefined) {
        pipeline[l.status]++;
      }
    });

    // Mock analytics dashboard structure matching Heitkamp Realty design
    const stats = [
      { label: "Active Leads", value: String(activeLeads), delta: "+12%", color: "#7C5CFC", bg: "#EDE9FF" },
      { label: "Properties", value: String(propertiesCount), delta: `+${propertiesCount}`, color: "#10B981", bg: "#D1FAE5" },
      { label: "Revenue", value: "$198k", delta: "+8%", color: "#F59E0B", bg: "#FEF3C7" },
      { label: "Tasks Due", value: String(tasksDue), delta: tasksDue > 5 ? "Urgent" : "Normal", color: "#EF4444", bg: "#FEE2E2" }
    ];

    res.json({
      stats,
      activeLeadsCount: activeLeads,
      totalLeadsCount: totalLeads,
      propertiesCount,
      tasksCount: tasksDue,
      pipeline: Object.entries(pipeline).map(([stage, count]) => ({ stage, count })),
      revenue: [
        { month: "Feb", v: 120 }, { month: "Mar", v: 145 }, { month: "Apr", v: 98 },
        { month: "May", v: 172 }, { month: "Jun", v: 160 }, { month: "Jul", v: 198 },
      ],
      sources: [
        { name: "Referral", value: 34, color: "#7C5CFC" },
        { name: "Website", value: 26, color: "#3B82F6" },
        { name: "WhatsApp", value: 18, color: "#25D366" },
        { name: "Open House", value: 14, color: "#F59E0B" },
        { name: "Walk-in", value: 8, color: "#0891B2" }
      ],
      weekly: [
        { day: "Mon", leads: 4, booked: 1 },
        { day: "Tue", leads: 7, booked: 2 },
        { day: "Wed", leads: 3, booked: 0 },
        { day: "Thu", leads: 9, booked: 3 },
        { day: "Fri", leads: 6, booked: 2 },
        { day: "Sat", leads: 5, booked: 1 },
        { day: "Sun", leads: 2, booked: 0 },
      ]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});


// ─── INCOMES ROUTES ──────────────────────────────────────────────────────────

app.get('/api/incomes', async (req, res) => {
  try {
    const result = await query('SELECT * FROM incomes ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch incomes' });
  }
});

app.post('/api/incomes', async (req, res) => {
  const {
    customerName,
    propertyName,
    paymentDate,
    amountReceived,
    paymentMode,
    commission,
    receivedFrom,
    transactionId,
    notes,
    receiptFile
  } = req.body;

  try {
    const result = await run(`
      INSERT INTO incomes (customerName, propertyName, paymentDate, amountReceived, paymentMode, commission, receivedFrom, transactionId, notes, receiptFile)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      customerName || '',
      propertyName || '',
      paymentDate || '',
      parseInt(amountReceived) || 0,
      paymentMode || 'UPI',
      parseInt(commission) || 0,
      receivedFrom || '',
      transactionId || '',
      notes || '',
      receiptFile || ''
    ]);

    res.status(201).json({
      id: result.lastID,
      customerName,
      propertyName,
      paymentDate,
      amountReceived,
      paymentMode,
      commission,
      receivedFrom,
      transactionId,
      notes,
      receiptFile
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create income entry' });
  }
});


// ─── EXPENSES ROUTES ─────────────────────────────────────────────────────────

app.get('/api/expenses', async (req, res) => {
  try {
    const result = await query('SELECT * FROM expenses ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

app.post('/api/expenses', async (req, res) => {
  const {
    category,
    vendorName,
    expenseDate,
    amount,
    paymentMode,
    invoiceNo,
    notes,
    billFile
  } = req.body;

  try {
    const result = await run(`
      INSERT INTO expenses (category, vendorName, expenseDate, amount, paymentMode, invoiceNo, notes, billFile)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      category || 'Fuel',
      vendorName || '',
      expenseDate || '',
      parseInt(amount) || 0,
      paymentMode || 'Card',
      invoiceNo || '',
      notes || '',
      billFile || ''
    ]);

    res.status(201).json({
      id: result.lastID,
      category,
      vendorName,
      expenseDate,
      amount,
      paymentMode,
      invoiceNo,
      notes,
      billFile
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create expense entry' });
  }
});


// ─── STATIC FILE SERVING FOR PRODUCTION ──────────────────────────────────────

// Serve static assets from Vite build output
app.use(express.static(path.join(__dirname, '../dist')));

// Serve index.html for React SPA Router (fallback)
app.get('*', (req, res, next) => {
  // If it's an API route that somehow hit this fallback, ignore it
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
