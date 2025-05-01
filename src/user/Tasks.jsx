// src/components/Tasks
import React, { useContext, useState } from 'react';
import { TaskContext } from './TaskContext';
import './Tasks.css';
import addIcon from '../assets/icons/more.png'; // Import the image

const Tasks = () => {
  const { tasks, addTask, deleteTask, updateTask, lists, addList, deleteList, updateList } = useContext(TaskContext);
  const [newTask, setNewTask] = useState('');
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(null);
  const [taskDetails, setTaskDetails] = useState('');
  const [selectedListIndex, setSelectedListIndex] = useState(null); // Track selected sidebar link
  const [popupVisible, setPopupVisible] = useState(false); // Track popup visibility
  const [popupListIndex, setPopupListIndex] = useState(null); // Track the list for the popup

  const handleAddTask = () => {
    if (newTask.trim()) {
      addTask({ title: newTask, description: '', listId: selectedListIndex });
      setNewTask('');
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleAddTask();
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTaskIndex(tasks.findIndex(t => t === task));
    setTaskDetails(task.description);
  };

  const handleTaskDetailsChange = (event) => {
    setTaskDetails(event.target.value);
    updateTask(selectedTaskIndex, { ...tasks[selectedTaskIndex], description: event.target.value });
  };

  const handleAddList = () => {
    const listName = prompt('Enter the name of the new list:');
    if (listName) {
      addList({ name: listName });
    }
  };

  const handleListDoubleClick = (index) => {
    setPopupListIndex(index);
    setPopupVisible(true);
  };

  const handleUpdateList = () => {
    const newListName = prompt('Enter the new name of the list:');
    if (newListName) {
      updateList(popupListIndex, { name: newListName });
      setPopupVisible(false);
    }
  };

  const handleDeleteList = () => {
    deleteList(popupListIndex);
    setPopupVisible(false);
  };

  const handleClosePopup = () => {
    setPopupVisible(false);
  };

  const handleListClick = (index) => {
    setSelectedListIndex(index); // Set the selected list index
    setSelectedTaskIndex(null); // Reset selected task when changing lists
  };

  const filteredTasks = selectedListIndex !== null
    ? tasks.filter(task => task.listId === selectedListIndex)
    : [];

  return (
    <div className="tasks">
      <div className="tasks-sidebar">
        <div className='tasks-sidebar-links' onClick={() => setSelectedListIndex(null)}>Today</div>
        <div className='tasks-sidebar-links' onClick={() => setSelectedListIndex(null)}>Next 7 Days</div>
        <div className='tasks-sidebar-links' onClick={() => setSelectedListIndex(null)}>Inbox</div>
        <hr />
        <div className='tasks-sidebar-links sidebar-lists'>
          <p className='sidebar-lists-heading'>Lists</p>
          <img src={addIcon} alt="Add List" className="add-list-icon" onClick={handleAddList} />
          {lists.map((list, index) => (
            <div
              key={index}
              className={`tasks-sidebar-links ${selectedListIndex === index ? 'active' : ''}`}
              onClick={() => handleListClick(index)}
              onDoubleClick={() => handleListDoubleClick(index)} // Show popup on double-click
            >
              {list.name}
            </div>
          ))}
        </div>
      </div>
      {selectedListIndex !== null && (
        <div className="tasks-main">
          <h2 className='todays-tasks-title'>{lists[selectedListIndex]?.name || "Tasks"}</h2>
          <input
            type="text"
            placeholder="Add a new task"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={handleKeyPress}
            className='task-input'
          />
          <button onClick={handleAddTask} className='addtask-button'>Add Task</button>
          <div className="task-list">
            {filteredTasks.map((task, index) => (
              <div key={index} className="task-item" onClick={() => handleTaskClick(task)}>
                {task.title}
                <button 
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the parent div's onClick
                    const actualIndex = tasks.findIndex(t => t === task);
                    deleteTask(actualIndex);
                  }} 
                  className='deletetask-button'
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {selectedListIndex !== null && (
        <div className="tasks-main2">
          <h2 className='task-description-title'>
            {selectedTaskIndex !== null ? tasks[selectedTaskIndex]?.title : 'Task Description'}
          </h2>
          <div className='task-description'>
            {selectedTaskIndex !== null ? (
              <textarea
                value={taskDetails}
                onChange={handleTaskDetailsChange}
                placeholder="Add more details about the task"
                className='task-details-input'
              />
            ) : (
              'Select a task to view details'
            )}
          </div>
        </div>
      )}
      {popupVisible && (
        <div className="popup">
          <div className="popup-content">
            <button onClick={handleUpdateList}>Update</button>
            <button onClick={handleDeleteList}>Delete</button>
            <button onClick={handleClosePopup}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;