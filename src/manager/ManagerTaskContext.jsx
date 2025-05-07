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

    const setView = (view) => {
        console.log(`Setting view to: ${view}`);
        setDefaultView(view);
        setSelectedList(null);
        setTasks([]);
    };

    const fetchLists = async () => {
        console.log('Fetching manager lists...');
        if (!isManagerLoggedIn || !userData?.username) {
            console.log('No manager logged in or username missing');
            setLoading(false);
            return;
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
        } catch (error) {
            console.error("Error fetching manager lists:", error);
            console.error("Error details:", error.response?.data);
            setLists([]);
            setLoading(false);
        }
    };

    const fetchTasks = async (listId) => {
        if (!userData?.username || !listId) return;

        try {
            console.log(`Fetching tasks for list ${listId}`);
            const response = await axios.get(`${config.url}/manager/tasks`, {
                params: {
                    listId: listId,
                    username: userData.username
                }
            });
            console.log('Tasks response:', response.data);
            setTasks(response.data);
        } catch (error) {
            console.error("Error fetching manager tasks:", error);
        }
    };

    const addTask = async (task) => {
      try {
          const response = await axios.post(`${config.url}/manager/tasks`, null, {
              params: {
                  title: task.title,
                  description: task.description || '',
                  listId: task.listId,
                  username: userData.username
              }
          });
          setTasks(prev => [...prev, response.data]);
          return { success: true };
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
        } catch (error) {
            console.error("Error deleting manager task:", error);
        }
    };

    const updateTask = async (taskId, updatedTask) => {
        try {
            const response = await axios.put(`${config.url}/manager/tasks/${taskId}`, updatedTask, {
                params: { username: userData.username }
            });
            setTasks(prev => prev.map(task => task.id === taskId ? response.data : task));
            return response.data;
        } catch (error) {
            console.error("Error updating manager task:", error);
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
        } catch (error) {
            console.error("Error adding manager list:", error);
        }
    };

    const deleteList = async (listId) => {
        try {
            await axios.delete(`${config.url}/manager/tasks/lists/${listId}`, {
                params: { username: userData.username }
            });
            setLists(prev => prev.filter(list => list.id !== listId));
            setTasks(prev => prev.filter(task => task.list?.id !== listId));

            if (selectedList?.id === listId) {
                setSelectedList(null);
            }
        } catch (error) {
            console.error("Error deleting manager list:", error);
        }
    };

    const updateList = async (listId, updatedList) => {
        try {
            const response = await axios.put(`${config.url}/manager/tasks/lists/${listId}`, updatedList, {
                params: { username: userData.username }
            });
            setLists(prev => prev.map(list => list.id === listId ? response.data : list));
            return response.data;
        } catch (error) {
            console.error("Error updating manager list:", error);
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
        if (selectedList) {
            console.log('Selected list changed, fetching tasks');
            fetchTasks(selectedList.id);
        }
    }, [selectedList]);

    return (
        <ManagerTaskContext.Provider value={{
            tasks,
            lists,
            loading,
            selectedList,
            setSelectedList,
            fetchTasks,
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
        }}>
            {children}
        </ManagerTaskContext.Provider>
    );
};

export const useManagerTasks = () => useContext(ManagerTaskContext);
