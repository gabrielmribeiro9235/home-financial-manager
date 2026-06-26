import { useState } from 'react';
import { createExpense } from '../api';

const CATEGORIES = [
  { value: 'FIXED', label: 'Contas Fixas', sublabel: 'água, luz, telefone...' },
  { value: 'ESSENTIAL', label: 'Essenciais', sublabel: 'mercado, farmácia, limpeza...' },
  { value: 'OTHER', label: 'Outros / Supérfluos', sublabel: 'lazer, restaurante...' },
];

const EMPTY = { description: '', amount: '', category: '', date: '' };

export default function AddExpense() {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validateAmount(val) {
    if (val === '') return true;
    return /^\d+([.,]\d{0,2})?$/.test(val);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.description.trim()) return setError('Informe o que foi o gasto.');
    if (!form.amount) return setError('Informe o valor.');
    if (!form.category) return setError('Selecione uma categoria.');

    const amount = parseFloat(form.amount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) return setError('Valor inválido.');

    setLoading(true);
    try {
      await createExpense({
        description: form.description.trim(),
        amount,
        category: form.category,
        date: form.date || undefined,
      });
      setSuccess('Gasto cadastrado com sucesso!');
      setForm(EMPTY);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h2 className="page-title">Novo Gasto</h2>
      <form onSubmit={handleSubmit} className="expense-form">

        <div className="form-group">
          <label className="form-label">O que foi?</label>
          <input
            type="text"
            className="input"
            placeholder="Ex: Conta de luz, Supermercado..."
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Quanto? (R$)</label>
          <input
            type="text"
            inputMode="decimal"
            className="input"
            placeholder="0,00"
            value={form.amount}
            onChange={(e) => {
              if (validateAmount(e.target.value)) set('amount', e.target.value);
            }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Data (opcional, padrão: hoje)</label>
          <input
            type="date"
            className="input"
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Categoria</label>
          <div className="category-options">
            {CATEGORIES.map((cat) => (
              <label
                key={cat.value}
                className={`category-option ${form.category === cat.value ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="category"
                  value={cat.value}
                  checked={form.category === cat.value}
                  onChange={() => set('category', cat.value)}
                  className="radio-hidden"
                />
                <span className="category-label">{cat.label}</span>
                <span className="category-sublabel">{cat.sublabel}</span>
              </label>
            ))}
          </div>
        </div>

        {error && <p className="error-msg">{error}</p>}
        {success && <p className="success-msg">{success}</p>}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Gasto'}
        </button>
      </form>
    </div>
  );
}