import React from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Download, 
  Flame, 
  Users, 
  FileJson,
  FileSpreadsheet,
  Layers,
  Sparkles
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { Task } from '../types';

interface AnalyticsViewProps {
  onSelectTask: (task: Task) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onSelectTask }) => {
  const { tasks, metrics, exportTasksJSON, exportTasksCSV } = useTasks();
  const { users } = useAuth();

  const todayStr = '2026-10-14';
  const overdueTasks = tasks.filter((t) => t.dueDate && t.dueDate < todayStr && t.status !== 'done');

  // Workload per user
  const userWorkload = users.map((user) => {
    const assignedTasks = tasks.filter((t) => t.assigneeId === user.id);
    const completedTasks = assignedTasks.filter((t) => t.status === 'done');
    const rate = assignedTasks.length > 0 ? Math.round((completedTasks.length / assignedTasks.length) * 100) : 0;
    return {
      user,
      total: assignedTasks.length,
      completed: completedTasks.length,
      rate,
    };
  });

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
      
      {/* Header with Export buttons */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Project Performance & Analytics
          </h2>
          <p className="text-xs text-slate-500">
            Real-time telemetry, completion rate tracking, and resource allocation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportTasksJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <FileJson className="w-4 h-4 text-slate-500" />
            Export JSON
          </button>
          <button
            onClick={exportTasksCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total & Completion */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Completion Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{metrics.completionRate}%</div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.completionRate}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {metrics.completed} of {metrics.total} tasks completed
          </p>
        </div>

        {/* Active In Progress */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>In Flight Tasks</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {metrics.inProgress + metrics.inReview}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {metrics.inProgress} In Progress • {metrics.inReview} Under Review
          </p>
        </div>

        {/* Urgent & High Priority */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Urgent / High Priority</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600">
            {metrics.highPriority}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Require critical sprint focus
          </p>
        </div>

        {/* Overdue */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Overdue Tasks</span>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-red-600">
            {metrics.overdue}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Past scheduled deadline
          </p>
        </div>

      </div>

      {/* Two-Column Grid: Team Workload & Overdue Warning List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Team Workload */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-900">Team Workload Distribution</h3>
            </div>
            <span className="text-[11px] text-slate-400">{users.length} Active Members</span>
          </div>

          <div className="space-y-3">
            {userWorkload.map(({ user, total, completed, rate }) => (
              <div key={user.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-500 capitalize">{user.role} • {user.title}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-slate-800">
                    {completed}/{total} done ({rate}%)
                  </div>
                  <div className="w-24 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1 ml-auto">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overdue & Urgent Attention */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <h3 className="font-bold text-sm text-slate-900">Tasks Requiring Attention</h3>
            </div>
            <span className="text-[11px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full">
              {overdueTasks.length} Overdue
            </span>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto">
            {overdueTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                className="p-3 rounded-xl border border-rose-200 bg-rose-50/40 hover:bg-rose-50 cursor-pointer transition-colors flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 hover:text-blue-600">
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-rose-700 mt-1">
                    <span>Due: {task.dueDate}</span>
                    <span>•</span>
                    <span className="capitalize">{task.status.replace('_', ' ')}</span>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-100 text-rose-700 uppercase">
                  Action Needed
                </span>
              </div>
            ))}

            {overdueTasks.length === 0 && (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                Great job! No tasks are currently overdue.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
