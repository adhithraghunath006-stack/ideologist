import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, ArrowLeft } from 'lucide-react';
import { api } from '../../services/api';
import IdeaCard from '../../components/IdeaCard';
import SkeletonLoader from '../../components/SkeletonLoader';
import EmptyState from '../../components/EmptyState';

export default function SavedIdeas() {
  const [savedIdeas, setSavedIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSaved = async () => {
    setLoading(true);
    try {
      const res = await api.getSavedIdeas();
      if (res.success && res.savedIdeas) {
        setSavedIdeas(res.savedIdeas);
      }
    } catch (err) {
      console.error('Failed to load saved ideas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSaved();
  }, []);

  const handleSaveToggle = (ideaId, isSaved) => {
    if (!isSaved) {
      setSavedIdeas((prev) => prev.filter((i) => i.id !== ideaId));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        to="/investor/dashboard"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Investor Hub</span>
      </Link>

      <div>
        <div className="flex items-center gap-2 text-brand-amber text-xs font-semibold uppercase tracking-wider mb-1">
          <Bookmark className="w-4 h-4" />
          <span>Due Diligence Watchlist</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Saved Startup Opportunities ({savedIdeas.length})
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Bookmarked startups saved for syndication review, valuation comparison, and founder meetings.
        </p>
      </div>

      {loading ? (
        <SkeletonLoader count={3} />
      ) : savedIdeas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedIdeas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} onSaveToggle={handleSaveToggle} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Your watchlist is empty"
          description="Browse the startup directory and bookmark opportunities to track them here."
          actionLabel="Discover Startups"
          actionLink="/discover"
          icon={Bookmark}
        />
      )}
    </div>
  );
}
