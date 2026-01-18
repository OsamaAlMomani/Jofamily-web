import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/admin/context/AdminAuthContext';
import './AdminHome.css';

export function AdminHome() {
  const navigate = useNavigate();
  const { adminLogout, adminEmail } = useAdminAuth();

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const modules = [
    {
      id: 'money',
      name: 'Money Management',
      icon: '💰',
      description: 'Track income, expenses, and financial planning',
      color: 'money'
    },
    {
      id: 'studies',
      name: 'Studies Tracker',
      icon: '📚',
      description: 'Manage academic tasks and learning progress',
      color: 'studies'
    },
    {
      id: 'work',
      name: 'Work Schedule',
      icon: '💼',
      description: 'Monitor shifts and work history',
      color: 'work'
    },
    {
      id: 'admin',
      name: 'Documents',
      icon: '📋',
      description: 'Administrative documents and records',
      color: 'admin'
    }
  ];

  return (
    <div className="admin-home-container">
      <header className="admin-home-header">
        <div className="admin-home-header-left">
          <h1>Admin Portal</h1>
          <p className="admin-home-email">Welcome, {adminEmail}</p>
        </div>
        <button className="admin-home-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <div className="admin-home-content">
        <div className="admin-home-welcome">
          <h2>System Overview</h2>
          <p>Access and manage all ERP modules from one unified admin dashboard</p>
        </div>

        <div className="admin-home-modules">
          {modules.map((module) => (
            <div key={module.id} className={`module-card ${module.color}`}>
              <div className="module-icon">{module.icon}</div>
              <h3>{module.name}</h3>
              <p>{module.description}</p>
              <button
                className="module-btn"
                onClick={() => navigate('/admin/dashboard')}
              >
                Access Module →
              </button>
            </div>
          ))}
        </div>

        <button
          className="full-dashboard-btn"
          onClick={() => navigate('/admin/dashboard')}
        >
          Open Full Dashboard
        </button>
      </div>
    </div>
  );
}
