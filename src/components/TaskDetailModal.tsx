import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  CheckSquare, 
  Clock, 
  Trash2, 
  MessageSquare, 
  Send, 
  Tag, 
  Plus, 
  User as UserIcon, 
  AlertCircle,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../types';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose }) => {
  const { updateTask, deleteTask, toggleSubtask, addSubtask, deleteSubtask, addComment } = useTasks();
  const { users, currentUser, canEditTask, canDeleteTask, canChangeStatus } = useAuth();

  if (!task) return null;

  const isEditable = canEditTask(task);
  const isDeletable = canDeleteTask(task);
  const isStatusChangeable = canChangeStatus(task);

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newTagInput, setNewTagInput] = useState('');

  const completedSubtasks = task.subtasks.filter((st) => st.completed).length;
  const totalSubtasks = task.subtasks.length;
  const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
  const isOverdue = task.dueDate && task.dueDate < '2026-10-14' && task.status !== 'done';

  const handleSaveTitleDesc = () => {
    if (isEditable && (title !== task.title || description !== task.description)) {
      updateTask(task.id, { title: title.trim() || task.title, description: description.trim() });
    }
  };

  const handleAddSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim() && isEditable) {
      addSubtask(task.id, newSubtaskTitle.trim());
      setNewSubtaskTitle('');
    }
  };

  const handleAddCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addComment(task.id, newComment.trim());
      setNewComment('');
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTagInput.trim() && isEditable) {
      e.preventDefault();
      const cleanTag = newTagInput.trim().replace(/^#/, '');
      if (!task.tags.includes(cleanTag)) {
        updateTask(task.id, { tags: [...task.tags, cleanTag] });
      }
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (isEditable) {
      updateTask(task.id, { tags: task.tags.filter((t) => t !== tagToRemove) });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-slate-400 font-semibold">{task.id}</span>
            
            {/* Status Select */}
            <select
              value={task.status}
              disabled={!isStatusChangeable}
              onChange={(e) => updateTask(task.id, { status: e.target.value as TaskStatus })}
              className="text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 capitalize"
            >
              <option value="backlog">Backlog</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="done">Completed</option>
            </select>

            {/* Priority Select */}
            <select
              value={task.priority}
              disabled={!isEditable}
              onChange={(e) => updateTask(task.id, { priority: e.target.value as TaskPriority })}
              className={`text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-200 bg-white capitalize ${
                task.priority === 'urgent' ? 'text-rose-600' : task.priority === 'high' ? 'text-amber-600' : 'text-slate-700'
              }`}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent Priority</option>
            </select>

            {isOverdue && (
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-100 text-rose-700 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Overdue
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {isDeletable && (
              <button
                onClick={() => {
                  if (confirm(`Delete task "${task.title}"?`)) {
                    deleteTask(task.id);
                    onClose();
                  }
                }}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                title="Delete Task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Permission Notice */}
          {!isEditable && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
              <Lock className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                You are currently viewing in read-only mode for this task (Role: {currentUser?.role}). Only Admins, Managers, or the Assignee can edit this task.
              </span>
            </div>
          )}

          {/* Title & Description Editor */}
          <div className="space-y-3">
            <input
              type="text"
              value={title}
              disabled={!isEditable}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSaveTitleDesc}
              className="w-full text-lg sm:text-xl font-extrabold text-slate-900 border-b border-transparent focus:border-blue-500 focus:bg-slate-50/50 px-1 py-1 rounded transition-colors outline-hidden disabled:bg-transparent"
              placeholder="Task Title..."
            />

            <textarea
              value={description}
              disabled={!isEditable}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleSaveTitleDesc}
              rows={3}
              className="w-full text-xs sm:text-sm text-slate-600 bg-slate-50/50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-blue-500 outline-hidden transition-all disabled:bg-slate-50"
              placeholder="Add more details, acceptance criteria, or technical notes..."
            />
          </div>

          {/* Metadata Grid: Due Date, Assignee, Estimated Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            {/* Assignee */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Assignee
              </label>
              <select
                value={task.assigneeId || ''}
                disabled={!isEditable}
                onChange={(e) => updateTask(task.id, { assigneeId: e.target.value || undefined })}
                className="w-full text-xs font-semibold p-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-1 focus:ring-blue-500 outline-hidden"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={task.dueDate || ''}
                disabled={!isEditable}
                onChange={(e) => updateTask(task.id, { dueDate: e.target.value })}
                className="w-full text-xs font-semibold p-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-1 focus:ring-blue-500 outline-hidden"
              />
            </div>

            {/* Estimated Hours */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Estimated Hours
              </label>
              <input
                type="number"
                min="0"
                value={task.estimatedHours || ''}
                disabled={!isEditable}
                onChange={(e) => updateTask(task.id, { estimatedHours: Number(e.target.value) || undefined })}
                placeholder="e.g. 8"
                className="w-full text-xs font-semibold p-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-1 focus:ring-blue-500 outline-hidden"
              />
            </div>
          </div>

          {/* Tags Section */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Tags & Labels
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                >
                  #{tag}
                  {isEditable && (
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-slate-400 hover:text-rose-600 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}

              {isEditable && (
                <input
                  type="text"
                  placeholder="+ Add tag (press enter)"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="text-xs px-2.5 py-1 bg-white border border-dashed border-slate-300 rounded-lg text-slate-700 outline-hidden focus:border-blue-500"
                />
              )}
            </div>
          </div>

          {/* Subtasks Checklist */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Checklist Subtasks ({completedSubtasks}/{totalSubtasks})
                </h4>
              </div>
              <span className="text-xs font-bold text-blue-600">{progressPercent}%</span>
            </div>

            {/* Subtask Progress bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Subtask Items */}
            <div className="space-y-1.5">
              {task.subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                >
                  <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => toggleSubtask(task.id, st.id)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span
                      className={`text-xs ${
                        st.completed ? 'line-through text-slate-400' : 'text-slate-800 font-medium'
                      }`}
                    >
                      {st.title}
                    </span>
                  </label>

                  {isEditable && (
                    <button
                      onClick={() => deleteSubtask(task.id, st.id)}
                      className="text-slate-300 hover:text-rose-600 p-1 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Subtask Form */}
            {isEditable && (
              <form onSubmit={handleAddSubtaskSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a new checklist item..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-hidden"
                />
                <button
                  type="submit"
                  disabled={!newSubtaskTitle.trim()}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </form>
            )}
          </div>

          {/* Real-Time Comments Discussion */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Live Discussion & Activity ({task.comments.length})
              </h4>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {task.comments.map((comment) => (
                <div key={comment.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <img
                    src={comment.userAvatar}
                    alt={comment.userName}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200 mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{comment.userName}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              ))}

              {task.comments.length === 0 && (
                <p className="text-xs text-slate-400 italic">No comments yet. Start the conversation!</p>
              )}
            </div>

            {/* Add Comment Input */}
            {currentUser && (
              <form onSubmit={handleAddCommentSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Comment as ${currentUser.name}...`}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-hidden"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  Post
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Created on {new Date(task.createdAt).toLocaleDateString()}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
