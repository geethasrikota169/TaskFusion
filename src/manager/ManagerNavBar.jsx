import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contextapi/AuthContext';
import { useState } from 'react';
import './ManagerNavBar.css'; 
import taskfusionlogo from '../assets/taskfusion-logo.png';
import notificationicon from '../assets/active.png';
import defaultProfile from '../assets/defaultacc.jpg';
import ManagerHome from './ManagerHome';
import ManagerProfile from './ManagerProfile';
import ManagerLogin from './ManagerLogin';
import ManagerSidebar from './ManagerSidebar'; 
import Pomodoro from '../user/Pomodoro';
import ManagerTasks from './ManagerTasks'; 
import { ManagerTaskProvider } from './ManagerTaskContext';
import TeamTasksPage from '../user/TeamTasksPage';

export default function ManagerNavBar() {
  const { setIsManagerLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    setIsManagerLoggedIn(false);
    navigate('/managerlogin');
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div>
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <img src={taskfusionlogo} alt="App Logo" className="app-icon" />
        </div>
        <div className="header-right">
          <img src={notificationicon} alt="Notifications" className="notif-icon" />
          <div className="navbar-profile-container">
            <img 
              src={defaultProfile} 
              alt="Profile" 
              className="profile-image"
            />
            <div className="manager-dropdown">
              <button onClick={toggleDropdown} className="manager-dropdown-toggle">
                ▼
              </button>
              {dropdownOpen && (
                <div className="manager-dropdown-menu">
                  <Link 
                    to="/managerprofile" 
                    className="manager-dropdown-item" 
                    onClick={() => setDropdownOpen(false)}
                  >
                    My Profile
                  </Link>
                  <div 
                    className="manager-dropdown-item" 
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                  >
                    Logout
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <ManagerSidebar />

      {/* Routes */}
      <ManagerTaskProvider>
        <Routes>
          <Route path="/managerhome" element={<ManagerHome />} exact />
          <Route path="/managerprofile" element={<ManagerProfile />} exact />
          <Route path="/managerlogin" element={<ManagerLogin />} exact />
          <Route path="/pomodoro" element={<Pomodoro />} exact />
          <Route path="/manager-tasks" element={<ManagerTasks/>} />
          <Route path="/teamtasks" element={<TeamTasksPage/>} />
        </Routes>
      </ManagerTaskProvider>
    </div>
  );
}