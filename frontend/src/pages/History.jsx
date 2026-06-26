import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMonths } from '../api';

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatMonthLabel(month) {
  const [year, m] = month.split('-');
  const d = new Date(parseInt(year), parseInt(m) - 1, 1);
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

export default function History() {
  const [months, setMonths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const data = await getMonths();
        setMonths(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="page">
      <h2 className="page-title">Histórico de Meses</h2>

      {loading && <p className="loading-msg">Carregando...</p>}
      {error && <p className="error-msg">{error}</p>}

      {!loading && months.length === 0 && (
        <p className="empty-msg">Nenhum gasto cadastrado ainda.</p>
      )}

      <div className="history-list">
        {months.map((item) => (
          <button
            key={item.month}
            className="history-item"
            onClick={() => navigate(`/historico/${item.month}`)}
          >
            <div className="history-month">{formatMonthLabel(item.month)}</div>
            <div className="history-breakdown">
              <span className="badge-fixed">Fixas: {formatCurrency(item.FIXED)}</span>
              <span className="badge-essential">Essenc.: {formatCurrency(item.ESSENTIAL)}</span>
              <span className="badge-other">Outros: {formatCurrency(item.OTHER)}</span>
            </div>
            <div className="history-total">{formatCurrency(item.total)}</div>
          </button>
        ))}
      </div>
    </div>
  );
}