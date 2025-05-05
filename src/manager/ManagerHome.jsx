import React from 'react';
import { useAuth } from '../contextapi/AuthContext';
import './ManagerHome.css'; 
import Ichecklist from '../assets/icons/Ichecklist.png';
import Inotes from '../assets/icons/Inotes.png';
import Itodolist from '../assets/icons/Itodolist.png';
import Iworkinprogress from '../assets/icons/Iworkinprogress.png';

export default function ManagerHome() {
  const { userData } = useAuth(); 

  return (
    <div className="manager-dashboard">
      <div className="m-task-stats horizontal">
        <div className="m-task-card">
          <h3 className="m-task-title m-total-title">Total Tasks</h3>
          <div className="m-task-card-content">
            <p className="m-tasks-count">50</p>
            <img src={Inotes} alt="Notes Icon" className="m-task-icon" />
          </div>
        </div>
        <div className="m-task-card">
          <h3 className="m-task-title m-completed-title">Completed Tasks</h3>
          <div className="m-task-card-content">
            <p className="m-tasks-count">20</p>
            <img src={Ichecklist} alt="Checklist Icon" className="m-task-icon" />
          </div>
        </div>
        <div className="m-task-card">
          <h3 className="m-task-title m-inprogress-title">In Progress Tasks</h3>
          <div className="m-task-card-content">
            <p className="m-tasks-count">15</p>
            <img src={Iworkinprogress} alt="Work in Progress Icon" className="m-task-icon" />
          </div>
        </div>
        <div className="m-task-card">
          <h3 className="m-task-title m-todo-title">To Do's</h3>
          <div className="m-task-card-content">
            <p className="m-tasks-count">15</p>
            <img src={Itodolist} alt="To-Do List Icon" className="m-task-icon" />
          </div>
        </div>
      </div>

      <div className="m-task-graph">
        <h2>Welcome Manager, {userData?.name || 'Manager'}!</h2>
      </div>
    </div>
  );
}