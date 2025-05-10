import React, { useState, useEffect } from 'react';
import { useAuth } from '../contextapi/AuthContext';
import axios from 'axios';
import config from '../config';
import './TeamTasksPage.css';

const TeamTasksPage = () => {
  const { userData, isManagerLoggedIn } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [activeView, setActiveView] = useState('assigned-tasks');
  const [newTask, setNewTask] = useState({
    userId: '',
    title: '',
    description: '',
    priority: 1,
    deadline: ''
  });
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    deadline: '',
    manager: ''
  });
  const [taskUpdates, setTaskUpdates] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const MAX_TITLE_LENGTH = 20;
  const MAX_DESC_LENGTH = 50;
  const MAX_RESPONSE_LENGTH = 30;

  // Fetch data based on role and active view
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isManagerLoggedIn) {
          const usersResponse = await axios.get(`${config.url}/user/all`, { withCredentials: true });
          setUsers(usersResponse.data);
          
          if (activeView === 'all-users') {
            try {
              const response = await axios.get(`${config.url}/admin/viewallusers`, { withCredentials: true });
              setAllUsers(response.data);
              setError('');
            } catch (err) {
              setError('Failed to fetch users data ... ' + err.message);
            }
          } else if (activeView === 'assigned-tasks') {
            const tasksResponse = await axios.get(
              `${config.url}/assignments/manager?username=${userData.username}`,
              { withCredentials: true }
            );
            setTasks(tasksResponse.data);
          }
        } else {
          const tasksResponse = await axios.get(
            `${config.url}/assignments/user?username=${userData.username}`,
            { withCredentials: true }
          );
          setTasks(tasksResponse.data);
          const uniqueManagers = [...new Set(tasksResponse.data.map(task => task.assignedBy.username))];
          setManagers(uniqueManagers);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to load data. Please try again.");
      }
    };
    fetchData();
  }, [userData, isManagerLoggedIn, activeView]);

  // Apply filters when tasks or filters change
  useEffect(() => {
    if (!isManagerLoggedIn) {
      let result = tasks;
      
      if (filters.status) {
        result = result.filter(task => task.status === filters.status);
      }
      
      if (filters.priority) {
        result = result.filter(task => task.priority.toString() === filters.priority);
      }
      
      if (filters.deadline) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (filters.deadline === 'today') {
          result = result.filter(task => {
            const taskDate = new Date(task.deadline);
            return taskDate.toDateString() === today.toDateString();
          });
        } else if (filters.deadline === 'week') {
          const nextWeek = new Date(today);
          nextWeek.setDate(nextWeek.getDate() + 7);
          result = result.filter(task => {
            const taskDate = new Date(task.deadline);
            return taskDate >= today && taskDate <= nextWeek;
          });
        } else if (filters.deadline === 'overdue') {
          result = result.filter(task => {
            const taskDate = new Date(task.deadline);
            return taskDate < today && task.status !== 'Completed';
          });
        }
      }
      
      if (filters.manager) {
        result = result.filter(task => task.assignedBy.username === filters.manager);
      }
      
      setFilteredTasks(result);
    }
  }, [tasks, filters, isManagerLoggedIn]);

  const handleAssignTask = async () => {
    if (!newTask.userId || !newTask.title) {
      alert("Please select a user and provide a title");
      return;
    }

    try {
      const response = await axios.post(
        `${config.url}/assignments`, 
        newTask, 
        {
          params: { managerUsername: userData.username },
          withCredentials: true
        }
      );
      setTasks([...tasks, response.data]);
      setNewTask({ userId: '', title: '', description: '', priority: 1, deadline: '' });
      setActiveView('assigned-tasks');
      alert("Task assigned successfully!");
    } catch (error) {
      console.error("Error assigning task:", error);
      alert(`Failed to assign task: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleUpdateStatus = async (taskId, status, response = '') => {
    try {
      const res = await axios.put(
        `${config.url}/assignments/${taskId}/status`,
        null,
        { 
          params: { status, response, username: userData.username },
          withCredentials: true
        }
      );
      setTasks(tasks.map(t => t.id === taskId ? res.data : t));
      alert("Status updated successfully!");
    } catch (error) {
      console.error("Error updating status:", error);
      alert(`Failed to update status: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await axios.delete(`${config.url}/assignments/${taskId}`, {
          params: { username: userData.username },
          withCredentials: true
        });
        setTasks(tasks.filter(task => task.id !== taskId));
        setShowTaskModal(false);
        alert("Task deleted successfully!");
      } catch (error) {
        console.error("Error deleting task:", error);
        alert(`Failed to delete task: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleSaveTask = async (taskId) => {
    const update = taskUpdates[taskId];
    if (!update) return;

    try {
      await handleUpdateStatus(taskId, update.status || tasks.find(t => t.id === taskId).status, update.response || '');
      setTaskUpdates(prev => {
        const newUpdates = {...prev};
        delete newUpdates[taskId];
        return newUpdates;
      });
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleTaskUpdate = (taskId, field, value) => {
    setTaskUpdates(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [field]: value
      }
    }));
  };

  const handleTaskDoubleClick = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const handleUpdateTask = async (taskId, updatedTask) => {
  try {
    const response = await axios.put(
      `${config.url}/assignments/${taskId}`,
      updatedTask,
      {
        params: { username: userData.username },
        withCredentials: true
      }
    );
    setTasks(tasks.map(t => t.id === taskId ? response.data : t));
    setShowTaskModal(false);
    alert("Task updated successfully!");
  } catch (error) {
    console.error("Error updating task:", error);
    alert(`Failed to update task: ${error.response?.data?.message || error.message}`);
  }
};

  return (
    <div className="team-tasks-container">
      {isManagerLoggedIn ? (
        <div className="manager-sidebar">
          <h3>Manager Dashboard</h3>
          <ul>
            <li 
              className={activeView === 'all-users' ? 'active' : ''}
              onClick={() => setActiveView('all-users')}
            >
              View All Users
            </li>
            <li 
              className={activeView === 'assign-task' ? 'active' : ''}
              onClick={() => setActiveView('assign-task')}
            >
              Assign New Task
            </li>
            <li 
              className={activeView === 'assigned-tasks' ? 'active' : ''}
              onClick={() => setActiveView('assigned-tasks')}
            >
              Assigned Tasks
            </li>
          </ul>
        </div>
      ) : (
        <div className="user-sidebar">
          <h3>Task Filters</h3>
          <div className="filter-section">
            <h4>Status</h4>
            <select 
              value={filters.status} 
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          
          <div className="filter-section">
            <h4>Priority</h4>
            <select 
              value={filters.priority} 
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="1">Low</option>
              <option value="2">Medium</option>
              <option value="3">High</option>
            </select>
          </div>
          
          <div className="filter-section">
            <h4>Deadline</h4>
            <select 
              value={filters.deadline} 
              onChange={(e) => handleFilterChange('deadline', e.target.value)}
            >
              <option value="">All Deadlines</option>
              <option value="today">Due Today</option>
              <option value="week">Due This Week</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          
          <div className="filter-section">
            <h4>Manager</h4>
            <select 
              value={filters.manager} 
              onChange={(e) => handleFilterChange('manager', e.target.value)}
            >
              <option value="">All Managers</option>
              {managers.map(manager => (
                <option key={manager} value={manager}>{manager}</option>
              ))}
            </select>
          </div>
          
          <button 
            className="clear-filters-btn"
            onClick={() => setFilters({
              status: '',
              priority: '',
              deadline: '',
              manager: ''
            })}
          >
            Clear Filters
          </button>
        </div>
      )}

      <div className="main-content">
        <h2>
          {isManagerLoggedIn 
            ? activeView === 'all-users' 
              ? 'View All Users' 
              : activeView === 'assign-task' 
                ? 'Assign New Task' 
                : 'Assigned Tasks'
            : 'My Assigned Tasks'}
        </h2>
        
        {/* Manager Views */}
        {isManagerLoggedIn && (
          <>
            {/* All Users View */}
            {activeView === 'all-users' && (
              <div className="view-users-container">
                <h3 className="view-users-title">
                  <u>View All Users</u>
                </h3>
                {error ? (
                  <p className="error-message">{error}</p>
                ) : allUsers.length === 0 ? (
                  <p className="no-data-message">No User Data Found</p>
                ) : (
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Gender</th>
                        <th>DOB</th>
                        <th>Email</th>
                        <th>Username</th>
                        <th>Mobile No</th>
                        <th>Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.map((user) => (
                        <tr key={user.id}>
                          <td>{user.id}</td>
                          <td>{user.name}</td>
                          <td>{user.gender}</td>
                          <td>{user.dob}</td>
                          <td>{user.email}</td>
                          <td>{user.username}</td>
                          <td>{user.mobileno}</td>
                          <td>{user.location}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Assign Task Form */}
            {activeView === 'assign-task' && (
              <div className="assignment-form">
                <select
                  value={newTask.userId}
                  onChange={(e) => setNewTask({...newTask, userId: e.target.value})}
                >
                  <option value="">Select Team Member</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Task Title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                />
                <textarea
                  placeholder="Detailed Description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                />
                <div className="form-row">
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: parseInt(e.target.value)})}
                  >
                    <option value="1">Low Priority</option>
                    <option value="2">Medium Priority</option>
                    <option value="3">High Priority</option>
                  </select>
                  <input
                    type="date"
                    value={newTask.deadline}
                    onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
                  />
                </div>
                <button className='assign-task-btn' onClick={handleAssignTask}>Assign Task</button>
              </div>
            )}

            {/* Assigned Tasks View */}
            {activeView === 'assigned-tasks' && (
              <div className="tasks-grid">
                {tasks.map(task => (
                  <div 
                    key={task.id} 
                    className={`ttask-card priority-${task.priority}`}
                    onDoubleClick={() => handleTaskDoubleClick(task)}
                  >
                    <div className="task-header">
                      <span className="task-meta">
                        Assigned to: {task.assignedTo.name}
                      </span>
                      <h3 className="ttask-title" title={task.title}>
                        {truncateText(task.title, 20)}
                      </h3>
                    </div>
                    <div className="task-body">
                      <p title={task.description}>{truncateText(task.description, 50)}</p>
                      <div className="task-details">
                        <span><strong>Deadline:</strong> {new Date(task.deadline).toLocaleDateString()}</span>
                        <span><strong>Status:</strong> {task.status}</span>
                        <span><strong>Priority:</strong> {task.priority === 1 ? 'Low' : task.priority === 2 ? 'Medium' : 'High'}</span>
                      </div>
                      {task.userResponse && (
                        <div className="task-response" title={task.userResponse}>
                          <strong>Response:</strong> {truncateText(task.userResponse, 40)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Regular User View */}
        {!isManagerLoggedIn && (
          <div className="tasks-grid">
            {(filteredTasks.length > 0 ? filteredTasks : tasks).map(task => {
              const update = taskUpdates[task.id] || {};
              const currentStatus = update.status || task.status;
              const currentResponse = update.response || task.userResponse || '';
              
              return (
                <div 
                  key={task.id} 
                  className={`ttask-card priority-${task.priority}`}
                  onDoubleClick={() => handleTaskDoubleClick(task)}
                >
                  <div className="task-header">
                    <h3 title={task.title}>{truncateText(task.title, 20)}</h3>
                    <span className="task-meta">
                      Assigned by: {task.assignedBy.name}
                    </span>
                  </div>
                  <div className="task-body">
                    <p title={task.description}>{truncateText(task.description, 50)}</p>
                    <div className="task-details">
                      <span><strong>Deadline:</strong> {new Date(task.deadline).toLocaleDateString()}</span>
                      <span><strong>Status:</strong> {currentStatus}</span>
                      <span><strong>Priority:</strong> {task.priority === 1 ? 'Low' : task.priority === 2 ? 'Medium' : 'High'}</span>
                    </div>
                    {currentResponse && (
                      <div className="task-response" title={currentResponse}>
                        <strong>Response:</strong> {truncateText(currentResponse, 30)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      {showTaskModal && selectedTask && (
        <div className="task-modal-overlay">
          <div className="task-modal">
            <div className="task-modal-header">
              <h3>{isManagerLoggedIn ? 'Task Details' : 'My Task'}</h3>
              <button 
                className="close-modal-btn"
                onClick={() => setShowTaskModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="task-modal-body">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={selectedTask.title}
                  onChange={(e) => setSelectedTask({...selectedTask, title: e.target.value})}
                  disabled={!isManagerLoggedIn}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={selectedTask.description}
                  onChange={(e) => setSelectedTask({...selectedTask, description: e.target.value})}
                  disabled={!isManagerLoggedIn}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={selectedTask.priority}
                    onChange={(e) => setSelectedTask({...selectedTask, priority: parseInt(e.target.value)})}
                    disabled={!isManagerLoggedIn}
                  >
                    <option value="1">Low</option>
                    <option value="2">Medium</option>
                    <option value="3">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Deadline</label>
                  <input
                    type="date"
                    value={selectedTask.deadline}
                    onChange={(e) => setSelectedTask({...selectedTask, deadline: e.target.value})}
                    disabled={!isManagerLoggedIn}
                  />
                </div>
                <div className="form-group">
                <label>Status</label>
                <select
                  value={selectedTask.status}
                  onChange={(e) => setSelectedTask({ ...selectedTask, status: e.target.value })}
                  disabled={isManagerLoggedIn} 
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              </div>
              
              <div className="form-group">
                <label>Response</label>
                <textarea
                  value={selectedTask.userResponse || ''}
                  onChange={(e) => setSelectedTask({...selectedTask, userResponse: e.target.value})}
                  disabled={isManagerLoggedIn}
                />
              </div>
            </div>
            <div className="task-modal-footer">
              <button 
                className="modal-save-btn"
                onClick={() => handleUpdateTask(selectedTask.id, {
                  title: selectedTask.title,
                  description: selectedTask.description,
                  priority: selectedTask.priority,
                  deadline: selectedTask.deadline,
                  status: selectedTask.status,
                  userResponse: selectedTask.userResponse
                })}
              >
                Save Changes
              </button>
              {isManagerLoggedIn && (
                <button 
                  className="modal-delete-btn"
                  onClick={() => handleDeleteTask(selectedTask.id)}
                >
                  Delete Task
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamTasksPage;