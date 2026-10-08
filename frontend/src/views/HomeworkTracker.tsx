import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import type { HomeworkStatus } from '@/types';
import {
  Plus,
  CheckCircle2,
  Circle,
  PlayCircle,
  AlertTriangle,
  X,
  Calendar,
  Clock,
  Flag,
} from 'lucide-react';

const statusConfig: Record<HomeworkStatus, { label: string; icon: typeof Circle; ringColor: string; chipBg: string; chipText: string; dotColor: string }> = {
  pending:     { label: 'Pending',     icon: Circle,       ringColor: 'hover:border-slate-300',  chipBg: 'bg-slate-100',   chipText: 'text-slate-600',  dotColor: 'bg-slate-400' },
  'in-progress': { label: 'In Progress', icon: PlayCircle,   ringColor: 'hover:border-sky-300',    chipBg: 'bg-sky-100',     chipText: 'text-sky-700',    dotColor: 'bg-sky-500' },
  completed:   { label: 'Completed',   icon: CheckCircle2, ringColor: 'hover:border-emerald-300', chipBg: 'bg-emerald-100', chipText: 'text-emerald-700', dotColor: 'bg-emerald-500' },
  overdue:     { label: 'Overdue',     icon: AlertTriangle, ringColor: 'hover:border-red-300',    chipBg: 'bg-red-100',     chipText: 'text-red-700',    dotColor: 'bg-red-500' },
};

export default function HomeworkTracker() {
  const { homeworks, toggleHomeworkStatus, addHomework } = useApp();
  const [filter, setFilter] = useState<HomeworkStatus | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    subject: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    description: '',
    estimatedMinutes: 30,
  });

  const filtered = filter === 'all' ? homeworks : homeworks.filter((h) => h.status === filter);

  const handleSubmit = () => {
    if (!form.title || !form.subject || !form.dueDate) return;
    addHomework({ ...form, status: 'pending' });
    setShowForm(false);
    setForm({ title: '', subject: '', dueDate: '', priority: 'medium', description: '', estimatedMinutes: 30 });
  };

  const counts = {
    all: homeworks.length,
    pending: homeworks.filter((h) => h.status === 'pending').length,
    'in-progress': homeworks.filter((h) => h.status === 'in-progress').length,
    completed: homeworks.filter((h) => h.status === 'completed').length,
    overdue: homeworks.filter((h) => h.status === 'overdue').length,
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Homework Tracker</h2>
          <p className="text-slate-500 mt-0.5 text-sm">Stay on top of every assignment and deadline.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-medium text-sm hover:bg-slate-700 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Assignment
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {(['all', 'pending', 'in-progress', 'completed', 'overdue'] as const).map((f) => {
          const active = filter === f;
          const dotColor = f !== 'all' ? statusConfig[f].dotColor : '';
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {f !== 'all' && <div className={`w-2 h-2 rounded-full ${active ? 'bg-white/60' : dotColor}`} />}
              {f === 'all' ? 'All' : statusConfig[f].label}
              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {counts[f]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Homework List */}
      <div className="space-y-3">
        {filtered.map((hw) => {
          const cfg = statusConfig[hw.status];
          const StatusIcon = cfg.icon;
          return (
            <div
              key={hw.id}
              className={`bg-white rounded-2xl p-5 border border-slate-100 shadow-sm transition-all card-lift ${cfg.ringColor} ${
                hw.status === 'overdue' ? 'border-l-4 border-l-red-400' :
                hw.status === 'completed' ? 'opacity-70' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleHomeworkStatus(hw.id)}
                  className="mt-0.5 hover:scale-110 transition-transform flex-shrink-0"
                  title="Click to cycle status"
                >
                  <StatusIcon className={`w-5 h-5 ${
                    hw.status === 'completed' ? 'text-emerald-500' :
                    hw.status === 'in-progress' ? 'text-sky-500' :
                    hw.status === 'overdue' ? 'text-red-500' :
                    'text-slate-300'
                  }`} />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`font-semibold text-slate-900 ${hw.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
                      {hw.title}
                    </h3>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${cfg.chipBg} ${cfg.chipText}`}>
                      {cfg.label}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      hw.priority === 'high' ? 'bg-red-50 text-red-600' :
                      hw.priority === 'medium' ? 'bg-amber-50 text-amber-600' :
                      'bg-slate-50 text-slate-500'
                    }`}>
                      {hw.priority}
                    </span>
                  </div>
                  {hw.description && (
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">{hw.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${cfg.dotColor}`} />
                      <span className="font-medium text-slate-600">{hw.subject}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> Due {hw.dueDate}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> ~{hw.estimatedMinutes} min
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl p-10 border border-slate-100 shadow-sm text-center">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-emerald-300" />
            <p className="font-semibold text-slate-500">No assignments here</p>
            <p className="text-sm text-slate-400 mt-1">Try a different filter or add a new assignment.</p>
          </div>
        )}
      </div>

      {/* Add Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-pop" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-900 text-lg">New Assignment</h3>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none text-sm transition-all"
                  placeholder="e.g. Chapter 5 Review Questions"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block">Subject</label>
                <input
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none text-sm transition-all"
                  placeholder="e.g. Mathematics"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block">Description</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none text-sm transition-all"
                  placeholder="Optional details about this assignment"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block">Due Date</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as 'low' | 'medium' | 'high' })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none text-sm transition-all bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block">Estimated Time (minutes)</label>
                <input
                  type="number"
                  value={form.estimatedMinutes}
                  onChange={(e) => setForm({ ...form, estimatedMinutes: parseInt(e.target.value) || 30 })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none text-sm transition-all"
                />
              </div>
              <button
                onClick={handleSubmit}
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-medium text-sm hover:bg-slate-700 transition-colors"
              >
                Add Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
