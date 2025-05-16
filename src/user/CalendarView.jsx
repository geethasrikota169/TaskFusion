import React, { useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { TaskContext } from './TaskContext';
import { useAuth } from '../contextapi/AuthContext';
import './CalendarView.css';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';

// Define color constants outside component to avoid recreation
const COLOR_COMPLETED = '#4CAF50'; // Green
const COLOR_HIGH = '#F44336';      // Red
const COLOR_MEDIUM = '#2196F3';    // Blue
const COLOR_LOW = '#FFEB3B';       // Yellow
const COLOR_NONE = '#9E9E9E';      // Grey

// Cache for storing list names to avoid lookups
const listNameCache = new Map();

const CalendarView = () => {
  const { lists, fetchAllTasks } = useContext(TaskContext);
  const { userData } = useAuth();
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Memoized helper functions to prevent recreation on each render
  const getEventColor = useCallback((priority, status) => {
    if (status === 'completed') return COLOR_COMPLETED;
    switch (priority) {
      case 3: return COLOR_HIGH;
      case 2: return COLOR_MEDIUM;
      case 1: return COLOR_LOW;
      default: return COLOR_NONE;
    }
  }, []);

  const getPriorityLabel = useCallback((value) => {
    switch (value) {
      case 3: return 'High';
      case 2: return 'Medium';
      case 1: return 'Low';
      default: return 'None';
    }
  }, []);

  // Memoized list data
  const listMap = useMemo(() => {
    const map = new Map();
    if (lists && lists.length) {
      lists.forEach(list => map.set(list.id, list.name));
      
      // Update cache
      lists.forEach(list => {
        listNameCache.set(list.id, list.name);
      });
    }
    return map;
  }, [lists]);

  const getListName = useCallback((listId) => {
    // First check cache
    if (listNameCache.has(listId)) {
      return listNameCache.get(listId);
    }
    
    // Then check current lists
    const name = listMap.get(listId) || 'Uncategorized';
    
    // Update cache for future lookups
    listNameCache.set(listId, name);
    
    return name;
  }, [listMap]);

  const handleEventClick = useCallback((clickInfo) => {
    setSelectedTask({
      ...clickInfo.event.extendedProps,
      title: clickInfo.event.title,
      start: clickInfo.event.start,
      listName: getListName(clickInfo.event.extendedProps.listId),
      priority: clickInfo.event.extendedProps.priority
    });
    setShowTaskModal(true);
  }, [getListName]);

  const closeModal = useCallback(() => {
    setShowTaskModal(false);
    setSelectedTask(null);
  }, []);

  // Optimized transform function with memoization - MODIFIED to filter tasks with deadlines
  const transformTasksToEvents = useCallback((tasks) => {
    if (!tasks || !tasks.length) return [];
    
    // Filter tasks to only include those with deadlines
    const tasksWithDeadlines = tasks.filter(task => task.deadline);
    
    return tasksWithDeadlines.map(task => ({
      id: task.id,
      title: task.title,
      start: task.deadline,
      allDay: true,
      extendedProps: {
        priority: task.priority,
        status: task.status,
        description: task.description,
        listId: task.listId
      },
      color: getEventColor(task.priority, task.status)
    }));
  }, [getEventColor]);

  // Optimized data fetching
  useEffect(() => {
    if (!userData?.username) {
      setIsLoading(false);
      return;
    }
    
    let isMounted = true;
    
    // Use local storage to cache events temporarily
    const cachedEvents = localStorage.getItem('calendarEvents');
    if (cachedEvents) {
      try {
        const parsedEvents = JSON.parse(cachedEvents);
        setCalendarEvents(parsedEvents);
        setIsLoading(false);
        
        // Still fetch in background to update
        fetchAllTasks().then(tasks => {
          if (!isMounted) return;
          const events = transformTasksToEvents(tasks);
          setCalendarEvents(events);
          localStorage.setItem('calendarEvents', JSON.stringify(events));
        }).catch(error => {
          console.error("Background fetch failed:", error);
        });
        
        return;
      } catch (e) {
        console.error("Error parsing cached events:", e);
        // Continue to normal fetch if cache parsing fails
      }
    }
    
    // Normal fetch path if no cache
    fetchAllTasks().then(tasks => {
      if (!isMounted) return;
      const events = transformTasksToEvents(tasks);
      setCalendarEvents(events);
      setIsLoading(false);
      localStorage.setItem('calendarEvents', JSON.stringify(events));
    }).catch(error => {
      console.error("Failed to load tasks:", error);
      if (isMounted) setIsLoading(false);
    });
    
    return () => { isMounted = false; };
  }, [fetchAllTasks, userData?.username, transformTasksToEvents]);

  // Progressive loading indicator
  if (isLoading) {
    return (
      <div className="calendar-loading">
        <div className="loading-spinner"></div>
        <p>Loading your calendar...</p>
      </div>
    );
  }

  // Memoized calendar options
  const calendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin],
    initialView: "dayGridMonth",
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: calendarEvents,
    eventClick: handleEventClick,
    height: "auto",
    nowIndicator: true,
    editable: true,
    selectable: true,
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      meridiem: false
    },
    // Performance options
    lazyFetching: true,
    rerenderDelay: 10,
    eventLimit: true, // When too many events in a day, show the popover
    eventLimitClick: "popover"
  };

  return (
    <div className="calendar-view-container">
      <div className="calendar-container">
        <FullCalendar {...calendarOptions} />
      </div>

      {/* Task Modal - Only render when needed */}
      {showTaskModal && selectedTask && (
        <div className="cal-task-modal-overlay" onClick={closeModal}>
          <div className="cal-task-modal" onClick={(e) => e.stopPropagation()}>
            <div 
              className="cal-task-modal-header"
              style={{ 
                backgroundColor: getEventColor(selectedTask.priority, selectedTask.status),
                color: 'white'
              }}
            >
              <h3>{selectedTask.title}</h3>
              <button className="close-modal" onClick={closeModal}>×</button>
            </div>
            <div className="cal-task-modal-content">
              <div className="cal-task-detail-row">
                <span className="detail-label">List:</span>
                <span className="detail-value">
                  <span className="list-badge">{selectedTask.listName}</span>
                </span>
              </div>
              <div className="cal-task-detail-row">
                <span className="detail-label">Due Date:</span>
                <span className="detail-value">
                  {selectedTask.start.toLocaleDateString()}
                </span>
              </div>
              <div className="cal-task-detail-row">
                <span className="detail-label">Priority:</span>
                <span className="detail-value">
                  <span 
                    className="priority-badge"
                    style={{ 
                      backgroundColor: getEventColor(selectedTask.priority, null),
                      color: selectedTask.priority === 1 ? '#333' : 'white'
                    }}
                  >
                    {getPriorityLabel(selectedTask.priority)}
                  </span>
                </span>
              </div>
              <div className="cal-task-detail-row">
                <span className="detail-label">Status:</span>
                <span className="detail-value">
                  <span 
                    className="status-badge"
                    style={{ 
                      backgroundColor: selectedTask.status === 'completed' ? COLOR_COMPLETED : 
                                     selectedTask.status === 'inprogress' ? COLOR_MEDIUM : COLOR_NONE,
                      color: 'white'
                    }}
                  >
                    {selectedTask.status || 'Not Started'}
                  </span>
                </span>
              </div>
              <div className="cal-task-detail-row full-width">
                <span className="detail-label">Description:</span>
                <div className="detail-value description-box">
                  {selectedTask.description || 'No description available'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;