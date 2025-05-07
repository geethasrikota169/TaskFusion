import React, { useState } from 'react';
import './TaskPopup.css';

const TaskPopup = ({ task, onClose, onUpdate, onDelete }) => {
  const [title, setTitle] = useState(task.title);
  const [status, setStatus] = useState(task.status || 'none');
  const [priority, setPriority] = useState(task.priority || 0);
  const [deadline, setDeadline] = useState(task.deadline || '');

  const priorityColors = [
    { value: 0, color: 'white', label: 'None' },
    { value: 1, color: 'yellow', label: 'Low' },
    { value: 2, color: 'blue', label: 'Medium' },
    { value: 3, color: 'red', label: 'High' }
  ];

  const handleSave = async () => {
    const updatePackage = {
      id: task.id,
      title: title,
      status: status,
      priority: priority,
      list: task.list,
      deadline: deadline,
    };
  
    try {
      await onUpdate(updatePackage);
      onClose();
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  return (
    <div className="task-popup-overlay">
      <div className="task-popup">
        <h3>Edit Task</h3>
        
        <div className="form-group">
          <label>Title</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="none">Not Started</option>
            <option value="inprogress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="form-group">
          <label>Priority</label>
          <div className="priority-options">
            {priorityColors.map((p) => (
              <button
                key={p.value}
                className={`priority-flag ${p.color} ${priority === p.value ? 'active' : ''}`}
                onClick={() => setPriority(p.value)}
                title={p.label}
              />
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Deadline</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>

        <div className="popup-actions">
          <button className="delete-btn" onClick={() => {
            onDelete(task.id);
            onClose();
          }}>
            Delete Task
          </button>
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="save-btn" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskPopup;