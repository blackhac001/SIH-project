import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  Bot, Sparkles, Send, User, Compass, Zap,
  TrendingUp, Award, HelpCircle, ArrowRight, RefreshCw,
  AlertCircle, CheckCircle2, FileText, Target
} from 'lucide-react';
import { streamAskAIAPI, fetchDashboardKPIsAPI } from '../services/intelligenceService';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  actionLinks?: { label: string; url: string }[];
  isError?: boolean;
}

export const CareerCopilotPage: React.FC = () => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [kpis, setKpis] = useState<any>(null);
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
    const initCopilot = async () => {
      let kpiData = null;
      try {
        const res = await fetchDashboardKPIsAPI();
        if (res?.kpis) {
          kpiData = res.kpis;
          setKpis(res.kpis);
        }
      } catch {
        // graceful
      }

      const candName = user?.full_name || 'there';
      const hasAnalysis = kpiData && (kpiData.careerScore > 0 || kpiData.resumeScore > 0 || (kpiData.verifiedSkills && kpiData.verifiedSkills > 0));

      let welcomeText = '';
      let initialActions: { label: string; url: string }[] = [];

      if (hasAnalysis) {
        welcomeText = `Welcome back, ${candName}! I am Ask AI, your dedicated career advisor grounded in your verified database profile.\n\nYour profile has **${kpiData.careerScore || kpiData.resumeScore}% ATS score** and **${kpiData.verifiedSkills} verified skills** in your capability ledger.\n\nWhat career objectives or market questions can I help you explore?`;
        initialActions = [
          { label: 'View 5-Year Salary Trajectory', url: '/candidate/earnings' },
          { label: 'Inspect Skill Gap Benchmark', url: '/candidate/skill-gap' },
          { label: 'Browse Matching Jobs', url: '/candidate/jobs' },
        ];
      } else {
        welcomeText = `Hello ${candName}! I am Ask AI, your CONNECTX career growth assistant. You haven't uploaded a CV yet, but you can ask me general questions about high-growth tech skills in 2026, interview strategies, or upload your CV to unlock personalized ATS score and skill gap insights!`;
        initialActions = [
          { label: 'Upload CV Document', url: '/candidate/resume' },
          { label: 'Browse Global Jobs', url: '/candidate/jobs' }
        ];
      }

      setMessages([
        {
          id: 'm-0',
          sender: 'ai',
          text: welcomeText,
          timestamp: 'Just now',
          actionLinks: initialActions,
        },
      ]);
    };

    initCopilot();
  }, [user]);

  const quickPrompts = [
    { label: "What skills should I improve?", category: "Skills" },
    { label: "What are the weaknesses in my resume?", category: "Resume" },
    { label: "What projects should I build?", category: "Portfolio" },
    { label: "Explain my resume score.", category: "ATS Score" },
    { label: "How can I prepare for technical interviews?", category: "Interview" },
    { label: "What should I learn next to reach $180k/year?", category: "Salary" },
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: 'Just now',
    };

    // Prepare conversation history for multi-turn context
    const currentHistory = [...messages, userMsg].map((m) => ({
      sender: m.sender,
      text: m.text
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
        history: currentHistory,
        onChunk: (chunk: string) => {
          setIsThinking(false);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMessageId ? { ...m, text: m.text + chunk } : m
            )
          );
        },
        onDone: (fullText: string, suggestedActions: string[]) => {
          const suggestedLinks = (suggestedActions || []).map((actionText: string) => {
            const aLower = actionText.toLowerCase();
            let targetUrl = '/candidate/dashboard';
            if (aLower.includes('salary') || aLower.includes('earn') || aLower.includes('forecast')) {
              targetUrl = '/candidate/earnings';
            } else if (aLower.includes('skill') || aLower.includes('gap') || aLower.includes('curriculum')) {
              targetUrl = '/candidate/skill-gap';
            } else if (aLower.includes('resume') || aLower.includes('ats') || aLower.includes('cv') || aLower.includes('keyword')) {
              targetUrl = '/candidate/resume';
            } else if (aLower.includes('job') || aLower.includes('role') || aLower.includes('openings')) {
              targetUrl = '/candidate/jobs';
            } else if (aLower.includes('roadmap') || aLower.includes('milestone')) {
              targetUrl = '/candidate/roadmap';
            }
            return { label: actionText, url: targetUrl };
          });

          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMessageId ? { ...m, text: fullText || m.text, actionLinks: suggestedLinks } : m
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
                    text: "I experienced a temporary communication hiccup with the AI intelligence service. Your verified profile records remain intact. Please try asking your question again.",
                    isError: true,
                    actionLinks: [{ label: 'Inspect Skill Gap Benchmark', url: '/candidate/skill-gap' }]
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
                text: "I experienced a temporary communication hiccup with the AI intelligence service. Your verified profile records remain intact. Please try asking your question again.",
                isError: true,
                actionLinks: [{ label: 'Inspect Skill Gap Benchmark', url: '/candidate/skill-gap' }]
              }
            : m
        )
      );
    } finally {
      setIsThinking(false);
    }
  };

  const handleClearHistory = () => {
    const name = user?.full_name || 'there';
    setMessages([
      {
        id: `reset-${Date.now()}`,
        sender: 'ai',
        text: `Conversation context refreshed. Hello ${name}! What would you like to explore regarding your career, skills, or resume?`,
        timestamp: 'Just now',
        actionLinks: [
          { label: 'View 5-Year Salary Trajectory', url: '/candidate/earnings' },
          { label: 'Inspect Skill Gap Benchmark', url: '/candidate/skill-gap' },
        ],
      }
    ]);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
            <Bot className="w-3.5 h-3.5" />
            <span>Ask AI Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Ask AI — Career Advisor
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Personalized AI career advisor grounded in your verified database credentials, ATS metrics, and global market signals.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleClearHistory}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Reset Session
        </Button>
      </div>

      {/* Quick Starter Prompts */}
      <div>
        <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
          <span>Suggested Questions for Your Profile</span>
          <span className="text-cyan-400 text-[11px] font-normal">Click to send</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt.label)}
              disabled={isThinking}
              className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs text-left text-slate-300 hover:text-cyan-300 transition-all flex items-center justify-between group disabled:opacity-50"
            >
              <div className="space-y-1">
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  {prompt.category}
                </span>
                <div className="font-medium text-white group-hover:text-cyan-300">"{prompt.label}"</div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Conversation Window */}
      <Card glow="cyan" className="p-0 overflow-hidden flex flex-col h-[580px] shadow-2xl border-slate-800">
        {/* Messages Scroll Area */}
        <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3.5 ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-md ${
                  msg.sender === 'ai'
                    ? msg.isError
                      ? 'bg-rose-950 border border-rose-500/40 text-rose-400'
                      : 'bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 text-white'
                    : 'bg-slate-800 border border-slate-700 text-slate-200'
                }`}
              >
                {msg.sender === 'ai' ? (
                  msg.isError ? <AlertCircle className="w-5 h-5" /> : <Bot className="w-5 h-5" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.sender === 'ai'
                    ? msg.isError
                      ? 'bg-rose-950/20 border border-rose-500/30 text-rose-200 shadow-xl'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 shadow-xl'
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium shadow-md'
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>

                {msg.actionLinks && msg.actionLinks.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-wrap gap-2">
                    {msg.actionLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-semibold transition-all hover:scale-105 shadow-sm"
                      >
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span>{link.label}</span>
                      </a>
                    ))}
                  </div>
                )}

                <div
                  className={`text-[10px] mt-2.5 font-mono ${
                    msg.sender === 'ai' ? 'text-slate-500' : 'text-cyan-200'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {/* Thinking / Typing Animated Indicator */}
          {isThinking && (
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md animate-pulse">
                <Bot className="w-5 h-5" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 flex items-center gap-2 shadow-xl">
                <span>Ask AI is analyzing your verified profile context</span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="flex-shrink-0 p-4 bg-[#0A0E1A] border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              placeholder="Ask AI about your skills, weaknesses, ATS score, salary, or interview prep..."
              className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isThinking}
            />
            <Button
              variant="cyber"
              size="md"
              type="submit"
              disabled={!input.trim() || isThinking}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Send
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};
