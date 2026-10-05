import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from './Button';
import { Badge } from './Badge';
import {
  Bot, Send, User, X, Sparkles, RefreshCw, AlertCircle,
  ArrowRight, ShieldCheck
} from 'lucide-react';
import { streamAskAIAPI, fetchDashboardKPIsAPI } from '../../services/intelligenceService';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  actionLinks?: { label: string; url: string }[];
  isError?: boolean;
}

interface AskAIChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AskAIChatWindow: React.FC<AskAIChatWindowProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  useEffect(() => {
    if (!isOpen) return;

    const initAskAI = async () => {
      let roleKpi = null;
      try {
        const res = await fetchDashboardKPIsAPI();
        if (res?.kpis) {
          roleKpi = res.kpis;
        }
      } catch {
        // graceful
      }

      const role = user?.role || 'CANDIDATE';
      const name = user?.full_name || 'there';

      let welcomeText = '';
      let initialActions: { label: string; url: string }[] = [];

      if (role === 'CANDIDATE') {
        const hasAnalysis = roleKpi && (roleKpi.careerScore > 0 || roleKpi.resumeScore > 0 || (roleKpi.verifiedSkills && roleKpi.verifiedSkills > 0));
        if (hasAnalysis) {
          welcomeText = `Hello ${name}! I am Ask AI, your career intelligence assistant.\n\nYour verified CV analysis is active with **${roleKpi.careerScore || roleKpi.resumeScore || 0}% ATS match** and **${roleKpi.verifiedSkills || 0} verified skills** in your capability ledger.\n\nHow can I assist your career progression today?`;
          initialActions = [
            { label: 'View 5-Year Salary Trajectory', url: '/candidate/earnings' },
            { label: 'Inspect Skill Gap Benchmark', url: '/candidate/skill-gap' },
            { label: 'Browse Matching Jobs', url: '/candidate/jobs' },
          ];
        } else {
          welcomeText = `Hello ${name}! I am Ask AI, your personal career intelligence assistant.\n\nI can analyze your resume, pinpoint high-growth skill gaps, predict 5-year salary trajectories, and match you with verified employer openings.\n\nTo get started, please upload your CV and click **Analyse**, or ask me anything about technical interview prep, high-demand 2026 skills, or career roadmaps.`;
          initialActions = [
            { label: 'Upload CV Document', url: '/candidate/resume' },
            { label: 'Inspect High-Demand Skills', url: '/candidate/future-skills' },
          ];
        }
      } else if (role === 'EMPLOYER') {
        welcomeText = `Hello ${name}! I am Ask AI, your enterprise recruitment and skill matching assistant.\n\nI can screen candidate profiles against live job requisitions, evaluate verified skill scores, predict placement velocity, and generate technical interview questions.\n\nWhat talent requirements can I help you with?`;
        initialActions = [
          { label: 'Post Job Requisition', url: '/company/jobs' },
          { label: 'Review Candidate Pipeline', url: '/company/dashboard' },
        ];
      } else if (role === 'TRAINING_PROVIDER') {
        welcomeText = `Hello ${name}! I am Ask AI for Training Academies.\n\nI assist with curriculum alignment against live market skill gaps, candidate cohort tracking, and credential verification.\n\nHow can I support your academy operations today?`;
        initialActions = [
          { label: 'View Market Skill Demand', url: '/provider/skills' },
          { label: 'Manage Student Batches', url: '/provider/batches' },
        ];
      } else {
        welcomeText = `Hello ${name}! I am Ask AI for the CONNECTX Platform.\n\nI provide ecosystem-level visibility across candidate credentials, district-level training outcomes, and verified employer placements under the Government of Maharashtra workforce framework.\n\nHow can I assist you?`;
        initialActions = [
          { label: 'View Ecosystem Audit Logs', url: '/admin/audit' },
          { label: 'Inspect Macro Skill Demand', url: '/admin/analytics' },
        ];
      }

      setMessages([
        {
          id: `welcome-${Date.now()}`,
          sender: 'ai',
          text: welcomeText,
          timestamp: 'Just now',
          actionLinks: initialActions,
        }
      ]);
    };

    if (messages.length === 0) {
      initAskAI();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSend = async (customPrompt?: string) => {
    const query = customPrompt || input;
    if (!query.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: 'Just now',
    };

    const historyPayload = [...messages, userMsg].map((m) => ({
      sender: m.sender,
      text: m.text,
    }));

    const aiMessageId = `ai-${Date.now() + 1}`;
    const initialAiMsg: ChatMessage = {
      id: aiMessageId,
      sender: 'ai',
      text: '',
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg, initialAiMsg]);
    setInput('');
    setIsThinking(true);

    try {
      await streamAskAIAPI({
        message: query.trim(),
        history: historyPayload,
        onChunk: (chunk: string) => {
          setIsThinking(false);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMessageId ? { ...m, text: m.text + chunk } : m
            )
          );
        },
        onDone: (fullText: string, suggestedActions: string[]) => {
          const actionLinks = (suggestedActions || []).map((actionText: string) => {
            const a = actionText.toLowerCase();
            let targetUrl = '/candidate/dashboard';
            if (a.includes('salary') || a.includes('earn')) targetUrl = '/candidate/earnings';
            else if (a.includes('skill') || a.includes('gap')) targetUrl = '/candidate/skill-gap';
            else if (a.includes('resume') || a.includes('cv') || a.includes('ats')) targetUrl = '/candidate/resume';
            else if (a.includes('job') || a.includes('post')) targetUrl = '/company/dashboard';
            return { label: actionText, url: targetUrl };
          });

          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMessageId ? { ...m, text: fullText || m.text, actionLinks } : m
            )
          );
          setIsThinking(false);
        },
        onError: () => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMessageId && !m.text
                ? {
                    ...m,
                    text: "I experienced a temporary communication hiccup with the AI service. Your verified profile records remain intact. Please try asking your question again.",
                    isError: true,
                  }
                : m
            )
          );
          setIsThinking(false);
        }
      });
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMessageId && !m.text
            ? {
                ...m,
                text: "I experienced a temporary communication hiccup with the AI service. Your verified profile records remain intact. Please try asking your question again.",
                isError: true,
              }
            : m
        )
      );
    } finally {
      setIsThinking(false);
    }
  };

  const role = user?.role || 'CANDIDATE';
  const rolePrompts = role === 'CANDIDATE' ? [
    "What skills should I improve?",
    "What are the weaknesses in my resume?",
    "Explain my resume score.",
    "What projects should I build?"
  ] : role === 'EMPLOYER' ? [
    "How is my recruitment pipeline performing?",
    "How can I attract more senior engineers?",
    "What are high-demand skill benchmarks?"
  ] : role === 'TRAINING_PROVIDER' ? [
    "What skills should we teach next?",
    "Which competencies have critical industry gaps?",
    "How can we improve placement outcomes?"
  ] : [
    "Give me a platform health summary.",
    "Show recent compliance audit actions.",
    "What are ecosystem employment trends?"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      {/* Non-movable, fixed container */}
      <div className="relative w-full max-w-2xl h-[620px] bg-[#0A0E1A] border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/50 flex flex-col overflow-hidden">
        
        {/* FIXED HEADER (flex-shrink: 0) */}
        <div className="flex-shrink-0 px-5 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">Ask AI</h3>
                <Badge variant="cyan" size="sm">Verified Context</Badge>
              </div>
              <p className="text-[11px] text-slate-400">
                Grounded in your authenticated {role.toLowerCase()} database records
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QUICK PROMPTS BAR (flex-shrink: 0) */}
        <div className="flex-shrink-0 px-5 py-2.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase shrink-0">Quick Ask:</span>
          {rolePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={isThinking}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-all whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              "{prompt}"
            </button>
          ))}
        </div>

        {/* ONLY THIS INNER MESSAGE AREA SCROLLS (flex: 1, min-height: 0, overflow-y: auto) */}
        <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                  msg.sender === 'ai'
                    ? msg.isError
                      ? 'bg-rose-950 text-rose-400 border border-rose-500/40'
                      : 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white'
                    : 'bg-slate-800 text-slate-200 border border-slate-700'
                }`}
              >
                {msg.sender === 'ai' ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                  msg.sender === 'ai'
                    ? msg.isError
                      ? 'bg-rose-950/20 border border-rose-500/30 text-rose-200'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 shadow-md'
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium shadow'
                }`}
              >
                <div className="whitespace-pre-line">
                  {msg.text}
                  {msg.sender === 'ai' && !msg.isError && msg.text && (
                    <span className="inline-block w-1.5 h-3 bg-cyan-400/80 animate-pulse ml-1 align-middle" />
                  )}
                </div>

                {msg.actionLinks && msg.actionLinks.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                    {msg.actionLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-semibold transition-all hover:scale-105"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                        <span>{link.label}</span>
                      </a>
                    ))}
                  </div>
                )}

                <div className="text-[9px] mt-1.5 font-mono text-slate-500">
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isThinking && (!messages.length || messages[messages.length - 1].sender !== 'ai' || !messages[messages.length - 1].text) && (
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 animate-pulse">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                <span>Ask AI is reasoning over your database records</span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FIXED INPUT BAR (flex-shrink: 0) */}
        <div className="flex-shrink-0 p-3 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Ask AI anything about your ${role.toLowerCase()} operations, metrics, or recommendations...`}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isThinking}
            />
            <Button
              variant="cyber"
              size="sm"
              type="submit"
              disabled={!input.trim() || isThinking}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Send
            </Button>
          </form>
        </div>

      </div>
    </div>
  );
};
