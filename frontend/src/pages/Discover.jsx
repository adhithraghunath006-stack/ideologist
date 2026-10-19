import React, { useState, useEffect } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import IdeaCard from '../components/IdeaCard';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';

const INDUSTRIES = [
  'All',
  'FinTech',
  'AgriTech',
  'HealthTech',
  'EV Charging',
  'CleanTech',
  'EdTech',
  'SaaS',
  'Hyperlocal Commerce'
];

const CITIES = [
  'All',
  'Bengaluru',
  'Mumbai',
  'Delhi NCR',
  'Hyderabad',
  'Pune',
  'Indore',
  'Jaipur',
  'Ahmedabad',
  'Kochi',
  'Coimbatore'
];

const STAGES = ['All', 'Idea', 'Prototype', 'MVP', 'Early Traction', 'Scaling'];

export default function Discover() {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedStage, setSelectedStage] = useState('All');
  const [minScore, setMinScore] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const fetchIdeas = async () => {
    setLoading(true);
    try {
      const res = await api.getIdeas({
        search,
        industry: selectedIndustry,
        city: selectedCity,
        stage: selectedStage,
        minScore,
        sortBy
      });

      if (res.success && res.ideas) {
        setIdeas(res.ideas);
      }
    } catch (err) {
      console.error('Failed to fetch ideas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchIdeas();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedIndustry, selectedCity, selectedStage, minScore, sortBy]);

  const resetFilters = () => {
    setSearch('');
    setSelectedIndustry('All');
    setSelectedCity('All');
    setSelectedStage('All');
    setMinScore('');
    setSortBy('newest');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="border-b border-navy-750 pb-4">
        <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
          Venture Directory
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-normal text-white mt-1">
          Startup Opportunities Catalog
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Filter verified startup submissions with transparent unit economics, break-even timelines, and pitch deck access.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="panel rounded-xl p-4 sm:p-5 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by keywords, startup name, problem statement, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-12 py-2.5 rounded-lg bg-navy-950 border border-navy-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-navy-600 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          {/* Industry */}
          <div>
            <label className="block text-slate-400 text-[10px] uppercase tracking-wide mb-1 font-medium">Industry</label>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full py-1.5 px-2.5 rounded bg-navy-950 border border-navy-750 text-slate-300 focus:outline-none focus:border-navy-600 text-xs"
            >
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block text-slate-400 text-[10px] uppercase tracking-wide mb-1 font-medium">Target City</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full py-1.5 px-2.5 rounded bg-navy-950 border border-navy-750 text-slate-300 focus:outline-none focus:border-navy-600 text-xs"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Stage */}
          <div>
            <label className="block text-slate-400 text-[10px] uppercase tracking-wide mb-1 font-medium">Stage</label>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full py-1.5 px-2.5 rounded bg-navy-950 border border-navy-750 text-slate-300 focus:outline-none focus:border-navy-600 text-xs"
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Min Viability Score */}
          <div>
            <label className="block text-slate-400 text-[10px] uppercase tracking-wide mb-1 font-medium">Min Viability</label>
            <select
              value={minScore}
              onChange={(e) => setMinScore(e.target.value)}
              className="w-full py-1.5 px-2.5 rounded bg-navy-950 border border-navy-750 text-slate-300 focus:outline-none focus:border-navy-600 text-xs"
            >
              <option value="">Any Index</option>
              <option value="60">60+ (Moderate)</option>
              <option value="75">75+ (Strong)</option>
              <option value="85">85+ (High Viability)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-slate-400 text-[10px] uppercase tracking-wide mb-1 font-medium">Sort Order</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full py-1.5 px-2.5 rounded bg-navy-950 border border-navy-750 text-slate-300 focus:outline-none focus:border-navy-600 text-xs"
            >
              <option value="newest">Recently Added</option>
              <option value="score_desc">Highest Viability Index</option>
              <option value="funding_asc">Lowest Funding Target</option>
              <option value="funding_desc">Highest Funding Target</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="w-full py-1.5 px-2.5 rounded bg-navy-850 hover:bg-navy-800 text-slate-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors border border-navy-700"
            >
              <RefreshCw className="w-3 h-3 text-slate-400" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Counter */}
        <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-navy-800">
          <span>Showing <strong className="text-white">{ideas.length}</strong> published startups</span>
          {(selectedIndustry !== 'All' || selectedCity !== 'All' || search || minScore) && (
            <span className="text-teal-400 font-medium">Filtered</span>
          )}
        </div>
      </div>

      {/* Ideas Grid */}
      {loading ? (
        <SkeletonLoader count={6} />
      ) : ideas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No opportunities found"
          description="Adjust your search criteria, try a different sector, or reset active filters."
          actionLabel="Reset All Filters"
          onAction={resetFilters}
        />
      )}
    </div>
  );
}
