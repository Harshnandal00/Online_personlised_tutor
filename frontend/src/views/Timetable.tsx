import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { CalendarClock, Plus, Clock, Sun, Moon, List, LayoutGrid, X, Sparkles } from 'lucide-react';
import type { TimetableSlot } from '@/types';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const colorMap: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  sky:     { bg: 'bg-sky-50',     border: 'border-l-sky-400',     text: 'text-sky-700',     dot: 'bg-sky-400' },
  teal:    { bg: 'bg-teal-50',    border: 'border-l-teal-400',    text: 'text-teal-700',    dot: 'bg-teal-400' },
  amber:   { bg: 'bg-amber-50',   border: 'border-l-amber-400',   text: 'text-amber-700',   dot: 'bg-amber-400' },
  rose:    { bg: 'bg-rose-50',    border: 'border-l-rose-400',    text: 'text-rose-700',    dot: 'bg-rose-400' },
  violet:  { bg: 'bg-violet-50',  border: 'border-l-violet-400',  text: 'text-violet-700',  dot: 'bg-violet-400' },
  emerald: { bg: 'bg-emerald-50', border: 'border-l-emerald-400', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  indigo:  { bg: 'bg-indigo-50',  border: 'border-l-indigo-400',  text: 'text-indigo-700',  dot: 'bg-indigo-400' },
};

const colorOptions = Object.keys(colorMap);

const emptySlot = (): Omit<TimetableSlot, 'id'> => ({
  day: 'Monday',
  startTime: '16:00',
  endTime: '17:00',
  subject: '',
  activity: '',
  color: 'sky',
});

