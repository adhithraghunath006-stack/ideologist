import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  FileText, 
  Send, 
  Bookmark, 
  ArrowLeft, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ViabilityMeter from '../components/ViabilityMeter';
import FinancialBreakdownChart from '../components/FinancialBreakdownChart';
import OpenStreetMapEmbed from '../components/OpenStreetMapEmbed';
import PitchDeckViewerModal from '../components/PitchDeckViewerModal';
import Modal from '../components/Modal';

export default function IdeaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isInvestor } = useAuth();
  const { addToast } = useToast();

  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDeckDoc, setActiveDeckDoc] = useState(null);

  // Interest Modal
  const [interestModalOpen, setInterestModalOpen] = useState(false);
  const [interestMessage, setInterestMessage] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [submittingInterest, setSubmittingInterest] = useState(false);

  // Saved state
  const [isSaved, setIsSaved] = useState(false);
  const [savingBookmark, setSavingBookmark] = useState(false);

  useEffect(() => {
    async function loadIdea() {
      try {
        const res = await api.getIdeaById(id);
        if (res.success && res.idea) {
          setIdea(res.idea);
          setIsSaved(res.idea.is_saved);
        }
      } catch (err) {
        addToast(err.message || 'Failed to load startup idea.', 'error');
        navigate('/discover');
      } finally {
        setLoading(false);
      }
    }
    loadIdea();
  }, [id, navigate]);

  const handleSaveToggle = async () => {
    if (!isAuthenticated) {
      addToast('Please sign in as an Investor to save opportunities.', 'info');
      navigate('/login');
      return;
    }

    if (!isInvestor) {
      addToast('Only investor accounts can save opportunities to watchlists.', 'info');
      return;
    }

    setSavingBookmark(true);
    try {
      const res = await api.toggleSaveIdea(idea.id);
      setIsSaved(res.saved);
      addToast(res.message, res.saved ? 'success' : 'info');
    } catch (err) {
      addToast(err.message || 'Failed to bookmark.', 'error');
    } finally {
      setSavingBookmark(false);
    }
  };

  const handleSendInterest = async (e) => {
    e.preventDefault();
    if (!interestMessage.trim()) {
      addToast('Please provide an introductory note for the founder.', 'error');
      return;
    }

    setSubmittingInterest(true);
    try {
      const res = await api.expressInterest({
        idea_id: idea.id,
        message: interestMessage,
        meeting_date: meetingDate
      });

      addToast(res.message, 'success');
      setInterestModalOpen(false);
      setIdea(prev => ({ ...prev, has_expressed_interest: true }));
    } catch (err) {
      addToast(err.message || 'Failed to send interest request.', 'error');
    } finally {
      setSubmittingInterest(false);
    }
  };

  if (loading || !idea) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-400 text-xs">Loading startup evaluation...</p>
      </div>
    );
  }

  const isOwner = user && user.id === idea.user_id;

  const formatCurrency = (val) => {
    if (Math.abs(val) >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (Math.abs(val) >= 100000) return `₹${(val / 100000).toFixed(1)} Lakh`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Navigation & Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-navy-750 pb-4">
        <Link
          to="/discover"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Directory</span>
        </Link>

        <div className="flex items-center gap-2.5">
          {isInvestor && (
            <>
              <button
                onClick={handleSaveToggle}
                disabled={savingBookmark}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-colors ${
                  isSaved
                    ? 'bg-amber-950/40 text-amber-300 border-amber-800'
                    : 'bg-navy-850 text-slate-300 hover:text-white border-navy-700'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                <span>{isSaved ? 'Saved in Watchlist' : 'Save Opportunity'}</span>
              </button>

              <button
                onClick={() => setInterestModalOpen(true)}
                disabled={idea.has_expressed_interest}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  idea.has_expressed_interest
                    ? 'bg-navy-850 text-teal-300 border border-teal-800'
                    : 'bg-ivory text-navy-950 hover:bg-white shadow-sm font-semibold'
                }`}
              >
                {idea.has_expressed_interest ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                    <span>Inquiry Sent</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-navy-950" />
                    <span>Express Investor Interest</span>
                  </>
                )}
              </button>
            </>
          )}

          {isOwner && (
            <Link
              to={`/entrepreneur/edit/${idea.id}`}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-navy-850 hover:bg-navy-800 text-slate-200 border border-navy-700 transition-colors"
            >
              Edit Submission
            </Link>
          )}
        </div>
      </div>

      {/* Main Pitch Summary Header */}
      <div className="panel rounded-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-teal-300 font-semibold tracking-wide uppercase text-[11px]">
                {idea.industry}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-300 font-medium">
                Stage: {idea.stage}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-300 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                {idea.target_city}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal text-white tracking-tight leading-tight">
              {idea.title}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              {idea.tagline}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span>Founded by <strong className="text-white font-medium">{idea.founder_name}</strong></span>
              <span className="text-slate-600">·</span>
              <span>Target Demographic: <strong className="text-slate-300 font-medium">{idea.target_customer}</strong></span>
            </div>
          </div>

          {/* Target Capital & Viability Gauge Card */}
          <div className="p-4 rounded-lg bg-navy-950 border border-navy-800 flex items-center gap-6 min-w-[260px] self-start">
            <div>
              <span className="text-[9px] uppercase font-semibold text-slate-500 tracking-wider block">
                Funding Target
              </span>
              <span className="text-xl font-semibold text-white block mt-0.5">
                {formatCurrency(idea.funding_target)}
              </span>
              <span className="text-[11px] text-teal-400 font-medium block mt-0.5">
                for {idea.equity_offered}% Equity
              </span>
            </div>

            <div className="border-l border-navy-800 pl-6">
              <ViabilityMeter score={idea.viability_score} size="md" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Split: Left 2 Cols (Analysis & Financials), Right 1 Col (Deck & Location) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Business & Unit Economics */}
        <div className="lg:col-span-2 space-y-8">
          {/* Problem & Solution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="panel rounded-xl p-5 space-y-2">
              <span className="text-[10px] uppercase font-semibold text-red-400 tracking-wider block">
                The Core Problem
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                {idea.problem}
              </p>
            </div>

            <div className="panel rounded-xl p-5 space-y-2">
              <span className="text-[10px] uppercase font-semibold text-teal-300 tracking-wider block">
                Proposed Solution & Moat
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                {idea.solution}
              </p>
            </div>
          </div>

          {/* Financial Breakdown & Unit Economics */}
          <div className="panel rounded-xl p-6 space-y-4">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
                Unit Economics Model
              </span>
              <h3 className="text-base font-semibold text-white mt-0.5 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-400" />
                <span>Financial Feasibility & Cashflow Projections</span>
              </h3>
            </div>

            <FinancialBreakdownChart metrics={idea.analysis?.metrics} />
          </div>

          {/* Transparent Scoring Engine Breakdown Table */}
          <div className="panel rounded-xl p-6 space-y-4">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
                Algorithmic Audit
              </span>
              <h3 className="text-base font-semibold text-white mt-0.5 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Viability Scoring Formula Breakdown</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Every factor is calculated through verifiable mathematical formulas based on entered unit economics.
              </p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs border border-navy-800 rounded-lg overflow-hidden">
                <thead className="bg-navy-950 text-slate-400 uppercase text-[9px] tracking-wider border-b border-navy-800">
                  <tr>
                    <th className="p-3">Pillar Factor</th>
                    <th className="p-3">Weight</th>
                    <th className="p-3">Score (0–100)</th>
                    <th className="p-3">Audit Formula</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800 bg-navy-900/50">
                  {idea.analysis?.breakdown?.map((row, idx) => (
                    <tr key={idx} className="hover:bg-navy-900">
                      <td className="p-3 font-medium text-white">{row.factor}</td>
                      <td className="p-3 text-blue-400 font-semibold">{row.weight}</td>
                      <td className="p-3 text-teal-400 font-semibold">{row.score} / 100</td>
                      <td className="p-3 font-mono text-[10px] text-slate-400">{row.formula}</td>
                      <td className="p-3 text-slate-300">{row.assessment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Recommendations */}
            {idea.analysis?.recommendations && idea.analysis.recommendations.length > 0 && (
              <div className="pt-4 border-t border-navy-800 space-y-2">
                <span className="text-xs font-semibold text-amber-300 block">
                  Scoring Engine Observations:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {idea.analysis.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">·</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Deck Vault & Location Embed */}
        <div className="space-y-6">
          {/* Pitch Decks & Documents */}
          <div className="panel rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Pitch Deck Vault</span>
              </h3>
              <span className="text-[10px] text-slate-400">
                {idea.documents?.length || 0} File(s)
              </span>
            </div>

            {idea.documents && idea.documents.length > 0 ? (
              <div className="space-y-2">
                {idea.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-lg bg-navy-950 border border-navy-800 flex items-center justify-between gap-3"
                  >
                    <div className="overflow-hidden">
                      <span className="block text-xs font-medium text-white truncate">
                        {doc.original_name}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {(doc.file_size / 1024).toFixed(1)} KB · {doc.file_type.toUpperCase()}
                      </span>
                    </div>

                    <button
                      onClick={() => setActiveDeckDoc(doc)}
                      className="px-2.5 py-1 rounded bg-navy-850 hover:bg-navy-800 text-slate-200 text-[11px] font-medium border border-navy-700 transition-colors flex-shrink-0"
                    >
                      Inspect
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-navy-950 border border-navy-800 text-center text-xs text-slate-400">
                No formal presentation deck uploaded yet.
              </div>
            )}
          </div>

          {/* Location Feasibility & OpenStreetMap */}
          <div className="panel rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>Location Feasibility ({idea.target_city})</span>
            </h3>

            <OpenStreetMapEmbed
              locationInsight={idea.locationInsight}
              city={idea.target_city}
            />
          </div>

          {/* Founder Profile */}
          <div className="panel rounded-xl p-5 space-y-2">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
              Entrepreneur Profile
            </span>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-navy-850 border border-navy-700 flex items-center justify-center font-semibold text-slate-300 text-xs">
                {idea.founder_name?.charAt(0)}
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">{idea.founder_name}</h4>
                <p className="text-[11px] text-slate-400">{idea.founder_city || idea.target_city}</p>
              </div>
            </div>
            {idea.founder_bio && (
              <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-navy-800">
                {idea.founder_bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Pitch Deck Viewer Modal */}
      {activeDeckDoc && (
        <PitchDeckViewerModal
          isOpen={!!activeDeckDoc}
          onClose={() => setActiveDeckDoc(null)}
          document={activeDeckDoc}
          ideaTitle={idea.title}
        />
      )}

      {/* Express Interest Modal for Investors */}
      <Modal
        isOpen={interestModalOpen}
        onClose={() => setInterestModalOpen(false)}
        title={`Express Investor Interest: ${idea.title}`}
      >
        <form onSubmit={handleSendInterest} className="space-y-4 text-xs">
          <p className="text-slate-300 leading-relaxed">
            Dispatch an introductory due diligence inquiry directly to <strong>{idea.founder_name}</strong> to initiate preliminary discussions.
          </p>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Introductory Message & Diligence Scope *
            </label>
            <textarea
              rows={4}
              required
              placeholder="E.g., We reviewed your unit margins and break-even timeline. Our syndicate is interested in evaluating participation in your round."
              value={interestMessage}
              onChange={(e) => setInterestMessage(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-navy-950 border border-navy-750 text-white placeholder-slate-500 focus:outline-none focus:border-navy-600 text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Proposed Meeting Window (Optional)
            </label>
            <input
              type="text"
              placeholder="E.g., Next Thursday, 3:00 PM IST via Google Meet"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-navy-950 border border-navy-750 text-white placeholder-slate-500 focus:outline-none focus:border-navy-600 text-xs"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-navy-800">
            <button
              type="button"
              onClick={() => setInterestModalOpen(false)}
              className="px-3 py-1.5 rounded-lg bg-navy-850 text-slate-300 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submittingInterest}
              className="px-4 py-1.5 rounded-lg bg-ivory text-navy-950 font-medium hover:bg-white transition-colors"
            >
              {submittingInterest ? 'Sending...' : 'Dispatch Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
