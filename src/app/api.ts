const handleResponse = async (r: Response) => {
  if (!r.ok) {
    const errText = await r.text();
    throw new Error(errText || `Request failed with status ${r.status}`);
  }
  return r.json();
};

export const api = {
  getLeads: () => fetch('/api/leads').then(handleResponse),
  getLead: (id: number) => fetch(`/api/leads/${id}`).then(handleResponse),
  createLead: (lead: any) => fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead)
  }).then(handleResponse),
  updateLead: (id: number, lead: any) => fetch(`/api/leads/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead)
  }).then(handleResponse),
  deleteLead: (id: number) => fetch(`/api/leads/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),
  importLeads: (leads: any[]) => fetch('/api/leads/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ leads })
  }).then(handleResponse),

  getProperties: () => fetch('/api/properties').then(handleResponse),
  createProperty: (prop: any) => fetch('/api/properties', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prop)
  }).then(handleResponse),
  updateProperty: (id: number, prop: any) => fetch(`/api/properties/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prop)
  }).then(handleResponse),
  deleteProperty: (id: number) => fetch(`/api/properties/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),

  getTasks: () => fetch('/api/tasks').then(handleResponse),
  createTask: (task: any) => fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task)
  }).then(handleResponse),
  toggleTask: (id: number, completed: boolean) => fetch(`/api/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed })
  }).then(handleResponse),
  deleteTask: (id: number) => fetch(`/api/tasks/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),

  getAppointments: () => fetch('/api/appointments').then(handleResponse),
  createAppointment: (apt: any) => fetch('/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(apt)
  }).then(handleResponse),

  getFollowups: () => fetch('/api/followups').then(handleResponse),
  createFollowup: (fup: any) => fetch('/api/followups', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fup)
  }).then(handleResponse),

  getBroadcasts: () => fetch('/api/broadcasts').then(handleResponse),
  createBroadcast: (broadcast: any) => fetch('/api/broadcasts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(broadcast)
  }).then(handleResponse),

  getAnalytics: () => fetch('/api/analytics').then(handleResponse),
  getIncomes: () => fetch('/api/incomes').then(handleResponse),
  createIncome: (inc: any) => fetch('/api/incomes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inc)
  }).then(handleResponse),
  getExpenses: () => fetch('/api/expenses').then(handleResponse),
  createExpense: (exp: any) => fetch('/api/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(exp)
  }).then(handleResponse),
  getSites: () => fetch('/api/sites').then(handleResponse),
  getMilestones: () => fetch('/api/milestones').then(handleResponse),
  createMilestone: (m: any) => fetch('/api/milestones', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(m)
  }).then(handleResponse),
  deleteMilestone: (id: number) => fetch(`/api/milestones/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),
  getDprs: () => fetch('/api/dprs').then(handleResponse),
  createDpr: (d: any) => fetch('/api/dprs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(d)
  }).then(handleResponse),
  deleteDpr: (id: number) => fetch(`/api/dprs/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),
  deleteIncome: (id: number) => fetch(`/api/incomes/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),
  deleteExpense: (id: number) => fetch(`/api/expenses/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),
};
