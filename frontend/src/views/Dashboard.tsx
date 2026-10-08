import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import {
  Flame,
  TrendingUp,
  BookCheck,
  Clock,
  Quote,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Circle,
  PlayCircle,
  Bot,
  ListTodo,
  Sparkles,
  Bell,
  X,
  Trophy,
  Zap,
  LogOut,
} from 'lucide-react';
import type { View } from '@/types';

type StatType = 'streak' | 'hours' | 'homework' | 'level';

export default function Dashboard() {
  const {
    studentProfile,
    homeworks: hwList,
    todayQuote,
    setView,
    tasks,
    notifications,
    unreadCount,
    setShowNotifPanel,
    signOut,
  } = useApp();
  const [detailOpen, setDetailOpen] = useState<StatType | null>(null);

  const pending = hwList.filter((h) => h.status === 'pending').length;
  const inProgress = hwList.filter((h) => h.status === 'in-progress').length;
  const overdue = hwList.filter((h) => h.status === 'overdue').length;
  const completed = hwList.filter((h) => h.status === 'completed').length;

  const stats: {
    type: StatType; label: string; value: string; sub: string;
    icon: typeof Flame; gradient: string; iconBg: string; iconColor: string;
  }[] = [
    {
      type: 'streak', label: 'Day Streak', value: `${studentProfile.streak}`,
      sub: studentProfile.longestStreak > 0 ? `Best: ${studentProfile.longestStreak} days` : 'Start your first streak!',
      icon: Flame, gradient: 'from-orange-500/10 to-red-500/5', iconBg: 'bg-orange-100', iconColor: 'text-orange-600',
    },
    {
      type: 'hours', label: 'Study Hours', value: `${studentProfile.totalStudyHours}`,
      sub: studentProfile.totalStudyHours > 0 ? 'This semester' : 'No sessions yet',
      icon: Clock, gradient: 'from-sky-500/10 to-cyan-500/5', iconBg: 'bg-sky-100', iconColor: 'text-sky-600',
    },
    {
      type: 'homework', label: 'Assignments Done', value: `${studentProfile.homeworkCompleted}`,
      sub: pending + inProgress > 0 ? `${pending + inProgress} active` : 'None active',
      icon: BookCheck, gradient: 'from-emerald-500/10 to-teal-500/5', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600',
    },
    {
      type: 'level', label: 'Level', value: `${studentProfile.level}`,
      sub: `${studentProfile.xp} XP earned`,
      icon: TrendingUp, gradient: 'from-violet-500/10 to-purple-500/5', iconBg: 'bg-violet-100', iconColor: 'text-violet-600',
    },
  ];

  const activeTasks = tasks.filter((t) => t.status !== 'done');
  const upcomingTaskItems = activeTasks.slice(0, 4);
  const latestNotifs = notifications.slice(0, 3);

  const quickNav: { view: View; label: string; desc: string; icon: typeof Bot; bg: string; iconColor: string }[] = [
    { view: 'tutor', label: 'Ask AI Tutor', desc: 'Get instant help on any topic', icon: Bot, bg: 'bg-sky-50', iconColor: 'text-sky-600' },
    { view: 'tasks', label: 'My Task List', desc: activeTasks.length > 0 ? `${activeTasks.length} active tasks` : 'Add your first task', icon: ListTodo, bg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { view: 'timetable', label: 'View Timetable', desc: "This week's study plan", icon: ArrowRight, bg: 'bg-amber-50', iconColor: 'text-amber-600' },
    { view: 'sessions', label: 'Study Analytics', desc: 'See your progress trends', icon: TrendingUp, bg: 'bg-violet-50', iconColor: 'text-violet-600' },
  ];

  // Build streak history from 0 (new users have no active days yet)
  const streakDays = studentProfile.streak;
  const streakHistory = Array.from({ length: 28 }, (_, i) => ({
    day: i + 1,
    active: i >= 28 - streakDays && streakDays > 0,
  }));

  const hwTotal = hwList.length;

  // Derive a first-name for the greeting
  const firstName = studentProfile.name.split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Page Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{greeting}, {firstName}! 👋</h2>
          <p className="text-slate-500 mt-0.5 text-sm">Here's your learning snapshot for today.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNotifPanel(true)}
            className="relative flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:border-sky-300 hover:text-sky-600 transition-all shadow-sm"
          >
            <Bell className="w-4 h-4" />
            Notifications
            {unreadCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-sky-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={signOut}
            title="Sign out"
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-500 hover:text-red-500 hover:border-red-200 transition-all shadow-sm"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Motivation Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-40" style={{ background: 'radial-gradient(ellipse at 80% 0%, rgba(56,189,248,0.15) 0%, transparent 60%), radial-gradient(ellipse at 0% 100%, rgba(99,102,241,0.12) 0%, transparent 60%)' }} />
        <div className="relative flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Quote className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <p className="text-[15px] font-medium leading-relaxed text-slate-100">{todayQuote}</p>
            <p className="text-slate-500 text-xs mt-2 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-sky-500" /> Your AI Tutor
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <button
              key={stat.label}
              onClick={() => setDetailOpen(stat.type)}
              className={`text-left bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all group bg-gradient-to-br ${stat.gradient} card-lift`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-2xl font-bold text-slate-900 leading-none">{stat.value}</p>
              <p className="text-xs font-semibold text-slate-600 mt-1.5">{stat.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{stat.sub}</p>
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Today's Tasks */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <h3 className="font-semibold text-slate-900 text-[15px]">Active Tasks</h3>
            <button onClick={() => setView('tasks')} className="text-xs text-sky-600 font-semibold hover:text-sky-700 flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="p-2">
            {upcomingTaskItems.map((task) => {
              const statusIcon =
                task.status === 'done' ? <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0" style={{ width: 18, height: 18 }} /> :
                task.status === 'in-progress' ? <PlayCircle className="w-4.5 h-4.5 text-sky-500 flex-shrink-0" style={{ width: 18, height: 18 }} /> :
                <Circle className="w-4.5 h-4.5 text-slate-300 flex-shrink-0" style={{ width: 18, height: 18 }} />;
              return (
                <div key={task.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                  {statusIcon}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-slate-800 truncate">{task.title}</p>
                      {task.aiSuggested && <Sparkles className="w-3 h-3 text-sky-400 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{task.subject} · Due {task.dueDate}</p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                    task.priority === 'high' ? 'bg-red-50 text-red-600' :
                    task.priority === 'medium' ? 'bg-amber-50 text-amber-600' :
                    'bg-slate-50 text-slate-500'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              );
            })}
            {upcomingTaskItems.length === 0 && (
              <div className="py-10 text-center">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                <p className="text-sm font-medium text-slate-500">No active tasks yet</p>
                <p className="text-xs text-slate-400 mt-0.5">Head to Task List to add your first task.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-50">
            <h3 className="font-semibold text-slate-900 text-[15px]">Quick Actions</h3>
          </div>
          <div className="p-3 space-y-1.5">
            {quickNav.map((qa) => {
              const Icon = qa.icon;
              return (
                <button
                  key={qa.view}
                  onClick={() => setView(qa.view)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all group"
                >
                  <div className={`w-9 h-9 rounded-xl ${qa.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${qa.iconColor}`} />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-800">{qa.label}</p>
                    <p className="text-xs text-slate-400 truncate">{qa.desc}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-sky-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Homework Progress */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 text-[15px]">Homework Progress</h3>
          <button onClick={() => setView('homework')} className="text-xs text-sky-600 font-semibold hover:text-sky-700 flex items-center gap-1 transition-colors">
            Manage <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        {hwTotal === 0 ? (
          <div className="py-6 text-center">
            <BookCheck className="w-7 h-7 mx-auto mb-2 text-slate-300" />
            <p className="text-sm text-slate-500">No homework added yet.</p>
            <p className="text-xs text-slate-400 mt-0.5">Go to Homework Tracker to add your first assignment.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-5 flex-wrap mb-3">
              {[
                { label: 'Completed', count: completed, dotColor: 'bg-emerald-500' },
                { label: 'In Progress', count: inProgress, dotColor: 'bg-sky-500' },
                { label: 'Pending', count: pending, dotColor: 'bg-slate-300' },
                { label: 'Overdue', count: overdue, dotColor: 'bg-red-500' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${s.dotColor}`} />
                  <span className="text-xs text-slate-500">{s.label}</span>
                  <span className="text-xs font-bold text-slate-800">{s.count}</span>
                </div>
              ))}
            </div>
            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
              {[
                { count: completed, color: 'bg-emerald-500' },
                { count: inProgress, color: 'bg-sky-500' },
                { count: pending, color: 'bg-slate-200' },
                { count: overdue, color: 'bg-red-400' },
              ].filter(s => s.count > 0).map((s, i) => (
                <div
                  key={i}
                  className={`h-full ${s.color} transition-all duration-700`}
                  style={{ width: `${(s.count / hwTotal) * 100}%` }}
                />
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {`${Math.round((completed / hwTotal) * 100)}% of ${hwTotal} assignments complete`}
            </p>
          </>
        )}
      </div>

      {/* Recent Notifications */}
      {latestNotifs.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <h3 className="font-semibold text-slate-900 text-[15px] flex items-center gap-2">
              <Bell className="w-4 h-4 text-sky-500" />
              Notifications
              {unreadCount > 0 && <span className="text-[10px] font-bold text-white bg-sky-500 px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
            </h3>
            <button onClick={() => setShowNotifPanel(true)} className="text-xs text-sky-600 font-semibold hover:text-sky-700 flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="p-3 space-y-1">
            {latestNotifs.map((n) => (
              <div key={n.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${n.read ? '' : 'bg-sky-50/50'}`}>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${n.read ? 'bg-slate-200' : 'bg-sky-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{n.title}</p>
                  <p className="text-xs text-slate-400 truncate">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Modals */}
      {detailOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDetailOpen(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[85vh] overflow-y-auto animate-pop" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-900 text-lg">
                {detailOpen === 'streak' && '🔥 Streak Details'}
                {detailOpen === 'hours' && '⏱ Study Hours'}
                {detailOpen === 'homework' && '📚 Homework Overview'}
                {detailOpen === 'level' && '⚡ Level & XP'}
              </h3>
              <button onClick={() => setDetailOpen(null)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {detailOpen === 'streak' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-md shadow-orange-400/25">
                    <Flame className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-900">{studentProfile.streak} <span className="text-base font-normal text-slate-500">days</span></p>
                    <p className="text-sm text-slate-500">
                      {studentProfile.longestStreak > 0 ? `Best streak: ${studentProfile.longestStreak} days` : 'Complete a session to start your streak!'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Last 4 Weeks</p>
                  <div className="grid grid-cols-7 gap-1.5">
                    {streakHistory.map((d, i) => (
                      <div key={i} className="aspect-square rounded-lg flex items-center justify-center text-[10px] font-semibold transition-all"
                        style={{ backgroundColor: d.active ? '#fb923c' : '#f1f5f9', color: d.active ? '#fff' : '#cbd5e1' }}
                      >
                        {d.day}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-2.5 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-orange-400" /> Studied</span>
                    <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-slate-100" /> Missed</span>
                  </div>
                </div>
                {studentProfile.streak > 0 && studentProfile.longestStreak > studentProfile.streak && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-sm text-slate-600">
                      You're <strong className="text-slate-800">{studentProfile.longestStreak - studentProfile.streak} days away</strong> from your all-time best of {studentProfile.longestStreak} days. Keep going!
                    </p>
                  </div>
                )}
                <button onClick={() => { setView('sessions'); setDetailOpen(null); }}
                  className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-medium text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                  <TrendingUp className="w-4 h-4" /> View Study Analytics
                </button>
              </div>
            )}

            {detailOpen === 'hours' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-100">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-md shadow-sky-400/25">
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-900">{studentProfile.totalStudyHours}<span className="text-base font-normal text-slate-500">h</span></p>
                    <p className="text-sm text-slate-500">
                      {studentProfile.totalStudyHours > 0 ? 'Total this semester' : 'Log your first study session to begin!'}
                    </p>
                  </div>
                </div>
                <button onClick={() => { setView('sessions'); setDetailOpen(null); }}
                  className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-medium text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                  <TrendingUp className="w-4 h-4" /> View Full Analytics
                </button>
              </div>
            )}

            {detailOpen === 'homework' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-400/25">
                    <BookCheck className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-900">{studentProfile.homeworkCompleted}</p>
                    <p className="text-sm text-slate-500">
                      {studentProfile.homeworkCompleted > 0 ? `Completed · ${pending + inProgress} still active` : 'Start by adding your first assignment!'}
                    </p>
                  </div>
                </div>
                {hwTotal > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'Done', count: completed, bg: 'bg-emerald-50', text: 'text-emerald-700' },
                      { label: 'Active', count: inProgress, bg: 'bg-sky-50', text: 'text-sky-700' },
                      { label: 'Pending', count: pending, bg: 'bg-slate-50', text: 'text-slate-600' },
                      { label: 'Overdue', count: overdue, bg: 'bg-red-50', text: 'text-red-700' },
                    ].map((s) => (
                      <div key={s.label} className={`p-3 rounded-xl text-center border border-transparent ${s.bg}`}>
                        <p className={`text-xl font-bold ${s.text}`}>{s.count}</p>
                        <p className={`text-xs font-medium ${s.text} opacity-70`}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                )}
                {hwList.filter((h) => h.status !== 'completed').length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Upcoming Deadlines</p>
                    <div className="space-y-2">
                      {hwList.filter((h) => h.status !== 'completed').slice(0, 4).map((h) => (
                        <div key={h.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                          {h.status === 'overdue' ? <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" /> :
                           h.status === 'in-progress' ? <PlayCircle className="w-4 h-4 text-sky-500 flex-shrink-0" /> :
                           <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate">{h.title}</p>
                            <p className="text-xs text-slate-400">{h.subject} · Due {h.dueDate}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <button onClick={() => { setView('homework'); setDetailOpen(null); }}
                  className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-medium text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                  <BookCheck className="w-4 h-4" /> Go to Homework Tracker
                </button>
              </div>
            )}

            {detailOpen === 'level' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-md shadow-violet-400/25">
                    <Trophy className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-900">Level {studentProfile.level}</p>
                    <p className="text-sm text-slate-500">{studentProfile.xp} XP · {studentProfile.xpToNext - studentProfile.xp} to next</p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Progress to Level {studentProfile.level + 1}</span>
                    <span className="text-sm font-bold text-violet-600">{Math.round((studentProfile.xp / studentProfile.xpToNext) * 100)}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-purple-500 transition-all duration-700"
                      style={{ width: `${(studentProfile.xp / studentProfile.xpToNext) * 100}%` }} />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">How to Earn XP</p>
                  <div className="space-y-1.5">
                    {[
                      { action: 'Complete a homework assignment', xp: '+20 XP', icon: BookCheck },
                      { action: 'Finish a study session', xp: '+15 XP', icon: Clock },
                      { action: 'Complete a task', xp: '+10 XP', icon: CheckCircle2 },
                      { action: 'Maintain a 7-day streak', xp: '+50 XP', icon: Flame },
                      { action: 'Upload notes for AI explanation', xp: '+5 XP', icon: Sparkles },
                    ].map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50">
                          <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span className="text-sm text-slate-600 flex-1">{item.action}</span>
                          <span className="text-xs font-bold text-violet-600 flex-shrink-0">{item.xp}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <button onClick={() => { setView('achievements'); setDetailOpen(null); }}
                  className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-medium text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                  <Trophy className="w-4 h-4" /> View Achievements
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
