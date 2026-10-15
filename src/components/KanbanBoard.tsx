import React, { useState } from 'react';
import { Plus, CheckCircle2, Clock, CircleDot, PlayCircle, Eye, Archive } from 'lucide-react';
import { Task, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';

interface KanbanBoardProps {
  onSelectTask: (task: Task) => void;
  onOpenCreateWithStatus: (status: TaskStatus) => void;
}

interface ColumnConfig {
  id: TaskStatus;
  title: string;
  icon: React.ReactNode;
  headerColor: string;
  badgeBg: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    icon: <Archive className="w-4 h-4 text-slate-500" />,
    headerColor: 'border-slate-300 text-slate-700',
    badgeBg: 'bg-slate-200 text-slate-700',
  },
  {
    id: 'todo',
    title: 'To Do',
    icon: <CircleDot className="w-4 h-4 text-sky-500" />,
    headerColor: 'border-sky-400 text-sky-800',
    badgeBg: 'bg-sky-100 text-sky-700',
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    icon: <PlayCircle className="w-4 h-4 text-amber-500" />,
    headerColor: 'border-amber-400 text-amber-800',
    badgeBg: 'bg-amber-100 text-amber-700',
  },
  {
    id: 'in_review',
    title: 'In Review',
    icon: <Eye className="w-4 h-4 text-purple-500" />,
    headerColor: 'border-purple-400 text-purple-800',
    badgeBg: 'bg-purple-100 text-purple-700',
  },
  {
    id: 'done',
    title: 'Completed',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    headerColor: 'border-emerald-400 text-emerald-800',
    badgeBg: 'bg-emerald-100 text-emerald-700',
  },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  onSelectTask,
  onOpenCreateWithStatus,
}) => {
  const { filteredTasks, moveTaskStatus } = useTasks();
  const { canCreateTask, canChangeStatus } = useAuth();
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [activeDropColumn, setActiveDropColumn] = useState<TaskStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (activeDropColumn !== status) {
      setActiveDropColumn(status);
    }
  };

  const handleDragLeave = () => {
    setActiveDropColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    setActiveDropColumn(null);
    setDraggedTaskId(null);

    if (taskId) {
      const task = filteredTasks.find((t) => t.id === taskId);
      if (task && canChangeStatus(task)) {
        moveTaskStatus(taskId, targetStatus);
      }
    }
  };

  return (
    <div className="flex-1 overflow-x-auto p-4 sm:p-6">
      <div className="flex gap-4 sm:gap-6 min-w-max pb-6">
        {COLUMNS.map((column) => {
          const columnTasks = filteredTasks.filter((t) => t.status === column.id);
          const isDropActive = activeDropColumn === column.id;

          return (
            <div
              key={column.id}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
              className={`w-72 sm:w-80 flex flex-col rounded-2xl bg-slate-100/70 border transition-all duration-200 ${
                isDropActive
                  ? 'border-blue-500 ring-2 ring-blue-400/20 bg-blue-50/40'
                  : 'border-slate-200/80'
              }`}
            >
              {/* Column Header */}
              <div className="p-3.5 flex items-center justify-between border-b border-slate-200/60 bg-white/50 rounded-t-2xl">
                <div className="flex items-center gap-2">
                  {column.icon}
                  <span className="font-bold text-xs sm:text-sm text-slate-800 tracking-tight">
                    {column.title}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${column.badgeBg}`}>
                    {columnTasks.length}
                  </span>
                </div>

                {canCreateTask() && (
                  <button
                    onClick={() => onOpenCreateWithStatus(column.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-white transition-colors"
                    title={`Add task to ${column.title}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Tasks List */}
              <div className="p-3 flex-1 overflow-y-auto space-y-3 min-h-[400px]">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable={canChangeStatus(task)}
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className={canChangeStatus(task) ? 'cursor-grab active:cursor-grabbing' : ''}
                  >
                    <TaskCard task={task} onSelectTask={onSelectTask} />
                  </div>
                ))}

                {columnTasks.length === 0 && (
                  <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-xs text-slate-400 font-medium">No tasks in {column.title}</p>
                    {canCreateTask() && (
                      <button
                        onClick={() => onOpenCreateWithStatus(column.id)}
                        className="mt-2 text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Create one now
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
