import {
  aiSuggestedTaskTemplates,
  motivationalQuotes,
} from '@/data/mockData';
import { supabase } from '@/lib/supabase';
import type {
  CalendarEvent,
  ChatMessage,
  Homework,
  HomeworkStatus,
  NoteExplanation,
  Notification,
  StudentProfile,
  Subject,
  Task,
  TaskCategory,
  TaskPriority,
  TaskStatus,
  View,
} from '@/types';
import type { User } from '@supabase/supabase-js';
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface AppContextValue {
  user: User | null;
  studentProfile: StudentProfile;
  view: View;
  setView: (v: View) => void;
  homeworks: Homework[];
  toggleHomeworkStatus: (id: string) => void;
  addHomework: (hw: Omit<Homework, 'id'>) => void;
  chatMessages: ChatMessage[];
  sendMessage: (content: string) => void;
  todayQuote: string;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  subjects: Subject[];
  addSubject: (s: Omit<Subject, 'id'>) => void;
  updateSubject: (id: string, s: Partial<Subject>) => void;
  removeSubject: (id: string) => void;
  calendarEvents: CalendarEvent[];
  addCalendarEvent: (e: Omit<CalendarEvent, 'id'>) => void;
  removeCalendarEvent: (id: string) => void;
  noteExplanations: NoteExplanation[];
  explainNotes: (title: string, subject: string, notes: string) => void;
  tasks: Task[];
  addTask: (t: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, t: Partial<Task>) => void;
  toggleTaskStatus: (id: string) => void;
  removeTask: (id: string) => void;
  aiSuggestions: typeof aiSuggestedTaskTemplates;
  acceptAISuggestion: (index: number) => void;
  dismissAISuggestion: (index: number) => void;
  notifications: Notification[];
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  pushNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  showNotifPanel: boolean;
  setShowNotifPanel: (v: boolean) => void;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

function buildProfile(user: User | null): StudentProfile {
  const raw = user?.user_metadata?.full_name ?? user?.email ?? 'Student';
  // Capitalise first word as a display name
  const name = raw.includes('@') ? raw.split('@')[0] : raw;
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() ?? '')
    .join('');

  return {
    name,
    grade: '',
    avatar: initials || 'S',
    streak: 0,
    longestStreak: 0,
    totalStudyHours: 0,
    homeworkCompleted: 0,
    level: 1,
    xp: 0,
    xpToNext: 200,
    joinDate: new Date().toISOString().split('T')[0],
  };
}

