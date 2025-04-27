import { Routes, Route, Link } from 'react-router-dom';
import './manager.css';
import ManagerHome from './ManagerHome';
import ManagerProfile from './ManagerProfile';
import ManagerLogin from './ManagerLogin';
import { useAuth } from '../contextapi/AuthContext';

export default function ManagerNavBar() 
{
  const { setIsManagerLoggedIn } = useAuth(); 

  const handleLogout = () => 
 {
  setIsManagerLoggedIn(false);
  };

  return (
    <div>
      <nav className="navbar">
        <div className="logo">Welcome Event Manager</div>
        <ul className="nav-links">
          <li><Link to="/managerhome">Home</Link></li>
          <li><Link to="/managerprofile">Manager Profile</Link></li>
          <li><Link to="/managerlogin" onClick={handleLogout}>Logout</Link></li>
        </ul>
      </nav>

      <Routes>
        <Route path="/managerhome" element={<ManagerHome />} exact />
        <Route path="/managerprofile" element={<ManagerProfile/>} exact />
        <Route path="/managerlogin" element={<ManagerLogin/>} exact />
      </Routes>
    </div>
  );
}