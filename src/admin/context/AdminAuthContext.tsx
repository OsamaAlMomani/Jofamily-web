import React, { createContext, useContext, useState } from 'react';

// Hardcoded admin email - no database needed
const ADMIN_EMAIL = 'momani.322.44157@gmail.com';

interface AdminAuthContextType {
  isAdminLoggedIn: boolean;
  adminEmail: string | null;
  adminLogin: (email: string, password: string) => boolean;
  adminLogout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  const adminLogin = (email: string, password: string): boolean => {
    // Simple check: email must match and password must be non-empty
    // In production, you'd hash the password
    if (email === ADMIN_EMAIL && password.length > 0) {
      setIsAdminLoggedIn(true);
      setAdminEmail(email);
      localStorage.setItem('adminSession', JSON.stringify({ email, timestamp: Date.now() }));
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdminLoggedIn(false);
    setAdminEmail(null);
    localStorage.removeItem('adminSession');
  };

  // Check if already logged in (on mount/refresh)
  React.useEffect(() => {
    const session = localStorage.getItem('adminSession');
    if (session) {
      try {
        const data = JSON.parse(session);
        if (data.email === ADMIN_EMAIL) {
          setIsAdminLoggedIn(true);
          setAdminEmail(data.email);
        }
      } catch (e) {
        localStorage.removeItem('adminSession');
      }
    }
  }, []);

  return (
    <AdminAuthContext.Provider value={{ isAdminLoggedIn, adminEmail, adminLogin, adminLogout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
