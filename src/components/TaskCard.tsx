import React from 'react';
import { 
  Calendar, 
  CheckSquare, 
  MessageSquare, 
  Clock, 
  MoreVertical, 
  AlertCircle, 
  ArrowRight,
  Trash2,
  Edit3
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';

interface TaskCardProps {
  task: Task;
  onSelectTask: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onSelectTask }) => {
  const { users, canEditTask, canDeleteTask, canChangeStatus } = useAuth();
  const { moveTaskStatus, deleteTask } = useTasks();

  const assignee = users.find((u) => u.id === task.assigneeId);
  const isOverdue = task.dueDate && task.dueDate < '2026-10-14' && task.status !== 'done';
  const completedSubtasks = task.subtasks.filter((st) => st.completed).length;
  const totalSubtasks = task.subtasks.length;
  const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  const priorityStyles: Record<TaskPriority, { bg: string; dot: string; label: string }> = {
    urgent: { bg: 'bg-rose-50 border-rose-200 text-rose-700', dot: 'bg-rose-500', label: 'Urgent' },
    high: { bg: 'bg-amber-50 border-amber-200 text-amber-700', dot: 'bg-amber-500', label: 'High' },
    medium: { bg: 'bg-blue-50 border-blue-200 text-blue-700', dot: 'bg-blue-500', label: 'Medium' },
    low: { bg: 'bg-slate-100 border-slate-200 text-slate-600', dot: 'bg-slate-400', label: 'Low' },
  };

  const nextStatuses: Record<TaskStatus, TaskStatus | null> = {
    backlog: 'todo',
    todo: 'in_progress',
    in_progress: 'in_review',
    in_review: 'done',
    done: null,
  };

  const nextStatusLabel: Record<TaskStatus, string> = {
    backlog: 'To Do',
    todo: 'In Progress',
    in_progress: 'In Review',
    in_review: 'Complete',
    done: '',
  };

  const handleNextStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = nextStatuses[task.status];
    if (next && canChangeStatus(task)) {
      moveTaskStatus(task.id, next);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete task "${task.title}"?`)) {
      deleteTask(task.id);
    }
  };

  return (
    <div
      onClick={() => onSelectTask(task)}
      className="group relative bg-white rounded-2xl p-4 border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-3 select-none"
    >
      <div>
        {/* Top bar: Priority & Actions */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${priorityStyles[task.priority].bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priorityStyles[task.priority].dot}`} />
              {priorityStyles[task.priority].label}
            </span>

            {isOverdue && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-red-100 text-red-700 border border-red-200">
                <AlertCircle className="w-3 h-3" />
                Overdue
              </span>
            )}
          </div>

          {/* Quick status progress button */}
          {nextStatuses[task.status] && canChangeStatus(task) && (
            <button
              onClick={handleNextStatus}
              title={`Move to ${nextStatusLabel[task.status]}`}
              className="opacity-0 group-hover:opacity-100 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 transition-all flex items-center gap-1"
            >
              <span>{nextStatusLabel[task.status]}</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          )}
        </div>

        {/* Task Title */}
        <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
          {task.title}
        </h4>

        {/* Task Description */}
        {task.description && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
            {task.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md"
              >
                #{tag}
              </span>
            ))}
            {task.tags.length > 3 && (
              <span className="text-[10px] text-slate-400 font-medium">
                +{task.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Subtask Progress Bar */}
        {totalSubtasks > 0 && (
          <div className="mt-3 pt-2.5 border-t border-slate-100">
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
              <span className="flex items-center gap-1 font-medium">
                <CheckSquare className="w-3 h-3 text-slate-400" />
                Subtasks
              </span>
              <span className="font-semibold">{completedSubtasks}/{totalSubtasks}</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  progressPercent === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Info: Due Date, Assignee, Comments */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          {task.dueDate && (
            <span className={`flex items-center gap-1 text-[11px] font-medium ${isOverdue ? 'text-red-600 font-bold' : ''}`}>
              <Calendar className="w-3.5 h-3.5" />
              {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}

          {task.comments.length > 0 && (
            <span className="flex items-center gap-1 text-[11px]">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              {task.comments.length}
            </span>
          )}

          {task.estimatedHours && (
            <span className="hidden sm:flex items-center gap-1 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {task.estimatedHours}h
            </span>
          )}
        </div>

        {/* Assignee Avatar */}
        <div className="flex items-center gap-1">
          {assignee ? (
            <img
              src={assignee.avatar}
              alt={assignee.name}
              title={`Assigned to ${assignee.name} (${assignee.role})`}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-white shadow-xs"
            />
          ) : (
            <div
              className="w-6 h-6 rounded-full bg-slate-200 border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-500 font-bold"
              title="Unassigned"
            >
              ?
            </div>
          )}

          {/* Delete Action if authorized */}
          {canDeleteTask(task) && (
            <button
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-all ml-1"
              title="Delete Task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
