import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { KanbanBoard } from './components/KanbanBoard';
import { TaskListView } from './components/TaskListView';
import { CalendarView } from './components/CalendarView';
import { AnalyticsView } from './components/AnalyticsView';
import { TaskDetailModal } from './components/TaskDetailModal';
import { TaskCreateModal } from './components/TaskCreateModal';
import { AssignmentModal } from './components/AssignmentModal';
import { AuthModal } from './components/AuthModal';
import { ViewMode, Task, TaskStatus } from './types';
import { 
  LayoutGrid, 
  ListOrdered, 
  Calendar, 
  BarChart3, 
  Plus, 
  Award,
  Filter,
  CheckCircle2
} from 'lucide-react';

const MainApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('board');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createInitialStatus, setCreateInitialStatus] = useState<TaskStatus>('todo');
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleOpenCreateWithStatus = (status: TaskStatus) => {
    setCreateInitialStatus(status);
    setIsCreateModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header
        onOpenCreateModal={() => {
          setCreateInitialStatus('todo');
          setIsCreateModalOpen(true);
        }}
        onOpenAssignmentModal={() => setIsAssignmentModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 flex max-w-full overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block shrink-0">
          <Sidebar
            currentView={currentView}
            onViewChange={setCurrentView}
            onOpenAssignmentModal={() => setIsAssignmentModalOpen(true)}
          />
        </div>

        {/* Content View Area */}
        <main className="flex-1 flex flex-col min-w-0 h-[calc(100vh-4rem)] overflow-hidden pb-16 md:pb-0">
          
          {/* Subheader / Breadcrumb bar on mobile or top of view */}
          <div className="px-4 py-2.5 bg-white/70 border-b border-slate-200/80 flex items-center justify-between gap-3 text-xs md:hidden">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <span className="capitalize">{currentView} View</span>
            </div>

            <button
              onClick={() => setIsAssignmentModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[11px]"
            >
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Assignment #2</span>
            </button>
          </div>

          {/* Dynamic View rendering */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {currentView === 'board' && (
              <KanbanBoard
                onSelectTask={setSelectedTask}
                onOpenCreateWithStatus={handleOpenCreateWithStatus}
              />
            )}

            {currentView === 'list' && (
              <TaskListView onSelectTask={setSelectedTask} />
            )}

            {currentView === 'calendar' && (
              <CalendarView onSelectTask={setSelectedTask} />
            )}

            {currentView === 'analytics' && (
              <AnalyticsView onSelectTask={setSelectedTask} />
            )}
          </div>
        </main>
      </div>

      {/* Mobile Floating Action Button */}
      <div className="fixed bottom-20 right-4 md:hidden z-30">
        <button
          onClick={() => {
            setCreateInitialStatus('todo');
            setIsCreateModalOpen(true);
          }}
          className="w-12 h-12 rounded-full bg-blue-600 text-white shadow-xl flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-transform"
          aria-label="Add Task"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-1.5 flex items-center justify-around">
        <button
          onClick={() => setCurrentView('board')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-bold ${
            currentView === 'board' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Board</span>
        </button>

        <button
          onClick={() => setCurrentView('list')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-bold ${
            currentView === 'list' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <ListOrdered className="w-4 h-4" />
          <span>List</span>
        </button>

        <button
          onClick={() => setCurrentView('calendar')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-bold ${
            currentView === 'calendar' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Calendar</span>
        </button>

        <button
          onClick={() => setCurrentView('analytics')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-bold ${
            currentView === 'analytics' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Rubric</span>
        </button>
      </nav>

      {/* Modals */}
      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />

      <TaskCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        initialStatus={createInitialStatus}
      />

      <AssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <MainApp />
      </TaskProvider>
    </AuthProvider>
  );
}
