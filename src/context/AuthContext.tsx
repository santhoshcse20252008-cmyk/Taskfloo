import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Task } from '../types';
import { INITIAL_USERS } from '../data/initialData';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  signIn: (email: string) => boolean;
  signUp: (userData: Omit<User, 'id'>) => User;
  switchUser: (userId: string) => void;
  signOut: () => void;
  canCreateTask: () => boolean;
  canEditTask: (task: Task) => boolean;
  canDeleteTask: (task: Task) => boolean;
  canChangeStatus: (task: Task) => boolean;
  canManageUsers: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USER = 'taskflow_current_user_v1';
const STORAGE_KEY_USERS_LIST = 'taskflow_users_list_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USERS_LIST);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) return JSON.parse(saved);
      // Default to the first user (Santhosh Kumar - Lead Full-Stack Engineer)
      return INITIAL_USERS[0];
    } catch {
      return INITIAL_USERS[0];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USERS_LIST, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users to storage', e);
    }
  }, [users]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    } catch (e) {
      console.error('Failed to save current user', e);
    }
  }, [currentUser]);

  const signIn = (email: string): boolean => {
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentUser(found);
      return true;
    }
    return false;
  };

  const signUp = (userData: Omit<User, 'id'>): User => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.name)}`,
    };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return newUser;
  };

  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
    }
  };

  const signOut = () => {
    setCurrentUser(null);
  };

  // Authorization policy methods
  const canCreateTask = (): boolean => {
    if (!currentUser) return false;
    return currentUser.role !== 'viewer';
  };

  const canEditTask = (task: Task): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin' || currentUser.role === 'manager') return true;
    if (currentUser.role === 'viewer') return false;
    // Developer or designer can edit their own assigned tasks or tasks they created
    return task.assigneeId === currentUser.id || task.createdBy === currentUser.id;
  };

  const canDeleteTask = (task: Task): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'manager' && task.createdBy === currentUser.id) return true;
    return task.createdBy === currentUser.id;
  };

  const canChangeStatus = (task: Task): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'viewer') return false;
    // Admin & manager can move any task; assignees can update status
    return (
      currentUser.role === 'admin' ||
      currentUser.role === 'manager' ||
      task.assigneeId === currentUser.id ||
      task.createdBy === currentUser.id
    );
  };

  const canManageUsers = (): boolean => {
    return currentUser?.role === 'admin';
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        signIn,
        signUp,
        switchUser,
        signOut,
        canCreateTask,
        canEditTask,
        canDeleteTask,
        canChangeStatus,
        canManageUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
