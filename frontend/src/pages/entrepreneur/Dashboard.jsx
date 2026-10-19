import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Rocket, 
  PlusCircle, 
  Eye, 
  TrendingUp, 
  Users, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  ArrowRight, 
  BarChart3, 
  MessageSquare,
  Calendar,
  Send
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ViabilityMeter from '../../components/ViabilityMeter';
import SkeletonLoader from '../../components/SkeletonLoader';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';

export default function EntrepreneurDashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [ideas, setIdeas] = useState([]);
  const [stats, setStats] = useState({ totalCreated: 0, totalViews: 0, totalInterests: 0, avgScore: 0 });
  const [receivedInterests, setReceivedInterests] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);

  // Response Modal
  const [activeInterest, setActiveInterest] = useState(null);
  const [responseStatus, setResponseStatus] = useState('Accepted');
  const [founderReply, setFounderReply] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [ideasRes, interestsRes] = await Promise.all([
        api.getMyIdeas(),
        api.getReceivedInterests()
      ]);

      if (ideasRes.success) {
        setIdeas(ideasRes.ideas || []);
        setStats(ideasRes.stats || { totalCreated: 0, totalViews: 0, totalInterests: 0, avgScore: 0 });
      }

      if (interestsRes.success) {
        setReceivedInterests(interestsRes.interests || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      addToast('Failed to load dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleDeleteIdea = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;

    try {
      const res = await api.deleteIdea(id);
      addToast(res.message, 'success');
      loadDashboardData();
    } catch (err) {
      addToast(err.message || 'Failed to delete idea.', 'error');
    }
  };

  const handleRespondToInterest = async (e) => {
    e.preventDefault();
    if (!activeInterest) return;

    setSubmittingResponse(true);
    try {
      const res = await api.respondToInterest(activeInterest.id, {
        status: responseStatus,
        founder_reply: founderReply,
        meeting_date: meetingDate || activeInterest.meeting_date
      });
      addToast(res.message, 'success');
      setActiveInterest(null);
      loadDashboardData();
    } catch (err) {
      addToast(err.message || 'Failed to respond.', 'error');
    } finally {
      setSubmittingResponse(false);
    }
  };

  const filteredIdeas = activeTab === 'All' 
    ? ideas 
    : ideas.filter(i => i.status === activeTab);

  const formatCurrency = (val) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} Lakh`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Welcome Banner */}
      <div className="p-8 rounded-3xl bg-navy-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-brand-emerald text-xs font-semibold uppercase tracking-wider">
            <Rocket className="w-4 h-4" />
            <span>Founder Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Monitor startup viability, manage pitch documents, and coordinate with interested investors.
          </p>
        </div>

        <Link
          to="/entrepreneur/create"
          className="px-5 py-3 rounded-xl bg-brand-emerald text-navy-950 font-bold text-xs uppercase tracking-wider hover:bg-emerald-400 transition-all shadow-lg shadow-brand-emerald/20 flex items-center gap-2 self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Idea</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Created Ideas</span>
            <Rocket className="w-4 h-4 text-brand-emerald" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-white">{stats.totalCreated}</span>
          <span className="block text-[11px] text-slate-500 mt-1">Submitted & Drafts</span>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Investor Views</span>
            <Eye className="w-4 h-4 text-brand-blue" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-white">{stats.totalViews}</span>
          <span className="block text-[11px] text-slate-500 mt-1">Catalog Impressions</span>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Investor Inquiries</span>
            <Users className="w-4 h-4 text-brand-amber" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-brand-amber">{stats.totalInterests}</span>
          <span className="block text-[11px] text-slate-500 mt-1">Meeting & Term Requests</span>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Avg Viability</span>
            <TrendingUp className="w-4 h-4 text-brand-emerald" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-brand-emerald">{stats.avgScore}</span>
          <span className="block text-[11px] text-slate-500 mt-1">Composite Viability Index</span>
        </div>
      </div>

      {/* Main Tabs & Idea Pipeline */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {['All', 'Published', 'Pending Review', 'Draft', 'Rejected'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-xl font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-brand-emerald text-navy-950 font-bold shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400">
            {filteredIdeas.length} idea(s) in this filter
          </span>
        </div>

        {/* Ideas Listing */}
        {loading ? (
          <SkeletonLoader count={3} />
        ) : filteredIdeas.length > 0 ? (
          <div className="space-y-4">
            {filteredIdeas.map((idea) => {
              const statusColors = {
                'Published': 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/30',
                'Pending Review': 'bg-brand-amber/10 text-brand-amber border-brand-amber/30',
                'Draft': 'bg-slate-800 text-slate-300 border-slate-700',
                'Rejected': 'bg-red-500/10 text-red-400 border-red-500/30'
              };

              return (
                <div
                  key={idea.id}
                  className="p-6 rounded-2xl bg-navy-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[idea.status] || 'bg-slate-800 text-slate-400'}`}>
                        {idea.status}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                        {idea.industry}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                        {idea.target_city}
                      </span>
                      {idea.document_count > 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-brand-blue flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          Deck Attached
                        </span>
                      )}
                    </div>

                    <Link to={`/ideas/${idea.id}`} className="block">
                      <h3 className="text-lg font-bold text-white hover:text-brand-emerald transition-colors">
                        {idea.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {idea.tagline}
                    </p>

                    {idea.admin_feedback && (
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-brand-amber/20 text-xs text-amber-200">
                        <strong>Review Note:</strong> {idea.admin_feedback}
                      </div>
                    )}
                  </div>

                  {/* Financials & Viability Gauge */}
                  <div className="flex flex-wrap items-center gap-6 border-t lg:border-t-0 lg:border-l border-slate-800 pt-4 lg:pt-0 lg:pl-6">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Ask & Equity</span>
                      <span className="text-sm font-bold text-white">{formatCurrency(idea.funding_target)}</span>
                      <span className="text-xs text-brand-emerald ml-1 font-semibold">{idea.equity_offered}%</span>
                    </div>

                    <ViabilityMeter score={idea.viability_score} size="md" />

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/ideas/${idea.id}`}
                        className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 transition-colors"
                        title="View Public Pitch"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      <Link
                        to={`/entrepreneur/report/${idea.id}`}
                        className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-brand-emerald text-xs font-medium flex items-center gap-1 transition-colors"
                        title="Deep-Dive Viability Report"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </Link>

                      {(idea.status === 'Draft' || idea.status === 'Pending Review') && (
                        <Link
                          to={`/entrepreneur/edit/${idea.id}`}
                          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-brand-blue text-xs font-medium flex items-center gap-1 transition-colors"
                          title="Edit Submission"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                      )}

                      {idea.status === 'Draft' && (
                        <button
                          onClick={() => handleDeleteIdea(idea.id, idea.title)}
                          className="p-2.5 rounded-xl bg-slate-800 hover:bg-red-500/20 text-red-400 text-xs font-medium flex items-center gap-1 transition-colors"
                          title="Delete Draft"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No business ideas in this category"
            description="Start by creating a new idea submission with real-time break-even calculations."
            actionLabel="Create Your First Idea"
            actionLink="/entrepreneur/create"
          />
        )}
      </div>

      {/* Received Investor Inquiries Section */}
      <div className="p-8 rounded-3xl bg-navy-900 border border-slate-800 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-brand-amber text-xs font-bold uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Investor Interest Inbox</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Received Inquiries & Meeting Requests ({receivedInterests.length})
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review due diligence requests from accredited investors and respond with proposed meeting links.
          </p>
        </div>

        {receivedInterests.length > 0 ? (
          <div className="space-y-4">
            {receivedInterests.map((interest) => (
              <div
                key={interest.id}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-3 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{interest.investor_name}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">{interest.investor_company || 'Angel Investor'}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-brand-emerald font-semibold">For "{interest.idea_title}"</span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      interest.status === 'Accepted'
                        ? 'bg-brand-emerald/20 text-brand-emerald'
                        : interest.status === 'Declined'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-brand-amber/20 text-brand-amber'
                    }`}
                  >
                    {interest.status}
                  </span>
                </div>

                <p className="text-slate-300 leading-relaxed bg-navy-900/60 p-3 rounded-xl border border-slate-800">
                  "{interest.message}"
                </p>

                {interest.meeting_date && (
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-brand-blue" />
                    <span>Proposed Window: <strong>{interest.meeting_date}</strong></span>
                  </div>
                )}

                {interest.founder_reply && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                    <strong className="text-brand-emerald block mb-0.5">Your Response:</strong>
                    {interest.founder_reply}
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      setActiveInterest(interest);
                      setResponseStatus(interest.status === 'Pending' ? 'Accepted' : interest.status);
                      setFounderReply(interest.founder_reply || '');
                      setMeetingDate(interest.meeting_date || '');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5 text-brand-emerald" />
                    <span>Manage / Respond to Investor</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No investor interest requests received yet. As your ideas gain visibility, requests will arrive here!
          </div>
        )}
      </div>

      {/* Response to Interest Modal */}
      {activeInterest && (
        <Modal
          isOpen={!!activeInterest}
          onClose={() => setActiveInterest(null)}
          title={`Respond to ${activeInterest.investor_name}`}
        >
          <form onSubmit={handleRespondToInterest} className="space-y-4 text-xs">
            <p className="text-slate-300">
              Update the inquiry status and send a direct reply with your meeting schedule or Google Meet coordinates.
            </p>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Decision Status *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setResponseStatus('Accepted')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    responseStatus === 'Accepted'
                      ? 'bg-brand-emerald text-navy-950 border-brand-emerald'
                      : 'bg-slate-950 text-slate-300 border-slate-800'
                  }`}
                >
                  Accept Meeting Request
                </button>

                <button
                  type="button"
                  onClick={() => setResponseStatus('Declined')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    responseStatus === 'Declined'
                      ? 'bg-red-500 text-white border-red-500'
                      : 'bg-slate-950 text-slate-300 border-slate-800'
                  }`}
                >
                  Decline Request
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Meeting Details / Video Link *
              </label>
              <input
                type="text"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                placeholder="e.g. Confirmed for Friday 4:00 PM IST via Google Meet: meet.google.com/abc-defg"
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Founder Message Note
              </label>
              <textarea
                rows={3}
                value={founderReply}
                onChange={(e) => setFounderReply(e.target.value)}
                placeholder="Share your appreciation or initial notes for the investor..."
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveInterest(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingResponse}
                className="px-5 py-2 rounded-xl bg-brand-emerald text-navy-950 font-bold hover:bg-emerald-400"
              >
                {submittingResponse ? 'Saving...' : 'Send Response'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
