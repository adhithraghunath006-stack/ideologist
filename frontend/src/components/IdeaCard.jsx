import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bookmark, ArrowUpRight, FileText } from 'lucide-react';
import ViabilityMeter from './ViabilityMeter';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export default function IdeaCard({ idea, onSaveToggle }) {
  const { isInvestor, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [saved, setSaved] = useState(idea.is_saved || false);
  const [saving, setSaving] = useState(false);

  const handleSaveToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      addToast('Please sign in as an Investor to bookmark opportunities.', 'info');
      return;
    }

    if (!isInvestor) {
      addToast('Bookmarking startups is an Investor role privilege.', 'info');
      return;
    }

    setSaving(true);
    try {
      const res = await api.toggleSaveIdea(idea.id);
      setSaved(res.saved);
      addToast(res.message, res.saved ? 'success' : 'info');
      if (onSaveToggle) onSaveToggle(idea.id, res.saved);
    } catch (err) {
      addToast(err.message || 'Failed to update bookmark.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (val) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="panel-card rounded-xl p-5 flex flex-col justify-between group">
      <div>
        {/* Header: Industry & Stage & Bookmark */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium tracking-wide text-teal-300 uppercase">
              {idea.industry}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-[10px] text-slate-400">
              {idea.stage}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {idea.document_count > 0 && (
              <span className="text-[10px] text-slate-400 flex items-center gap-1 px-1.5 py-0.5 rounded bg-navy-850 border border-navy-700/60" title="Pitch deck attached">
                <FileText className="w-3 h-3 text-slate-400" />
                <span>Deck</span>
              </span>
            )}

            {isInvestor && (
              <button
                onClick={handleSaveToggle}
                disabled={saving}
                title={saved ? 'Remove from Watchlist' : 'Save to Watchlist'}
                className={`p-1.5 rounded transition-colors ${
                  saved
                    ? 'text-brand-amber hover:text-amber-300'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Title & Tagline */}
        <Link to={`/ideas/${idea.id}`} className="block group-hover:text-teal-300 transition-colors">
          <h3 className="text-sm font-semibold text-white tracking-tight leading-snug mb-1">
            {idea.title}
          </h3>
        </Link>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
          {idea.tagline}
        </p>

        {/* Metadata */}
        <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-4">
          <MapPin className="w-3 h-3 text-slate-400" />
          <span>{idea.target_city}</span>
          <span className="text-slate-600">·</span>
          <span>Founder: {idea.founder_name || 'Founder'}</span>
        </div>
      </div>

      {/* Financials & Viability */}
      <div className="pt-3 border-t border-navy-750 flex items-center justify-between">
        <div>
          <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-medium">
            Funding Target
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xs font-semibold text-white">
              {formatCurrency(idea.funding_target)}
            </span>
            <span className="text-[10px] text-slate-400">
              for {idea.equity_offered}% eq.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ViabilityMeter score={idea.viability_score} size="sm" showLabel={false} />

          <Link
            to={`/ideas/${idea.id}`}
            className="p-1.5 rounded bg-navy-850 hover:bg-navy-800 text-slate-300 hover:text-white border border-navy-700 transition-colors"
            title="Inspect Pitch"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
