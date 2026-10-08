import { useApp } from '@/store/AppContext';
import * as Icons from 'lucide-react';
import { Trophy, Lock, Star, Zap, Flame, BookCheck, Target, Award } from 'lucide-react';

// Badge definitions — unlock conditions are checked against the live studentProfile
const allBadges = [
  { id: 'a1', title: 'First Steps',    description: 'Complete your first study session',    icon: 'Footprints', xpReward: 20  },
  { id: 'a2', title: 'Week Warrior',   description: 'Maintain a 7-day streak',              icon: 'Sword',      xpReward: 50  },
  { id: 'a3', title: 'Homework Hero',  description: 'Complete 10 homework assignments',     icon: 'BookCheck',  xpReward: 30  },
  { id: 'a4', title: 'Deep Diver',     description: 'Study for 20+ total hours',            icon: 'Anchor',     xpReward: 40  },
  { id: 'a5', title: 'Streak Master',  description: 'Reach a 14-day streak',                icon: 'Zap',        xpReward: 75  },
  { id: 'a6', title: 'Century Club',   description: 'Complete 50 homework assignments',     icon: 'Trophy',     xpReward: 100 },
  { id: 'a7', title: 'Perfect Week',   description: 'Complete all homework in a week',      icon: 'CheckCircle',xpReward: 60  },
  { id: 'a8', title: 'Subject Sage',   description: 'Add 5 or more subjects',               icon: 'Brain',      xpReward: 50  },
];

function isUnlocked(id: string, profile: { streak: number; totalStudyHours: number; homeworkCompleted: number }, subjectCount: number): boolean {
  switch (id) {
    case 'a1': return profile.totalStudyHours > 0;
    case 'a2': return profile.streak >= 7;
    case 'a3': return profile.homeworkCompleted >= 10;
    case 'a4': return profile.totalStudyHours >= 20;
    case 'a5': return profile.streak >= 14;
    case 'a6': return profile.homeworkCompleted >= 50;
    case 'a7': return false; // requires weekly tracking not yet implemented
    case 'a8': return subjectCount >= 5;
    default:   return false;
  }
}

export default function Achievements() {
  const { studentProfile, subjects } = useApp();
  const badges = allBadges.map((b) => ({ ...b, unlocked: isUnlocked(b.id, studentProfile, subjects.length) }));
  const unlocked = badges.filter((a) => a.unlocked);
  const locked = badges.filter((a) => !a.unlocked);

  const milestones = [
    { label: 'Day Streak',   value: studentProfile.streak,           target: 14,  icon: Flame,     gradient: 'from-orange-400 to-red-500',    soft: 'bg-orange-50' },
    { label: 'Homework Done', value: studentProfile.homeworkCompleted, target: 100, icon: BookCheck, gradient: 'from-emerald-400 to-teal-500',   soft: 'bg-emerald-50' },
    { label: 'Study Hours',  value: studentProfile.totalStudyHours,   target: 100, icon: Target,    gradient: 'from-sky-400 to-blue-500',       soft: 'bg-sky-50' },
    { label: 'Level',        value: studentProfile.level,             target: 10,  icon: Zap,       gradient: 'from-violet-400 to-purple-500',  soft: 'bg-violet-50' },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Achievements</h2>
        <p className="text-slate-500 mt-0.5 text-sm">Celebrate your milestones and unlock new badges.</p>
      </div>

      {/* Level Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 p-6 text-white shadow-lg shadow-violet-500/20">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 80% 0%, rgba(255,255,255,0.1) 0%, transparent 60%)' }} />
        <div className="relative flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-2xl font-bold tracking-tight">Level {studentProfile.level}</h3>
              <span className="text-sm bg-white/20 px-2.5 py-0.5 rounded-full font-semibold">{studentProfile.xp} XP</span>
            </div>
            <p className="text-violet-200 text-sm mb-3">{studentProfile.xpToNext - studentProfile.xp} XP to Level {studentProfile.level + 1}</p>
            <div className="h-2 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-white transition-all duration-700"
                style={{ width: `${(studentProfile.xp / studentProfile.xpToNext) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Progress */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {milestones.map((m) => {
          const Icon = m.icon;
          const pct = Math.min((m.value / m.target) * 100, 100);
          return (
            <div key={m.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.gradient} flex items-center justify-center mb-3 shadow-sm`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-slate-900 leading-none">
                {m.value}<span className="text-sm font-normal text-slate-400">/{m.target}</span>
              </p>
              <p className="text-xs font-medium text-slate-500 mt-1.5">{m.label}</p>
              <div className="mt-2.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className={`h-full rounded-full bg-gradient-to-r ${m.gradient} transition-all duration-700`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Unlocked Badges */}
      <div>
        <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2 text-[15px]">
          <Award className="w-4.5 h-4.5 text-amber-500" style={{ width: 18, height: 18 }} />
          Unlocked <span className="text-sm font-normal text-slate-400">({unlocked.length})</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {unlocked.map((a) => {
            const Icon = (Icons as unknown as Record<string, typeof Trophy>)[a.icon] || Trophy;
            return (
              <div key={a.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center group card-lift">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center mb-3 shadow-md shadow-amber-400/20 group-hover:scale-105 transition-transform">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{a.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{a.description}</p>
                <p className="text-xs text-emerald-600 mt-2 flex items-center justify-center gap-1 font-medium">
                  <Star className="w-3 h-3" /> +{a.xpReward} XP
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Locked Badges */}
      <div>
        <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2 text-[15px]">
          <Lock className="w-4.5 h-4.5 text-slate-400" style={{ width: 18, height: 18 }} />
          Locked <span className="text-sm font-normal text-slate-400">({locked.length})</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {locked.map((a) => {
            const Icon = (Icons as unknown as Record<string, typeof Trophy>)[a.icon] || Trophy;
            return (
              <div key={a.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-center opacity-70">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-200 flex items-center justify-center mb-3">
                  <Icon className="w-7 h-7 text-slate-400" />
                </div>
                <h4 className="font-semibold text-slate-500 text-sm">{a.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{a.description}</p>
                <p className="text-xs text-slate-400 mt-2 flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" /> Locked
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
