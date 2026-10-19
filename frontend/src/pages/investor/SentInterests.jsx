import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, ArrowLeft, Calendar, User, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../../services/api';
import SkeletonLoader from '../../components/SkeletonLoader';
import EmptyState from '../../components/EmptyState';

export default function SentInterests() {
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getMySentInterests();
        if (res.success && res.interests) {
          setInterests(res.interests);
        }
      } catch (err) {
        console.error('Failed to load sent interests:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8 text-xs">
      <Link
        to="/investor/dashboard"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Investor Hub</span>
      </Link>

      <div>
        <div className="flex items-center gap-2 text-brand-emerald text-xs font-semibold uppercase tracking-wider mb-1">
          <Send className="w-4 h-4" />
          <span>Outbound Diligence Inquiries</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Sent Investor Interest Inquiries ({interests.length})
        </h1>
        <p className="text-slate-400 mt-1">
          Track founder responses, meeting scheduling, and term discussions.
        </p>
      </div>

      {loading ? (
        <SkeletonLoader count={2} />
      ) : interests.length > 0 ? (
        <div className="space-y-4">
          {interests.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <Link
                    to={`/ideas/${item.idea_id}`}
                    className="text-base font-bold text-white hover:text-brand-emerald transition-colors"
                  >
                    {item.idea_title}
                  </Link>
                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <span>Founder: <strong className="text-white">{item.founder_name}</strong></span>
                    <span>•</span>
                    <span>{item.target_city}</span>
                    <span>•</span>
                    <span>Target: ₹{(item.funding_target / 100000).toFixed(1)}L ({item.equity_offered}%)</span>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                    item.status === 'Accepted'
                      ? 'bg-brand-emerald/20 text-brand-emerald border border-brand-emerald/30'
                      : item.status === 'Declined'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-brand-amber/20 text-brand-amber border border-brand-amber/30'
                  }`}
                >
                  {item.status === 'Accepted' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {item.status === 'Declined' && <XCircle className="w-3.5 h-3.5" />}
                  {item.status === 'Pending' && <Clock className="w-3.5 h-3.5" />}
                  <span>{item.status}</span>
                </span>
              </div>

              {/* Sent Note */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                  Your Dispatched Note:
                </span>
                "{item.message}"
              </div>

              {/* Founder Response Note if available */}
              {item.founder_reply ? (
                <div className="p-4 rounded-xl bg-brand-emerald/10 border border-brand-emerald/30 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-brand-emerald">
                    <span>Founder Response & Meeting Details:</span>
                    <span className="text-[10px] text-slate-400">Status: {item.status}</span>
                  </div>
                  <p className="text-white leading-relaxed">
                    {item.founder_reply}
                  </p>
                  {item.meeting_date && (
                    <div className="pt-1 text-[11px] text-brand-emerald flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Scheduled Window: <strong>{item.meeting_date}</strong></span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[11px] text-slate-500 italic">
                  Awaiting founder response and calendar link.
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No investment inquiries sent yet"
          description="Browse published startups and click 'Express Investor Interest' to initiate founder due diligence."
          actionLabel="Explore Startup Catalog"
          actionLink="/discover"
          icon={Send}
        />
      )}
    </div>
  );
}
