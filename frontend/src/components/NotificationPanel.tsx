import { useApp } from '@/store/AppContext';
import {
  Bell,
  X,
  Clock,
  Trophy,
  Info,
  AlertTriangle,
  Check,
  ChevronRight,
} from 'lucide-react';

const typeConfig = {
  deadline:    { icon: AlertTriangle, color: 'text-red-500',     bg: 'bg-red-50',     label: 'Deadline' },
  reminder:    { icon: Clock,         color: 'text-amber-500',   bg: 'bg-amber-50',   label: 'Reminder' },
  achievement: { icon: Trophy,        color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Achievement' },
  info:        { icon: Info,          color: 'text-sky-500',     bg: 'bg-sky-50',     label: 'Info' },
};

function timeAgo(timestamp: string): string {
  const now = new Date('2026-10-08T10:00:00');
  const then = new Date(timestamp);
  const diff = now.getTime() - then.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  const mins = Math.floor(diff / (1000 * 60));
  return `${mins}m ago`;
}

export default function NotificationPanel() {
  const { notifications, unreadCount, markNotificationRead, markAllRead, showNotifPanel, setShowNotifPanel, setView } = useApp();

  if (!showNotifPanel) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setShowNotifPanel(false)} />
      <div className="fixed top-0 right-0 z-50 h-full w-80 max-w-[90vw] bg-white shadow-2xl shadow-slate-900/10 border-l border-slate-100 flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4.5 h-4.5 text-slate-700" style={{ width: 18, height: 18 }} />
            <h3 className="font-bold text-slate-900 text-[15px]">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold text-white bg-sky-500 px-1.5 py-0.5 rounded-full">{unreadCount} new</span>
            )}
          </div>
          <button onClick={() => setShowNotifPanel(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mark all read */}
        {unreadCount > 0 && (
          <div className="px-5 py-2.5 border-b border-slate-50">
            <button
              onClick={markAllRead}
              className="text-xs text-sky-600 font-semibold hover:text-sky-700 flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-3.5 h-3.5" /> Mark all as read
            </button>
          </div>
        )}

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto py-2">
          {notifications.length === 0 ? (
            <div className="text-center py-14 text-slate-400">
              <Bell className="w-9 h-9 mx-auto mb-2.5 text-slate-200" />
              <p className="text-sm font-medium">All caught up!</p>
              <p className="text-xs text-slate-300 mt-0.5">No notifications yet.</p>
            </div>
          ) : (
            <div className="px-3 space-y-1">
              {notifications.map((n) => {
                const cfg = typeConfig[n.type];
                const Icon = cfg.icon;
                return (
                  <button
                    key={n.id}
                    onClick={() => {
                      markNotificationRead(n.id);
                      if (n.taskId) setView('tasks');
                      setShowNotifPanel(false);
                    }}
                    className={`w-full text-left rounded-xl p-3 transition-all group ${
                      n.read ? 'hover:bg-slate-50' : 'bg-sky-50/50 hover:bg-sky-50 border border-sky-100/70'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-900 leading-tight">{n.title}</p>
                          {!n.read && <div className="w-2 h-2 rounded-full bg-sky-500 flex-shrink-0 mt-1" />}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">{cfg.label}</span>
                          <span className="text-[10px] text-slate-300">·</span>
                          <span className="text-[10px] text-slate-300">{timeAgo(n.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3.5 border-t border-slate-100">
          <button
            onClick={() => { setView('tasks'); setShowNotifPanel(false); }}
            className="w-full py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5"
          >
            Go to Task List <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );
}
