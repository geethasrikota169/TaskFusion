import React, { useContext, useState } from 'react';
import { TaskContext } from './TaskContext';
import TaskItem from './TaskItem';
import TaskPopup from './TaskPopup';
import './Tasks.css';
import './TaskPopup.css';
import addIcon from '../assets/icons/more.png';
import { useAuth } from '../contextapi/AuthContext';

const Tasks = () => {
  const { userData } = useAuth();
  const { 
    tasks, 
    setTasks, 
    lists, 
    loading,
    selectedList,
    setSelectedList,
    defaultView,
    setView,
    addTask, 
    deleteTask, 
    updateTask, 
    addList, 
    deleteList, 
    updateList,
    fetchTasks,
    priorityFilter,
    setPriorityFilter,
    statusFilter,
    setStatusFilter
  } = useContext(TaskContext);
  
  const [newTask, setNewTask] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskDetails, setTaskDetails] = useState('');
  const [tempDescription, setTempDescription] = useState('');
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupList, setPopupList] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [showTaskPopup, setShowTaskPopup] = useState(false);
  const [deadlineFilter, setDeadlineFilter] = useState('all');

  const MAX_TITLE_LENGTH = 30;

  const getTruncatedTitle = (title) => {
    return title.length > MAX_TITLE_LENGTH
      ? `${title.substring(0, MAX_TITLE_LENGTH)}...`
      : title;
  };

  const handleAddTask = () => {
    if (newTask.trim() && selectedList) {
      addTask({ 
        title: newTask, 
        description: '', 
        listId: selectedList.id 
      });
      setNewTask('');
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setTaskDetails(task.description || '');
    setTempDescription(task.description || '');
  };

  const handleTaskDoubleClick = (task) => {
    setSelectedTask(task);
    setShowTaskPopup(true);
  };

  const handleTaskDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
      } catch (error) {
        console.error("Failed to delete task:", error);
      }
    }
  };

  const handleDescriptionChange = (e) => {
    setTempDescription(e.target.value);
  };

  const handleTaskUpdate = async (updatedTask) => {
    if (!userData?.username) {
      console.error("Cannot update task - user not authenticated");
      throw new Error("User not authenticated");
    }
  
    try {
      const response = await fetch(`http://localhost:2002/tasks/${updatedTask.id}/metadata`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'username': userData.username
        },
        body: JSON.stringify(updatedTask),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Update failed');
      }
      
      const result = await response.json();
      
      setTasks(tasks.map(t => t.id === updatedTask.id ? result : t));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return result;
    } catch (error) {
      console.error("Failed to update task:", {
        error: error.message,
        taskId: updatedTask?.id,
        payload: updatedTask
      });
      throw error;
    }
  };
  
  const saveDescription = async () => {
    if (selectedTask && tempDescription !== taskDetails) {
      try {
        const response = await fetch(`http://localhost:2002/tasks/${selectedTask.id}/description`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'username': userData.username
          },
          body: JSON.stringify({
            description: tempDescription
          }),
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Update failed');
        }
        
        const updatedTask = await response.json();
        
        setTaskDetails(tempDescription);
        setSelectedTask(updatedTask);
        setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } catch (error) {
        console.error('Failed to update task description:', error);
        alert(`Failed to save description: ${error.message}`);
      }
    }
  };

  const resetDescription = () => {
    setTempDescription(taskDetails);
  };

  const handleAddList = () => {
    const listName = prompt('Enter the name of the new list:');
    if (listName && listName.trim()) {
      addList({ name: listName.trim() });
    }
  };

  const handleListDoubleClick = (list) => {
    setPopupList(list);
    setPopupVisible(true);
  };

  const handleUpdateList = () => {
    const newListName = prompt('Enter the new name of the list:', popupList.name);
    if (newListName && newListName.trim()) {
      updateList(popupList.id, { ...popupList, name: newListName.trim() });
      setPopupVisible(false);
    }
  };

  const handleDeleteList = () => {
    if (window.confirm(`Are you sure you want to delete the list "${popupList.name}"?`)) {
      setShowToast(true);
      
      deleteList(popupList.id)
        .then(() => {
          setPopupVisible(false);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        })
        .catch((error) => {
          console.error("Failed to delete list:", error);
          alert(`Could not delete list "${popupList.name}". Please try again later.`);
          setPopupVisible(false);
        });
    }
  };

  const handleListClick = (list) => {
    setSelectedList(list);
    setSelectedTask(null);
  };

  const renderLists = () => {
    if (!Array.isArray(lists)) return null;

    return lists.map((list) => (
      <div
        key={list.id}
        className={`tasks-sidebar-links ${
          selectedList?.id === list.id ? 'active' : ''
        }`}
        onClick={() => handleListClick(list)}
        onDoubleClick={() => handleListDoubleClick(list)}
      >
        {list.name}
      </div>
    ));
  };

  const getFilteredTasks = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    return tasks.filter(task => {
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
          onClick={() => setStatusFilter('none')}
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

  const getMainContent = () => {
    if (!selectedList && !defaultView) {
      return (
        <div className="tasks-main">
          <h2 className='todays-tasks-title'>Select a List</h2>
          <p>Please select a list or view from the sidebar to manage your tasks.</p>
        </div>
      );
    }
    
    const title = defaultView === 'deadline-filter' ? 'Filter By Deadline' : 
                 defaultView === 'priority-filter' ? 'Filter By Priority' :
                 defaultView === 'status-filter' ? 'Filter By Status' :
                 selectedList?.name || '';
    
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
            <button onClick={handleAddTask} className='addtask-button'>
              Add Task
            </button>
          </>
        )}
        
        <div className="task-list">
          {filteredTasks.map((task) => (
            <TaskItem
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

  const findListByName = (name) => {
    return lists.find(list => list.name === name);
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
          <img 
            src={addIcon} 
            alt="Add List" 
            className="add-list-icon" 
            onClick={handleAddList} 
          />
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
              disabled={['deadline-filter', 'priority-filter', 'status-filter'].includes(popupList?.name)}
            >
              Delete
            </button>
            <button onClick={() => setPopupVisible(false)}>Close</button>
          </div>
        </div>
      )}

      {showTaskPopup && selectedTask && (
        <TaskPopup
          task={selectedTask}
          onClose={() => setShowTaskPopup(false)}
          onUpdate={handleTaskUpdate}
          onDelete={handleTaskDelete}
        />
      )}

      {showToast && (
        <div className="toast-notification">
          Saved
        </div>
      )}
    </div>
  );
};

export default Tasks;