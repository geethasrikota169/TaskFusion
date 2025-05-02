import React from 'react';
import { useAuth } from '../contextapi/AuthContext';
import './UserHome.css'; 
import Ichecklist from '../assets/icons/Ichecklist.png';
import Inotes from '../assets/icons/Inotes.png';
import Itodolist from '../assets/icons/Itodolist.png';
import Iworkinprogress from '../assets/icons/Iworkinprogress.png';

export default function UserHome() {
  const { userData } = useAuth(); // Get user data from context

  return (
    <div className="user-dashboard">
      <div className="task-stats horizontal">
        <div className="task-card">
          <h3 className="task-title total-title">Total Tasks</h3>
          <div className="task-card-content">
            <p className="tasks-count">50</p>
            <img src={Inotes} alt="Notes Icon" className="task-icon" />
          </div>
        </div>
        <div className="task-card">
          <h3 className="task-title completed-title">Completed Tasks</h3>
          <div className="task-card-content">
            <p className="tasks-count">20</p>
            <img src={Ichecklist} alt="Checklist Icon" className="task-icon" />
          </div>
        </div>
        <div className="task-card">
          <h3 className="task-title inprogress-title">In Progress Tasks</h3>
          <div className="task-card-content">
            <p className="tasks-count">15</p>
            <img src={Iworkinprogress} alt="Work in Progress Icon" className="task-icon" />
          </div>
        </div>
        <div className="task-card">
          <h3 className="task-title todo-title">To Do's</h3>
          <div className="task-card-content">
            <p className="tasks-count">15</p>
            <img src={Itodolist} alt="To-Do List Icon" className="task-icon" />
          </div>
        </div>
      </div>

      <div className="task-graph">
        <h2>Welcome, {userData?.name || 'User'}!</h2>
      </div>
    </div>
  );
}