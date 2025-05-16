import React from 'react';
import { Link } from 'react-router-dom';
import './ManagerSidebar.css';
import Itasks from '../assets/icons/Itasks.png';
import Iteams from '../assets/icons/Iteams.png';
import Icalendar from '../assets/icons/Icalendar.png';
import Ipomodoro from '../assets/icons/Ipomodoro.png';
import Isearch from '../assets/icons/Isearch.png';
import Ibin from '../assets/icons/Ibin.png';
import Idashboard from '../assets/icons/Idashboard.png';

const ManagerSidebar = () => {
  return (
    <div className="m-sidebar">
      <Link to="/managerhome" className="m-sidebar-icon">
        <img src={Idashboard} alt="Dashboard Icon" className="m-icon m-dashboard-icon-sidebar" />
      </Link>
      <Link to="/manager-tasks" className="m-sidebar-icon">
        <img src={Itasks} alt="Tasks Icon" className="m-icon m-task-icon-sidebar" />
      </Link>
      <Link to="/teamtasks" className="m-sidebar-icon">
        <img src={Iteams} alt="Teams Icon" className="m-icon m-teams-icon-sidebar" />
      </Link>
      <Link to="/managercalendar" className="m-sidebar-icon">
        <img src={Icalendar} alt="Calendar Icon" className="m-icon m-calendar-icon-sidebar" />
      </Link>
      <Link to="/pomodoro" className="m-sidebar-icon">
        <img src={Ipomodoro} alt="Pomodoro Icon" className="m-icon m-pomodoro-icon-sidebar" />
      </Link>
      <div className="m-sidebar-icon">
        <img src={Isearch} alt="Search Icon" className="m-icon m-search-icon-sidebar" />
      </div>
      <div className="m-sidebar-icon">
        <img src={Ibin} alt="Trash Icon" className="m-icon m-trash-icon-sidebar" />
      </div>
    </div>
  );
};

export default ManagerSidebar;