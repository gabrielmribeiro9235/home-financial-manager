import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getMonthlyExpenses, deleteExpense, updateExpense } from '../api';
import ExpenseList from '../components/ExpenseList';

const COLORS = { FIXED: '#3b82f6', ESSENTIAL: '#22c55e', OTHER: '#f59e0b' };
const LABELS = { FIXED: 'Contas Fixas', ESSENTIAL: 'Essenciais', OTHER: 'Outros/Supérfluos' };

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatMonthLabel(month) {
  const [year, m] = month.split('-');
  const d = new Date(parseInt(year), parseInt(m) - 1, 1);
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

export default function MonthlyView() {
  const { month: paramMonth } = useParams();
  const navigate = useNavigate();
  const month = paramMonth || getCurrentMonth();
  const isHistory = Boolean(paramMonth);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getMonthlyExpenses(month);
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id) {
    if (!confirm('Excluir este gasto?')) return;
    try {
      await deleteExpense(id);
      await load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleUpdate(id, formData) {
    try {
      await updateExpense(id, formData);
      await load();
    } catch (err) {
      alert(err.message);
    }
  }

  const pieData = data
    ? Object.entries(LABELS)
        .map(([key, name]) => ({ name, value: data.summary[key] || 0, color: COLORS[key] }))
        .filter((d) => d.value > 0)
    : [];

  return (
    <div className="page">
      {isHistory && (
        <button className="btn-back" onClick={() => navigate('/historico')}>
          ← Voltar ao Histórico
        </button>
      )}

      <h2 className="page-title">
        {isHistory ? formatMonthLabel(month) : `Mês Atual — ${formatMonthLabel(month)}`}
      </h2>

      {loading && <p className="loading-msg">Carregando...</p>}
      {error && <p className="error-msg">{error}</p>}

      {data && !loading && (
        <>
          <div className="summary-cards">
            <div className="summary-card total">
              <span className="summary-card-label">Total</span>
              <span className="summary-card-value">{formatCurrency(data.summary.total)}</span>
            </div>
            <div className="summary-card fixed">
              <span className="summary-card-label">Contas Fixas</span>
              <span className="summary-card-value">{formatCurrency(data.summary.FIXED)}</span>
            </div>
            <div className="summary-card essential">
              <span className="summary-card-label">Essenciais</span>
              <span className="summary-card-value">{formatCurrency(data.summary.ESSENTIAL)}</span>
            </div>
            <div className="summary-card other">
              <span className="summary-card-label">Outros</span>
              <span className="summary-card-value">{formatCurrency(data.summary.OTHER)}</span>
            </div>
          </div>

          {pieData.length > 0 && (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <h3 className="section-title">Todos os gastos</h3>
          <ExpenseList
            expenses={data.expenses}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
            readOnly={false}
          />
        </>
      )}
    </div>
  );
}