export default function Timetable() {
  const { subjects } = useApp();
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [view, setView] = useState<'week' | 'list'>('week');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptySlot());
  const [editId, setEditId] = useState<string | null>(null);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const openAdd = (day?: string) => {
    setForm({ ...emptySlot(), day: day || 'Monday' });
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (slot: TimetableSlot) => {
    setForm({ day: slot.day, startTime: slot.startTime, endTime: slot.endTime, subject: slot.subject, activity: slot.activity, color: slot.color });
    setEditId(slot.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.subject.trim() || !form.activity.trim()) return;
    if (editId) {
      setSlots((prev) => prev.map((s) => s.id === editId ? { ...s, ...form } : s));
    } else {
      setSlots((prev) => [...prev, { ...form, id: `t${Date.now()}` }]);
    }
    setShowForm(false);
    setEditId(null);
  };

  const removeSlot = (id: string) => setSlots((prev) => prev.filter((s) => s.id !== id));

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Smart Timetable</h2>
          <p className="text-slate-500 mt-0.5 text-sm">Build your weekly study schedule and stay consistent.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setView('week')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                view === 'week' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Week
            </button>
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                view === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
          </div>
          <button
            onClick={() => openAdd()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-medium text-sm hover:bg-slate-700 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Block
          </button>
        </div>
      </div>

      {/* Empty state banner */}
      {slots.length === 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 p-5 text-white shadow-lg">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10" />
          <div className="relative flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <h3 className="font-bold text-[15px]">Your timetable is empty</h3>
              <p className="text-sky-50 text-sm mt-1 leading-relaxed">
                Click <strong>+ Add Block</strong> to schedule your first study session. Add your subjects, pick a time slot, and build your weekly routine.
              </p>
            </div>
          </div>
        </div>
      )}

      {view === 'week' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {days.map((day) => {
            const daySlots = slots.filter((s) => s.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
            const isToday = day === today;
            return (
              <div
                key={day}
                className={`bg-white rounded-2xl p-4 border shadow-sm transition-all ${
                  isToday ? 'border-sky-200 ring-2 ring-sky-100' : 'border-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-bold text-sm flex items-center gap-2 ${isToday ? 'text-sky-700' : 'text-slate-700'}`}>
                    {isToday && <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse-soft" />}
                    {day}
                  </h3>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium text-slate-400">
                      {daySlots.length > 0 ? `${daySlots.length} blocks` : '—'}
                    </span>
                    <button
                      onClick={() => openAdd(day)}
                      className="w-6 h-6 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-sky-600 transition-colors ml-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {daySlots.length === 0 ? (
                    <div className="text-center py-5 text-slate-300 text-xs font-medium">No blocks ✦</div>
                  ) : (
                    daySlots.map((slot) => {
                      const c = colorMap[slot.color] || colorMap.sky;
                      return (
                        <div
                          key={slot.id}
                          className={`rounded-xl p-3 border-l-4 ${c.bg} ${c.border} group relative cursor-pointer`}
                          onClick={() => openEdit(slot)}
                        >
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                            <Clock className="w-3 h-3" />
                            {slot.startTime} – {slot.endTime}
                          </div>
                          <p className={`text-sm font-bold ${c.text} leading-tight`}>{slot.subject}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{slot.activity}</p>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeSlot(slot.id); }}
                            className="absolute top-2 right-2 w-5 h-5 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 flex items-center justify-center text-red-400 transition-all"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        slots.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 border border-slate-100 shadow-sm text-center">
            <CalendarClock className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-slate-500">No study blocks yet</p>
            <p className="text-sm text-slate-400 mt-1">Add a block to get started.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Day</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Time</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Subject</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Activity</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {slots.map((slot) => {
                  const c = colorMap[slot.color] || colorMap.sky;
                  const isToday = slot.day === today;
                  return (
                    <tr key={slot.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => openEdit(slot)}>
                      <td className="px-5 py-3.5 text-sm font-medium text-slate-700">
                        <span className="flex items-center gap-2">
                          {isToday && <div className="w-1.5 h-1.5 rounded-full bg-sky-500 flex-shrink-0" />}
                          {slot.day}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-500 tabular-nums">{slot.startTime} – {slot.endTime}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-sm font-semibold ${c.text} flex items-center gap-1.5`}>
                          <div className={`w-2 h-2 rounded-full ${c.dot} flex-shrink-0`} /> {slot.subject}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">{slot.activity}</td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); removeSlot(slot.id); }}
                          className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Tips */}
      {slots.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                <Sun className="w-4 h-4 text-amber-500" />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">Focused Study Blocks</h3>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Keep each study block to <strong className="text-slate-700">45–60 minutes</strong> with a short break in between. This matches how your brain consolidates information most effectively.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
                <Moon className="w-4 h-4 text-violet-500" />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">Balance & Recovery</h3>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Keep at least one full rest day per week. Research shows adequate recovery improves retention and prevents burnout — aim for no more than <strong className="text-slate-700">3 blocks per day</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-pop" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-900 text-lg">{editId ? 'Edit Block' : 'New Study Block'}</h3>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block">Day</label>
                <select
                  value={form.day}
                  onChange={(e) => setForm({ ...form, day: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none text-sm transition-all bg-white"
                >
                  {days.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block">Start Time</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block">End Time</label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none text-sm transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block">Subject</label>
                {subjects.length > 0 ? (
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none text-sm transition-all bg-white"
                  >
                    <option value="">Select a subject</option>
                    {subjects.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                ) : (
                  <input
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none text-sm transition-all"
                    placeholder="e.g. Mathematics"
                  />
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block">Activity</label>
                <input
                  value={form.activity}
                  onChange={(e) => setForm({ ...form, activity: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none text-sm transition-all"
                  placeholder="e.g. Chapter 5 Review"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {colorOptions.map((name) => {
                    const c = colorMap[name];
                    return (
                      <button
                        key={name}
                        onClick={() => setForm({ ...form, color: name })}
                        className={`w-8 h-8 rounded-lg ${c.dot} transition-all ${
                          form.color === name ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'opacity-60 hover:opacity-100'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={!form.subject.trim() || !form.activity.trim()}
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-medium text-sm hover:bg-slate-700 transition-colors disabled:opacity-40"
              >
                {editId ? 'Save Changes' : 'Add Block'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
