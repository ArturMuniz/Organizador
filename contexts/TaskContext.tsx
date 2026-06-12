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
import { updateTaskSummaryWidget } from '@/src/services/widgetService';

export interface TaskAttachment {
  id: string;
  uri: string;
  name: string;
  type: 'image';
}

export interface Task {
  id: string;
  name: string;
  date: string;
  category: string;
  completed?: boolean;
  notificationId?: string;
  attachments?: TaskAttachment[];
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

  const normalizeTask = (task: Task): Task => ({
    ...task,
    completed: task.completed ?? false,
    attachments: task.attachments ?? [],
  });

  const persistTasks = async (nextTasks: Task[]) => {
    const normalizedTasks = nextTasks.map(normalizeTask);
    setTasks(normalizedTasks);
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(normalizedTasks));
    await updateTaskSummaryWidget(normalizedTasks);
  };

  const loadTasks = async () => {
    try {
      const stored = await AsyncStorage.getItem(TASKS_KEY);
      const parsed: Task[] = stored ? JSON.parse(stored) : [];
      const normalizedTasks = parsed.map(normalizeTask);
      setTasks(normalizedTasks);
      await updateTaskSummaryWidget(normalizedTasks);
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
      attachments: task.attachments ?? [],
    };

    if (notificationsEnabled && !newTask.completed) {
      newTask.notificationId = await scheduleTaskReminder({
        taskId: newTask.id,
        taskName: newTask.name,
        taskDate: newTask.date,
      });
    }

    try {
      await persistTasks([...tasks, newTask]);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const removeTask = async (id: string) => {
    const taskToRemove = tasks.find(t => t.id === id);
    await cancelTaskReminder(taskToRemove?.notificationId);

    try {
      await persistTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error removing task:', error);
    }
  };

  const updateTask = async (id: string, task: Omit<Task, 'id'>) => {
    const existingTask = tasks.find(t => t.id === id);
    await cancelTaskReminder(existingTask?.notificationId);

    const updatedTask: Task = {
      ...task,
      id,
      attachments: task.attachments ?? existingTask?.attachments ?? [],
    };

    if (notificationsEnabled && !updatedTask.completed) {
      updatedTask.notificationId = await scheduleTaskReminder({
        taskId: updatedTask.id,
        taskName: updatedTask.name,
        taskDate: updatedTask.date,
      });
    }

    try {
      await persistTasks(tasks.map(t => (t.id === id ? updatedTask : t)));
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
      await persistTasks(tasks.map(task => ({ ...task, notificationId: undefined })));
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
      await cancelTaskReminder(task.notificationId);

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
