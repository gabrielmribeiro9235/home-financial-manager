const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

const VALID_CATEGORIES = ['FIXED', 'ESSENTIAL', 'OTHER'];

// Todas as rotas abaixo exigem autenticação
router.use(auth);

// ─────────────────────────────────────────────
// GET /api/expenses/months
// Retorna lista de meses com totais por categoria
// ─────────────────────────────────────────────
router.get('/months', async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      select: { amount: true, category: true, date: true },
      orderBy: { date: 'desc' },
    });

    const monthMap = {};

    for (const expense of expenses) {
      // Formata como "2024-06" usando UTC pra evitar bug de fuso
      const d = new Date(expense.date);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;

      if (!monthMap[key]) {
        monthMap[key] = { month: key, total: 0, FIXED: 0, ESSENTIAL: 0, OTHER: 0 };
      }

      monthMap[key].total += expense.amount;
      monthMap[key][expense.category] += expense.amount;
    }

    const result = Object.values(monthMap).sort((a, b) =>
      b.month.localeCompare(a.month)
    );

    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ─────────────────────────────────────────────
// GET /api/expenses?month=2024-06
// Retorna gastos + resumo de um mês específico
// ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  const { month } = req.query;

  let where = {};

  if (month) {
    const [year, m] = month.split('-').map(Number);
    if (!year || !m || m < 1 || m > 12) {
      return res.status(400).json({ error: 'Mês inválido. Use o formato YYYY-MM' });
    }
    // Filtra pelo intervalo do mês em UTC
    where.date = {
      gte: new Date(Date.UTC(year, m - 1, 1)),
      lt: new Date(Date.UTC(year, m, 1)),
    };
  }

  try {
    const [expenses, groupedSummary] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy: { date: 'desc' },
      }),
      prisma.expense.groupBy({
        by: ['category'],
        where,
        _sum: { amount: true },
      }),
    ]);

    const summary = { FIXED: 0, ESSENTIAL: 0, OTHER: 0, total: 0 };
    for (const row of groupedSummary) {
      const val = row._sum.amount ?? 0;
      summary[row.category] = val;
      summary.total += val;
    }

    return res.json({ expenses, summary });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ─────────────────────────────────────────────
// POST /api/expenses
// Cria um novo gasto
// ─────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { description, amount, category, date } = req.body;

  if (!description || amount === undefined || !category) {
    return res.status(400).json({ error: 'Campos obrigatórios: description, amount, category' });
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: 'O valor deve ser um número positivo' });
  }

  if (!VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: 'Categoria inválida. Use: FIXED, ESSENTIAL ou OTHER' });
  }

  try {
    const expense = await prisma.expense.create({
      data: {
        description: description.trim(),
        amount: parsedAmount,
        category,
        date: date ? new Date(date) : new Date(),
      },
    });

    return res.status(201).json(expense);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ─────────────────────────────────────────────
// PUT /api/expenses/:id
// Atualiza um gasto existente
// ─────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { description, amount, category, date } = req.body;

  const data = {};

  if (description !== undefined) data.description = description.trim();

  if (amount !== undefined) {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'O valor deve ser um número positivo' });
    }
    data.amount = parsedAmount;
  }

  if (category !== undefined) {
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Categoria inválida. Use: FIXED, ESSENTIAL ou OTHER' });
    }
    data.category = category;
  }

  if (date !== undefined) data.date = new Date(date);

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: 'Nenhum campo para atualizar foi enviado' });
  }

  try {
    const expense = await prisma.expense.update({
      where: { id },
      data,
    });

    return res.json(expense);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Gasto não encontrado' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/expenses/:id
// Remove um gasto
// ─────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.expense.delete({ where: { id } });
    return res.json({ ok: true });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Gasto não encontrado' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;