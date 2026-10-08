import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/store/AppContext';
import { Bot, Send, Sparkles, User, Zap } from 'lucide-react';

// ---------------------------------------------------------------------------
// Lightweight markdown renderer — no external deps
// Handles: h1-h3, bold, italic, inline code, code blocks, ul/ol lists, hr
// ---------------------------------------------------------------------------
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let i = 0;

  const parseInline = (raw: string, key: string): React.ReactNode => {
    // Split on bold, italic, inline-code patterns
    const parts = raw.split(/(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*]+\*|_[^_]+_)/g);
    return (
      <span key={key}>
        {parts.map((p, pi) => {
          if ((p.startsWith('**') && p.endsWith('**')) || (p.startsWith('__') && p.endsWith('__')))
            return <strong key={pi}>{p.slice(2, -2)}</strong>;
          if ((p.startsWith('*') && p.endsWith('*')) || (p.startsWith('_') && p.endsWith('_')))
            return <em key={pi}>{p.slice(1, -1)}</em>;
          if (p.startsWith('`') && p.endsWith('`'))
            return <code key={pi} className="bg-slate-100 text-sky-700 px-1 py-0.5 rounded text-[0.82em] font-mono">{p.slice(1, -1)}</code>;
          return p;
        })}
      </span>
    );
  };

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      nodes.push(
        <pre key={`code-${i}`} className="bg-slate-900 text-slate-100 rounded-xl p-4 my-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
          {codeLines.join('\n')}
        </pre>
      );
      i++;
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      nodes.push(<hr key={`hr-${i}`} className="border-slate-200 my-3" />);
      i++; continue;
    }

    // Headings
    const h3 = line.match(/^###\s+(.*)/);
    const h2 = line.match(/^##\s+(.*)/);
    const h1 = line.match(/^#\s+(.*)/);
    if (h3) { nodes.push(<h3 key={`h-${i}`} className="text-sm font-bold text-slate-900 mt-3 mb-1">{parseInline(h3[1], `h3i-${i}`)}</h3>); i++; continue; }
    if (h2) { nodes.push(<h2 key={`h-${i}`} className="text-base font-bold text-slate-900 mt-4 mb-1">{parseInline(h2[1], `h2i-${i}`)}</h2>); i++; continue; }
    if (h1) { nodes.push(<h1 key={`h-${i}`} className="text-lg font-bold text-slate-900 mt-4 mb-1">{parseInline(h1[1], `h1i-${i}`)}</h1>); i++; continue; }

    // Unordered list — collect consecutive items
    if (/^[\*\-]\s+/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^[\*\-]\s+/.test(lines[i])) {
        const content = lines[i].replace(/^[\*\-]\s+/, '');
        items.push(<li key={i} className="leading-relaxed">{parseInline(content, `li-${i}`)}</li>);
        i++;
      }
      nodes.push(<ul key={`ul-${i}`} className="list-disc list-outside ml-4 my-1.5 space-y-0.5 text-sm">{items}</ul>);
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        const content = lines[i].replace(/^\d+\.\s+/, '');
        items.push(<li key={i} className="leading-relaxed">{parseInline(content, `oli-${i}`)}</li>);
        i++;
      }
      nodes.push(<ol key={`ol-${i}`} className="list-decimal list-outside ml-4 my-1.5 space-y-0.5 text-sm">{items}</ol>);
      continue;
    }

    // Blank line — small spacer
    if (line.trim() === '') {
      nodes.push(<div key={`br-${i}`} className="h-1" />);
      i++; continue;
    }

    // Normal paragraph
    nodes.push(<p key={`p-${i}`} className="text-sm leading-relaxed">{parseInline(line, `pi-${i}`)}</p>);
    i++;
  }

  return nodes;
}

const suggestedPrompts = [
  "Help me understand Newton's Laws",
  "Create a study plan for this week",
  "Explain quadratic equations step by step",
  "What should I focus on before my Physics midterm?",
];

export default function AITutor() {
  const { chatMessages, sendMessage } = useApp();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    setIsTyping(true);
    sendMessage(text);
    setInput('');
    setTimeout(() => setIsTyping(false), 750);
  };

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">AI Tutor</h2>
          <p className="text-slate-500 mt-0.5 text-sm">Your personalized learning companion, available 24/7.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-soft" />
          <span className="text-xs font-semibold text-emerald-700">Online · Knows your study history</span>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[600px]">
        {/* Chat Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100">
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center shadow-sm shadow-sky-400/20">
              <Bot className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm leading-tight">StudyMate AI</h3>
            <p className="text-[11px] text-slate-400">Powered by Gemini · Responds in seconds</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {chatMessages.map((msg, idx) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-up`}
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              {/* Avatar */}
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 self-end ${
                msg.role === 'user'
                  ? 'bg-slate-200'
                  : 'bg-gradient-to-br from-sky-400 to-cyan-500 shadow-sm shadow-sky-400/20'
              }`}>
                {msg.role === 'user' ? (
                  <User className="w-3.5 h-3.5 text-slate-600" />
                ) : (
                  <Bot className="w-3.5 h-3.5 text-white" />
                )}
              </div>

              {/* Bubble */}
              <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 ${
                msg.role === 'user'
                  ? 'bg-slate-900 text-white rounded-br-sm'
                  : 'bg-slate-50 border border-slate-100 text-slate-700 rounded-bl-sm'
              }`}>
                {msg.role === 'tutor'
                  ? <div className="space-y-0.5">{renderMarkdown(msg.content)}</div>
                  : <p className="text-sm leading-relaxed">{msg.content}</p>
                }
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-2.5 animate-fade-in">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center flex-shrink-0 self-end shadow-sm shadow-sky-400/20">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1 items-center h-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 typing-dot" />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 typing-dot" />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 typing-dot" />
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Suggested Prompts */}
        {chatMessages.length <= 1 && (
          <div className="px-4 pb-3">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> Try asking
            </p>
            <div className="flex flex-wrap gap-1.5">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-sky-50 text-slate-600 hover:text-sky-700 text-xs font-medium border border-slate-200 hover:border-sky-200 transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
              placeholder="Ask your tutor anything..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100 outline-none text-sm transition-all"
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim()}
              className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-slate-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="grid md:grid-cols-3 gap-3">
        {[
          { icon: Zap, title: 'Subject-aware', desc: 'The AI knows your current subjects and study history to give personalized help.' },
          { icon: Sparkles, title: 'Instant explanations', desc: 'Get step-by-step breakdowns of any concept, formula, or problem.' },
          { icon: Bot, title: 'Study planning', desc: 'Ask for study schedules, revision strategies, and exam tips.' },
        ].map((tip) => {
          const Icon = tip.icon;
          return (
            <div key={tip.title} className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-sky-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{tip.title}</p>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{tip.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
