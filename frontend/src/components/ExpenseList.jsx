import { useState } from 'react';
import ExpenseModal from './ExpenseModal';

const CATEGORY_LABELS = {
  FIXED: 'Fixa',
  ESSENTIAL: 'Essencial',
  OTHER: 'Outros',
};

const CATEGORY_COLORS = {
  FIXED: '#3b82f6',
  ESSENTIAL: '#22c55e',
  OTHER: '#f59e0b',
};

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

export default function ExpenseList({ expenses, onUpdate, onDelete, readOnly }) {
  const [editing, setEditing] = useState(null);

  return (
    <div className="expense-list">
      {expenses.length === 0 && (
        <p className="empty-msg">Nenhum gasto cadastrado neste mês.</p>
      )}
      {expenses.map((exp) => (
        <div key={exp.id} className="expense-item">
          <div className="expense-info">
            <span className="expense-description">{exp.description}</span>
            <span
              className="expense-badge"
              style={{ backgroundColor: CATEGORY_COLORS[exp.category] }}
            >
              {CATEGORY_LABELS[exp.category]}
            </span>
            <span className="expense-date">{formatDate(exp.date)}</span>
          </div>
          <div className="expense-right">
            <span className="expense-amount">{formatCurrency(exp.amount)}</span>
            {!readOnly && (
              <div className="expense-actions">
                <button className="btn-icon" onClick={() => setEditing(exp)} title="Editar">
                  ✏️
                </button>
                <button
                  className="btn-icon btn-delete"
                  onClick={() => onDelete(exp.id)}
                  title="Excluir"
                >
                  🗑️
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      {editing && (
        <ExpenseModal
          expense={editing}
          onClose={() => setEditing(null)}
          onSave={(id, data) => {
            onUpdate(id, data);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}