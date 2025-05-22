import React, { useContext, useEffect, useState } from 'react';
import { useAuth } from '../contextapi/AuthContext';
import { TaskContext } from './TaskContext';
import axios from 'axios';
import config from '../config';
import './UserHome.css';
import Ichecklist from '../assets/icons/Ichecklist.png';
import Inotes from '../assets/icons/Inotes.png';
import Itodolist from '../assets/icons/Itodolist.png';
import Iworkinprogress from '../assets/icons/Iworkinprogress.png';

export default function UserHome() {
  const { userData } = useAuth();
  const { tasks, fetchAllTasks } = useContext(TaskContext);
  const [loading, setLoading] = useState(true);
  const [assignedTasks, setAssignedTasks] = useState([]);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        await fetchAllTasks();
        const response = await axios.get(
          `${config.url}/assignments/user?username=${userData.username}`,
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

  const myPersonalTasks = tasks.filter(task => 
    !task.isAssigned && (!task.assignedTo || task.assignedTo === userData?.username)
  );
  
  const tasksAssignedToMe = assignedTasks;

  const totalPersonalTasks = myPersonalTasks.length;
  const completedPersonalTasks = myPersonalTasks.filter(task => 
    task.status === 'completed'
  ).length;
  const inProgressPersonalTasks = myPersonalTasks.filter(task => 
    task.status === 'inprogress'
  ).length;
  const totalAssignedToMe = tasksAssignedToMe.length;

  if (loading) {
    return <div className="user-dashboard">Loading task data...</div>;
  }

  return (
    <div className="user-dashboard">
      <div className="task-stats horizontal">
        <div className="task-card">
          <h3 className="task-title todo-title">My Tasks</h3>
          <div className="task-card-content">
            <p className="tasks-count">{totalPersonalTasks}</p>
            <img src={Itodolist} alt="Todo List Icon" className="task-icon" />
          </div>
        </div>
        <div className="task-card">
          <h3 className="task-title completed-title">Completed</h3>
          <div className="task-card-content">
            <p className="tasks-count">{completedPersonalTasks}</p>
            <img src={Ichecklist} alt="Checklist Icon" className="task-icon" />
          </div>
        </div>
        <div className="task-card">
          <h3 className="task-title inprogress-title">In Progress</h3>
          <div className="task-card-content">
            <p className="tasks-count">{inProgressPersonalTasks}</p>
            <img src={Iworkinprogress} alt="Work in Progress Icon" className="task-icon" />
          </div>
        </div>
        <div className="task-card">
          <h3 className="task-title total-title">Assigned To Me</h3>
          <div className="task-card-content">
            <p className="tasks-count">{totalAssignedToMe}</p>
            <img src={Inotes} alt="Notes Icon" className="task-icon" />
          </div>
        </div>
      </div>

      <div className="task-graph">
        <h2>Welcome, {userData?.name || 'User'}!</h2>
        <p className="task-summary">
          You have {totalPersonalTasks} personal tasks ({inProgressPersonalTasks} in progress) 
          and {totalAssignedToMe} tasks assigned by your manager.
        </p>
      </div>
    </div>
  );
}