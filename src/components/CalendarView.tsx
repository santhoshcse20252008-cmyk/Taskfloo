import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  AlertCircle, 
  Clock, 
  CheckCircle2 
} from 'lucide-react';
import { Task } from '../types';
import { useTasks } from '../context/TaskContext';

interface CalendarViewProps {
  onSelectTask: (task: Task) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onSelectTask }) => {
  const { tasks } = useTasks();

  // Current view year and month (default to Oct 2026 as per local environment time)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(9); // 0-indexed: 9 = October

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Days in month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Calendar cells
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  const todayStr = '2026-10-14';

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
      {/* Month Navigation Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <p className="text-xs text-slate-500">
              Current Date: Oct 14, 2026 • Interactive Schedule & Deadlines
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCurrentYear(2026);
              setCurrentMonth(9);
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            Today (Oct 2026)
          </button>
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Days of week */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-bold text-slate-500 py-2.5">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Day Cells */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="min-h-[100px] bg-slate-50/40 p-1.5" />;
            }

            const formattedDay = day < 10 ? `0${day}` : `${day}`;
            const formattedMonth = currentMonth + 1 < 10 ? `0${currentMonth + 1}` : `${currentMonth + 1}`;
            const cellDateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;

            const isToday = cellDateStr === todayStr;
            const dayTasks = tasks.filter((t) => t.dueDate === cellDateStr);

            return (
              <div
                key={cellDateStr}
                className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors hover:bg-slate-50/80 ${
                  isToday ? 'bg-blue-50/30 ring-2 ring-blue-500/30' : ''
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700'
                    }`}
                  >
                    {day}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] text-slate-400 font-medium">
                      {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                    </span>
                  )}
                </div>

                {/* Tasks chips */}
                <div className="space-y-1 flex-1 overflow-y-auto max-h-24">
                  {dayTasks.map((task) => {
                    const isDone = task.status === 'done';
                    const isOverdue = task.dueDate < todayStr && !isDone;

                    return (
                      <div
                        key={task.id}
                        onClick={() => onSelectTask(task)}
                        className={`text-[11px] p-1.5 rounded-lg border font-medium truncate cursor-pointer transition-transform hover:scale-[1.02] ${
                          isDone
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 line-through opacity-80'
                            : isOverdue
                            ? 'bg-rose-50 border-rose-200 text-rose-800 font-bold'
                            : task.priority === 'urgent'
                            ? 'bg-amber-50 border-amber-200 text-amber-800 font-bold'
                            : 'bg-slate-100 border-slate-200 text-slate-800'
                        }`}
                        title={task.title}
                      >
                        <div className="flex items-center gap-1">
                          {isDone ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          ) : isOverdue ? (
                            <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
                          ) : (
                            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          )}
                          <span className="truncate">{task.title}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
