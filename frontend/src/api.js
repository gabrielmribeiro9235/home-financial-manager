const BASE = import.meta.env.VITE_API_URL;

function getToken() {
  return localStorage.getItem('token');
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Erro desconhecido');
  }

  return data;
}

// Auth
export const login = (password) =>
  request('POST', '/api/auth/login', { password });

// Gastos
export const getMonthlyExpenses = (month) =>
  request('GET', `/api/expenses?month=${month}`);

export const getMonths = () =>
  request('GET', '/api/expenses/months');

export const createExpense = (data) =>
  request('POST', '/api/expenses', data);

export const updateExpense = (id, data) =>
  request('PUT', `/api/expenses/${id}`, data);

export const deleteExpense = (id) =>
  request('DELETE', `/api/expenses/${id}`);