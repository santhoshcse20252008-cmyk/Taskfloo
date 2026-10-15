import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Task, TaskStatus, TaskPriority, ActivityLog, FilterOptions, User, SubTask, TaskComment } from '../types';
import { INITIAL_TASKS, INITIAL_ACTIVITY } from '../data/initialData';
import { useAuth } from './AuthContext';

interface TaskContextType {
  tasks: Task[];
  filteredTasks: Task[];
  activityLogs: ActivityLog[];
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  resetFilters: () => void;
  // CRUD
  createTask: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'comments'>) => Task;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  moveTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  addComment: (taskId: string, content: string) => void;
  // Bulk operations
  bulkUpdateStatus: (taskIds: string[], newStatus: TaskStatus) => void;
  bulkDeleteTasks: (taskIds: string[]) => void;
  // Real-time & Tools
  isLiveSyncConnected: boolean;
  simulateLiveActivity: () => void;
  resetToDefaultData: () => void;
  exportTasksJSON: () => void;
  exportTasksCSV: () => void;
  // Metrics
  metrics: {
    total: number;
    completed: number;
    inProgress: number;
    inReview: number;
    todo: number;
    backlog: number;
    overdue: number;
    completionRate: number;
    highPriority: number;
  };
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const STORAGE_KEY_TASKS = 'taskflow_tasks_v1';
const STORAGE_KEY_ACTIVITY = 'taskflow_activity_v1';
const BROADCAST_CHANNEL_NAME = 'taskflow_sync_channel';

