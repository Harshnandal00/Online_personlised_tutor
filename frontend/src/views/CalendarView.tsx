import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import type { EventType } from '@/types';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  X,
  Calendar as CalendarIcon,
  FileText,
  ClipboardCheck,
  BookOpen,
  Bell,
  Users,
} from 'lucide-react';

const eventTypeConfig: Record<EventType, { label: string; icon: typeof FileText; color: string; bg: string; text: string; dot: string }> = {
  test: { label: 'Test', icon: ClipboardCheck, color: 'red', bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
  project: { label: 'Project', icon: FileText, color: 'amber', bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
  homework: { label: 'Homework', icon: BookOpen, color: 'sky', bg: 'bg-sky-50', text: 'text-sky-600', dot: 'bg-sky-500' },
  reminder: { label: 'Reminder', icon: Bell, color: 'violet', bg: 'bg-violet-50', text: 'text-violet-600', dot: 'bg-violet-500' },
  event: { label: 'Event', icon: Users, color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
};

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function CalendarView() {
  const { calendarEvents, addCalendarEvent, removeCalendarEvent, subjects } = useApp();
  const [currentDate, setCurrentDate] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    date: '',
    type: 'test' as EventType,
    subject: '',
    description: '',
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const eventsForDate = (date: string) => calendarEvents.filter((e) => e.date === date);
  const selectedEvents = selectedDate ? eventsForDate(selectedDate) : [];

  const upcomingEvents = [...calendarEvents]
    .filter((e) => e.date >= formatDate(year, month, 1))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  const handleSubmit = () => {
    if (!form.title.trim() || !form.date) return;
    addCalendarEvent({
      title: form.title.trim(),
      date: form.date,
      type: form.type,
      subject: form.subject || 'General',
      description: form.description.trim(),
    });
    setShowForm(false);
    setForm({ title: '', date: '', type: 'test', subject: '', description: '' });
  };

  const openFormForDate = (date: string) => {
    setForm({ ...form, date });
    setShowForm(true);
  };

  const days: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Calendar</h2>
          <p className="text-slate-500 mt-1">Mark tests, project deadlines, and important events.</p>
        </div>
        <button
          onClick={() => { setForm({ title: '', date: formatDate(year, month, new Date().getDate()), type: 'test', subject: '', description: '' }); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 text-white rounded-xl font-medium text-sm hover:bg-sky-700 transition-colors shadow-sm shadow-sky-600/20"
        >
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-lg">{monthNames[month]} {year}</h3>
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={nextMonth} className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 mb-2">
            {dayNames.map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-slate-400 py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {days.map((day, i) => {
              if (day === null) return <div key={i} />;
              const dateStr = formatDate(year, month, day);
              const dayEvents = eventsForDate(dateStr);
              const isSelected = selectedDate === dateStr;
              const isToday = dateStr === new Date().toISOString().split('T')[0];
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center p-1 transition-all relative ${
                    isSelected
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                      : isToday
                      ? 'bg-sky-50 text-sky-700 border border-sky-200'
                      : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                  }`}
                >
                  <span className={`text-sm font-medium ${isSelected ? 'text-white' : ''}`}>{day}</span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayEvents.slice(0, 3).map((e) => (
                        <div
                          key={e.id}
                          className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : eventTypeConfig[e.type].dot}`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100 flex-wrap">
            {Object.entries(eventTypeConfig).map(([key, cfg]) => {
              const Icon = cfg.icon;
              return (
                <div key={key} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Icon className="w-3 h-3" /> {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Selected day + Upcoming */}
        <div className="space-y-4">
          {/* Selected Date Events */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                {selectedDate
                  ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
                  : 'Select a date'}
              </h3>
              {selectedDate && (
                <button
                  onClick={() => openFormForDate(selectedDate)}
                  className="text-sky-600 hover:text-sky-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
            {selectedEvents.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">
                {selectedDate ? 'No events on this day.' : 'Click any date to see events.'}
              </p>
            ) : (
              <div className="space-y-2">
                {selectedEvents.map((e) => {
                  const cfg = eventTypeConfig[e.type];
                  const Icon = cfg.icon;
                  return (
                    <div key={e.id} className={`rounded-xl p-3 ${cfg.bg} group`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2">
                          <Icon className={`w-4 h-4 ${cfg.text} mt-0.5 flex-shrink-0`} />
                          <div>
                            <p className={`text-sm font-semibold ${cfg.text}`}>{e.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{e.subject}</p>
                            {e.description && <p className="text-xs text-slate-400 mt-1">{e.description}</p>}
                          </div>
                        </div>
                        <button
                          onClick={() => removeCalendarEvent(e.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all flex-shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Upcoming</h3>
            <div className="space-y-2">
              {upcomingEvents.map((e) => {
                const cfg = eventTypeConfig[e.type];
                const Icon = cfg.icon;
                const eventDate = new Date(e.date + 'T00:00:00');
                return (
                  <button
                    key={e.id}
                    onClick={() => setSelectedDate(e.date)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="text-center flex-shrink-0">
                      <p className="text-xs text-slate-400">{eventDate.toLocaleDateString('en-US', { month: 'short' })}</p>
                      <p className="text-lg font-bold text-slate-700 leading-none">{eventDate.getDate()}</p>
                    </div>
                    <div className={`w-1 h-10 rounded-full ${cfg.dot}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{e.title}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Icon className="w-3 h-3" /> {cfg.label} · {e.subject}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-lg">Add Calendar Event</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none text-sm transition-all"
                  placeholder="e.g. Chemistry Midterm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as EventType })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none text-sm transition-all bg-white"
                  >
                    {Object.entries(eventTypeConfig).map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Subject</label>
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
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Description (optional)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none text-sm transition-all resize-none"
                  placeholder="Add details about this event..."
                />
              </div>
              <button
                onClick={handleSubmit}
                className="w-full py-2.5 bg-sky-600 text-white rounded-xl font-medium text-sm hover:bg-sky-700 transition-colors"
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
