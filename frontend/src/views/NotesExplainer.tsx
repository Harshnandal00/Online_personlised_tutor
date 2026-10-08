import { useState, useRef, useCallback } from 'react';
import { useApp } from '@/store/AppContext';
import {
  Sparkles,
  FileText,
  Send,
  Lightbulb,
  HelpCircle,
  History,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Upload,
  File,
  Image,
  X,
  FileType2,
  Wand2,
} from 'lucide-react';

interface UploadedFile {
  name: string;
  type: string;
  size: number;
  previewUrl?: string;
}

const acceptedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'text/plain'];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string): typeof File {
  if (type.startsWith('image/')) return Image;
  if (type === 'application/pdf') return FileType2;
  return FileText;
}

export default function NotesExplainer() {
  const { noteExplanations, explainNotes, subjects } = useApp();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    setError('');
    const valid: UploadedFile[] = [];
    Array.from(fileList).forEach((f) => {
      if (!acceptedTypes.includes(f.type) && !f.name.match(/\.(pdf|jpe?g|png|webp|txt)$/i)) {
        setError(`${f.name} is not a supported format. Please upload PDF, JPG, PNG, WEBP, or TXT files.`);
        return;
      }
      const uploaded: UploadedFile = { name: f.name, type: f.type || 'text/plain', size: f.size };
      if (f.type.startsWith('image/')) {
        uploaded.previewUrl = URL.createObjectURL(f);
      }
      valid.push(uploaded);
    });
    setFiles((prev) => [...prev, ...valid]);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const updated = [...prev];
      if (updated[index].previewUrl) URL.revokeObjectURL(updated[index].previewUrl!);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleExplain = () => {
    if (files.length === 0 || !title.trim()) return;
    setIsAnalyzing(true);
    const fileNames = files.map((f) => f.name).join(', ');
    setTimeout(() => {
      explainNotes(title, subject || 'General', `[Content extracted from uploaded file(s): ${fileNames}]`);
      setIsAnalyzing(false);
      setTitle('');
      setSubject('');
      files.forEach((f) => { if (f.previewUrl) URL.revokeObjectURL(f.previewUrl); });
      setFiles([]);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">AI Notes Explainer</h2>
        <p className="text-slate-500 mt-0.5 text-sm">Upload your notes (PDF, images, or text) and let the AI break them down.</p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center shadow-sm shadow-sky-400/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-[15px]">Upload Your Notes</h3>
            <p className="text-xs text-slate-400">The AI will extract, analyze, simplify, and generate practice questions</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block">Note Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none text-sm transition-all"
                placeholder="e.g. Chapter 3: Cell Division"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none text-sm transition-all bg-white"
              >
                <option value="">Select a subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-sky-400 bg-sky-50'
                : 'border-slate-200 hover:border-sky-300 hover:bg-slate-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,application/pdf,image/*,text/plain"
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
            <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3 transition-all ${
              isDragOver ? 'bg-sky-100 scale-110' : 'bg-slate-100'
            }`}>
              <Upload className={`w-7 h-7 ${isDragOver ? 'text-sky-500' : 'text-slate-400'}`} />
            </div>
            <p className="text-sm font-medium text-slate-700">
              {isDragOver ? 'Drop your files here' : 'Drag & drop notes here, or click to browse'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports PDF, JPG, PNG, WEBP, and TXT files
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-600 flex items-center gap-2">
              <X className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Uploaded Files Preview */}
          {files.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500">{files.length} file{files.length > 1 ? 's' : ''} ready</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {files.map((file, i) => {
                  const Icon = getFileIcon(file.type);
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 group">
                      {file.previewUrl ? (
                        <img src={file.previewUrl} alt={file.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 border border-slate-200">
                          <Icon className="w-5 h-5 text-slate-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                        <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                      </div>
                      <button
                        onClick={() => removeFile(i)}
                        className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button
            onClick={handleExplain}
            disabled={files.length === 0 || !title.trim() || isAnalyzing}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-medium text-sm hover:bg-slate-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing files...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" /> Explain My Notes
              </>
            )}
          </button>
        </div>
      </div>

      {/* History Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <History className="w-4.5 h-4.5 text-slate-400" style={{ width: 18, height: 18 }} />
          <h3 className="font-semibold text-slate-900 text-[15px]">Explanation History</h3>
          <span className="text-xs font-medium text-slate-400">({noteExplanations.length})</span>
        </div>

        {noteExplanations.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 border border-slate-100 shadow-sm text-center">
            <FileText className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-slate-500">No explanations yet</p>
            <p className="text-sm text-slate-400 mt-1">Upload your notes above to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {noteExplanations.map((ne) => {
              const isExpanded = expandedId === ne.id;
              return (
                <div key={ne.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : ne.id)}
                    className="w-full flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-sky-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm">{ne.title}</h4>
                        <p className="text-xs text-slate-400">{ne.subject} · {ne.date}</p>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 space-y-4 border-t border-slate-100 pt-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Source Content</p>
                        <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 font-mono leading-relaxed whitespace-pre-wrap">
                          {ne.originalNotes}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-sky-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> AI Explanation
                        </p>
                        <div className="bg-sky-50/50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {ne.explanation}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Lightbulb className="w-3.5 h-3.5" /> Key Points
                        </p>
                        <ul className="space-y-2">
                          {ne.keyPoints.map((kp, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                              <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                {i + 1}
                              </div>
                              {kp}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-violet-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5" /> Practice Questions
                        </p>
                        <div className="space-y-2">
                          {ne.questions.map((q, i) => (
                            <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-violet-50/50">
                              <HelpCircle className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-slate-700">{q}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-sky-400" /> How It Works
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { step: '1', title: 'Upload Your Notes', desc: 'Drag & drop PDFs, photos of handwritten notes, screenshots, or text files. Multiple files supported.' },
            { step: '2', title: 'AI Extracts & Explains', desc: 'The AI reads your files, extracts the content, and breaks down complex concepts into simple language with key points highlighted.' },
            { step: '3', title: 'Practice & Save', desc: 'Generated practice questions test your understanding. Everything is saved to your history for future reference.' },
          ].map((s) => (
            <div key={s.step} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center flex-shrink-0 text-sm">
                {s.step}
              </div>
              <div>
                <p className="font-semibold text-sm">{s.title}</p>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
