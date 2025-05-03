import React, { useContext, useState, useEffect } from 'react';
import { TaskContext } from './TaskContext';
import './Tasks.css';
import addIcon from '../assets/icons/more.png';

const Tasks = () => {
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
    fetchTasks
  } = useContext(TaskContext);
  
  const [newTask, setNewTask] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskDetails, setTaskDetails] = useState('');
  const [tempDescription, setTempDescription] = useState('');
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupList, setPopupList] = useState(null);

  const MAX_TITLE_LENGTH = 50; // Maximum length for task titles

  const getTruncatedTitle = (title) => {
    if (title.length > MAX_TITLE_LENGTH) {
      return `${title.substring(0, MAX_TITLE_LENGTH)}...`;
    }
    return title;
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

  const handleDescriptionChange = (e) => {
    setTempDescription(e.target.value);
  };

  const saveDescription = async () => {
    if (selectedTask && tempDescription !== taskDetails) {
      try {
        await updateTask(selectedTask.id, {
          ...selectedTask,
          description: tempDescription
        });
        setTaskDetails(tempDescription);
        setSelectedTask({
          ...selectedTask,
          description: tempDescription
        });
      } catch (error) {
        alert('Failed to update task description');
      }
    }
  };

  const resetDescription = () => {
    setTempDescription(taskDetails); // Reset to the original description
  };

  const handleTaskDelete = (e, taskId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId)
        .catch(() => alert('Failed to delete task'));
    }
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
      deleteList(popupList.id)
        .then(() => setPopupVisible(false))
        .catch(() => alert('Failed to delete list'));
    }
  };

  const handleListClick = (list) => {
    setSelectedList(list);
    setSelectedTask(null);
  };

  const renderLists = () => {
    if (!Array.isArray(lists)) {
      return null;
    }
    
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
  

  const getMainContent = () => {
    if (!selectedList && !defaultView) {
      return (
        <div className="tasks-main">
          <h2 className='todays-tasks-title'>Select a List</h2>
          <p>Please select a list or view from the sidebar to manage your tasks.</p>
        </div>
      );
    }
    
    let title = defaultView ? defaultView : (selectedList?.name || '');

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
            <button onClick={handleAddTask} className='addtask-button'>
              Add Task
            </button>
          </>
        )}
        <div className="task-list">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              className="task-item" 
              onClick={() => handleTaskClick(task)}
            >
              <span className="task-title">{getTruncatedTitle(task.title)}</span>
              <button 
                onClick={(e) => handleTaskDelete(e, task.id)} 
                className='deletetask-button'
              >
                Delete
              </button>
            </div>
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
                  disabled={tempDescription === taskDetails} // Disable if no changes
                >
                  Save
                </button>
                <button 
                  onClick={resetDescription} 
                  className="cancel-button"
                  disabled={tempDescription === taskDetails} // Disable if no changes
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
          className={`tasks-sidebar-links ${defaultView === 'Today' ? 'active' : ''}`} 
          onClick={() => {
            const todayList = findListByName('Today');
            if (todayList) {
              setSelectedList(todayList);
            } else {
              setView('Today');
            }
          }}
        >
          Today
        </div>
        <div 
          className={`tasks-sidebar-links ${defaultView === 'Next 7 Days' ? 'active' : ''}`} 
          onClick={() => {
            const next7List = findListByName('Next 7 Days');
            if (next7List) {
              setSelectedList(next7List);
            } else {
              setView('Next 7 Days');
            }
          }}
        >
          Next 7 Days
        </div>
        <div 
          className={`tasks-sidebar-links ${defaultView === 'Inbox' ? 'active' : ''}`} 
          onClick={() => {
            const inboxList = findListByName('Inbox');
            if (inboxList) {
              setSelectedList(inboxList);
            } else {
              setView('Inbox');
            }
          }}
        >
          Inbox
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
              disabled={['Today', 'Next 7 Days', 'Inbox'].includes(popupList?.name)}
            >
              Delete
            </button>
            <button onClick={() => setPopupVisible(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;