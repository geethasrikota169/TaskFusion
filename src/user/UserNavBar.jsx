import { Routes, Route, Link } from 'react-router-dom';
import './user.css';
import UserHome from './UserHome';
import UserProfile from './UserProfile';
import UserLogin from './UserLogin';
import { useAuth } from '../contextapi/AuthContext';

export default function UserNavBar() 
{
  const { setIsUserLoggedIn } = useAuth(); 

  const handleLogout = () => 
  {
    setIsUserLoggedIn(false);
  };

  return (
    <div>
      <nav className="navbar">
        <div className="logo">Welcome Admin</div>
        <ul className="nav-links">
          <li><Link to="/userhome">Home</Link></li>
          <li><Link to="/userprofile">User Profile</Link></li>
          <li><Link to="/userlogin" onClick={handleLogout}>Logout</Link></li>
        </ul>
      </nav>

      <Routes>
        <Route path="/userhome" element={<UserHome />} exact />
        <Route path="/userprofile" element={<UserProfile />} exact />
        <Route path="/userlogin" element={<UserLogin />} exact />
      </Routes>
    </div>
  );
}