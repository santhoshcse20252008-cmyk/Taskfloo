import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Calendar, 
  Trash2, 
  ArrowUpDown, 
  ChevronDown, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Filter
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority } from '../types';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';

interface TaskListViewProps {
  onSelectTask: (task: Task) => void;
}

export const TaskListView: React.FC<TaskListViewProps> = ({ onSelectTask }) => {
  const { filteredTasks, moveTaskStatus, updateTask, deleteTask, bulkUpdateStatus, bulkDeleteTasks, filters, setFilters } = useTasks();
  const { users, canEditTask, canDeleteTask, canChangeStatus } = useAuth();
  
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  const handleSelectAll = () => {
    if (selectedTaskIds.length === filteredTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(filteredTasks.map((t) => t.id));
    }
  };

  const handleToggleSelect = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleSort = (field: 'title' | 'priority' | 'dueDate' | 'created') => {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'desc' ? 'asc' : 'desc',
    }));
  };

  const statusOptions: { value: TaskStatus; label: string; bg: string }[] = [
    { value: 'backlog', label: 'Backlog', bg: 'bg-slate-100 text-slate-700' },
    { value: 'todo', label: 'To Do', bg: 'bg-sky-100 text-sky-700' },
    { value: 'in_progress', label: 'In Progress', bg: 'bg-amber-100 text-amber-700' },
    { value: 'in_review', label: 'In Review', bg: 'bg-purple-100 text-purple-700' },
    { value: 'done', label: 'Completed', bg: 'bg-emerald-100 text-emerald-700' },
  ];

  const priorityOptions: { value: TaskPriority; label: string; text: string }[] = [
    { value: 'urgent', label: 'Urgent', text: 'text-rose-600 font-bold' },
    { value: 'high', label: 'High', text: 'text-amber-600 font-semibold' },
    { value: 'medium', label: 'Medium', text: 'text-blue-600 font-medium' },
    { value: 'low', label: 'Low', text: 'text-slate-500' },
  ];

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
      
      {/* Bulk action toolbar */}
      {selectedTaskIds.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between flex-wrap gap-2 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-900 bg-blue-200/80 px-2.5 py-0.5 rounded-full">
              {selectedTaskIds.length} Selected
            </span>
            <span className="text-xs text-blue-700 hidden sm:inline">Bulk Actions:</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                bulkUpdateStatus(selectedTaskIds, 'done');
                setSelectedTaskIds([]);
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
            >
              Mark Completed
            </button>
            <button
              onClick={() => {
                bulkUpdateStatus(selectedTaskIds, 'in_progress');
                setSelectedTaskIds([]);
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 transition-colors"
            >
              Move to In Progress
            </button>
            <button
              onClick={() => {
                if (confirm(`Delete ${selectedTaskIds.length} tasks?`)) {
                  bulkDeleteTasks(selectedTaskIds);
                  setSelectedTaskIds([]);
                }
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            {/* Table Header */}
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3.5 w-10 text-center">
                  <button onClick={handleSelectAll} className="text-slate-400 hover:text-slate-600">
                    {selectedTaskIds.length === filteredTasks.length && filteredTasks.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>

                <th className="p-3.5 min-w-[240px]">
                  <button
                    onClick={() => handleSort('title')}
                    className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"
                  >
                    <span>Task Title & Details</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </th>

                <th className="p-3.5 w-36">Status</th>

                <th className="p-3.5 w-32">
                  <button
                    onClick={() => handleSort('priority')}
                    className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"
                  >
                    <span>Priority</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </th>

                <th className="p-3.5 w-36">
                  <button
                    onClick={() => handleSort('dueDate')}
                    className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"
                  >
                    <span>Due Date</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </th>

                <th className="p-3.5 w-44">Assignee</th>
                <th className="p-3.5 w-28 text-center">Subtasks</th>
                <th className="p-3.5 w-16 text-center">Action</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map((task) => {
                const isSelected = selectedTaskIds.includes(task.id);
                const assignee = users.find((u) => u.id === task.assigneeId);
                const isOverdue = task.dueDate && task.dueDate < '2026-10-14' && task.status !== 'done';
                const completedSubtasks = task.subtasks.filter((st) => st.completed).length;

                return (
                  <tr
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className={`hover:bg-blue-50/40 transition-colors cursor-pointer ${
                      isSelected ? 'bg-blue-50/60' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="p-3.5 text-center" onClick={(e) => handleToggleSelect(task.id, e)}>
                      <button className="text-slate-400 hover:text-blue-600">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Title & Tags */}
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 text-xs sm:text-sm hover:text-blue-600">
                        {task.title}
                      </div>
                      {task.tags.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {task.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Status dropdown */}
                    <td className="p-3.5" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={task.status}
                        disabled={!canChangeStatus(task)}
                        onChange={(e) => moveTaskStatus(task.id, e.target.value as TaskStatus)}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 outline-hidden hover:border-slate-300 focus:ring-1 focus:ring-blue-500"
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Priority dropdown */}
                    <td className="p-3.5" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={task.priority}
                        disabled={!canEditTask(task)}
                        onChange={(e) => updateTask(task.id, { priority: e.target.value as TaskPriority })}
                        className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-medium outline-hidden hover:border-slate-300"
                      >
                        {priorityOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Due Date */}
                    <td className="p-3.5 whitespace-nowrap">
                      <div className={`flex items-center gap-1.5 font-medium ${isOverdue ? 'text-red-600 font-bold' : 'text-slate-600'}`}>
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{task.dueDate || 'No date'}</span>
                        {isOverdue && (
                          <span className="text-[9px] bg-red-100 text-red-700 px-1 py-0.2 rounded font-extrabold">
                            Overdue
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Assignee */}
                    <td className="p-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        {assignee ? (
                          <>
                            <img
                              src={assignee.avatar}
                              alt={assignee.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className="text-slate-800 font-medium truncate max-w-[100px]">
                              {assignee.name}
                            </span>
                          </>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </div>
                    </td>

                    {/* Subtasks Count */}
                    <td className="p-3.5 text-center">
                      {task.subtasks.length > 0 ? (
                        <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full text-[11px]">
                          {completedSubtasks}/{task.subtasks.length}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* Delete */}
                    <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                      {canDeleteTask(task) && (
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${task.title}"?`)) {
                              deleteTask(task.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                    No tasks match the active filters or search terms.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
