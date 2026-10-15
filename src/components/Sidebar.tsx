import React from 'react';
import { 
  LayoutGrid, 
  ListOrdered, 
  Calendar, 
  BarChart3, 
  AlertCircle, 
  UserCheck, 
  Flame, 
  Tag, 
  RotateCcw,
  Download,
  ExternalLink,
  Award,
  Video
} from 'lucide-react';
import { ViewMode, TaskPriority } from '../types';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onOpenAssignmentModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  onOpenAssignmentModal,
}) => {
  const { tasks, filters, setFilters, resetFilters, resetToDefaultData, exportTasksCSV, metrics } = useTasks();
  const { currentUser } = useAuth();

  // Extract all unique tags
  const allTags = Array.from(new Set(tasks.flatMap((t) => t.tags)));

  const navItems: { id: ViewMode; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'board', label: 'Kanban Board', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'list', label: 'List View', icon: <ListOrdered className="w-4 h-4" />, count: tasks.length },
    { id: 'calendar', label: 'Deadlines Calendar', icon: <Calendar className="w-4 h-4" /> },
    { id: 'analytics', label: 'Metrics & Rubric', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const isAssignedToMeActive = currentUser && filters.assigneeId === currentUser.id;

  return (
    <aside className="w-64 bg-slate-50/70 border-r border-slate-200 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none overflow-y-auto">
      <div className="p-4 space-y-6">
        
        {/* Navigation Views */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Workspace Views
          </p>
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Filters */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Quick Filters
            </p>
            {(filters.onlyOverdue || filters.assigneeId !== 'all' || filters.priority !== 'all' || filters.tag !== 'all') && (
              <button
                onClick={resetFilters}
                className="text-[10px] font-bold text-blue-600 hover:underline"
              >
                Reset
              </button>
            )}
          </div>

          {/* Assigned to Me */}
          {currentUser && (
            <button
              onClick={() => {
                setFilters((prev) => ({
                  ...prev,
                  assigneeId: isAssignedToMeActive ? 'all' : currentUser.id,
                }));
              }}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isAssignedToMeActive
                  ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                  : 'text-slate-600 hover:bg-slate-200/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                <span>Assigned to me</span>
              </div>
              <span className="text-[11px] text-slate-400">
                {tasks.filter((t) => t.assigneeId === currentUser.id).length}
              </span>
            </button>
          )}

          {/* Overdue */}
          <button
            onClick={() => {
              setFilters((prev) => ({
                ...prev,
                onlyOverdue: !prev.onlyOverdue,
              }));
            }}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filters.onlyOverdue
                ? 'bg-red-50 text-red-700 font-bold border border-red-200'
                : 'text-slate-600 hover:bg-slate-200/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-red-500" />
              <span>Overdue Tasks</span>
            </div>
            {metrics.overdue > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                {metrics.overdue}
              </span>
            )}
          </button>

          {/* High Priority */}
          <button
            onClick={() => {
              setFilters((prev) => ({
                ...prev,
                priority: prev.priority === 'urgent' ? 'all' : 'urgent',
              }));
            }}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filters.priority === 'urgent'
                ? 'bg-amber-50 text-amber-700 font-bold border border-amber-200'
                : 'text-slate-600 hover:bg-slate-200/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Urgent Priority</span>
            </div>
            <span className="text-[11px] text-slate-400">
              {tasks.filter((t) => t.priority === 'urgent').length}
            </span>
          </button>
        </div>

        {/* Tags list */}
        {allTags.length > 0 && (
          <div className="space-y-1.5">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Filter By Tag
            </p>
            <div className="px-2 flex flex-wrap gap-1.5">
              {allTags.map((tag) => {
                const isSelected = filters.tag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => {
                      setFilters((prev) => ({
                        ...prev,
                        tag: isSelected ? 'all' : tag,
                      }));
                    }}
                    className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Exact Prompt Assignment Box (matching image uploaded by user) */}
        <div className="mx-1 p-3.5 rounded-2xl bg-gradient-to-br from-blue-50/90 to-indigo-50/50 border border-blue-200/80 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
              2
            </div>
            <span className="text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 uppercase">
              Available
            </span>
          </div>

          <div>
            <div className="text-xs font-bold text-slate-800 leading-tight">
              Task Management Application
            </div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-500 font-medium">Due: 08 Jul 2026</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-red-100 text-red-700">
                Overdue 98 Days
              </span>
            </div>
          </div>

          <div className="pt-1 flex flex-col gap-1.5">
            <button
              onClick={onOpenAssignmentModal}
              className="w-full py-1.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5" />
              Submit Work
            </button>
            <button
              onClick={onOpenAssignmentModal}
              className="w-full py-1 text-[11px] font-semibold text-slate-600 hover:text-blue-700 flex items-center justify-center gap-1"
            >
              <Video className="w-3 h-3 text-red-600" />
              Watch Tutorial & Specs
            </button>
          </div>
          
          <p className="text-[9px] text-center text-slate-400">
            Maintained by Team Emogi (emogi.in)
          </p>
        </div>

      </div>

      {/* Footer controls: Reset data, Export */}
      <div className="p-3 border-t border-slate-200 bg-white/60 space-y-1.5 text-xs">
        <div className="flex items-center justify-between text-slate-500 px-1 text-[11px]">
          <span>Progress</span>
          <span className="font-bold text-slate-700">{metrics.completionRate}% Done</span>
        </div>
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${metrics.completionRate}%` }}
          />
        </div>

        <div className="pt-2 flex items-center justify-between gap-1">
          <button
            onClick={resetToDefaultData}
            className="flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-[11px] text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Reset to default demo data"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Data
          </button>
          <button
            onClick={exportTasksCSV}
            className="flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-[11px] text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Export tasks to CSV"
          >
            <Download className="w-3 h-3" />
            Export CSV
          </button>
        </div>
      </div>
    </aside>
  );
};
