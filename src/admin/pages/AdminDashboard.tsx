import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/admin/context/AdminAuthContext';
import Money from '@/pages/Money/Money';
import Studies from '@/pages/Studies/Studies';
import Work from '@/pages/Work/Work';
import AdminVisa from '@/pages/Admin/Admin';
import './AdminDashboard.css';

type TabType = 'money' | 'studies' | 'work' | 'admin';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('money');
  const navigate = useNavigate();
  const { adminLogout, adminEmail } = useAdminAuth();

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const renderModuleContent = () => {
    switch (activeTab) {
      case 'money':
        return <Money />;
      case 'studies':
        return <Studies />;
      case 'work':
        return <Work />;
      case 'admin':
        return <AdminVisa />;
      default:
        return <Money />;
    }
  };

  return (
    <div className="admin-dashboard-container">
      <header className="admin-header">
        <div className="admin-header-left">
          <h1>Admin Dashboard</h1>
          <p className="admin-email">Logged in as: {adminEmail}</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <div className="admin-content">
        <nav className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'money' ? 'active' : ''}`}
            onClick={() => setActiveTab('money')}
          >
            💰 Money
          </button>
          <button
            className={`tab-btn ${activeTab === 'studies' ? 'active' : ''}`}
            onClick={() => setActiveTab('studies')}
          >
            📚 Studies
          </button>
          <button
            className={`tab-btn ${activeTab === 'work' ? 'active' : ''}`}
            onClick={() => setActiveTab('work')}
          >
            💼 Work
          </button>
          <button
            className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            📋 Admin
          </button>
        </nav>

        <div className="admin-module-content">
          {renderModuleContent()}
        </div>
      </div>
    </div>
  );
}
