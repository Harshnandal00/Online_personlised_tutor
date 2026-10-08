import { Brain, Zap, Clock, TrendingUp, TrendingDown, Calendar, BarChart3 } from 'lucide-react';

const colorMap: Record<string, { bar: string; dot: string; soft: string }> = {
  sky:     { bar: 'bg-sky-400',     dot: 'bg-sky-400',     soft: 'bg-sky-50' },
  teal:    { bar: 'bg-teal-400',    dot: 'bg-teal-400',    soft: 'bg-teal-50' },
  amber:   { bar: 'bg-amber-400',   dot: 'bg-amber-400',   soft: 'bg-amber-50' },
  rose:    { bar: 'bg-rose-400',    dot: 'bg-rose-400',    soft: 'bg-rose-50' },
  violet:  { bar: 'bg-violet-400',  dot: 'bg-violet-400',  soft: 'bg-violet-50' },
  emerald: { bar: 'bg-emerald-400', dot: 'bg-emerald-400', soft: 'bg-emerald-50' },
};

// Study analytics is currently display-only (no live session logging in this version).
// It shows empty-state messaging when there is no data yet.
const subjectEffortData: {
  subject: string; totalMinutes: number; avgEffort: number;
  avgUnderstanding: number; sessions: number; color: string;
}[] = [];

const studySessions: {
  id: string; subject: string; topic: string; date: string;
  durationMinutes: number; effortLevel: number; understandingLevel: number; notes: string;
}[] = [];

