import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from '../contextapi/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './UserNavbar.css'; 
import taskfusionlogo from '../assets/taskfusion-logo.png';
import notificationicon from '../assets/active.png';
import defaultProfile from '../assets/defaultacc.jpg';
import UserHome from './UserHome';
import UserProfile from './UserProfile';
import UserLogin from './UserLogin';
import Sidebar from './Sidebar'; 
import Pomodoro from './Pomodoro';
import Tasks from './Tasks';
import { TaskProvider } from './TaskContext';
import TeamTasksPage from './TeamTasksPage';
import CalendarView from './CalendarView';
import SearchPage from './SearchPage';

export default function UserNavBar() {
  const { setIsUserLoggedIn } = useAuth();
  const { clearAuthData } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    setIsUserLoggedIn(false);
    clearAuthData();
    navigate('/userlogin');
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div>
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
            <div className="user-dropdown">
            <button onClick={toggleDropdown} className="user-dropdown-toggle">
              ▼
            </button>
            {dropdownOpen && (
              <div className="user-dropdown-menu">
                <Link 
                  to="/userprofile" 
                  className="user-dropdown-item" 
                  onClick={() => setDropdownOpen(false)}
                >
                  My Profile
                </Link>
                <div className="user-dropdown-item" 
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

      <Sidebar />

      <TaskProvider>
        <Routes>
          <Route path="/userhome" element={<UserHome />} exact />
          <Route path="/userprofile" element={<UserProfile />} exact />
          <Route path="/userlogin" element={<UserLogin />} exact />
          <Route path="/pomodoro" element={<Pomodoro />} />
          <Route path="/usertasks" element={<Tasks />} />
          <Route path="/teamtasks" element={<TeamTasksPage />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/searchpage" element={<SearchPage />} />
        </Routes>
      </TaskProvider>
    </div>
  );
}