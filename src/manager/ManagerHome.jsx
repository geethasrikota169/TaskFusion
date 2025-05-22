import React, { useContext, useEffect, useState } from 'react';
import { useAuth } from '../contextapi/AuthContext';
import { ManagerTaskContext } from './ManagerTaskContext';
import axios from 'axios';
import config from '../config';
import './ManagerHome.css'; 
import Ichecklist from '../assets/icons/Ichecklist.png';
import Inotes from '../assets/icons/Inotes.png';
import Itodolist from '../assets/icons/Itodolist.png';
import Iworkinprogress from '../assets/icons/Iworkinprogress.png';

export default function ManagerHome() {
  const { userData } = useAuth(); 
  const { tasks, fetchAllTasks } = useContext(ManagerTaskContext);
  const [loading, setLoading] = useState(true);
  const [assignedTasks, setAssignedTasks] = useState([]);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        await fetchAllTasks();
        const response = await axios.get(
          `${config.url}/assignments/manager?username=${userData.username}`,
          { withCredentials: true }
        );
        setAssignedTasks(response.data);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadTasks();
  }, [fetchAllTasks, userData.username]);

  const allTasks = tasks || [];
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = allTasks.filter(task => task.status === 'inprogress').length;
  const tasksAssignedByMe = assignedTasks.length;

  if (loading) {
    return <div className="manager-dashboard">Loading task data...</div>;
  }

  return (
    <div className="manager-dashboard">
      <div className="m-task-stats horizontal">
        <div className="m-task-card">
          <h3 className="m-task-title m-todo-title">My Tasks</h3>
          <div className="m-task-card-content">
            <p className="m-tasks-count">{totalTasks}</p>
            <img src={Itodolist} alt="Todo List Icon" className="m-task-icon" />
          </div>
        </div>
        <div className="m-task-card">
          <h3 className="m-task-title m-completed-title">Completed</h3>
          <div className="m-task-card-content">
            <p className="m-tasks-count">{completedTasks}</p>
            <img src={Ichecklist} alt="Checklist Icon" className="m-task-icon" />
          </div>
        </div>
        <div className="m-task-card">
          <h3 className="m-task-title m-inprogress-title">In Progress</h3>
          <div className="m-task-card-content">
            <p className="m-tasks-count">{inProgressTasks}</p>
            <img src={Iworkinprogress} alt="Work in Progress Icon" className="m-task-icon" />
          </div>
        </div>
        <div className="m-task-card">
          <h3 className="m-task-title m-total-title">Assigned by Me</h3>
          <div className="m-task-card-content">
            <p className="m-tasks-count">{tasksAssignedByMe}</p>
            <img src={Inotes} alt="Notes Icon" className="m-task-icon" />
          </div>
        </div>
      </div>

      <div className="m-task-graph">
        <h2>Welcome Manager, {userData?.name || 'Manager'}!</h2>
        <p className="m-task-summary">
          You have {totalTasks} total tasks: {completedTasks} completed, {inProgressTasks} in progress, 
          and you've assigned {tasksAssignedByMe} tasks to your team.
        </p>
      </div>
    </div>
  );
}