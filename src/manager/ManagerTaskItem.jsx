import React from 'react';
import '../user/TaskItem.css';

const ManagerTaskItem = ({ task, onClick, onDoubleClick }) => {
  const priorityColor = [
    'white', 'yellow', 'blue', 'red'
  ][task.priority || 0];

  return (
    <div 
      className="task-item"
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <div className="task-priority" style={{
        backgroundColor: priorityColor,
        border: '1px solid #ccc'
      }} />
      <span className="task-title-item">
        {task.title}
      </span>
      <div className="task-meta">
        {task.deadline && (
          <span className="task-deadline">
            {new Date(task.deadline).toLocaleDateString()}
          </span>
        )}
        <span className={`task-status ${task.status}`}>
          {task.status || 'none'}
        </span>
      </div>
    </div>
  );
};

export default ManagerTaskItem;