const defaultFilters: FilterOptions = {
  search: '',
  status: 'all',
  priority: 'all',
  assigneeId: 'all',
  tag: 'all',
  onlyOverdue: false,
  sortBy: 'priority',
  sortOrder: 'desc',
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, users } = useAuth();

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TASKS);
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVITY);
      return saved ? JSON.parse(saved) : INITIAL_ACTIVITY;
    } catch {
      return INITIAL_ACTIVITY;
    }
  });

  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [isLiveSyncConnected, setIsLiveSyncConnected] = useState<boolean>(true);

  // Cross-tab real-time sync with BroadcastChannel
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channel.onmessage = (event) => {
        const { type, payload } = event.data;
        if (type === 'TASKS_UPDATED') {
          setTasks(payload.tasks);
          if (payload.activity) {
            setActivityLogs((prev) => [payload.activity, ...prev.slice(0, 49)]);
          }
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel not supported or restricted', e);
    }

    return () => {
      channel?.close();
    };
  }, []);

  // Sync to storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks', e);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVITY, JSON.stringify(activityLogs));
    } catch (e) {
      console.error('Failed to save activity', e);
    }
  }, [activityLogs]);

  // Broadcast helper
  const broadcastSync = (newTasks: Task[], activity?: ActivityLog) => {
    try {
      const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channel.postMessage({
        type: 'TASKS_UPDATED',
        payload: { tasks: newTasks, activity },
      });
      channel.close();
    } catch (e) {
      // ignore
    }
  };

  const logActivity = useCallback((
    action: ActivityLog['action'],
    details: string,
    taskId?: string,
    taskTitle?: string,
    customUser?: User
  ): ActivityLog => {
    const actingUser = customUser || currentUser || {
      id: 'system',
      name: 'System',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    };

    const newLog: ActivityLog = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      taskId,
      taskTitle,
      userId: actingUser.id,
      userName: actingUser.name,
      userAvatar: actingUser.avatar,
      action,
      details,
      timestamp: new Date().toISOString(),
    };

    setActivityLogs((prev) => [newLog, ...prev.slice(0, 49)]);
    return newLog;
  }, [currentUser]);

  // CRUD Operations
  const createTask = useCallback((
    data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'comments'>
  ): Task => {
    const newTask: Task = {
      ...data,
      id: `task-${Date.now()}`,
      createdBy: currentUser?.id || 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
    };

    setTasks((prev) => {
      const updated = [newTask, ...prev];
      const activity = logActivity('created', `Created new task: "${newTask.title}"`, newTask.id, newTask.title);
      broadcastSync(updated, activity);
      return updated;
    });

    return newTask;
  }, [currentUser, logActivity]);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks((prev) => {
      const target = prev.find((t) => t.id === taskId);
      if (!target) return prev;

      const updatedTask: Task = {
        ...target,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      const updatedList = prev.map((t) => (t.id === taskId ? updatedTask : t));
      const activity = logActivity('updated', `Updated details of "${updatedTask.title}"`, taskId, updatedTask.title);
      broadcastSync(updatedList, activity);
      return updatedList;
    });
  }, [logActivity]);

  const deleteTask = useCallback((taskId: string) => {
    setTasks((prev) => {
      const target = prev.find((t) => t.id === taskId);
      const updatedList = prev.filter((t) => t.id !== taskId);
      if (target) {
        const activity = logActivity('deleted', `Deleted task "${target.title}"`, taskId, target.title);
        broadcastSync(updatedList, activity);
      }
      return updatedList;
    });
  }, [logActivity]);

  const moveTaskStatus = useCallback((taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) => {
      const target = prev.find((t) => t.id === taskId);
      if (!target || target.status === newStatus) return prev;

      const updatedTask: Task = {
        ...target,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };

      const statusLabels: Record<TaskStatus, string> = {
        backlog: 'Backlog',
        todo: 'To Do',
        in_progress: 'In Progress',
        in_review: 'In Review',
        done: 'Completed',
      };

      const updatedList = prev.map((t) => (t.id === taskId ? updatedTask : t));
      const activity = logActivity(
        newStatus === 'done' ? 'completed' : 'status_changed',
        `Moved to ${statusLabels[newStatus]}`,
        taskId,
        target.title
      );
      broadcastSync(updatedList, activity);
      return updatedList;
    });
  }, [logActivity]);

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks((prev) => {
      const target = prev.find((t) => t.id === taskId);
      if (!target) return prev;

      let subtaskTitle = '';
      let isCompleted = false;

      const updatedSubtasks = target.subtasks.map((st) => {
        if (st.id === subtaskId) {
          subtaskTitle = st.title;
          isCompleted = !st.completed;
          return { ...st, completed: !st.completed };
        }
        return st;
      });

      const updatedTask: Task = {
        ...target,
        subtasks: updatedSubtasks,
        updatedAt: new Date().toISOString(),
      };

      const updatedList = prev.map((t) => (t.id === taskId ? updatedTask : t));
      const activity = logActivity(
        'updated',
        `${isCompleted ? 'Completed' : 'Reopened'} checklist item "${subtaskTitle}"`,
        taskId,
        target.title
      );
      broadcastSync(updatedList, activity);
      return updatedList;
    });
  }, [logActivity]);

  const addSubtask = useCallback((taskId: string, title: string) => {
    if (!title.trim()) return;
    setTasks((prev) => {
      const target = prev.find((t) => t.id === taskId);
      if (!target) return prev;

      const newSubtask: SubTask = {
        id: `st-${Date.now()}`,
        title: title.trim(),
        completed: false,
      };

      const updatedTask: Task = {
        ...target,
        subtasks: [...target.subtasks, newSubtask],
        updatedAt: new Date().toISOString(),
      };

      const updatedList = prev.map((t) => (t.id === taskId ? updatedTask : t));
      return updatedList;
    });
  }, []);

  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks((prev) => {
      const target = prev.find((t) => t.id === taskId);
      if (!target) return prev;

      const updatedTask: Task = {
        ...target,
        subtasks: target.subtasks.filter((st) => st.id !== subtaskId),
        updatedAt: new Date().toISOString(),
      };

      return prev.map((t) => (t.id === taskId ? updatedTask : t));
    });
  }, []);

  const addComment = useCallback((taskId: string, content: string) => {
    if (!content.trim() || !currentUser) return;
    setTasks((prev) => {
      const target = prev.find((t) => t.id === taskId);
      if (!target) return prev;

      const newComment: TaskComment = {
        id: `c-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        content: content.trim(),
        createdAt: new Date().toISOString(),
      };

      const updatedTask: Task = {
        ...target,
        comments: [...target.comments, newComment],
        updatedAt: new Date().toISOString(),
      };

      const updatedList = prev.map((t) => (t.id === taskId ? updatedTask : t));
      const activity = logActivity('commented', `Commented: "${content.trim().slice(0, 40)}..."`, taskId, target.title);
      broadcastSync(updatedList, activity);
      return updatedList;
    });
  }, [currentUser, logActivity]);

  const bulkUpdateStatus = useCallback((taskIds: string[], newStatus: TaskStatus) => {
    setTasks((prev) => {
      const updatedList = prev.map((t) => (taskIds.includes(t.id) ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t));
      const activity = logActivity('status_changed', `Bulk updated ${taskIds.length} tasks to ${newStatus}`);
      broadcastSync(updatedList, activity);
      return updatedList;
    });
  }, [logActivity]);

  const bulkDeleteTasks = useCallback((taskIds: string[]) => {
    setTasks((prev) => {
      const updatedList = prev.filter((t) => !taskIds.includes(t.id));
      const activity = logActivity('deleted', `Bulk deleted ${taskIds.length} tasks`);
      broadcastSync(updatedList, activity);
      return updatedList;
    });
  }, [logActivity]);

  // Simulate real-time live events from team members (WebSocket simulation)
  const simulateLiveActivity = useCallback(() => {
    const otherUsers = users.filter((u) => u.id !== currentUser?.id);
    const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)] || users[0];

    const actions = [
      () => {
        // Change a task status
        if (tasks.length === 0) return;
        const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
        const statuses: TaskStatus[] = ['backlog', 'todo', 'in_progress', 'in_review', 'done'];
        const nextStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        setTasks((prev) => {
          const updated = prev.map((t) => t.id === randomTask.id ? { ...t, status: nextStatus, updatedAt: new Date().toISOString() } : t);
          const activity = logActivity(
            'status_changed',
            `${randomUser.name} moved "${randomTask.title.slice(0, 30)}..." to ${nextStatus.replace('_', ' ')}`,
            randomTask.id,
            randomTask.title,
            randomUser
          );
          broadcastSync(updated, activity);
          return updated;
        });
      },
      () => {
        // Post a team comment
        if (tasks.length === 0) return;
        const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
        const sampleComments = [
          'Code review passed! Ready for staging release.',
          'Added acceptance test coverage for all endpoints.',
          'UI polish completed on mobile breakpoint viewports.',
          'Synced with client specifications from Team Emogi rubric.',
          'Everything looks solid on our end!',
        ];
        const commentText = sampleComments[Math.floor(Math.random() * sampleComments.length)];

        setTasks((prev) => {
          const updated = prev.map((t) => {
            if (t.id === randomTask.id) {
              const newComment: TaskComment = {
                id: `c-${Date.now()}`,
                userId: randomUser.id,
                userName: randomUser.name,
                userAvatar: randomUser.avatar,
                content: commentText,
                createdAt: new Date().toISOString(),
              };
              return { ...t, comments: [...t.comments, newComment], updatedAt: new Date().toISOString() };
            }
            return t;
          });

          const activity = logActivity(
            'commented',
            `${randomUser.name} commented on "${randomTask.title.slice(0, 25)}..."`,
            randomTask.id,
            randomTask.title,
            randomUser
          );
          broadcastSync(updated, activity);
          return updated;
        });
      },
    ];

    const chosenAction = actions[Math.floor(Math.random() * actions.length)];
    chosenAction();
  }, [tasks, users, currentUser, logActivity]);

  const resetToDefaultData = () => {
    setTasks(INITIAL_TASKS);
    setActivityLogs(INITIAL_ACTIVITY);
    localStorage.removeItem(STORAGE_KEY_TASKS);
    localStorage.removeItem(STORAGE_KEY_ACTIVITY);
    broadcastSync(INITIAL_TASKS);
  };

  const exportTasksJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `taskflow-tasks-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportTasksCSV = () => {
    const headers = ['ID', 'Title', 'Status', 'Priority', 'Due Date', 'Assignee ID', 'Tags', 'Created At'];
    const rows = tasks.map((t) => [
      `"${t.id}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.status}"`,
      `"${t.priority}"`,
      `"${t.dueDate}"`,
      `"${t.assigneeId || ''}"`,
      `"${t.tags.join(', ')}"`,
      `"${t.createdAt}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `taskflow-tasks-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  // Filtered & Sorted Tasks calculation
  const filteredTasks = useMemo(() => {
    const todayStr = '2026-10-14'; // App time environment
    return tasks.filter((task) => {
      // Search
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = task.description.toLowerCase().includes(query);
        const matchesTag = task.tags.some((tag) => tag.toLowerCase().includes(query));
        if (!matchesTitle && !matchesDesc && !matchesTag) return false;
      }
      // Status
      if (filters.status !== 'all' && task.status !== filters.status) {
        return false;
      }
      // Priority
      if (filters.priority !== 'all' && task.priority !== filters.priority) {
        return false;
      }
      // Assignee
      if (filters.assigneeId !== 'all' && task.assigneeId !== filters.assigneeId) {
        return false;
      }
      // Tag
      if (filters.tag !== 'all' && !task.tags.includes(filters.tag)) {
        return false;
      }
      // Overdue
      if (filters.onlyOverdue) {
        const isOverdue = task.dueDate && task.dueDate < todayStr && task.status !== 'done';
        if (!isOverdue) return false;
      }
      return true;
    }).sort((a, b) => {
      const factor = filters.sortOrder === 'asc' ? 1 : -1;
      if (filters.sortBy === 'priority') {
        const priorityWeight: Record<TaskPriority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (priorityWeight[a.priority] - priorityWeight[b.priority]) * factor;
      }
      if (filters.sortBy === 'dueDate') {
        return (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) * factor;
      }
      if (filters.sortBy === 'created') {
        return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * factor;
      }
      if (filters.sortBy === 'title') {
        return a.title.localeCompare(b.title) * factor;
      }
      return 0;
    });
  }, [tasks, filters]);

  // Metrics summary
  const metrics = useMemo(() => {
    const todayStr = '2026-10-14';
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'done').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const inReview = tasks.filter((t) => t.status === 'in_review').length;
    const todo = tasks.filter((t) => t.status === 'todo').length;
    const backlog = tasks.filter((t) => t.status === 'backlog').length;
    const overdue = tasks.filter((t) => t.dueDate && t.dueDate < todayStr && t.status !== 'done').length;
    const highPriority = tasks.filter((t) => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'done').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      inProgress,
      inReview,
      todo,
      backlog,
      overdue,
      completionRate,
      highPriority,
    };
  }, [tasks]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        filteredTasks,
        activityLogs,
        filters,
        setFilters,
        resetFilters,
        createTask,
        updateTask,
        deleteTask,
        moveTaskStatus,
        toggleSubtask,
        addSubtask,
        deleteSubtask,
        addComment,
        bulkUpdateStatus,
        bulkDeleteTasks,
        isLiveSyncConnected,
        simulateLiveActivity,
        resetToDefaultData,
        exportTasksJSON,
        exportTasksCSV,
        metrics,
      }}
    >
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
