import { useState } from 'react';
import { useApp, taskCategoryLabels, taskPriorityConfig, taskStatusConfig } from '@/store/AppContext';
import type { TaskStatus, TaskPriority, TaskCategory } from '@/types';
import {
  Plus,
  Check,
  Circle,
  Clock,
  Trash2,
  Pencil,
  X,
  Sparkles,
  Calendar,
  Flag,
  ListTodo,
  CheckCircle2,
  PlayCircle,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';

const categoryColors: Record<TaskCategory, { bg: string; text: string; dot: string }> = {
  study:    { bg: 'bg-sky-50',     text: 'text-sky-700',    dot: 'bg-sky-400' },
  homework: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  revision: { bg: 'bg-violet-50',  text: 'text-violet-700',  dot: 'bg-violet-400' },
  project:  { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400' },
  personal: { bg: 'bg-rose-50',    text: 'text-rose-700',    dot: 'bg-rose-400' },
};

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr + 'T00:00:00');
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getUrgencyLabel(dateStr: string): { label: string; color: string } | null {
  const days = daysUntil(dateStr);
  if (days < 0) return { label: `${Math.abs(days)}d overdue`, color: 'text-red-500' };
  if (days === 0) return { label: 'Due today', color: 'text-red-500' };
  if (days === 1) return { label: 'Due tomorrow', color: 'text-amber-500' };
  if (days <= 3) return { label: `${days} days left`, color: 'text-amber-500' };
  return null;
}

interface FormState {
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate: string;
  subject: string;
}

function getDefaultDueDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toISOString().split('T')[0];
}

const emptyForm: FormState = {
  title: '',
  description: '',
  category: 'study',
  priority: 'medium',
  dueDate: getDefaultDueDate(),
  subject: '',
};

