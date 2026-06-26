import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import AddExpense from './pages/AddExpense';
import MonthlyView from './pages/MonthlyView';
import History from './pages/History';
import Navbar from './components/Navbar';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const location = useLocation();
  const isLogin = location.pathname === '/login';
  const token = localStorage.getItem('token');

  return (
    <>
      {!isLogin && token && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <AddExpense />
              </PrivateRoute>
            }
          />
          <Route
            path="/mes"
            element={
              <PrivateRoute>
                <MonthlyView />
              </PrivateRoute>
            }
          />
          <Route
            path="/historico"
            element={
              <PrivateRoute>
                <History />
              </PrivateRoute>
            }
          />
          <Route
            path="/historico/:month"
            element={
              <PrivateRoute>
                <MonthlyView />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}