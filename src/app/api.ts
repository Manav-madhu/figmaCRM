export const api = {
  getLeads: () => fetch('/api/leads').then(r => r.json()),
  getLead: (id: number) => fetch(`/api/leads/${id}`).then(r => r.json()),
  createLead: (lead: any) => fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead)
  }).then(r => r.json()),
  updateLead: (id: number, lead: any) => fetch(`/api/leads/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead)
  }).then(r => r.json()),
  deleteLead: (id: number) => fetch(`/api/leads/${id}`, {
    method: 'DELETE'
  }).then(r => r.json()),
  importLeads: (leads: any[]) => fetch('/api/leads/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ leads })
  }).then(r => r.json()),

  getProperties: () => fetch('/api/properties').then(r => r.json()),
  createProperty: (prop: any) => fetch('/api/properties', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prop)
  }).then(r => r.json()),
  updateProperty: (id: number, prop: any) => fetch(`/api/properties/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prop)
  }).then(r => r.json()),
  deleteProperty: (id: number) => fetch(`/api/properties/${id}`, {
    method: 'DELETE'
  }).then(r => r.json()),

  getTasks: () => fetch('/api/tasks').then(r => r.json()),
  createTask: (task: any) => fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task)
  }).then(r => r.json()),
  toggleTask: (id: number, completed: boolean) => fetch(`/api/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed })
  }).then(r => r.json()),
  deleteTask: (id: number) => fetch(`/api/tasks/${id}`, {
    method: 'DELETE'
  }).then(r => r.json()),

  getAppointments: () => fetch('/api/appointments').then(r => r.json()),
  createAppointment: (apt: any) => fetch('/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(apt)
  }).then(r => r.json()),

  getFollowups: () => fetch('/api/followups').then(r => r.json()),
  createFollowup: (fup: any) => fetch('/api/followups', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fup)
  }).then(r => r.json()),

  getBroadcasts: () => fetch('/api/broadcasts').then(r => r.json()),
  createBroadcast: (broadcast: any) => fetch('/api/broadcasts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(broadcast)
  }).then(r => r.json()),

  getAnalytics: () => fetch('/api/analytics').then(r => r.json()),
};
