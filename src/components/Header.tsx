import React, { useState } from 'react';
import { 
  CheckSquare, 
  Search, 
  Plus, 
  Bell, 
  Radio, 
  Sparkles, 
  FileText, 
  LogOut, 
  UserCheck, 
  ShieldCheck,
  ChevronDown,
  Layers,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';

interface HeaderProps {
  onOpenCreateModal: () => void;
  onOpenAssignmentModal: () => void;
  onOpenAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCreateModal,
  onOpenAssignmentModal,
  onOpenAuthModal,
}) => {
  const { currentUser, users, switchUser, signOut, canCreateTask } = useAuth();
  const { filters, setFilters, isLiveSyncConnected, simulateLiveActivity, activityLogs } = useTasks();
  
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'manager': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'developer': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'designer': return 'bg-pink-100 text-pink-700 border-pink-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand & Assignment Prompt trigger */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <CheckSquare className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">TaskFlow</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                  v2.4
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Full-Stack Task Workspace</p>
            </div>
          </div>

          {/* Quick Assignment Link matching the user's screenshot prompt */}
          <button
            onClick={onOpenAssignmentModal}
            className="ml-2 hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors shadow-xs"
            title="View Assignment Rubric & Submission"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Assignment #2 Brief</span>
            <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-bold">Overdue</span>
          </button>
        </div>

        {/* Center: Search input */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks, descriptions, or #tags..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100/80 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-hidden text-slate-800 placeholder-slate-400"
            />
            {filters.search && (
              <button
                onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 rounded px-1.5 py-0.5"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right Actions: Real-time sync, Simulation button, New Task, User */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Real-time status indicator & trigger */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-xs font-medium text-emerald-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live Sync Active</span>
            
            <button
              onClick={simulateLiveActivity}
              className="ml-1 text-[11px] text-emerald-700 hover:text-emerald-950 underline font-semibold flex items-center gap-1 hover:bg-emerald-100 px-1 py-0.5 rounded"
              title="Simulate incoming team update (WebSockets simulation)"
            >
              <Radio className="w-3 h-3" />
              Simulate Event
            </button>
          </div>

          {/* Activity Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-transparent hover:border-slate-200"
              title="Recent Activity"
            >
              <Bell className="w-5 h-5" />
              {activityLogs.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
              )}
            </button>

            {showNotifications && (
              <div 
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-sm text-slate-900">Live Team Feed</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">Cross-Tab Synced</span>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 px-1">
                  {activityLogs.slice(0, 8).map((log) => (
                    <div key={log.id} className="p-3 hover:bg-slate-50 rounded-xl transition-colors flex items-start gap-3">
                      <img
                        src={log.userAvatar}
                        alt={log.userName}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200 mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-800 leading-snug">
                          <span className="font-semibold">{log.userName}</span>: {log.details}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-2 border-t border-slate-100 text-center">
                  <button
                    onClick={simulateLiveActivity}
                    className="w-full py-1.5 text-xs text-blue-600 font-semibold hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    Trigger Real-Time Activity Event
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Create Task Button */}
          <button
            onClick={onOpenCreateModal}
            disabled={!canCreateTask()}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm ${
              canCreateTask()
                ? 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-blue-500/20'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
            title={canCreateTask() ? 'Create New Task' : 'Viewers cannot create tasks'}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">New Task</span>
          </button>

          {/* User Profile & Role Switcher */}
          <div className="relative">
            {currentUser ? (
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl hover:bg-slate-100 border border-slate-200/80 transition-colors"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/30"
                />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">
                    {currentUser.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors"
              >
                Sign In
              </button>
            )}

            {/* User Dropdown */}
            {showUserDropdown && currentUser && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Signed in as</p>
                  <p className="text-sm font-bold text-slate-900 truncate">{currentUser.name}</p>
                  <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold capitalize ${getRoleBadgeColor(currentUser.role)}`}>
                      {currentUser.role}
                    </span>
                    <span className="text-[11px] text-slate-600 truncate">{currentUser.title}</span>
                  </div>
                </div>

                {/* Quick Role Switcher for Testing Authorization */}
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="flex items-center justify-between mb-1.5 px-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Switch Role (Demo)
                    </span>
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div className="space-y-1">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                          u.id === currentUser.id
                            ? 'bg-blue-50 text-blue-700 font-bold'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full" />
                          <span className="truncate">{u.name}</span>
                        </div>
                        <span className="text-[10px] capitalize px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {u.role}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-1.5">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onOpenAuthModal();
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2"
                  >
                    <UserCheck className="w-4 h-4 text-slate-400" />
                    Manage Accounts / Sign In as Other
                  </button>
                  <button
                    onClick={() => {
                      signOut();
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
