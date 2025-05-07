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
    addTask,
    deleteTask,
    updateTask,
    addList,
    deleteList,
    updateList,
    userData,
    setTasks,
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

  const handleListClick = (list) => {
    setSelectedList(list);
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
        className={`tasks-sidebar-links ${selectedList?.id === list.id ? 'active' : ''}`}
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

  const getMainContent = () => {
    if (!selectedList && !defaultView) {
      return (
        <div className="tasks-main">
          <h2 className='todays-tasks-title'>Select a List</h2>
          <p>Select a list from the sidebar to manage tasks.</p>
        </div>
      );
    }

    const title = defaultView || selectedList?.name || '';

    return (
      <div className="tasks-main">
        <h2 className='todays-tasks-title'>{title}</h2>
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
          {tasks.map((task) => (
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

  const handleViewClick = (viewName) => {
    const list = findListByName(viewName);
    if (list) {
      setSelectedList(list);
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
          className={`tasks-sidebar-links ${defaultView === 'Today' ? 'active' : ''}`}
          onClick={() => handleViewClick('Today')}
        >
          Today
        </div>
        <div
          className={`tasks-sidebar-links ${defaultView === 'Next 7 Days' ? 'active' : ''}`}
          onClick={() => handleViewClick('Next 7 Days')}
        >
          Next 7 Days
        </div>
        <div
          className={`tasks-sidebar-links ${defaultView === 'Inbox' ? 'active' : ''}`}
          onClick={() => handleViewClick('Inbox')}
        >
          Inbox
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
