import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="logo-dot" />
        Task Management System
      </div>
      {user && (
        <div className="navbar-right">
          <span className="navbar-user">
            {user.name}
            <span className="navbar-role-badge">{user.role}</span>
          </span>
          <button className="btn btn-outline btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
