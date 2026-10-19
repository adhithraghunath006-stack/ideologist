import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowLeft, CheckCircle2, XCircle, Eye, FileText, AlertCircle, MessageSquare } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import ViabilityMeter from '../../components/ViabilityMeter';
import SkeletonLoader from '../../components/SkeletonLoader';
import EmptyState from '../../components/EmptyState';

export default function ReviewSubmissions() {
  const { addToast } = useToast();

  const [submissions, setSubmissions] = useState([]);
  const [filterStatus, setFilterStatus] = useState('Pending Review');
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [activeIdea, setActiveIdea] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('Published');
  const [feedbackNote, setFeedbackNote] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const res = await api.getAllSubmissions(filterStatus);
      if (res.success && res.ideas) {
        setSubmissions(res.ideas);
      }
    } catch (err) {
      console.error('Failed to load submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [filterStatus]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!activeIdea) return;

    setSubmittingReview(true);
    try {
      const res = await api.reviewSubmission(activeIdea.id, {
        status: reviewStatus,
        admin_feedback: feedbackNote
      });

      addToast(res.message, 'success');
      setActiveIdea(null);
      loadSubmissions();
    } catch (err) {
      addToast(err.message || 'Failed to submit review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatCurrency = (val) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-xs">
      <Link
        to="/admin/dashboard"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Admin Console</span>
      </Link>

      <div>
        <div className="flex items-center gap-2 text-brand-emerald text-xs font-semibold uppercase tracking-wider mb-1">
          <Layers className="w-4 h-4" />
          <span>Vetting & Moderation Queue</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Review Startup Submissions
        </h1>
        <p className="text-slate-400 mt-1">
          Verify business descriptions, review attached pitch documents, and set approval statuses with feedback notes.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
        {['Pending Review', 'Published', 'Rejected', 'All'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filterStatus === status
                ? 'bg-brand-emerald text-navy-950 font-bold shadow'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Submissions List */}
      {loading ? (
        <SkeletonLoader count={3} />
      ) : submissions.length > 0 ? (
        <div className="space-y-4">
          {submissions.map((idea) => (
            <div
              key={idea.id}
              className="p-6 rounded-2xl bg-navy-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      idea.status === 'Published'
                        ? 'bg-brand-emerald/20 text-brand-emerald'
                        : idea.status === 'Rejected'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-brand-amber/20 text-brand-amber'
                    }`}
                  >
                    {idea.status}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                    {idea.industry}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                    {idea.target_city}
                  </span>
                  <span className="text-slate-400">
                    Founder: <strong className="text-white">{idea.founder_name}</strong> ({idea.founder_email})
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{idea.title}</h3>
                <p className="text-slate-300 line-clamp-2 leading-relaxed">{idea.tagline}</p>

                {idea.admin_feedback && (
                  <p className="text-amber-300 bg-slate-950 p-2.5 rounded-xl border border-amber-500/20">
                    <strong>Admin Note:</strong> {idea.admin_feedback}
                  </p>
                )}
              </div>

              {/* Right Side Stats & Actions */}
              <div className="flex flex-wrap items-center gap-6 border-t lg:border-t-0 lg:border-l border-slate-800 pt-4 lg:pt-0 lg:pl-6">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Ask</span>
                  <span className="text-sm font-bold text-white">{formatCurrency(idea.funding_target)}</span>
                  <span className="text-xs text-brand-emerald block">for {idea.equity_offered}% Eq</span>
                </div>

                <ViabilityMeter score={idea.viability_score} size="md" />

                <div className="flex items-center gap-2">
                  <Link
                    to={`/ideas/${idea.id}`}
                    target="_blank"
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
                    title="Open Full Pitch View"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => {
                      setActiveIdea(idea);
                      setReviewStatus('Published');
                      setFeedbackNote(idea.admin_feedback || '');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-brand-emerald text-navy-950 font-bold hover:bg-emerald-400 transition-colors flex items-center gap-1.5"
                  >
                    <span>Audit & Review</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title={`No submissions with status "${filterStatus}"`}
          description="All submissions in this queue have been processed."
          icon={CheckCircle2}
        />
      )}

      {/* Review Modal */}
      {activeIdea && (
        <Modal
          isOpen={!!activeIdea}
          onClose={() => setActiveIdea(null)}
          title={`Audit & Review: ${activeIdea.title}`}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Problem Statement:</span>
              <p className="text-slate-300">{activeIdea.problem}</p>
              <span className="text-[10px] uppercase font-bold text-slate-500 block pt-2">Solution:</span>
              <p className="text-slate-300">{activeIdea.solution}</p>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Moderation Decision *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setReviewStatus('Published')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                    reviewStatus === 'Published'
                      ? 'bg-brand-emerald text-navy-950 border-brand-emerald'
                      : 'bg-slate-950 text-slate-300 border-slate-800'
                  }`}
                >
                  Approve & Publish to Marketplace
                </button>

                <button
                  type="button"
                  onClick={() => setReviewStatus('Rejected')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                    reviewStatus === 'Rejected'
                      ? 'bg-red-500 text-white border-red-500'
                      : 'bg-slate-950 text-slate-300 border-slate-800'
                  }`}
                >
                  Reject Submission
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Feedback / Guidance Note for Founder
              </label>
              <textarea
                rows={3}
                placeholder="Share reasons for approval or guidelines for resubmission..."
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveIdea(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingReview}
                className="px-6 py-2 rounded-xl bg-brand-emerald text-navy-950 font-bold hover:bg-emerald-400"
              >
                {submittingReview ? 'Processing...' : 'Confirm Decision'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
