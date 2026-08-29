import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  MessageSquare, Send, CheckCircle2, Award, Calendar,
  Building2, Sparkles, User, ShieldCheck, DollarSign
} from 'lucide-react';
import { fetchConversationsAPI, sendMessageAPI, getMessagesData, MessageItem } from '../services/intelligenceService';

export const MessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<MessageItem[]>(getMessagesData());
  const [activeId, setActiveId] = useState<string | number>(1);
  const [replyText, setReplyText] = useState('');

  const loadConversations = async () => {
    try {
      const convs = await fetchConversationsAPI();
      if (convs && convs.length > 0) {
        const formatted: MessageItem[] = convs.map((c: any) => {
          const lastMsg = c.messages && c.messages.length > 0 ? c.messages[c.messages.length - 1] : null;
          const otherParticipant = c.participants?.find((p: any) => p.user_id !== 1) || c.participants?.[0];
          return {
            id: c.id,
            senderName: otherParticipant?.full_name || c.title || "Direct Message",
            senderRole: otherParticipant?.role || "Talent Partner",
            avatarText: (otherParticipant?.full_name || "DM").substring(0, 2).toUpperCase(),
            lastMessage: lastMsg?.content || "No messages yet",
            timestamp: "Today",
            unread: false,
            conversation: c.messages?.map((m: any) => ({
              id: m.id,
              fromMe: m.sender_id === 1,
              text: m.content,
              time: "Today"
            })) || []
          };
        });
        setMessages(formatted);
        if (formatted[0]) setActiveId(formatted[0].id);
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const activeMessage = messages.find((m) => m.id === activeId) || messages[0];

  const handleSendReply = async () => {
    if (!replyText.trim() || !activeMessage) return;
    const textToSend = replyText;
    setReplyText('');

    const newMsg: MessageItem['conversation'][number] = {
      id: String(Date.now()),
      fromMe: true,
      text: textToSend,
      time: 'Just now',
    };

    setMessages((prev) =>
      prev.map((m) =>
        m.id === activeId
          ? {
              ...m,
              lastMessage: textToSend,
              timestamp: 'Just now',
              conversation: [...(m.conversation || []), newMsg],
            }
          : m
      )
    );

    try {
      await sendMessageAPI(activeId, textToSend);
    } catch {
      // already updated in state
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Direct Recruiter ↔ Candidate Communications</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Messages & Interview Invites
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Communicate directly with enterprise talent partners, schedule technical panels, and receive formal offer proposals.
        </p>
      </div>

      {/* Two-Pane Messaging Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[640px]">
        {/* Left: Conversations List (4 Cols) */}
        <div className="lg:col-span-4 rounded-2xl bg-[#0D1322] border border-slate-800 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-[#0A0E1A] flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Conversations ({messages.length})
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
              Direct Recruiter Line
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {messages.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveId(item.id)}
                className={`p-4 cursor-pointer transition-all flex items-start gap-3 ${
                  activeId === item.id
                    ? 'bg-cyan-500/10 border-l-2 border-cyan-400'
                    : 'hover:bg-slate-800/50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow-md shrink-0 font-mono">
                  {item.avatarText}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate">{item.senderName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{item.timestamp}</span>
                  </div>
                  <div className="text-[11px] text-cyan-400 truncate">{item.senderRole}</div>
                  <p className="text-xs text-slate-400 truncate mt-1">{item.lastMessage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Active Chat Conversation (8 Cols) */}
        <div className="lg:col-span-8 rounded-2xl bg-[#0D1322] border border-slate-800 flex flex-col overflow-hidden">
          {activeMessage ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-800 bg-[#0A0E1A] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow-md font-mono">
                    {activeMessage.avatarText}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      {activeMessage.senderName}
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    </h3>
                    <p className="text-xs text-slate-400">{activeMessage.senderRole}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="cyan" size="sm" dot>Verified Recruiter</Badge>
                </div>
              </div>

              {/* Chat Messages Stream */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {activeMessage.conversation.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.fromMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-lg rounded-2xl p-4 text-xs leading-relaxed ${
                        msg.fromMe
                          ? 'bg-cyan-600 text-white font-medium'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 shadow-lg'
                      }`}
                    >
                      <p>{msg.text}</p>

                      {/* Offer Proposal Callout Card */}
                      {msg.isOffer && msg.offerDetails && (
                        <div className="mt-3 p-4 rounded-xl bg-purple-950/40 border border-purple-500/40 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-purple-300 font-mono">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span>OFFICIAL COMPENSATION PROPOSAL</span>
                          </div>
                          <div className="text-sm font-bold text-white">
                            {msg.offerDetails.role} — {msg.offerDetails.company}
                          </div>
                          <div className="text-xs font-mono text-emerald-400 font-semibold">
                            Compensation: {msg.offerDetails.salary}
                          </div>
                          <div className="pt-2 flex items-center gap-2">
                            <Button variant="cyber" size="sm">Accept & Review Terms</Button>
                            <Button variant="secondary" size="sm">Request Call</Button>
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 font-mono">{msg.time}</span>
                  </div>
                ))}
              </div>

              {/* Reply Input Bar */}
              <div className="p-4 bg-[#0A0E1A] border-t border-slate-800">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendReply();
                  }}
                  className="flex items-center gap-3"
                >
                  <input
                    type="text"
                    placeholder="Type your response to recruiter..."
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs text-white placeholder-slate-500 focus:outline-none"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <Button variant="cyber" size="md" type="submit" disabled={!replyText.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
              Select a conversation to begin chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
