import { Routes, Route, Link } from 'react-router-dom';
import './admin.css';
import AdminHome from './AdminHome';
import AddManager from './AddManager';
import ViewManagers from './ViewManagers';
import ViewUsers from './ViewUsers';
import AdminLogin from './AdminLogin';
import { useAuth } from '../contextapi/AuthContext';
import taskfusionLogo from '../assets/taskfusion-logo.png'; 

export default function AdminNavBar() {
  const { setIsAdminLoggedIn } = useAuth();

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
  };

  return (
    <div className="admin-layout">
      <nav className="adminnavbar">
        <div className="profile-app-logo">
          <img src={taskfusionLogo} alt="TaskFusion Logo" className="taskfusion-logo" />
        </div>
        <div className="admin-nav-links">
          <Link to="/adminhome" className="admin-nav-link">Home</Link>
          <Link to="/adminlogin" className="admin-nav-link" onClick={handleLogout}>Logout</Link>
        </div>
      </nav>

      <aside className="admin-sidebar">
        <div className="admin-sidebar-links">
          <div className="admin-sidebar-link">
            <Link to="/addmanager" className="sidebar-link-text">Add Managers</Link>
          </div>
          <div className="admin-sidebar-link">
            <Link to="/viewmanagers" className="sidebar-link-text">View All Managers</Link>
          </div>
          <div className="admin-sidebar-link">
            <Link to="/viewallusers" className="sidebar-link-text">View All Users</Link>
          </div>
        </div>
      </aside>

      <main className="admin-main-content">
        <Routes>
          <Route path="/adminhome" element={<AdminHome />} exact />
          <Route path="/addmanager" element={<AddManager />} exact />
          <Route path="/viewmanagers" element={<ViewManagers />} exact />
          <Route path="/viewallusers" element={<ViewUsers />} exact />
          <Route path="/adminlogin" element={<AdminLogin />} exact />
        </Routes>
      </main>
    </div>
  );
}