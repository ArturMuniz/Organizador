export type TaskAttachment = {
  id: string;
  uri: string;
  name: string;
  type: 'image';
};

export type Task = {
  id: string;
  name: string;
  category: string;
  date: string;
  completed?: boolean;
  notificationId?: string;
  attachments?: TaskAttachment[];
  title?: string;
};
