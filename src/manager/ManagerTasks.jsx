import React, { useContext, useState } from 'react';
import { ManagerTaskContext } from './ManagerTaskContext';
import '../user/Tasks.css';
import axios from 'axios';
import addIcon from '../assets/icons/more.png';
import ManagerTaskItem from './ManagerTaskItem';
import ManagerTaskPopup from './ManagerTaskPopup';
import config from '../config';

const ManagerTasks = () => {
  const {
    tasks,
    lists,
    loading,
    selectedList,
    setSelectedList,
    defaultView,
    setView,
    setDefaultView, // Make sure we use this to clear the default view
    addTask,
    deleteTask,
    updateTask,
    addList,
    deleteList,
    updateList,
    userData,
    setTasks,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    deadlineFilter,
    setDeadlineFilter
  } = useContext(ManagerTaskContext);

  const [newTask, setNewTask] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskDetails, setTaskDetails] = useState('');
  const [tempDescription, setTempDescription] = useState('');
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupList, setPopupList] = useState(null);
  const [showToast, setShowToast] = useState(false); 
  const [showManagerTaskPopup, setShowManagerTaskPopup] = useState(false);

  const MAX_TITLE_LENGTH = 50;

  const getTruncatedTitle = (title) =>
    title.length > MAX_TITLE_LENGTH ? `${title.substring(0, MAX_TITLE_LENGTH)}...` : title;

  const handleAddTask = () => {
    if (newTask.trim() && selectedList) {
      addTask({ title: newTask, description: '', listId: selectedList.id });
      setNewTask('');
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setTaskDetails(task.description || '');
    setTempDescription(task.description || '');
  };

  const handleDescriptionChange = (e) => setTempDescription(e.target.value);

  const resetDescription = () => setTempDescription(taskDetails);

  const handleTaskDelete = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
        deleteTask(taskId)
            .then(() => {
                setSelectedTask(null);
                setShowManagerTaskPopup(false);
            })
            .catch(() => alert('Failed to delete task'));
    }
  };

  const handleAddList = () => {
    const listName = prompt('Enter the name of the new list:');
    if (listName && listName.trim()) {
      addList({ name: listName.trim() });
    }
  };

  // FIXED: Clear defaultView when clicking on a list
  const handleListClick = (list) => {
    setSelectedList(list);
    setDefaultView(null); // Clear the default view when selecting a list
    setSelectedTask(null);
  };

  const handleListDoubleClick = (list) => {
    setPopupList(list);
    setPopupVisible(true);
  };

  const handleUpdateList = () => {
    const newName = prompt('Enter new list name:', popupList.name);
    if (newName && newName.trim()) {
      updateList(popupList.id, { ...popupList, name: newName.trim() });
      setPopupVisible(false);
    }
  };

  const handleDeleteList = () => {
    if (window.confirm(`Delete list "${popupList.name}"?`)) {
      deleteList(popupList.id)
        .then(() => setPopupVisible(false))
        .catch(() => alert('Failed to delete list'));
    }
  };

  const renderLists = () => {
    if (!Array.isArray(lists)) return null;
    return lists.map((list) => (
      <div
        key={list.id}
        className={`tasks-sidebar-links ${selectedList?.id === list.id && !defaultView ? 'active' : ''}`}
        onClick={() => handleListClick(list)}
        onDoubleClick={() => handleListDoubleClick(list)}
      >
        {list.name}
      </div>
    ));
  };

  const handleTaskDoubleClick = (task) => {
    setSelectedTask(task);
    setShowManagerTaskPopup(true);
  };
  
  const handleTaskUpdate = async (updatedTask) => {
    if (!userData?.username) {
        console.error("Cannot update task - user not authenticated");
        throw new Error("User not authenticated");
    }

    try {
        const response = await axios.put(
            `${config.url}/manager/tasks/${updatedTask.id}/metadata`,
            updatedTask,
            {
                params: { username: userData.username },
                headers: { 'Content-Type': 'application/json' }
            }
        );
        
        if (response.data) {
            setTasks(prev => prev.map(t => t.id === updatedTask.id ? response.data : t));
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            return response.data;
        }
        throw new Error('Update failed');
    } catch (error) {
        console.error("Failed to update task:", error);
        throw error;
    }
  };
  
  const saveDescription = async () => {
    if (selectedTask && tempDescription !== taskDetails) {
        try {
            const response = await axios.put(
                `${config.url}/manager/tasks/${selectedTask.id}/description`,
                { description: tempDescription },
                {
                    params: { username: userData.username },
                    headers: { 'Content-Type': 'application/json' }
                }
            );
            
            if (response.data) {
                setTaskDetails(tempDescription);
                setSelectedTask(response.data);
                setTasks(prev => prev.map(t => t.id === response.data.id ? response.data : t));
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
                return response.data;
            }
            throw new Error('Update failed');
        } catch (error) {
            console.error('Failed to update task description:', error);
            alert(`Failed to save description: ${error.message}`);
        }
    }
  };

  // Filter handlers - FIXED to properly clear list selection
  const handleDeadlineFilterClick = () => {
    setView('deadline-filter');
    setSelectedList(null);
    setDeadlineFilter('all');
  };

  const handlePriorityFilterClick = () => {
    setView('priority-filter');
    setSelectedList(null);
    setPriorityFilter('all');
  };

  const handleStatusFilterClick = () => {
    setView('status-filter');
    setSelectedList(null);
    setStatusFilter('all');
  };

  // Filter rendering functions
  const renderDeadlineFilterOptions = () => {
    if (defaultView !== 'deadline-filter') return null;

    return (
      <div className="deadline-filter">
        <button
          className={`filter-button ${deadlineFilter === 'all' ? 'active' : ''}`}
          onClick={() => setDeadlineFilter('all')}
        >
          All Tasks
        </button>
        <button
          className={`filter-button ${deadlineFilter === 'today' ? 'active' : ''}`}
          onClick={() => setDeadlineFilter('today')}
        >
          Due Today
        </button>
        <button
          className={`filter-button ${deadlineFilter === 'week' ? 'active' : ''}`}
          onClick={() => setDeadlineFilter('week')}
        >
          Due This Week
        </button>
        <button
          className={`filter-button ${deadlineFilter === 'overdue' ? 'active' : ''}`}
          onClick={() => setDeadlineFilter('overdue')}
        >
          Overdue
        </button>
      </div>
    );
  };

  const renderPriorityFilterOptions = () => {
    if (defaultView !== 'priority-filter') return null;

    return (
      <div className="priority-filter">
        <button
          className={`filter-button ${priorityFilter === 'all' ? 'active' : ''}`}
          onClick={() => setPriorityFilter('all')}
        >
          All Tasks
        </button>
        <button
          className={`filter-button priority-none ${priorityFilter === 'none' ? 'active' : ''}`}
          onClick={() => setPriorityFilter('none')}
        >
          None
        </button>
        <button
          className={`filter-button priority-low ${priorityFilter === 'low' ? 'active' : ''}`}
          onClick={() => setPriorityFilter('low')}
        >
          Low
        </button>
        <button
          className={`filter-button priority-medium ${priorityFilter === 'medium' ? 'active' : ''}`}
          onClick={() => setPriorityFilter('medium')}
        >
          Medium
        </button>
        <button
          className={`filter-button priority-high ${priorityFilter === 'high' ? 'active' : ''}`}
          onClick={() => setPriorityFilter('high')}
        >
          High
        </button>
      </div>
    );
  };

  const renderStatusFilterOptions = () => {
    if (defaultView !== 'status-filter') return null;

    return (
      <div className="status-filter">
        <button
          className={`filter-button ${statusFilter === 'all' ? 'active' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          All Tasks
        </button>
        <button
          className={`filter-button status-pending ${statusFilter === 'pending' ? 'active' : ''}`}
          onClick={() => setStatusFilter('pending')}
        >
          Pending
        </button>
        <button
          className={`filter-button status-inprogress ${statusFilter === 'inprogress' ? 'active' : ''}`}
          onClick={() => setStatusFilter('inprogress')}
        >
          In Progress
        </button>
        <button
          className={`filter-button status-completed ${statusFilter === 'completed' ? 'active' : ''}`}
          onClick={() => setStatusFilter('completed')}
        >
          Completed
        </button>
      </div>
    );
  };

  const getFilteredTasks = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    return tasks.filter(task => {
      // Apply deadline filter for Deadline View
      if (defaultView === 'deadline-filter') {
        if (!task.deadline && deadlineFilter !== 'all') return false;
        
        const taskDate = task.deadline ? new Date(task.deadline) : null;
        
        switch (deadlineFilter) {
          case 'today':
            return taskDate && (
              taskDate.getFullYear() === today.getFullYear() &&
              taskDate.getMonth() === today.getMonth() &&
              taskDate.getDate() === today.getDate()
            );
          case 'week':
            return taskDate && taskDate >= today && taskDate <= weekEnd;
          case 'overdue':
            return taskDate && taskDate < today;
          case 'all':
          default:
            break;
        }
      }

      // Apply priority filter for Priority view
      if (defaultView === 'priority-filter') {
        if (priorityFilter !== 'all') {
          const priorityValues = {
            'none': 0,
            'low': 1,
            'medium': 2,
            'high': 3
          };
          return task.priority === priorityValues[priorityFilter];
        }
      }

      // Apply status filter for Status view
      if (defaultView === 'status-filter') {
        if (statusFilter !== 'all') {
          return task.status === statusFilter;
        }
      }

      // Default filter for specific lists
      if (!defaultView && selectedList) {
        return task.listId === selectedList.id;
      }

      return true;
    });
  };

  const getMainContent = () => {
    if (!selectedList && !defaultView) {
      return (
        <div className="tasks-main">
          <h2 className='todays-tasks-title'>Select a List</h2>
          <p>Select a list from the sidebar to manage tasks.</p>
        </div>
      );
    }

    const title = defaultView === 'deadline-filter' ? 'Filter By Deadline' : 
                 defaultView === 'priority-filter' ? 'Filter By Priority' :
                 defaultView === 'status-filter' ? 'Filter By Status' :
                 defaultView || selectedList?.name || '';

    const filteredTasks = getFilteredTasks();

    return (
      <div className="tasks-main">
        <h2 className='todays-tasks-title'>{title}</h2>
        {defaultView === 'deadline-filter' && renderDeadlineFilterOptions()}
        {defaultView === 'priority-filter' && renderPriorityFilterOptions()}
        {defaultView === 'status-filter' && renderStatusFilterOptions()}
        
        {selectedList && (
          <>
            <input
              type="text"
              placeholder="Add a new task"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
              className='task-input'
            />
            <button onClick={handleAddTask} className='addtask-button'>Add Task</button>
          </>
        )}
        <div className="task-list">
          {filteredTasks.map((task) => (
            <ManagerTaskItem
              key={task.id}
              task={{
                ...task,
                title: getTruncatedTitle(task.title), 
              }}
              onClick={() => handleTaskClick(task)}
              onDoubleClick={() => handleTaskDoubleClick(task)}
            />
          ))}
        </div>
      </div>
    );
  };

  const getTaskDetails = () => {
    if (!selectedList && !defaultView) return null;

    return (
      <div className="tasks-main2">
        <h2 className="task-description-title">
          {selectedTask ? selectedTask.title : 'Task Description'}
        </h2>
        <div className="task-description">
          {selectedTask ? (
            <div className="description-edit-container">
              <textarea
                value={tempDescription}
                onChange={handleDescriptionChange}
                placeholder="Add more details about the task"
                className="task-details-input"
              />
              <div className="description-buttons">
                <button
                  onClick={saveDescription}
                  className="save-button"
                  disabled={tempDescription === taskDetails}
                >
                  Save
                </button>
                <button
                  onClick={resetDescription}
                  className="cancel-button"
                  disabled={tempDescription === taskDetails}
                >
                  Reset
                </button>
              </div>
            </div>
          ) : (
            'Select a task to view details'
          )}
        </div>
      </div>
    );
  };

  const findListByName = (name) => lists.find(list => list.name === name);

  // FIXED: Properly handle view switching
  const handleViewClick = (viewName) => {
    const list = findListByName(viewName);
    if (list) {
      setSelectedList(list);
      setDefaultView(null); // Clear default view when selecting a list
    } else {
      setView(viewName);
      setSelectedList(null);
    }
  };

  if (loading) {
    return <div className="tasks">Loading...</div>;
  }

  return (
    <div className="tasks">
      <div className="tasks-sidebar">
        <div
          className={`tasks-sidebar-links ${defaultView === 'deadline-filter' ? 'active' : ''}`}
          onClick={handleDeadlineFilterClick}
        >
          Deadline Filter
        </div>
        <div
          className={`tasks-sidebar-links ${defaultView === 'priority-filter' ? 'active' : ''}`}
          onClick={handlePriorityFilterClick}
        >
          Priority Filter
        </div>
        <div
          className={`tasks-sidebar-links ${defaultView === 'status-filter' ? 'active' : ''}`}
          onClick={handleStatusFilterClick}
        >
          Status Filter
        </div>
        <hr />
        <div className='tasks-sidebar-links sidebar-lists'>
          <p className='sidebar-lists-heading'>Lists</p>
          <img src={addIcon} alt="Add List" className="add-list-icon" onClick={handleAddList} />
          {renderLists()}
        </div>
      </div>

      {getMainContent()}
      {getTaskDetails()}

      {popupVisible && (
        <div className="popup">
          <div className="popup-content">
            <button onClick={handleUpdateList}>Update</button>
            <button
              onClick={handleDeleteList}
              disabled={['Today', 'Next 7 Days', 'Inbox'].includes(popupList?.name)}
            >
              Delete
            </button>
            <button onClick={() => setPopupVisible(false)}>Close</button>
          </div>
        </div>
      )}

      {showManagerTaskPopup && selectedTask && (
        <ManagerTaskPopup
          task={selectedTask}
          onClose={() => setShowManagerTaskPopup(false)}
          onUpdate={handleTaskUpdate}
          onDelete={handleTaskDelete}
        />
      )}

      {showToast && (
        <div className="toast-notification">Saved!</div>
      )}
    </div>
  );
};

export default ManagerTasks;