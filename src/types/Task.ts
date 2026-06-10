export type Task = {
  id: string;
  name: string;
  category: string;
  date: string; // formato: YYYY-MM-DD
  completed?: boolean;
  title?: string;
};
