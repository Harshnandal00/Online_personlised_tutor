import { AuthProvider, useAuth } from '@/store/AuthContext';
import { AppProvider, useApp } from '@/store/AppContext';
import Sidebar from '@/components/Sidebar';
import NotificationPanel from '@/components/NotificationPanel';
import Dashboard from '@/views/Dashboard';
import HomeworkTracker from '@/views/HomeworkTracker';
import StudyAnalytics from '@/views/StudyAnalytics';
import Timetable from '@/views/Timetable';
import AITutor from '@/views/AITutor';
import Achievements from '@/views/Achievements';
import SubjectManager from '@/views/SubjectManager';
import CalendarView from '@/views/CalendarView';
import NotesExplainer from '@/views/NotesExplainer';
import TaskList from '@/views/TaskList';
import AuthPage from '@/views/AuthPage';
import { Menu, Bell, Loader2 } from 'lucide-react';

function MainContent() {
  const { view, setSidebarOpen, unreadCount, setShowNotifPanel } = useApp();

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <header className="lg:hidden sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => setSidebarOpen(true)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors">
          <Menu className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
        </button>
        <span className="font-bold text-slate-900 flex-1 text-[15px] tracking-tight">StudyMate</span>
        <button onClick={() => setShowNotifPanel(true)} className="relative w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-sky-500 text-white text-[9px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {view === 'dashboard' && <Dashboard />}
          {view === 'homework' && <HomeworkTracker />}
          {view === 'tasks' && <TaskList />}
          {view === 'sessions' && <StudyAnalytics />}
          {view === 'timetable' && <Timetable />}
          {view === 'tutor' && <AITutor />}
          {view === 'notes' && <NotesExplainer />}
          {view === 'subjects' && <SubjectManager />}
          {view === 'calendar' && <CalendarView />}
          {view === 'achievements' && <Achievements />}
        </div>
      </main>
    </div>
  );
}

function AuthenticatedApp() {
  const { user } = useAuth();
  return (
    <AppProvider user={user}>
      <div className="flex h-screen bg-slate-50 text-slate-900">
        <Sidebar />
        <MainContent />
        <NotificationPanel />
      </div>
    </AppProvider>
  );
}

function AppShell() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-sky-500 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  return <AuthenticatedApp />;
}

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

export default App;
