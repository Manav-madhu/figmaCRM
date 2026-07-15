const handleResponse = async (r: Response) => {
  if (!r.ok) {
    const errText = await r.text();
    let parsed = errText;
    try {
      const json = JSON.parse(errText);
      parsed = json.error || errText;
    } catch (e) {}
    throw new Error(parsed || `Request failed with status ${r.status}`);
  }
  return r.json();
};

const getUserId = () => {
  try {
    const userJson = localStorage.getItem("crm_user");
    if (userJson) {
      const u = JSON.parse(userJson);
      return String(u.id || "1");
    }
  } catch (e) {}
  return "1";
};

const customFetch = (url: string, options: any = {}) => {
  const userId = getUserId();
  const headers = {
    ...options.headers,
    'x-user-id': userId
  };
  return fetch(url, { ...options, headers });
};

export const api = {
  // Authentication & Signup Flow
  signup: (body: any) => customFetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).then(handleResponse),

  profileSetup: (body: any) => customFetch('/api/auth/profile-setup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).then(handleResponse),

  subscribe: (body: any) => customFetch('/api/auth/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).then(handleResponse),

  login: (body: any) => customFetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).then(handleResponse),

  // Admin Trials Approval
  getTrials: () => customFetch('/api/admin/trials').then(handleResponse),
  approveTrial: (id: number) => customFetch(`/api/admin/trials/${id}/approve`, {
    method: 'POST'
  }).then(handleResponse),
  rejectTrial: (id: number) => customFetch(`/api/admin/trials/${id}/reject`, {
    method: 'POST'
  }).then(handleResponse),

  // CRM Features
  getLeads: () => customFetch('/api/leads').then(handleResponse),
  getLead: (id: number) => customFetch(`/api/leads/${id}`).then(handleResponse),
  createLead: (lead: any) => customFetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead)
  }).then(handleResponse),
  updateLead: (id: number, lead: any) => customFetch(`/api/leads/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead)
  }).then(handleResponse),
  deleteLead: (id: number) => customFetch(`/api/leads/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),
  importLeads: (leads: any[]) => customFetch('/api/leads/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ leads })
  }).then(handleResponse),

  getProperties: () => customFetch('/api/properties').then(handleResponse),
  createProperty: (prop: any) => customFetch('/api/properties', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prop)
  }).then(handleResponse),
  updateProperty: (id: number, prop: any) => customFetch(`/api/properties/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prop)
  }).then(handleResponse),
  deleteProperty: (id: number) => customFetch(`/api/properties/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),

  getTasks: () => customFetch('/api/tasks').then(handleResponse),
  createTask: (task: any) => customFetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task)
  }).then(handleResponse),
  toggleTask: (id: number, completed: boolean) => customFetch(`/api/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed })
  }).then(handleResponse),
  deleteTask: (id: number) => customFetch(`/api/tasks/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),

  getAppointments: () => customFetch('/api/appointments').then(handleResponse),
  createAppointment: (apt: any) => customFetch('/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(apt)
  }).then(handleResponse),

  getFollowups: () => customFetch('/api/followups').then(handleResponse),
  createFollowup: (fup: any) => customFetch('/api/followups', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fup)
  }).then(handleResponse),

  getBroadcasts: () => customFetch('/api/broadcasts').then(handleResponse),
  createBroadcast: (broadcast: any) => customFetch('/api/broadcasts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(broadcast)
  }).then(handleResponse),

  getAnalytics: () => customFetch('/api/analytics').then(handleResponse),
  getIncomes: () => customFetch('/api/incomes').then(handleResponse),
  createIncome: (inc: any) => customFetch('/api/incomes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inc)
  }).then(handleResponse),
  getExpenses: () => customFetch('/api/expenses').then(handleResponse),
  createExpense: (exp: any) => customFetch('/api/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(exp)
  }).then(handleResponse),
  getSites: () => customFetch('/api/sites').then(handleResponse),
  getMilestones: () => customFetch('/api/milestones').then(handleResponse),
  createMilestone: (m: any) => customFetch('/api/milestones', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(m)
  }).then(handleResponse),
  deleteMilestone: (id: number) => customFetch(`/api/milestones/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),
  getDprs: () => customFetch('/api/dprs').then(handleResponse),
  createDpr: (d: any) => customFetch('/api/dprs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(d)
  }).then(handleResponse),
  deleteDpr: (id: number) => customFetch(`/api/dprs/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),
  deleteIncome: (id: number) => customFetch(`/api/incomes/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),
  deleteExpense: (id: number) => customFetch(`/api/expenses/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),
};