export default function TaskList() {
  const {
    tasks,
    addTask,
    updateTask,
    toggleTaskStatus,
    removeTask,
    aiSuggestions,
    acceptAISuggestion,
    dismissAISuggestion,
    subjects,
    setView,
  } = useApp();
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const filtered = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);
  const sorted = [...filtered].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const statusOrder = { 'in-progress': 0, todo: 1, done: 2 };
    if (statusOrder[a.status] !== statusOrder[b.status]) return statusOrder[a.status] - statusOrder[b.status];
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) return priorityOrder[a.priority] - priorityOrder[b.priority];
    return a.dueDate.localeCompare(b.dueDate);
  });

  const counts = {
    all: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  const completionRate = tasks.length > 0 ? Math.round((counts.done / tasks.length) * 100) : 0;

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };

  const openEdit = (id: string) => {
    const t = tasks.find((tk) => tk.id === id);
    if (!t) return;
    setForm({ title: t.title, description: t.description, category: t.category, priority: t.priority, dueDate: t.dueDate, subject: t.subject });
    setEditId(id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    const data = { title: form.title.trim(), description: form.description.trim(), category: form.category, priority: form.priority, dueDate: form.dueDate, subject: form.subject || 'General' };
    if (editId) {
      updateTask(editId, data);
    } else {
      addTask({ ...data, status: 'todo' as TaskStatus, aiSuggested: false });
    }
    setShowForm(false);
    setForm(emptyForm);
    setEditId(null);
  };

  const statusIcon = (status: TaskStatus) => {
    if (status === 'done') return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    if (status === 'in-progress') return <PlayCircle className="w-5 h-5 text-sky-500" />;
    return <Circle className="w-5 h-5 text-slate-300" />;
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Task List</h2>
          <p className="text-slate-500 mt-0.5 text-sm">Your to-do list with deadlines and AI-suggested tasks.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-medium text-sm hover:bg-slate-700 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {/* Progress Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', value: counts.all, icon: ListTodo, color: 'text-slate-600', bg: 'bg-slate-50' },
          { label: 'To Do', value: counts.todo, icon: Circle, color: 'text-slate-500', bg: 'bg-slate-50' },
          { label: 'In Progress', value: counts['in-progress'], icon: PlayCircle, color: 'text-sky-600', bg: 'bg-sky-50' },
          { label: 'Completed', value: counts.done, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold text-slate-900 leading-none">{s.value}</p>
              <p className="text-xs font-medium text-slate-500 mt-1.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Completion Progress */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-500" />
            Completion Rate
          </h3>
          <span className="text-sm font-bold text-slate-900">{completionRate}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-700"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-1.5">{counts.done} of {counts.all} tasks complete</p>
      </div>

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <div className="rounded-2xl border border-sky-100 overflow-hidden">
          <div className="bg-gradient-to-br from-sky-50 to-cyan-50 px-5 py-4 flex items-center justify-between border-b border-sky-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-sky-600 flex-shrink-0" style={{ width: 18, height: 18 }} />
              <h3 className="font-semibold text-slate-900 text-[15px]">AI-Suggested Tasks</h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">{aiSuggestions.length} suggestion{aiSuggestions.length > 1 ? 's' : ''}</span>
          </div>
          <div className="bg-white divide-y divide-slate-50">
            {aiSuggestions.map((sug, i) => (
              <div key={i} className="flex items-start gap-3 p-4">
                <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-sky-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-slate-800">{sug.title}</p>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${taskPriorityConfig[sug.priority].bg} ${taskPriorityConfig[sug.priority].text}`}>
                      {sug.priority}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">{sug.subject}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{sug.description}</p>
                  <div className="mt-2 flex items-start gap-1.5 text-xs text-sky-700 bg-sky-50 rounded-lg px-2.5 py-1.5">
                    <Sparkles className="w-3 h-3 mt-0.5 flex-shrink-0 text-sky-500" />
                    <span>{sug.reason}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => acceptAISuggestion(i)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-700 transition-colors flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Add
                  </button>
                  <button
                    onClick={() => dismissAISuggestion(i)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 text-xs font-medium hover:bg-slate-50 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {(['all', 'todo', 'in-progress', 'done'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {f === 'all' ? 'All' : taskStatusConfig[f].label}
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${
              filter === f ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {/* Task Cards */}
      <div className="space-y-3">
        {sorted.map((task) => {
          const urgency = getUrgencyLabel(task.dueDate);
          const catStyle = categoryColors[task.category];
          return (
            <div
              key={task.id}
              className={`bg-white rounded-2xl p-5 border border-slate-100 shadow-sm transition-all card-lift group ${
                task.status === 'done' ? 'opacity-55' : ''
              } ${task.priority === 'high' && task.status !== 'done' ? 'border-l-4 border-l-red-400' : ''}`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleTaskStatus(task.id)}
                  className="mt-0.5 hover:scale-110 transition-transform flex-shrink-0"
                  title="Click to cycle status"
                >
                  {statusIcon(task.status)}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`font-semibold text-slate-900 ${task.status === 'done' ? 'line-through text-slate-400' : ''}`}>
                      {task.title}
                    </h3>
                    {task.aiSuggested && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> AI
                      </span>
                    )}
                  </div>
                  {task.description && (
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">{task.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${catStyle.bg} ${catStyle.text} flex items-center gap-1`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`} />
                      {taskCategoryLabels[task.category]}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${taskPriorityConfig[task.priority].bg} ${taskPriorityConfig[task.priority].text}`}>
                      {taskPriorityConfig[task.priority].label}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{task.subject}</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {task.dueDate}
                    </span>
                    {urgency && task.status !== 'done' && (
                      <span className={`text-xs font-semibold flex items-center gap-1 ${urgency.color}`}>
                        {urgency.label.includes('overdue') || urgency.label.includes('today')
                          ? <AlertTriangle className="w-3 h-3" />
                          : <Clock className="w-3 h-3" />}
                        {urgency.label}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() => openEdit(task.id)}
                    className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-sky-600 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeTask(task.id)}
                    className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {sorted.length === 0 && (
          <div className="bg-white rounded-2xl p-10 border border-slate-100 shadow-sm text-center">
            <ListTodo className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-slate-500">No tasks here</p>
            <p className="text-sm text-slate-400 mt-1">Add a task or accept an AI suggestion to get started.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto animate-pop" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-900 text-lg">{editId ? 'Edit Task' : 'New Task'}</h3>
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
                  placeholder="e.g. Review chapter 5 for test"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block">Description (optional)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none text-sm transition-all resize-none"
                  placeholder="Add details about this task..."
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block">Subject</label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none text-sm transition-all bg-white"
                >
                  <option value="">General</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as TaskCategory })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none text-sm transition-all bg-white"
                  >
                    {Object.entries(taskCategoryLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none text-sm transition-all bg-white"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block">Due Date</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none text-sm transition-all"
                />
              </div>
              <button
                onClick={handleSubmit}
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-medium text-sm hover:bg-slate-700 transition-colors"
              >
                {editId ? 'Save Changes' : 'Add Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