export function AppProvider({ children, user }: { children: ReactNode; user: User | null }) {
  const profile = useMemo(() => buildProfile(user), [user]);

  const [view, setView] = useState<View>('dashboard');
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'm0',
      role: 'tutor',
      content: `Hi ${profile.name}! I'm your AI study tutor. Ask me anything about your subjects, and I'll help you understand difficult topics, plan your study sessions, or just keep you motivated. What would you like to work on today?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [todayQuote] = useState(
    motivationalQuotes[new Date().getDate() % motivationalQuotes.length]
  );
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [noteExplanations, setNoteExplanations] = useState<NoteExplanation[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<number[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleHomeworkStatus = (id: string) => {
    setHomeworks((prev) =>
      prev.map((hw) => {
        if (hw.id !== id) return hw;
        const next: HomeworkStatus =
          hw.status === 'completed'
            ? 'pending'
            : hw.status === 'pending'
              ? 'in-progress'
              : 'completed';
        return { ...hw, status: next };
      })
    );
  };

  const addHomework = (hw: Omit<Homework, 'id'>) => {
    setHomeworks((prev) => [...prev, { ...hw, id: `hw${Date.now()}` }]);
  };

  const addSubject = (s: Omit<Subject, 'id'>) => {
    setSubjects((prev) => [...prev, { ...s, id: `sub${Date.now()}` }]);
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const removeSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  const addCalendarEvent = (e: Omit<CalendarEvent, 'id'>) => {
    setCalendarEvents((prev) => [...prev, { ...e, id: `ev${Date.now()}` }]);
  };

  const removeCalendarEvent = (id: string) => {
    setCalendarEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const sendMessage = async (content: string) => {
    const userMsg: ChatMessage = {
      id: `m${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    const botMsgId = `m${Date.now() + 1}`;
    const initialBotMsg: ChatMessage = {
      id: botMsgId,
      role: 'tutor',
      content: '',
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, userMsg, initialBotMsg]);

    try {
      const response = await fetch('https://onlinepersonlisedtutor-production.up.railway.app/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id ?? 'anonymous',
          message: content,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to connect to backend server');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullResponse += decoder.decode(value, { stream: true });
        setChatMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMsgId ? { ...msg, content: fullResponse } : msg
          )
        );
      }
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMsgId
            ? {
              ...msg,
              content:
                '⚠️ Could not reach the tutor backend. Ensure FastAPI is running on http://localhost:8000.',
            }
            : msg
        )
      );
    }
  };

  const explainNotes = (title: string, subject: string, notes: string) => {
    const explanation = generateNoteExplanation(notes, subject);
    const newExplanation: NoteExplanation = {
      id: `ne${Date.now()}`,
      title,
      subject,
      date: new Date().toISOString().split('T')[0],
      originalNotes: notes,
      explanation: explanation.text,
      keyPoints: explanation.keyPoints,
      questions: explanation.questions,
    };
    setNoteExplanations((prev) => [newExplanation, ...prev]);
  };

  const pushNotification = (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    setNotifications((prev) => [
      { ...n, id: `n${Date.now()}`, timestamp: new Date().toISOString(), read: false },
      ...prev,
    ]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const addTask = (t: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...t,
      id: `task${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    pushNotification({
      title: 'Task Added',
      message: `"${t.title}" has been added to your to-do list.`,
      type: 'info',
      taskId: newTask.id,
    });
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const toggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const next: TaskStatus =
          t.status === 'todo' ? 'in-progress' : t.status === 'in-progress' ? 'done' : 'todo';
        if (next === 'done') {
          pushNotification({
            title: 'Task Completed!',
            message: `Great job completing "${t.title}"! Keep the momentum going.`,
            type: 'achievement',
            taskId: id,
          });
        }
        return { ...t, status: next };
      })
    );
  };

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const activeSuggestions = aiSuggestedTaskTemplates.filter((_, i) => !dismissedSuggestions.includes(i));

  const acceptAISuggestion = (index: number) => {
    const suggestion = aiSuggestedTaskTemplates[index];
    const newTask: Task = {
      id: `task${Date.now()}`,
      title: suggestion.title,
      description: suggestion.description,
      category: suggestion.category,
      priority: suggestion.priority,
      dueDate: getDefaultDueDate(),
      status: 'todo',
      aiSuggested: true,
      subject: suggestion.subject,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    setDismissedSuggestions((prev) => [...prev, index]);
    pushNotification({
      title: 'AI Task Added',
      message: `"${suggestion.title}" has been added to your task list.`,
      type: 'info',
      taskId: newTask.id,
    });
  };

  const dismissAISuggestion = (index: number) => {
    setDismissedSuggestions((prev) => [...prev, index]);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AppContext.Provider
      value={{
        user,
        studentProfile: profile,
        view,
        setView,
        homeworks,
        toggleHomeworkStatus,
        addHomework,
        chatMessages,
        sendMessage,
        todayQuote,
        sidebarOpen,
        setSidebarOpen,
        subjects,
        addSubject,
        updateSubject,
        removeSubject,
        calendarEvents,
        addCalendarEvent,
        removeCalendarEvent,
        noteExplanations,
        explainNotes,
        tasks,
        addTask,
        updateTask,
        toggleTaskStatus,
        removeTask,
        aiSuggestions: activeSuggestions,
        acceptAISuggestion,
        dismissAISuggestion,
        notifications,
        unreadCount,
        markNotificationRead,
        markAllRead,
        pushNotification,
        showNotifPanel,
        setShowNotifPanel,
        signOut,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

function getDefaultDueDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toISOString().split('T')[0];
}

function generateNoteExplanation(notes: string, subject: string): {
  text: string;
  keyPoints: string[];
  questions: string[];
} {
  const sentences = notes.split(/[.!?]\s+/).filter((s) => s.trim().length > 5);
  const keyPoints = sentences.slice(0, 5).map((s) => s.trim());

  const questions = [
    `Can you explain the most important concept from these ${subject} notes in your own words?`,
    `Which part of these notes was hardest to understand, and why?`,
    `How do the ideas in these notes connect to what you already know about ${subject}?`,
  ];

  const text = `Here's a clear breakdown of your ${subject} notes:\n\n${sentences
    .map((s, i) => `${i + 1}. ${s.trim()}`)
    .join('\n')}\n\nIn simple terms, these notes cover the core ideas of ${subject}. The key is to understand how each concept connects to the others — try to build a mental map where each piece of information links to the next. When you can explain a concept without looking at your notes, you truly understand it.\n\nI've saved this explanation to your study history so we can revisit it anytime. Try answering the practice questions below to test your understanding!`;

  return { text, keyPoints, questions };
}

export const taskCategoryLabels: Record<TaskCategory, string> = {
  study: 'Study',
  homework: 'Homework',
  revision: 'Revision',
  project: 'Project',
  personal: 'Personal',
};

export const taskPriorityConfig: Record<TaskPriority, { label: string; bg: string; text: string }> = {
  high: { label: 'High', bg: 'bg-red-50', text: 'text-red-600' },
  medium: { label: 'Medium', bg: 'bg-amber-50', text: 'text-amber-600' },
  low: { label: 'Low', bg: 'bg-slate-50', text: 'text-slate-500' },
};

export const taskStatusConfig: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  todo: { label: 'To Do', color: 'text-slate-500', bg: 'bg-slate-100' },
  'in-progress': { label: 'In Progress', color: 'text-sky-600', bg: 'bg-sky-100' },
  done: { label: 'Done', color: 'text-emerald-600', bg: 'bg-emerald-100' },
};
