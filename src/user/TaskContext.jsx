// src/components/TaskContext.js
import React, { createContext, useState, useEffect } from 'react';

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState(() => {
    // Load tasks from local storage if available
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [lists, setLists] = useState(() => {
    // Load lists from local storage if available
    const savedLists = localStorage.getItem('lists');
    return savedLists ? JSON.parse(savedLists) : [];
  });

  useEffect(() => {
    // Save tasks to local storage whenever they change
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    // Save lists to local storage whenever they change
    localStorage.setItem('lists', JSON.stringify(lists));
  }, [lists]);

  const addTask = (task) => {
    setTasks([...tasks, task]);
  };

  const deleteTask = (index) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  const updateTask = (index, updatedTask) => {
    const newTasks = tasks.map((task, i) => (i === index ? updatedTask : task));
    setTasks(newTasks);
  };

  const addList = (list) => {
    setLists([...lists, list]);
  };

  const deleteList = (index) => {
    const newLists = lists.filter((_, i) => i !== index);
    setLists(newLists);
  };

  const updateList = (index, updatedList) => {
    const newLists = lists.map((list, i) => (i === index ? updatedList : list));
    setLists(newLists);
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, deleteTask, updateTask, lists, addList, deleteList, updateList }}>
      {children}
    </TaskContext.Provider>
  );
};