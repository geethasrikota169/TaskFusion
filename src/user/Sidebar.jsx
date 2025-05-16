import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';
import Itasks from '../assets/icons/Itasks.png';
import Iteams from '../assets/icons/Iteams.png';
import Icalendar from '../assets/icons/Icalendar.png';
import Ipomodoro from '../assets/icons/Ipomodoro.png';
import Isearch from '../assets/icons/Isearch.png';
import Ibin from '../assets/icons/Ibin.png';
import Idashboard from '../assets/icons/Idashboard.png';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <Link to="/userhome" className="sidebar-icon"> {/* Updated route */}
        <img src={Idashboard} alt="Dashboard Icon" className="icon dashboard-icon-sidebar" />
      </Link>
      <Link to="/usertasks" className="sidebar-icon">
        <img src={Itasks} alt="Tasks Icon" className="icon task-icon-sidebar" />
      </Link>
      <Link to="/teamtasks" className="sidebar-icon">
        <img src={Iteams} alt="Teams Icon" className="icon teams-icon-sidebar" />
      </Link>
      <Link to="/calendar" className="sidebar-icon">
        <img src={Icalendar} alt="Calendar Icon" className="icon calendar-icon-sidebar" />
      </Link>
      <Link to="/pomodoro" className="sidebar-icon">
        <img src={Ipomodoro} alt="Pomodoro Icon" className="icon pomodoro-icon-sidebar" />
      </Link>
      <div className="sidebar-icon">
        <img src={Isearch} alt="Search Icon" className="icon search-icon-sidebar" />
      </div>
      <div className="sidebar-icon">
        <img src={Ibin} alt="Trash Icon" className="icon trash-icon-sidebar" />
      </div>
    </div>
  );
};

export default Sidebar;