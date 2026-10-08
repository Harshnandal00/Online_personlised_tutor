import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import type { Subject } from '@/types';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  BookOpen,
  User,
  Layers,
  Check,
  ChevronRight,
} from 'lucide-react';

const colorOptions = [
  { name: 'sky',     bg: 'bg-sky-100',     dot: 'bg-sky-500',     text: 'text-sky-700' },
  { name: 'teal',    bg: 'bg-teal-100',    dot: 'bg-teal-500',    text: 'text-teal-700' },
  { name: 'amber',   bg: 'bg-amber-100',   dot: 'bg-amber-500',   text: 'text-amber-700' },
  { name: 'rose',    bg: 'bg-rose-100',    dot: 'bg-rose-500',    text: 'text-rose-700' },
  { name: 'violet',  bg: 'bg-violet-100',  dot: 'bg-violet-500',  text: 'text-violet-700' },
  { name: 'emerald', bg: 'bg-emerald-100', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  { name: 'indigo',  bg: 'bg-indigo-100',  dot: 'bg-indigo-500',  text: 'text-indigo-700' },
  { name: 'orange',  bg: 'bg-orange-100',  dot: 'bg-orange-500',  text: 'text-orange-700' },
];

const colorMap: Record<string, { bg: string; dot: string; text: string }> = {};
colorOptions.forEach((c) => { colorMap[c.name] = { bg: c.bg, dot: c.dot, text: c.text }; });

const difficultyConfig = {
  easy:   { label: 'Easy',   bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  medium: { label: 'Medium', bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400' },
  hard:   { label: 'Hard',   bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-400' },
};

interface FormState {
  name: string;
  color: string;
  teacher: string;
  topics: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const emptyForm: FormState = { name: '', color: 'sky', teacher: '', topics: '', difficulty: 'medium' };

export default function SubjectManager() {
  const { subjects, addSubject, updateSubject, removeSubject } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };

  const openEdit = (s: Subject) => {
    setForm({ name: s.name, color: s.color, teacher: s.teacher, topics: s.topics.join(', '), difficulty: s.difficulty });
    setEditId(s.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    const data = { name: form.name.trim(), color: form.color, teacher: form.teacher.trim(), topics: form.topics.split(',').map((t) => t.trim()).filter(Boolean), difficulty: form.difficulty };
    if (editId) { updateSubject(editId, data); } else { addSubject(data); }
    setShowForm(false);
    setForm(emptyForm);
    setEditId(null);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Subject Manager</h2>
          <p className="text-slate-500 mt-0.5 text-sm">Add, edit, and organize your subjects and topics.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-medium text-sm hover:bg-slate-700 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Subject
        </button>
      </div>

      {/* Summary Row */}
      <div className="flex items-center gap-4 flex-wrap">
        {subjects.map((s) => {
          const c = colorMap[s.color] || colorMap.sky;
          return (
            <div key={s.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${c.bg}`}>
              <div className={`w-2 h-2 rounded-full ${c.dot}`} />
              <span className={`text-xs font-semibold ${c.text}`}>{s.name}</span>
              <span className={`text-xs ${c.text} opacity-60`}>{s.topics.length} topics</span>
            </div>
          );
        })}
      </div>

      {/* Subject Cards */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {subjects.map((s) => {
          const c = colorMap[s.color] || colorMap.sky;
          const diff = difficultyConfig[s.difficulty];
          const isExpanded = expandedId === s.id;
          return (
            <div key={s.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden card-lift">
              <div className={`h-1.5 ${c.dot}`} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
                      <BookOpen className={`w-4.5 h-4.5 ${c.text}`} style={{ width: 18, height: 18 }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 leading-tight">{s.name}</h3>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full mt-0.5 ${diff.bg} ${diff.text}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
                        {diff.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button
                      onClick={() => openEdit(s)}
                      className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-sky-600 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(s.id)}
                      className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                  <User className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="font-medium">{s.teacher || 'No teacher assigned'}</span>
                </div>

                <button
                  onClick={() => setExpandedId(isExpanded ? null : s.id)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> {s.topics.length} Topics
                  </p>
                  <ChevronRight className={`w-4 h-4 text-slate-300 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>

                {isExpanded && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {s.topics.map((t, i) => (
                      <span key={i} className={`text-xs px-2 py-1 rounded-md font-medium ${c.bg} ${c.text}`}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                {!isExpanded && s.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {s.topics.slice(0, 3).map((t, i) => (
                      <span key={i} className={`text-xs px-2 py-1 rounded-md font-medium ${c.bg} ${c.text}`}>
                        {t}
                      </span>
                    ))}
                    {s.topics.length > 3 && (
                      <button
                        onClick={() => setExpandedId(s.id)}
                        className="text-xs px-2 py-1 rounded-md font-medium bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors"
                      >
                        +{s.topics.length - 3} more
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {subjects.length === 0 && (
        <div className="bg-white rounded-2xl p-10 border border-slate-100 shadow-sm text-center">
          <BookOpen className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="font-semibold text-slate-500">No subjects yet</p>
          <p className="text-sm text-slate-400 mt-1">Add your first subject to get started.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto animate-pop" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-900 text-lg">{editId ? 'Edit Subject' : 'New Subject'}</h3>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block">Subject Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none text-sm transition-all"
                  placeholder="e.g. Chemistry"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block">Teacher</label>
                <input
                  value={form.teacher}
                  onChange={(e) => setForm({ ...form, teacher: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none text-sm transition-all"
                  placeholder="e.g. Mr. Smith"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block">Color</label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setForm({ ...form, color: c.name })}
                      className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center transition-all ${
                        form.color === c.name ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'
                      }`}
                    >
                      {form.color === c.name
                        ? <Check className="w-4 h-4 text-slate-700" />
                        : <div className={`w-4 h-4 rounded-full ${c.dot}`} />
                      }
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block">Difficulty</label>
                <div className="flex gap-2">
                  {(['easy', 'medium', 'hard'] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setForm({ ...form, difficulty: d })}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                        form.difficulty === d
                          ? d === 'easy' ? 'bg-emerald-100 text-emerald-800' : d === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                          : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block">Topics (comma-separated)</label>
                <input
                  value={form.topics}
                  onChange={(e) => setForm({ ...form, topics: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none text-sm transition-all"
                  placeholder="e.g. Acids & Bases, Periodic Table, Bonding"
                />
              </div>
              <button
                onClick={handleSubmit}
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-medium text-sm hover:bg-slate-700 transition-colors"
              >
                {editId ? 'Save Changes' : 'Add Subject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-pop" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg text-center">Remove Subject?</h3>
            <p className="text-sm text-slate-500 text-center mt-2 mb-5">
              This will remove <strong>"{subjects.find((s) => s.id === confirmDelete)?.name}"</strong> and all its topics.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { removeSubject(confirmDelete); setConfirmDelete(null); }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
