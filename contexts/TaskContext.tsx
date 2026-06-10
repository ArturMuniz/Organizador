import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import {
  cancelTaskReminder,
  getNotificationsEnabled,
  requestNotificationPermission,
  saveNotificationsEnabled,
  scheduleTaskReminder,
  setupNotificationChannel,
} from '@/src/services/notificationService';

export interface Task {
  id: string;
  name: string;
  date: string;
  category: string;
  completed?: boolean;
  notificationId?: string;
}

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  notificationsEnabled: boolean;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: string, task: Omit<Task, 'id'>) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  toggleTaskCompleted: (id: string) => Promise<void>;
  setTaskNotificationsEnabled: (enabled: boolean) => Promise<boolean>;
  reloadTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const TASKS_KEY = 'tasks';

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

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

  const persistTasks = async (nextTasks: Task[]) => {
    setTasks(nextTasks);
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(nextTasks));
  };

  const addTask = async (task: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
    };

    if (notificationsEnabled) {
      newTask.notificationId = await scheduleTaskReminder({
        taskId: newTask.id,
        taskName: newTask.name,
        taskDate: newTask.date,
      });
    }

    const updatedTasks = [...tasks, newTask];
    try {
      await persistTasks(updatedTasks);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const removeTask = async (id: string) => {
    const taskToRemove = tasks.find(t => t.id === id);
    await cancelTaskReminder(taskToRemove?.notificationId);

    const updatedTasks = tasks.filter(t => t.id !== id);
    try {
      await persistTasks(updatedTasks);
    } catch (error) {
      console.error('Error removing task:', error);
    }
  };

  const updateTask = async (id: string, task: Omit<Task, 'id'>) => {
    const existingTask = tasks.find(t => t.id === id);
    await cancelTaskReminder(existingTask?.notificationId);

    const updatedTask: Task = { ...task, id };
    if (notificationsEnabled && !updatedTask.completed) {
      updatedTask.notificationId = await scheduleTaskReminder({
        taskId: id,
        taskName: updatedTask.name,
        taskDate: updatedTask.date,
      });
    }

    const updatedTasks = tasks.map(t => t.id === id ? updatedTask : t);
    try {
      await persistTasks(updatedTasks);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const toggleTaskCompleted = async (id: string) => {
    const updatedTasks = await Promise.all(tasks.map(async task => {
      if (task.id !== id) {
        return task;
      }

      const completed = !task.completed;
      await cancelTaskReminder(task.notificationId);

      if (completed || !notificationsEnabled) {
        return { ...task, completed, notificationId: undefined };
      }

      const notificationId = await scheduleTaskReminder({
        taskId: task.id,
        taskName: task.name,
        taskDate: task.date,
      });

      return { ...task, completed, notificationId };
    }));

    try {
      await persistTasks(updatedTasks);
    } catch (error) {
      console.error('Error toggling task status:', error);
    }
  };

  const setTaskNotificationsEnabled = async (enabled: boolean) => {
    if (!enabled) {
      await Promise.all(tasks.map(task => cancelTaskReminder(task.notificationId)));
      const updatedTasks = tasks.map(task => ({ ...task, notificationId: undefined }));
      await persistTasks(updatedTasks);
      await saveNotificationsEnabled(false);
      setNotificationsEnabled(false);
      return true;
    }

    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      await saveNotificationsEnabled(false);
      setNotificationsEnabled(false);
      return false;
    }

    const updatedTasks = await Promise.all(tasks.map(async task => {
      if (task.completed) {
        return { ...task, notificationId: undefined };
      }

      const notificationId = await scheduleTaskReminder({
        taskId: task.id,
        taskName: task.name,
        taskDate: task.date,
      });

      return { ...task, notificationId };
    }));

    await persistTasks(updatedTasks);
    await saveNotificationsEnabled(true);
    setNotificationsEnabled(true);
    return true;
  };

  useEffect(() => {
    const initialize = async () => {
      await setupNotificationChannel();
      setNotificationsEnabled(await getNotificationsEnabled());
      await loadTasks();
    };

    void initialize();
  }, []);

  return (
    <TaskContext.Provider value={{
      tasks,
      loading,
      notificationsEnabled,
      addTask,
      updateTask,
      removeTask,
      toggleTaskCompleted,
      setTaskNotificationsEnabled,
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
