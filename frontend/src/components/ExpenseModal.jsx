import { useState } from 'react';

const CATEGORIES = [
  { value: 'FIXED', label: 'Contas Fixas' },
  { value: 'ESSENTIAL', label: 'Essenciais' },
  { value: 'OTHER', label: 'Outros / Supérfluos' },
];

function toInputDate(dateStr) {
  const d = new Date(dateStr);
  return d.toISOString().slice(0, 10);
}

export default function ExpenseModal({ expense, onClose, onSave }) {
  const [form, setForm] = useState({
    description: expense.description,
    amount: String(expense.amount),
    category: expense.category,
    date: toInputDate(expense.date),
  });
  const [error, setError] = useState('');

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validateAmount(val) {
    if (val === '') return true;
    return /^\d+([.,]\d{0,2})?$/.test(val);
  }

  function handleSave() {
    setError('');
    if (!form.description.trim()) return setError('Informe a descrição.');
    const amount = parseFloat(form.amount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) return setError('Valor inválido.');

    onSave(expense.id, {
      description: form.description.trim(),
      amount,
      category: form.category,
      date: form.date,
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">Editar Gasto</h3>

        <div className="form-group">
          <label className="form-label">Descrição</label>
          <input
            type="text"
            className="input"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Valor (R$)</label>
          <input
            type="text"
            inputMode="decimal"
            className="input"
            value={form.amount}
            onChange={(e) => {
              if (validateAmount(e.target.value)) set('amount', e.target.value);
            }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Data</label>
          <input
            type="date"
            className="input"
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Categoria</label>
          <select
            className="input"
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="error-msg">{error}</p>}

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}