import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import { useAuth } from '../contextapi/AuthContext';

export const ManagerTaskContext = createContext();

export const ManagerTaskProvider = ({ children }) => {
  const { userData, isManagerLoggedIn } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedList, setSelectedList] = useState(null);
  const [defaultView, setDefaultView] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [deadlineFilter, setDeadlineFilter] = useState('all');

  const setView = (view) => {
    console.log(`Setting view to: ${view}`);
    setDefaultView(view);
    setSelectedList(null);
  };

  const fetchLists = async () => {
    console.log('Fetching manager lists...');
    if (!isManagerLoggedIn || !userData?.username) {
      console.log('No manager logged in or username missing');
      setLoading(false);
      return [];
    }

    try {
      console.log('Making API call to fetch manager lists');
      const response = await axios.get(`${config.url}/manager/tasks/lists`, {
        params: { username: userData.username }
      });

      console.log('Manager lists response:', response.data);
      const serverLists = Array.isArray(response.data) ? response.data : [];
      setLists(serverLists);

      if (serverLists.length > 0 && !selectedList && !defaultView) {
        console.log('Auto-selecting first list');
        const inboxList = serverLists.find(list => list.name === 'Inbox') || serverLists[0];
        setSelectedList(inboxList);
      }

      setLoading(false);
      return serverLists;
    } catch (error) {
      console.error("Error fetching manager lists:", error);
      console.error("Error details:", error.response?.data);
      setLists([]);
      setLoading(false);
      return [];
    }
  };

  const fetchTasks = async (listId) => {
    if (!userData?.username || !isManagerLoggedIn) {
      console.log('Cannot fetch tasks - no username or not logged in as manager');
      return [];
    }

    try {
      let response;
      if (defaultView && !listId) {
        console.log('Fetching all tasks for manager');
        response = await axios.get(`${config.url}/manager/tasks/all`, {
          params: { username: userData.username }
        });
      } else if (listId) {
        console.log(`Fetching tasks for list ${listId}`);
        response = await axios.get(`${config.url}/manager/tasks`, {
          params: {
            listId: listId,
            username: userData.username
          }
        });
      } else {
        console.log('No list ID provided and no default view set');
        return [];
      }

      console.log('Tasks response:', response.data);

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
      console.error("Error fetching manager tasks:", error);
      console.error("Error details:", error.response?.data);
      setTasks([]);
      return [];
    }
  };

  const fetchAllTasks = async () => {
    if (!userData?.username || !isManagerLoggedIn) return [];

    try {
      const response = await axios.get(`${config.url}/manager/tasks/all`, {
        params: { username: userData.username }
      });

      const enhancedTasks = response.data.map(task => {
        const list = lists.find(l => l.id === task.listId);
        return {
          ...task,
          listName: list?.name || 'Uncategorized',
          list: list
        };
      });

      setTasks(enhancedTasks);
      return enhancedTasks;
    } catch (error) {
      console.error("Error fetching all manager tasks:", error);
      return [];
    }
  };

  const addTask = async (task) => {
    try {
      const response = await axios.post(`${config.url}/manager/tasks`, null, {
        params: {
          title: task.title,
          description: task.description || '',
          listId: task.listId,
          username: userData.username,
          deadline: task.deadline || null,
          priority: task.priority || 0,
          status: task.status || 'not_started'
        }
      });
      setTasks(prev => [...prev, response.data]);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error adding manager task:", error);
      const errorMsg = error.response?.data?.message || 'Failed to add task';
      return { success: false, error: errorMsg };
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${config.url}/manager/tasks/${taskId}`, {
        params: { username: userData.username }
      });
      setTasks(prev => prev.filter(task => task.id !== taskId));
      return { success: true };
    } catch (error) {
      console.error("Error deleting manager task:", error);
      return { success: false, error: error.response?.data?.message || 'Failed to delete task' };
    }
  };

  const updateTask = async (taskId, updatedTask) => {
    try {
      const currentTasks = [...tasks];
      const taskIndex = currentTasks.findIndex(t => t.id === taskId);

      if (taskIndex === -1) {
        return { success: false, error: 'Task not found' };
      }

      const mergedTask = {
        ...currentTasks[taskIndex],
        ...updatedTask
      };

      console.log("Sending merged update:", mergedTask);

      const response = await axios.put(`${config.url}/manager/tasks/${taskId}`, mergedTask, {
        params: { username: userData.username }
      });

      setTasks(prev => prev.map(task => task.id === taskId ? response.data : task));
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error updating manager task:", error);
      return { success: false, error: error.response?.data?.message || 'Failed to update task' };
    }
  };

  const addList = async (list) => {
    try {
      const response = await axios.post(`${config.url}/manager/tasks/lists`, null, {
        params: {
          name: list.name,
          username: userData.username
        }
      });
      setLists(prev => [...prev, response.data]);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error adding manager list:", error);
      return { success: false, error: error.response?.data?.message || 'Failed to add list' };
    }
  };

  const deleteList = async (listId) => {
    try {
      await axios.delete(`${config.url}/manager/tasks/lists/${listId}`, {
        params: { username: userData.username }
      });
      setLists(prev => prev.filter(list => list.id !== listId));
      setTasks(prev => prev.filter(task => task.listId !== listId));

      if (selectedList?.id === listId) {
        setSelectedList(null);
      }
      return { success: true };
    } catch (error) {
      console.error("Error deleting manager list:", error);
      return { success: false, error: error.response?.data?.message || 'Failed to delete list' };
    }
  };

  const updateList = async (listId, updatedList) => {
    try {
      const response = await axios.put(`${config.url}/manager/tasks/lists/${listId}`, updatedList, {
        params: { username: userData.username }
      });
      setLists(prev => prev.map(list => list.id === listId ? response.data : list));
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error updating manager list:", error);
      return { success: false, error: error.response?.data?.message || 'Failed to update list' };
    }
  };

  useEffect(() => {
    console.log('ManagerTaskProvider mounted or updated');
    console.log('isManagerLoggedIn:', isManagerLoggedIn);
    console.log('userData:', userData);

    if (isManagerLoggedIn && userData?.username) {
      fetchLists();
    } else {
      setLoading(false);
    }
  }, [isManagerLoggedIn, userData]);

  useEffect(() => {
    if (isManagerLoggedIn && userData?.username && lists.length > 0) {
      if (defaultView) {
        fetchTasks();
      } else if (selectedList) {
        fetchTasks(selectedList.id);
      }
    }
  }, [defaultView, selectedList, lists.length, isManagerLoggedIn, userData?.username]);

  useEffect(() => {
    if (lists.length > 0 && !selectedList && !defaultView) {
      fetchAllTasks();
    }
  }, [lists]);

  return (
    <ManagerTaskContext.Provider value={{
      tasks,
      lists,
      loading,
      selectedList,
      setSelectedList,
      fetchTasks,
      fetchAllTasks,
      addTask,
      deleteTask,
      updateTask,
      addList,
      deleteList,
      updateList,
      defaultView,
      setView,
      setDefaultView,
      userData,
      setTasks,
      statusFilter,
      setStatusFilter,
      priorityFilter,
      setPriorityFilter,
      deadlineFilter,
      setDeadlineFilter
    }}>
      {children}
    </ManagerTaskContext.Provider>
  );
};

export const useManagerTasks = () => useContext(ManagerTaskContext);
