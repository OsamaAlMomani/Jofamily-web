import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import CreateAcc from './pages/CreateAcc/CreateAcc';
import RTCPractice from './pages/RTCPractice/RTCPractice';
import Rooms from './pages/Rooms/Rooms';
import Chat from './pages/Chat/Chat';
import Calendar from './pages/Calendar/Calendar';
import Tasks from './pages/Tasks/Tasks';
import Budget from './pages/Budget/Budget';
import Safety from './pages/Safety/Safety';
import Dashboard from './pages/Dashboard/Dashboard';
import Money from './pages/Money/Money';
import Studies from './pages/Studies/Studies';
import Work from './pages/Work/Work';
import AdminVisa from './pages/Admin/Admin';
import Logout from './pages/Logout/Logout';
import ProtectedRoute from './components/ProtectedRoute';
import { AdminAuthProvider, AdminLogin, AdminHome, AdminDashboard, AdminProtectedRoute } from './admin';
import './styles/App.css';

function App() {
  return (
    <AdminAuthProvider>
      <div className='lego_yellow'>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/signup" element={<CreateAcc />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/rtc-practice/:roomId?" element={<RTCPractice />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/safety" element={<Safety />} />
          
          {/* Admin Portal Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminHome />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />

          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          {/* Dashboard-scoped ERP routes */}
          <Route
            path="/dashboard/money"
            element={
              <ProtectedRoute>
                <Money />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/studies"
            element={
              <ProtectedRoute>
                <Studies />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/work"
            element={
              <ProtectedRoute>
                <Work />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute>
                <AdminVisa />
              </ProtectedRoute>
            }
          />

          {/* Redirect legacy paths to dashboard namespace */}
          <Route path="/money" element={<Navigate to="/dashboard/money" replace />} />
          <Route path="/studies" element={<Navigate to="/dashboard/studies" replace />} />
          <Route path="/work" element={<Navigate to="/dashboard/work" replace />} />
          <Route path="/admin" element={<Navigate to="/dashboard/admin" replace />} />
        </Routes>
      </div>
    </AdminAuthProvider>
  )
}

export default App
