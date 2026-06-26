import { NavLink, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          + Adicionar
        </NavLink>
        <NavLink to="/mes" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Mês Atual
        </NavLink>
        <NavLink to="/historico" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Histórico
        </NavLink>
      </div>
      <button className="btn-logout" onClick={handleLogout}>
        Sair
      </button>
    </nav>
  );
}