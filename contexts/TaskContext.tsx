import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export interface Task {
  id: string;
  name: string;
  date: string;
  category: string;
  completed?: boolean;
}

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: string, task: Omit<Task, 'id'>) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  toggleTaskCompleted: (id: string) => Promise<void>;
  reloadTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const TASKS_KEY = 'tasks';

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    try {
      const stored = await AsyncStorage.getItem(TASKS_KEY);
      if (stored) {
        const parsed: Task[] = JSON.parse(stored);
        setTasks(parsed.map(task => ({ ...task, completed: task.completed ?? false })));
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (task: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
    };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    try {
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const removeTask = async (id: string) => {
    const updatedTasks = tasks.filter(t => t.id !== id);
    setTasks(updatedTasks);
    try {
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));
    } catch (error) {
      console.error('Error removing task:', error);
    }
  };

  const updateTask = async (id: string, task: Omit<Task, 'id'>) => {
    const updatedTasks = tasks.map(t => t.id === id ? { ...task, id } : t);
    setTasks(updatedTasks);
    try {
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const toggleTaskCompleted = async (id: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    try {
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));
    } catch (error) {
      console.error('Error toggling task status:', error);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <TaskContext.Provider value={{
      tasks,
      loading,
      addTask,
      updateTask,
      removeTask,
      toggleTaskCompleted,
      reloadTasks: loadTasks,
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};