export default function StudyAnalytics() {
  const totalMinutes = subjectEffortData.reduce((sum, s) => sum + s.totalMinutes, 0);
  const totalSessions = subjectEffortData.reduce((sum, s) => sum + s.sessions, 0);
  const avgEffort = totalSessions > 0
    ? (subjectEffortData.reduce((sum, s) => sum + s.avgEffort * s.sessions, 0) / totalSessions).toFixed(1)
    : '—';
  const maxMinutes = subjectEffortData.length > 0
    ? Math.max(...subjectEffortData.map((s) => s.totalMinutes))
    : 0;

  const isEmpty = subjectEffortData.length === 0;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Study Analytics</h2>
        <p className="text-slate-500 mt-0.5 text-sm">Track your effort, understanding, and growth over time.</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Study Time', value: totalMinutes > 0 ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` : '0h', icon: Clock, bg: 'bg-sky-50', color: 'text-sky-600' },
          { label: 'Sessions Logged', value: `${totalSessions}`, icon: Calendar, bg: 'bg-violet-50', color: 'text-violet-600' },
          { label: 'Avg Effort Level', value: `${avgEffort}${avgEffort !== '—' ? '/5' : ''}`, icon: Zap, bg: 'bg-amber-50', color: 'text-amber-600' },
          { label: 'Subjects Tracked', value: `${subjectEffortData.length}`, icon: Brain, bg: 'bg-emerald-50', color: 'text-emerald-600' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-slate-900 leading-none">{stat.value}</p>
              <p className="text-xs font-medium text-slate-500 mt-1.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {isEmpty ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-100 shadow-sm text-center">
          <BarChart3 className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="text-base font-semibold text-slate-500">No study sessions yet</p>
          <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            Once you start logging study sessions, your analytics will appear here — effort levels, understanding trends, and subject breakdowns.
          </p>
        </div>
      ) : (
        <>
          <div className="grid lg:grid-cols-2 gap-5">
            {/* Time per Subject */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4.5 h-4.5 text-slate-500" style={{ width: 18, height: 18 }} />
                <h3 className="font-semibold text-slate-900 text-[15px]">Time by Subject</h3>
              </div>
              <p className="text-xs text-slate-400 mb-5">Total minutes studied per subject this semester</p>
              <div className="space-y-4">
                {subjectEffortData.map((s) => {
                  const c = colorMap[s.color] || colorMap.sky;
                  const pct = maxMinutes > 0 ? Math.round((s.totalMinutes / maxMinutes) * 100) : 0;
                  return (
                    <div key={s.subject}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
                          <span className="text-sm font-medium text-slate-700">{s.subject}</span>
                        </div>
                        <span className="text-xs font-semibold text-slate-500">{s.totalMinutes} min</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${c.bar} transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Effort vs Understanding */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Brain className="w-4.5 h-4.5 text-slate-500" style={{ width: 18, height: 18 }} />
                <h3 className="font-semibold text-slate-900 text-[15px]">Effort vs Understanding</h3>
              </div>
              <p className="text-xs text-slate-400 mb-5">Identify where to focus your energy next</p>
              <div className="space-y-4">
                {subjectEffortData.map((s) => (
                  <div key={s.subject}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-slate-700">{s.subject}</span>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-500" />{s.avgEffort.toFixed(1)}</span>
                        <span className="flex items-center gap-1"><Brain className="w-3 h-3 text-violet-500" />{s.avgUnderstanding.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full bg-amber-400 transition-all duration-700" style={{ width: `${(s.avgEffort / 5) * 100}%` }} />
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full bg-violet-400 transition-all duration-700" style={{ width: `${(s.avgUnderstanding / 5) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-50 text-xs text-slate-400">
                <span className="flex items-center gap-1.5"><div className="w-3 h-1.5 rounded-full bg-amber-400" /> Effort</span>
                <span className="flex items-center gap-1.5"><div className="w-3 h-1.5 rounded-full bg-violet-400" /> Understanding</span>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          {subjectEffortData.length >= 2 && (() => {
            const best = subjectEffortData.reduce((a, b) => a.avgEffort > b.avgEffort ? a : b);
            const worst = subjectEffortData.reduce((a, b) => a.avgUnderstanding < b.avgUnderstanding ? a : b);
            return (
              <div className="rounded-2xl border border-sky-100 overflow-hidden">
                <div className="bg-gradient-to-br from-sky-50 to-cyan-50 px-5 py-4 flex items-center gap-2 border-b border-sky-100">
                  <Brain className="w-4.5 h-4.5 text-sky-600 flex-shrink-0" style={{ width: 18, height: 18 }} />
                  <h3 className="font-semibold text-slate-900 text-[15px]">AI Insights</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="p-5 border-b md:border-b-0 md:border-r border-sky-100 bg-white">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">High Effort, High Reward</span>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      You're putting the most effort into <strong className="text-slate-700">{best.subject}</strong> ({best.avgEffort.toFixed(1)}/5) and seeing good understanding ({best.avgUnderstanding.toFixed(1)}/5). Keep this momentum going!
                    </p>
                  </div>
                  <div className="p-5 bg-white">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                        <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">Needs Attention</span>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      <strong className="text-slate-700">{worst.subject}</strong> shows the lowest understanding ({worst.avgUnderstanding.toFixed(1)}/5). Try breaking problems into smaller steps or ask your AI tutor.
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Recent Sessions */}
          {studySessions.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-50">
                <h3 className="font-semibold text-slate-900 text-[15px]">Recent Study Sessions</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {studySessions.slice(0, 6).map((session) => {
                  const subjectData = subjectEffortData.find((s) => s.subject === session.subject);
                  const c = colorMap[subjectData?.color || 'sky'] || colorMap.sky;
                  return (
                    <div key={session.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
                      <div className={`w-1.5 h-10 rounded-full ${c.dot} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800">{session.topic}</p>
                        <p className="text-xs text-slate-400">{session.subject} · {session.date} · {session.durationMinutes} min</p>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-center">
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Effort</p>
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map((i) => (
                              <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= session.effortLevel ? 'bg-amber-400' : 'bg-slate-100'}`} />
                            ))}
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Grasp</p>
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map((i) => (
                              <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= session.understandingLevel ? 'bg-violet-400' : 'bg-slate-100'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
