import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
  Bot, Sparkles, Send, User, Compass, Zap,
  TrendingUp, Award, HelpCircle, ArrowRight
} from 'lucide-react';
import { chatCopilotAPI } from '../services/intelligenceService';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  actionLinks?: { label: string; url: string }[];
}

export const CareerCopilotPage: React.FC = () => {
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-0',
      sender: 'ai',
      text: "Hello Alex! I am your CONNECTX Career Growth Copilot. I've analyzed your verified profile (Senior AI & Cloud Platform Engineer, 5.2 yrs exp, verified capability ledger). How can I assist your career progression today?",
      timestamp: 'Just now',
      actionLinks: [
        { label: 'View 5-Year Salary Trajectory', url: '/candidate/earnings' },
        { label: 'Inspect Missing Keywords', url: '/candidate/resume' },
      ],
    },
  ]);

  const quickPrompts = [
    "What should I learn next to reach $180k/year?",
    "Why am I getting 95% match on Google Cloud AI roles?",
    "Which country has the best remote salary for my profile?",
    "How does the CKA certification impact my job offers?",
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: query,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    try {
      const copilotResponse = await chatCopilotAPI(query);
      const aiMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'ai',
        text: copilotResponse.reply,
        timestamp: 'Just now',
        actionLinks: (copilotResponse.suggestedActions || []).map((a: string) => ({
          label: a,
          url: '/candidate/earnings'
        }))
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'ai',
        text: "Based on your verified skills in Python, FastAPI, and PyTorch, you are in the top 5% of global talent match for Cloud AI engineering. Consider adding Kubernetes orchestration to maximize compensation ceiling.",
        timestamp: 'Just now',
        actionLinks: [{ label: 'Inspect Skill Gap', url: '/candidate/skill-gap' }]
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
          <Bot className="w-3.5 h-3.5" />
          <span>Personalized Neural Career Advisor</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          CONNECTX Career Growth Copilot
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Ask real-time questions about your market value, skill gaps, interview strategies, and international relocation.
        </p>
      </div>

      {/* Quick Starter Prompts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs text-left text-slate-300 hover:text-cyan-300 transition-all flex items-center justify-between group"
          >
            <span>"{prompt}"</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0" />
          </button>
        ))}
      </div>

      {/* Main Chat Conversation Window */}
      <Card glow="cyan" className="p-0 overflow-hidden flex flex-col h-[550px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                    ? 'bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 text-white'
                    : 'bg-slate-800 border border-slate-700 text-slate-200'
                }`}
              >
                {msg.sender === 'ai' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.sender === 'ai'
                    ? 'bg-slate-900/90 border border-slate-800 text-slate-200 shadow-xl'
                    : 'bg-cyan-600 text-white font-medium'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {msg.actionLinks && msg.actionLinks.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap gap-2">
                    {msg.actionLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.url}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-semibold transition-colors"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{link.label}</span>
                      </a>
                    ))}
                  </div>
                )}

                <div
                  className={`text-[10px] mt-2 ${
                    msg.sender === 'ai' ? 'text-slate-500' : 'text-cyan-200'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[#0A0E1A] border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              placeholder="Ask Copilot anything about your skills, jobs, salary, or resume..."
              className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs text-white placeholder-slate-500 focus:outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button variant="cyber" size="md" type="submit" disabled={!input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};
