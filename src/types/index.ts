export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'manager' | 'developer' | 'designer' | 'viewer';
  title: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  taskId?: string;
  taskTitle?: string;
  userId: string;
  userName: string;
  userAvatar: string;
  action: 'created' | 'updated' | 'deleted' | 'status_changed' | 'commented' | 'completed';
  details: string;
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string; // ISO date string YYYY-MM-DD
  estimatedHours?: number;
  assigneeId?: string;
  assignee?: User;
  tags: string[];
  subtasks: SubTask[];
  comments: TaskComment[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type ViewMode = 'board' | 'list' | 'calendar' | 'analytics';

export interface FilterOptions {
  search: string;
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  assigneeId: string | 'all';
  tag: string | 'all';
  onlyOverdue: boolean;
  sortBy: 'dueDate' | 'priority' | 'created' | 'title';
  sortOrder: 'asc' | 'desc';
}
