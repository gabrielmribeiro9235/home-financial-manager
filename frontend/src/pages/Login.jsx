import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { token } = await login(password);
      localStorage.setItem('token', token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">💰 Gastos Casa</h1>
        <p className="login-subtitle">Digite a senha para acessar</p>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            autoFocus
          />
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}