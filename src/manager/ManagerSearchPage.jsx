import React, { useState, useEffect, useContext } from 'react';
import { ManagerTaskContext } from './ManagerTaskContext';
import TaskItem from './ManagerTaskItem';
import '../user/SearchPage.css';
import { useAuth } from '../contextapi/AuthContext';

const ManagerSearchPage = () => {
  const { userData } = useAuth();
  const { tasks, fetchAllTasks, loading } = useContext(ManagerTaskContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    const loadTasks = async () => {
      setLocalLoading(true);
      try {
        // Only fetch if we don't have tasks or if they might be stale
        if (tasks.length === 0 || !tasks.some(t => t.list)) {
          await fetchAllTasks();
        }
      } catch (error) {
        console.error("Failed to fetch manager tasks:", error);
      } finally {
        setLocalLoading(false);
      }
    };

    loadTasks();
  }, [fetchAllTasks]);

  const filteredTasks = tasks.filter(task => {
    if (!searchTerm.trim()) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      task.title.toLowerCase().includes(term) ||
      (task.description && task.description.toLowerCase().includes(term)) ||
      (task.assignedTo && task.assignedTo.toLowerCase().includes(term))
    );
  });

  if (loading || localLoading) {
    return <div className="search-page">Loading tasks...</div>;
  }

  return (
    <div className="search-page">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          autoFocus
        />
      </div>
      
      <div className="search-results">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <div key={task.id} className="search-task-item">
              <TaskItem 
                task={task}
                onClick={() => {}}
                onDoubleClick={() => {}}
              />
              {task.description && (
                <div className="search-task-description">
                  {task.description}
                </div>
              )}
              <div className="search-task-meta">
                <span className="search-task-list">
                  List: {task.list?.name || 'Inbox'}
                </span>
                {task.assignedTo && (
                  <span className="search-task-assignee">
                    Assignee: {task.assignedTo}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="no-results">
            {searchTerm ? 'No tasks match your search' : 'No tasks found'}
          </p>
        )}
      </div>
    </div>
  );
};

export default ManagerSearchPage;