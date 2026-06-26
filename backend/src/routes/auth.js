const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Senha obrigatória' });
  }

  const isValid = await bcrypt.compare(password, process.env.PASSWORD_HASH);

  if (!isValid) {
    return res.status(401).json({ error: 'Senha incorreta' });
  }

  const token = jwt.sign({ user: 'owner' }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  return res.json({ token });
});

module.exports = router;