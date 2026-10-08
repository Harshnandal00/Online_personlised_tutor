import { useApp } from '@/store/AppContext';
import type { View } from '@/types';
import {
  LayoutDashboard,
  CheckSquare,
  LineChart,
  CalendarClock,
  Bot,
  Trophy,
  Flame,
  X,
  GraduationCap,
  BookOpen,
  Calendar,
  FileText,
  ListTodo,
  Bell,
  ChevronRight,
  LogOut,
} from 'lucide-react';

type NavItem = { id: View; label: string; icon: typeof LayoutDashboard };

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'calendar', label: 'Calendar', icon: Calendar },
    ],
  },
  {
    label: 'Academic',
    items: [
      { id: 'homework', label: 'Homework', icon: CheckSquare },
      { id: 'tasks', label: 'Task List', icon: ListTodo },
      { id: 'subjects', label: 'Subjects', icon: BookOpen },
      { id: 'timetable', label: 'Timetable', icon: CalendarClock },
    ],
  },
  {
    label: 'AI Tools',
    items: [
      { id: 'tutor', label: 'AI Tutor', icon: Bot },
      { id: 'notes', label: 'Notes Explainer', icon: FileText },
    ],
  },
  {
    label: 'Progress',
    items: [
      { id: 'sessions', label: 'Study Analytics', icon: LineChart },
      { id: 'achievements', label: 'Achievements', icon: Trophy },
    ],
  },
];

export default function Sidebar() {
  const { studentProfile, view, setView, sidebarOpen, setSidebarOpen, unreadCount, setShowNotifPanel, signOut } = useApp();

  const handleNav = (v: View) => {
    setView(v);
    setSidebarOpen(false);
  };

  const xpPct = Math.round((studentProfile.xp / studentProfile.xpToNext) * 100);

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#0f172a] flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-sky-500/25">
              <GraduationCap className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <h1 className="text-white font-bold text-[15px] leading-tight tracking-[-0.01em]">StudyMate</h1>
              <p className="text-slate-500 text-[11px] font-medium">AI Personal Tutor</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowNotifPanel(true)}
              className="relative w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/[0.08] transition-all"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-sky-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/[0.08] transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Profile */}
        <div className="px-4 py-3.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-md flex-shrink-0">
              {studentProfile.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white font-semibold text-[13px] leading-tight truncate">{studentProfile.name}</p>
              <p className="text-slate-500 text-[11px]">{studentProfile.grade}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-orange-400 font-bold text-xs">{studentProfile.streak}</span>
            </div>
          </div>

          {/* XP Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Level {studentProfile.level}</span>
              <span className="text-[10px] text-slate-600">{studentProfile.xp}/{studentProfile.xpToNext} XP</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-400 transition-all duration-700"
                style={{ width: `${xpPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = view === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                        active
                          ? 'bg-white/[0.10] text-white'
                          : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.05]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-sky-400' : ''}`} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {active && <ChevronRight className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-soft" />
            <span className="text-[11px] text-slate-500 font-medium">AI Tutor is online</span>
          </div>
          <button
            onClick={signOut}
            title="Sign out"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-white/[0.06] transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>
    </>
  );
}
