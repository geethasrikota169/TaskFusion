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
  const [defaultView, setDefaultView] = useState(null); // today, next7days, inbox

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
    if (!userData?.username || !listId) return;
    
    try {
      const response = await axios.get(`${config.url}/tasks`, {
        params: { 
          listId: listId,
          username: userData.username 
        }
      });
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const addTask = async (task) => {
    try {
      const response = await axios.post(`${config.url}/tasks`, null, {
        params: {
          title: task.title,
          description: task.description || '',
          listId: task.listId,
          username: userData.username
        }
      });
      setTasks([...tasks, response.data]);
    } catch (error) {
      console.error("Error adding task:", error);
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
      throw error; // Re-throw to handle in UI if needed
    }
  };

  const updateTask = async (taskId, updatedTask) => {
    try {
      const response = await axios.put(`${config.url}/tasks/${taskId}`, updatedTask, {
        params: { username: userData.username }
      });
      setTasks(tasks.map(task => task.id === taskId ? response.data : task));
      return response.data; // Return updated task
    } catch (error) {
      console.error("Error updating task:", error);
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
      await axios.delete(`${config.url}/tasks/lists/${listId}`, {
        params: { username: userData.username }
      });
      setLists(lists.filter(list => list.id !== listId));
      setTasks(tasks.filter(task => task.list?.id !== listId));
      
      if (selectedList?.id === listId) {
        setSelectedList(null);
      }
    } catch (error) {
      console.error("Error deleting list:", error);
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
    if (userData?.username) {
      fetchLists();
    }
  }, [userData]);

  useEffect(() => {
    if (selectedList) {
      fetchTasks(selectedList.id);
      setDefaultView(null);
    }
  }, [selectedList]);

  return (
    <TaskContext.Provider value={{ 
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
    }}>
      {children}
    </TaskContext.Provider>
  );
};
