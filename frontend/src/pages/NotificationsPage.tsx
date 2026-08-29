import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  Bell, Sparkles, Briefcase, MessageSquare, TrendingUp,
  BookOpen, CheckCircle2, ArrowRight, ShieldCheck, Filter
} from 'lucide-react';
import { fetchNotificationsAPI, markNotificationReadAPI } from '../services/intelligenceService';

interface NotificationItem {
  id: string | number;
  category: 'jobs' | 'messages' | 'interviews' | 'salary' | 'learning';
  title: string;
  desc: string;
  time: string;
  unread: boolean;
  linkUrl: string;
  linkLabel: string;
}

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'jobs' | 'messages' | 'salary' | 'learning'>('all');
  const [items, setItems] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const loadNotifs = async () => {
      try {
        const notifs = await fetchNotificationsAPI();
        if (notifs && notifs.length > 0) {
          setItems(notifs.map((n: any) => ({
            id: n.id,
            category: n.notification_type === 'MESSAGE' ? 'messages' : n.notification_type === 'APPLICATION' ? 'jobs' : 'salary',
            title: n.title,
            desc: n.message,
            time: "Today",
            unread: !n.is_read,
            linkUrl: '/candidate/dashboard',
            linkLabel: 'View Details'
          })));
        } else {
          setItems([
            {
              id: 'notif-1',
              category: 'jobs',
              title: 'New 95% Compatibility Match: Google Cloud AI',
              desc: 'Google Cloud AI posted Senior AI Systems & Cloud Platform Engineer. Your Python & PyTorch skills matched 95%.',
              time: 'Just now',
              unread: true,
              linkUrl: '/candidate/jobs',
              linkLabel: 'Inspect Job',
            },
            {
              id: 'notif-2',
              category: 'messages',
              title: 'Direct Outreach from Sarah Chen (Google Recruiter)',
              desc: 'Sarah Chen sent an interview invitation for the Cloud AI Systems team.',
              time: '1 hour ago',
              unread: true,
              linkUrl: '/candidate/messages',
              linkLabel: 'Open Chat',
            }
          ]);
        }
      } catch {
        // fallback
      }
    };
    loadNotifs();
  }, []);

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const markSingleRead = async (id: string | number) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
    try {
      if (typeof id === 'number') {
        await markNotificationReadAPI(id);
      }
    } catch {
      // already updated
    }
  };

  const filteredItems = items.filter((item) => filter === 'all' || item.category === filter);

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
            <Bell className="w-3.5 h-3.5" />
            <span>Real-time Ecosystem Intelligence Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Notification Center
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time alerts regarding new job matches, recruiter outreach, salary updates, and skill recommendations.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={markAllRead}>
          Mark All as Read
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {(['all', 'jobs', 'messages', 'salary', 'learning'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider font-mono transition-all ${
              filter === cat
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              item.unread
                ? 'bg-slate-900/90 border-cyan-500/40 shadow-lg shadow-cyan-500/5'
                : 'bg-slate-900/50 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs shrink-0 ${
                  item.category === 'jobs'
                    ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/40'
                    : item.category === 'messages' || item.category === 'interviews'
                    ? 'bg-purple-950 text-purple-400 border border-purple-500/40'
                    : item.category === 'salary'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                    : 'bg-blue-950 text-blue-400 border border-blue-500/40'
                }`}
              >
                {item.category === 'jobs' && <Briefcase className="w-5 h-5" />}
                {(item.category === 'messages' || item.category === 'interviews') && <MessageSquare className="w-5 h-5" />}
                {item.category === 'salary' && <TrendingUp className="w-5 h-5" />}
                {item.category === 'learning' && <BookOpen className="w-5 h-5" />}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">{item.title}</h4>
                  {item.unread && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  )}
                </div>
                <p className="text-xs text-slate-300 max-w-2xl">{item.desc}</p>
                <div className="text-[10px] text-slate-500 font-mono pt-1">{item.time}</div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(item.linkUrl)}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="shrink-0 text-xs"
            >
              {item.linkLabel}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
