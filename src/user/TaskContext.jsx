// src/components/TaskContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import { useAuth } from '../contextapi/AuthContext';

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const { userData } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedList, setSelectedList] = useState(null);
  const [defaultView, setDefaultView] = useState(null); 
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const fetchLists = async () => {
    console.log('Fetching lists for user:', userData?.username);
    if (!userData?.username) {
      console.log('No username available');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Making API call to:', `${config.url}/tasks/lists`);
      const response = await axios.get(`${config.url}/tasks/lists`, {
        params: { username: userData.username }
      });
      
      // Ensure response.data is an array
      const serverLists = Array.isArray(response.data) ? response.data : [];
      console.log('Server lists:', serverLists);
      
      setLists(serverLists);
      
      // Auto-select the first list if none selected
      if (serverLists.length > 0 && !selectedList) {
        const inboxList = serverLists.find(list => list.name === 'Inbox') || serverLists[0];
        setSelectedList(inboxList);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching lists:", error);
      setLists([]); // Set to empty array on error
      setLoading(false);
    }
  };

  const fetchTasks = async (listId) => {
  if (!userData?.username) return;
  
  try {
    let response;
    if (defaultView && !listId) {
      response = await axios.get(`${config.url}/tasks/all`, {
        params: { username: userData.username }
      });
    } else {
      response = await axios.get(`${config.url}/tasks`, {
        params: { 
          listId: listId,
          username: userData.username 
        }
      });
    }
    
    const enhancedTasks = response.data.map(task => {
      const list = lists.find(l => l.id === task.listId);
      return {
        ...task,
        listName: list?.name || 'Uncategorized'
      };
    });
    
    setTasks(enhancedTasks);
    return enhancedTasks;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    setTasks([]);
    return [];
  }
};

const fetchAllTasks = async () => {
  if (!userData?.username) return [];
  
  try {
    const response = await axios.get(`${config.url}/tasks/all`, {
      params: { username: userData.username }
    });
    
    const enhancedTasks = response.data.map(task => {
      const list = lists.find(l => l.id === task.listId);
      return {
        ...task,
        listName: list?.name || 'Uncategorized',
        list: list // Add the full list object to each task
      };
    });
    
    setTasks(enhancedTasks);
    return enhancedTasks;
  } catch (error) {
    console.error("Error fetching all tasks:", error);
    setTasks([]);
    return [];
  }
};

  const addTask = async (task) => {
    try {
      console.log("Adding task with data:", {
        title: task.title,
        description: task.description || '',
        listId: task.listId,
        username: userData.username
      });
  
      const response = await axios.post(`${config.url}/tasks`, null, {
        params: {
          title: task.title,
          description: task.description || '',
          listId: task.listId,
          username: userData.username
        },
        paramsSerializer: params => {
          return Object.entries(params)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');
        }
      });
      
      setTasks(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error("Error adding task:", {
        message: error.message,
        response: error.response?.data,
        config: error.config
      });
      throw error;
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${config.url}/tasks/${taskId}`, {
        params: { username: userData.username }
      });
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error; 
    }
  };

  const updateTask = async (taskId, updatedTask) => {
    try {
      // Get fresh task data from state first
      const currentTasks = [...tasks];
      const taskIndex = currentTasks.findIndex(t => t.id === taskId);
      
      if (taskIndex === -1) return;
      
      // Merge updates with existing task data
      const mergedTask = {
        ...currentTasks[taskIndex],
        ...updatedTask
      };
      
      console.log("Sending merged update:", mergedTask);
      
      const response = await axios.put(`${config.url}/tasks/${taskId}`, mergedTask, {
        params: { username: userData.username }
      });
      
      // Update state immutably
      setTasks(currentTasks.map(task => 
        task.id === taskId ? response.data : task
      ));
      
      return response.data;
    } catch (error) {
      console.error("Update error:", error.response?.data || error.message);
      throw error;
    }
  };

  const addList = async (list) => {
    try {
      const response = await axios.post(`${config.url}/tasks/lists`, null, {
        params: {
          name: list.name,
          username: userData.username
        }
      });
      setLists([...lists, response.data]);
    } catch (error) {
      console.error("Error adding list:", error);
    }
  };

const deleteList = async (listId) => {
  try {
    const tasksInList = tasks.filter(task => task.list?.id === listId);
    
    if (tasksInList.length > 0) {
      for (const task of tasksInList) {
        try {
          await axios.delete(`${config.url}/tasks/${task.id}`, {
            params: { username: userData.username }
          });
        } catch (taskError) {
          console.error(`Error deleting task ${task.id}:`, taskError);
        }
      }
    }
    
    await axios.delete(`${config.url}/tasks/lists/${listId}`, {
      params: { username: userData.username }
    });
    
    setLists(lists.filter(list => list.id !== listId));
    setTasks(tasks.filter(task => task.list?.id !== listId));
    
    if (selectedList?.id === listId) {
      setSelectedList(null);
    }
    
    return true; 
  } catch (error) {
    console.error("Error deleting list:", error);
    
    if (error.response) {
      console.error("Server responded with:", {
        status: error.response.status,
        data: error.response.data
      });
    }
    
    throw error;
  }
};

  const updateList = async (listId, updatedList) => {
    try {
      const response = await axios.put(`${config.url}/tasks/lists/${listId}`, updatedList, {
        params: { username: userData.username }
      });
      setLists(lists.map(list => list.id === listId ? response.data : list));
      return response.data; // Return updated list
    } catch (error) {
      console.error("Error updating list:", error);
      throw error;
    }
  };
  
  // Helper function to set the default view
  const setView = (view) => {
    setDefaultView(view);
    setSelectedList(null);
  };

  useEffect(() => {
    if (lists.length > 0 && !selectedList && !defaultView) {
      fetchAllTasks();
    }
  }, [lists]);

  useEffect(() => {
    if (userData?.username) {
      fetchLists();
    }
  }, [userData]);

  useEffect(() => {
  if (userData?.username && lists.length > 0) {
    if (defaultView) { 
      fetchTasks();
    } else if (selectedList) {
      fetchTasks(selectedList.id); 
    }
  }
}, [defaultView, selectedList, lists]);
  useEffect(() => {
    if (selectedList) {
      fetchTasks(selectedList.id);
      setDefaultView(null);
    }
  }, [selectedList]);

  useEffect(() => {
  if (!userData?.username) return;

  const loadData = async () => {
    try {
      setLoading(true);
      await fetchLists();
      
      // Only fetch tasks if we're not in a default view
      if (!defaultView && selectedList) {
        await fetchTasks(selectedList.id);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, [userData?.username]);

  return (
    <TaskContext.Provider value={{ 
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
      setStatusFilter,
      fetchAllTasks,
    }}>
      {children}
    </TaskContext.Provider>
  );
};
