import React, { useState } from 'react';
import '../user/TaskPopup.css';
import config from '../config';

const ManagerTaskPopup = ({ task, onClose, onUpdate, onDelete }) => {
  const [title, setTitle] = useState(task.title);
  const [status, setStatus] = useState(task.status || 'none');
  const [priority, setPriority] = useState(task.priority || 0);
  const [deadline, setDeadline] = useState(task.deadline || '');
  const [suggestedPriority, setSuggestedPriority] = useState(null);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [aiReasoning, setAiReasoning] = useState('');

  const priorityColors = [
    { value: 0, color: 'white', label: 'None' },
    { value: 1, color: 'yellow', label: 'Low' },
    { value: 2, color: 'blue', label: 'Medium' },
    { value: 3, color: 'red', label: 'High' }
  ];

  const getPriorityLabel = (value) => {
    const priority = priorityColors.find(p => p.value === value);
    return priority ? priority.label : 'None';
  };

  const handleSave = async () => {
    const updatePackage = {
      id: task.id,
      title: title,
      status: status,
      priority: priority,
      deadline: deadline,
    };
  
    try {
      await onUpdate(updatePackage);
      onClose();
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const fetchPrioritySuggestion = async () => {
    setIsLoadingSuggestion(true);
    setAiReasoning("Analyzing task...");
    
    try {
      const response = await fetch(`${config.url}/api/ai/suggest-priority`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title,
          description: task.description || '',
          deadline: deadline
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.message || 'Failed to get suggestion');
      }
      
      const data = await response.json();
      
      if (data.status === "error") {
        throw new Error(data.message);
      }
      
      setSuggestedPriority(data.priority);
      setAiReasoning(`Priority suggestion received from ${data.source || 'AI'}`);
    } catch (error) {
      console.error("Failed to get priority suggestion:", error);
      setAiReasoning(`Using fallback priority system: ${error.message}`);
    } finally {
      setIsLoadingSuggestion(false);
    }
  };

  const applySuggestion = () => {
    if (suggestedPriority !== null) {
      setPriority(suggestedPriority);
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
          
          {/* Add the priority suggestion section */}
          <div className="priority-suggestion">
            <button 
              onClick={fetchPrioritySuggestion}
              disabled={isLoadingSuggestion}
              className="suggest-btn"
            >
              {isLoadingSuggestion ? 'Analyzing...' : 'Suggest Priority'}
            </button>
            
            {suggestedPriority !== null && (
              <div className="suggestion-result">
                <div className="suggestion-details">
                  <span>Suggested: {getPriorityLabel(suggestedPriority)}</span>
                  <button 
                    onClick={applySuggestion}
                    className="apply-suggestion-btn"
                  >
                    Apply
                  </button>
                </div>
                <div className="ai-reasoning">
                  {aiReasoning}
                </div>
              </div>
            )}
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
          <button 
            className="delete-btn" 
            onClick={() => {
              onDelete(task.id);
              onClose();
            }}
          >
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

export default ManagerTaskPopup;