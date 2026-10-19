import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Bookmark, 
  Send, 
  TrendingUp, 
  Compass, 
  MapPin, 
  ArrowRight, 
  SlidersHorizontal,
  FileText
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import IdeaCard from '../../components/IdeaCard';
import SkeletonLoader from '../../components/SkeletonLoader';
import EmptyState from '../../components/EmptyState';

export default function InvestorDashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [ideas, setIdeas] = useState([]);
  const [savedIdeas, setSavedIdeas] = useState([]);
  const [sentInterests, setSentInterests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedIndustry, setSelectedIndustry] = useState('All');

  const loadData = async () => {
    setLoading(true);
    try {
      const [ideasRes, savedRes, interestsRes] = await Promise.all([
        api.getIdeas({ sortBy: 'score_desc' }),
        api.getSavedIdeas(),
        api.getMySentInterests()
      ]);

      if (ideasRes.success) setIdeas(ideasRes.ideas || []);
      if (savedRes.success) setSavedIdeas(savedRes.savedIdeas || []);
      if (interestsRes.success) setSentInterests(interestsRes.interests || []);
    } catch (err) {
      console.error('Failed to load investor data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveToggle = (ideaId, isSaved) => {
    if (isSaved) {
      loadData();
    } else {
      setSavedIdeas(prev => prev.filter(i => i.id !== ideaId));
    }
  };

  const filteredIdeas = selectedIndustry === 'All'
    ? ideas
    : ideas.filter(i => i.industry === selectedIndustry);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Banner */}
      <div className="p-8 rounded-3xl bg-navy-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-brand-blue text-xs font-semibold uppercase tracking-wider">
            <Briefcase className="w-4 h-4" />
            <span>Investor Syndicate Terminal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {user?.company ? `${user.company} • ` : ''}Evaluation Range: {user?.investment_range || 'Flexible Seed'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/investor/saved"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <Bookmark className="w-4 h-4 text-brand-amber" />
            <span>Watchlist ({savedIdeas.length})</span>
          </Link>

          <Link
            to="/investor/interests"
            className="px-4 py-2.5 rounded-xl bg-brand-emerald text-navy-950 font-bold text-xs flex items-center gap-2 hover:bg-emerald-400 transition-colors shadow-lg shadow-brand-emerald/20"
          >
            <Send className="w-4 h-4" />
            <span>Sent Interests ({sentInterests.length})</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium block">Active Dealflow</span>
          <span className="text-3xl font-extrabold text-white mt-1 block">{ideas.length}</span>
          <span className="text-[11px] text-slate-500 mt-1 block">Approved & Published Ventures</span>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium block">Saved Watchlist</span>
          <span className="text-3xl font-extrabold text-brand-amber mt-1 block">{savedIdeas.length}</span>
          <span className="text-[11px] text-slate-500 mt-1 block">Bookmarked for Diligence</span>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium block">Dispatched Interests</span>
          <span className="text-3xl font-extrabold text-brand-emerald mt-1 block">{sentInterests.length}</span>
          <span className="text-[11px] text-slate-500 mt-1 block">Founder Meeting Requests</span>
        </div>
      </div>

      {/* Quick Industry Filter Tabs */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {['All', 'FinTech', 'AgriTech', 'CleanTech', 'HealthTech', 'EV Charging', 'EdTech', 'SaaS'].map((ind) => (
              <button
                key={ind}
                onClick={() => setSelectedIndustry(ind)}
                className={`px-3.5 py-1.5 rounded-xl font-medium transition-all ${
                  selectedIndustry === ind
                    ? 'bg-brand-blue text-white font-bold shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {ind}
              </button>
            ))}
          </div>

          <Link
            to="/discover"
            className="text-xs font-semibold text-brand-blue hover:text-blue-300 flex items-center gap-1"
          >
            <span>Open Advanced Filters</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Startups Grid */}
        {loading ? (
          <SkeletonLoader count={6} />
        ) : filteredIdeas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIdeas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} onSaveToggle={handleSaveToggle} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No startups found in this sector"
            description="Broaden your industry selection to view active investment opportunities."
            actionLabel="Reset to All"
            onAction={() => setSelectedIndustry('All')}
          />
        )}
      </div>
    </div>
  );
}
