import { useTasks as useTaskContext } from '@/contexts/TaskContext';

export function useTasks() {
  const taskContext = useTaskContext();

  const getTasksByDate = (date: string) => {
    return taskContext.tasks.filter(task => task.date === date);
  };

  return {
    ...taskContext,
    getTasksByDate,
  };
}