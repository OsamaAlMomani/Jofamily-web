export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export type Task = {
  id: string;
  title: string;
  description?: string;
  assignedTo: string;
  assignedBy: string;
  status: TaskStatus;
  priority: TaskPriority;
  points: number;
  dueDate?: Date | null;
  completedAt?: Date | null;
  createdAt?: Date | null;
};

export type CreateTaskInput = {
  title: string;
  description?: string;
  assignedTo: string;
  assignedBy: string;
  priority: TaskPriority;
  points: number;
  dueDate?: Date | null;
};

export type UserStats = {
  userId: string;
  userName: string;
  totalPoints: number;
  completedTasks: number;
  badges: string[];
};
