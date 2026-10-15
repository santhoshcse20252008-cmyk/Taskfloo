import React, { useState } from 'react';
import { X, ShieldCheck, UserCheck, ArrowRight, UserPlus, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { users, currentUser, switchUser, signIn, signUp } = useAuth();
  const [tab, setTab] = useState<'demo' | 'signin' | 'signup'>('demo');

  // Sign In form
  const [signInEmail, setSignInEmail] = useState('');
  const [signInError, setSignInError] = useState('');

  // Sign Up form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<User['role']>('developer');
  const [newTitle, setNewTitle] = useState('');

  if (!isOpen) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError('');
    const success = signIn(signInEmail.trim());
    if (success) {
      onClose();
    } else {
      setSignInError('No account found with this email. Please pick a demo account or sign up.');
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    signUp({
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      title: newTitle.trim() || `${newRole.toUpperCase()} Contributor`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newName.trim())}`,
    });

    onClose();
  };

  const roleDescriptions: Record<User['role'], string> = {
    admin: 'Full permissions: create, edit, delete any task, and assign roles.',
    manager: 'Management tier: create, assign, change status, and edit any task.',
    developer: 'Contributor tier: create tasks, edit own assigned tasks, and complete subtasks.',
    designer: 'Contributor tier: create and update design sprint deliverables.',
    viewer: 'Read-only access: can inspect boards and metrics, but cannot mutate tasks.',
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
              User Authentication & Authorization
            </h3>
            <p className="text-xs text-slate-500">
              Select or create an account to test role-based access control
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-200 bg-slate-50/40 p-1 text-xs font-bold text-slate-500">
          <button
            onClick={() => setTab('demo')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              tab === 'demo' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            1-Click Demo Profiles
          </button>
          <button
            onClick={() => setTab('signin')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              tab === 'signin' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            Sign In with Email
          </button>
          <button
            onClick={() => setTab('signup')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              tab === 'signup' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            New Registration
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto">
          {/* TAB 1: 1-Click Demo Profiles */}
          {tab === 'demo' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 mb-2">
                Click any profile to instantly switch identity and observe role permissions in real time:
              </p>

              {users.map((user) => {
                const isActive = currentUser?.id === user.id;
                return (
                  <button
                    key={user.id}
                    onClick={() => {
                      switchUser(user.id);
                      onClose();
                    }}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                      isActive
                        ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                            {user.name}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize bg-slate-100 text-slate-700">
                            {user.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">{user.title}</p>
                        <p className="text-[11px] text-slate-400 mt-1">{roleDescriptions[user.role]}</p>
                      </div>
                    </div>

                    {isActive ? (
                      <span className="text-xs font-bold text-blue-600 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shrink-0">
                        Active
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-slate-400 hover:text-slate-700 shrink-0">
                        Switch →
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 2: Sign In */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. santhoshcse20252008@gmail.com"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-hidden text-slate-900"
                />
              </div>

              {signInError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-700 rounded-xl font-medium">
                  {signInError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Sign In
              </button>
            </form>
          )}

          {/* TAB 3: Sign Up */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Miller"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. jordan.m@company.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role & Permissions</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as User['role'])}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-hidden"
                >
                  <option value="developer">Developer (Create & Edit Own Tasks)</option>
                  <option value="manager">Manager (Manage Team & Move Tasks)</option>
                  <option value="admin">Admin (Full Control)</option>
                  <option value="designer">Designer (Creative Tasks)</option>
                  <option value="viewer">Viewer (Read-only)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">{roleDescriptions[newRole]}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Job Title / Department</label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Create Account & Sign In
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
