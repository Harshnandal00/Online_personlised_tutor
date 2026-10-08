export type View =
  | 'dashboard'
  | 'homework'
  | 'tasks'
  | 'sessions'
  | 'timetable'
  | 'tutor'
  | 'achievements'
  | 'subjects'
  | 'calendar'
  | 'notes';

export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskCategory = 'study' | 'homework' | 'revision' | 'project' | 'personal';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate: string;
  status: TaskStatus;
  aiSuggested: boolean;
  subject: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'deadline' | 'achievement' | 'info';
  taskId?: string;
  read: boolean;
  timestamp: string;
}

export type EventType = 'test' | 'project' | 'homework' | 'reminder' | 'event';

export interface Subject {
  id: string;
  name: string;
  color: string;
  teacher: string;
  topics: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: EventType;
  subject: string;
  description: string;
}

export interface NoteExplanation {
  id: string;
  title: string;
  originalNotes: string;
  explanation: string;
  subject: string;
  date: string;
  keyPoints: string[];
  questions: string[];
}

export type HomeworkStatus = 'pending' | 'in-progress' | 'completed' | 'overdue';

export interface Homework {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: HomeworkStatus;
  priority: 'low' | 'medium' | 'high';
  description: string;
  estimatedMinutes: number;
}

export interface StudySession {
  id: string;
  subject: string;
  topic: string;
  date: string;
  durationMinutes: number;
  effortLevel: 1 | 2 | 3 | 4 | 5;
  understandingLevel: 1 | 2 | 3 | 4 | 5;
  notes: string;
}

export interface TimetableSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  activity: string;
  color: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'tutor';
  content: string;
  timestamp: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  date?: string;
}

export interface StudentProfile {
  name: string;
  grade: string;
  avatar: string;
  streak: number;
  longestStreak: number;
  totalStudyHours: number;
  homeworkCompleted: number;
  level: number;
  xp: number;
  xpToNext: number;
  joinDate: string;
}

export interface SubjectEffort {
  subject: string;
  totalMinutes: number;
  avgEffort: number;
  avgUnderstanding: number;
  sessions: number;
  color: string;
}
