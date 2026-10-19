import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Tv, 
  Calendar, 
  Clock, 
  MessageSquare, 
  Send, 
  Plus, 
  CheckCircle2, 
  ArrowRight, 
  Award
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';

export default function PitchEvents() {
  const { user, isAuthenticated, isEntrepreneur, isAdmin } = useAuth();
  const { addToast } = useToast();

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [eventDetail, setEventDetail] = useState(null);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Application Modal
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [myIdeas, setMyIdeas] = useState([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState('');
  const [applyNotes, setApplyNotes] = useState('');
  const [submittingApp, setSubmittingApp] = useState(false);

  // Q&A Question input
  const [questionText, setQuestionText] = useState('');
  const [targetIdeaId, setTargetIdeaId] = useState('');
  const [postingQuestion, setPostingQuestion] = useState(false);

  // Reply state
  const [replyingToQId, setReplyingToQId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [postingReply, setPostingReply] = useState(false);

  // Load events
  const loadEvents = async () => {
    try {
      const res = await api.getPitchEvents();
      if (res.success && res.events) {
        setEvents(res.events);
        if (res.events.length > 0 && !selectedEventId) {
          setSelectedEventId(res.events[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Load details of selected event
  const loadEventDetail = async (id) => {
    if (!id) return;
    try {
      const res = await api.getPitchEventById(id);
      if (res.success) {
        setEventDetail(res);
        if (res.pitches && res.pitches.length > 0 && !targetIdeaId) {
          setTargetIdeaId(res.pitches[0].idea_id);
        }
      }
    } catch (err) {
      console.error('Failed to load event detail:', err);
    }
  };

  useEffect(() => {
    if (selectedEventId) {
      loadEventDetail(selectedEventId);
    }
  }, [selectedEventId]);

  // Load entrepreneur ideas for application modal
  const openApplyModal = async () => {
    if (!isAuthenticated) {
      addToast('Please sign in as an Entrepreneur to apply.', 'info');
      return;
    }
    try {
      const res = await api.getMyIdeas();
      if (res.success) {
        const publishedOnly = res.ideas.filter(i => i.status === 'Published');
        setMyIdeas(publishedOnly);
        if (publishedOnly.length > 0) {
          setSelectedIdeaId(publishedOnly[0].id);
        }
      }
      setApplyModalOpen(true);
    } catch (err) {
      addToast('Failed to retrieve your published ideas.', 'error');
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!selectedIdeaId) {
      addToast('Please select a published idea.', 'error');
      return;
    }

    setSubmittingApp(true);
    try {
      const res = await api.applyToEvent(selectedEventId, {
        idea_id: selectedIdeaId,
        notes: applyNotes
      });
      addToast(res.message, 'success');
      setApplyModalOpen(false);
      loadEventDetail(selectedEventId);
    } catch (err) {
      addToast(err.message || 'Failed to submit application.', 'error');
    } finally {
      setSubmittingApp(false);
    }
  };

  const handlePostQuestion = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      addToast('Please sign in to ask a question.', 'info');
      return;
    }
    if (!questionText.trim() || !targetIdeaId) {
      addToast('Please select a startup and type your question.', 'error');
      return;
    }

    setPostingQuestion(true);
    try {
      const res = await api.submitQuestion(selectedEventId, {
        idea_id: targetIdeaId,
        question: questionText
      });
      addToast(res.message, 'success');
      setQuestionText('');
      loadEventDetail(selectedEventId);
    } catch (err) {
      addToast(err.message || 'Failed to submit question.', 'error');
    } finally {
      setPostingQuestion(false);
    }
  };

  const handlePostReply = async (questionId) => {
    if (!replyText.trim()) return;

    setPostingReply(true);
    try {
      const res = await api.replyToQuestion(questionId, { reply: replyText });
      addToast(res.message, 'success');
      setReplyText('');
      setReplyingToQId(null);
      loadEventDetail(selectedEventId);
    } catch (err) {
      addToast(err.message || 'Failed to post reply.', 'error');
    } finally {
      setPostingReply(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-xs">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 border-b border-navy-750 pb-4">
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
            Virtual Pitch Arena
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal text-white mt-1">
            Virtual Shark Tank Pitching
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Scheduled pitching rounds where selected founders present unit economics, respond to due diligence questions, and secure investor interest.
          </p>
        </div>

        {isEntrepreneur && (
          <button
            onClick={openApplyModal}
            className="px-3.5 py-2 rounded-lg bg-ivory text-navy-950 font-medium text-xs flex items-center gap-1.5 self-start hover:bg-white transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-navy-950" />
            <span>Apply to Pitch</span>
          </button>
        )}
      </div>

      {/* Main Grid: Left Sessions List, Right Active Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Sessions List */}
        <div className="space-y-3">
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
            Pitching Sessions ({events.length})
          </span>

          <div className="space-y-3">
            {events.map((ev) => {
              const isSelected = ev.id === selectedEventId;
              const isLive = ev.status === 'Live Demo';

              return (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEventId(ev.id)}
                  className={`p-4 rounded-xl cursor-pointer border transition-colors ${
                    isSelected
                      ? 'bg-navy-900 border-teal-800 shadow-md'
                      : 'bg-navy-950 border-navy-800 hover:border-navy-750'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        isLive
                          ? 'bg-teal-950 text-teal-300 border border-teal-800'
                          : ev.status === 'Upcoming'
                          ? 'bg-blue-950 text-blue-300 border border-blue-900'
                          : 'bg-navy-850 text-slate-400 border border-navy-750'
                      }`}
                    >
                      {ev.status}
                    </span>

                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {ev.event_date}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-white mb-1">{ev.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {ev.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-navy-800">
                    <span>{ev.approved_startups_count || 0} Startups Slotted</span>
                    <span>{ev.questions_count || 0} Questions</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: Active Session Arena */}
        <div className="lg:col-span-2 space-y-6">
          {eventDetail ? (
            <>
              {/* Event Header Banner */}
              <div className="panel rounded-xl p-6 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        eventDetail.event.status === 'Live Demo'
                          ? 'bg-teal-950 text-teal-300 border border-teal-800'
                          : 'bg-navy-850 text-slate-300 border border-navy-750'
                      }`}
                    >
                      {eventDetail.event.status}
                    </span>

                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {eventDetail.event.event_date}
                    </span>
                  </div>

                  {eventDetail.myApplication && (
                    <span className="text-xs font-medium text-teal-300 bg-teal-950/40 px-2 py-0.5 rounded border border-teal-800/60">
                      Application Status: {eventDetail.myApplication.status}
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-serif font-normal text-white">
                  {eventDetail.event.title}
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  {eventDetail.event.description}
                </p>
              </div>

              {/* Slotted Presentations */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
                    Slotted Pitch Presentations ({eventDetail.pitches?.length || 0})
                  </span>
                  <span className="text-[10px] text-slate-500">Official Sequence</span>
                </div>

                {eventDetail.pitches && eventDetail.pitches.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {eventDetail.pitches.map((pitch) => (
                      <div
                        key={pitch.application_id}
                        className="panel-card rounded-xl p-4 space-y-3 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[11px] mb-1.5">
                            <span className="font-mono text-teal-300 font-semibold">
                              SLOT #{pitch.pitch_slot || '1'}
                            </span>
                            <span className="text-slate-400 font-medium">
                              Index: {pitch.viability_score}/100
                            </span>
                          </div>

                          <Link
                            to={`/ideas/${pitch.idea_id}`}
                            className="text-sm font-semibold text-white hover:text-teal-300 transition-colors block"
                          >
                            {pitch.title}
                          </Link>
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                            {pitch.tagline}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-navy-750 flex items-center justify-between text-xs">
                          <span className="text-slate-300">
                            ₹{(pitch.funding_target / 100000).toFixed(1)}L ({pitch.equity_offered}%)
                          </span>

                          <Link
                            to={`/ideas/${pitch.idea_id}`}
                            className="text-slate-300 hover:text-white flex items-center gap-1 text-[11px] font-medium"
                          >
                            <span>Inspect</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="panel rounded-xl p-8 text-center text-slate-400 text-xs">
                    No startups currently slotted for this pitch session.
                  </div>
                )}
              </div>

              {/* Q&A Floor */}
              <div className="panel rounded-xl p-6 space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                    <span>Shark Tank Floor Due Diligence</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    Direct questioning by syndicate investors. Presenting founders reply on the floor.
                  </p>
                </div>

                {/* Question Form */}
                <form onSubmit={handlePostQuestion} className="space-y-3 p-4 rounded-lg bg-navy-950 border border-navy-800">
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="sm:w-1/3">
                      <select
                        value={targetIdeaId}
                        onChange={(e) => setTargetIdeaId(e.target.value)}
                        className="w-full p-2 rounded bg-navy-900 border border-navy-750 text-slate-200 text-xs focus:outline-none focus:border-navy-600"
                      >
                        {eventDetail.pitches?.map((p) => (
                          <option key={p.idea_id} value={p.idea_id}>
                            Slot #{p.pitch_slot}: {p.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:w-2/3 flex gap-2">
                      <input
                        type="text"
                        placeholder="Ask a technical or financial feasibility question..."
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        className="flex-1 p-2 rounded bg-navy-900 border border-navy-750 text-white placeholder-slate-500 focus:outline-none focus:border-navy-600 text-xs"
                      />
                      <button
                        type="submit"
                        disabled={postingQuestion || !eventDetail.pitches?.length}
                        className="px-3.5 py-2 rounded bg-ivory hover:bg-white text-navy-950 font-medium text-xs flex items-center gap-1 flex-shrink-0 transition-colors shadow-sm"
                      >
                        <Send className="w-3 h-3 text-navy-950" />
                        <span>Post</span>
                      </button>
                    </div>
                  </div>
                </form>

                {/* Questions List */}
                <div className="space-y-3">
                  {eventDetail.questions && eventDetail.questions.length > 0 ? (
                    eventDetail.questions.map((q) => {
                      const isPitchOwner = user && eventDetail.pitches?.some(p => p.idea_id === q.idea_id && p.founder_id === user.id);
                      const canReply = isPitchOwner || isAdmin;

                      return (
                        <div key={q.id} className="p-4 rounded-lg bg-navy-950 border border-navy-800 space-y-2.5 text-xs">
                          <div className="flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-white">{q.asker_name}</span>
                              <span className="text-slate-500 font-mono">({q.asker_role})</span>
                              <span className="text-slate-600">·</span>
                              <span className="text-teal-300 font-medium">Re: {q.idea_title}</span>
                            </div>
                            <span className="text-slate-500 text-[10px]">
                              {new Date(q.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <p className="text-slate-200 pl-2 border-l border-navy-700 leading-relaxed font-normal">
                            "{q.question}"
                          </p>

                          {/* Reply */}
                          {q.reply ? (
                            <div className="ml-3 p-3 rounded bg-navy-900 border border-navy-800 space-y-1">
                              <span className="text-[10px] font-semibold text-teal-400 uppercase tracking-wider block">
                                Founder Response:
                              </span>
                              <p className="text-slate-300 leading-relaxed text-xs">
                                {q.reply}
                              </p>
                            </div>
                          ) : (
                            canReply && (
                              <div className="ml-3">
                                {replyingToQId === q.id ? (
                                  <div className="flex gap-2 mt-2">
                                    <input
                                      type="text"
                                      placeholder="Type your official reply..."
                                      value={replyText}
                                      onChange={(e) => setReplyText(e.target.value)}
                                      className="flex-1 p-2 rounded bg-navy-900 border border-navy-750 text-white text-xs"
                                    />
                                    <button
                                      onClick={() => handlePostReply(q.id)}
                                      disabled={postingReply}
                                      className="px-3 py-1.5 rounded bg-ivory text-navy-950 font-medium text-xs"
                                    >
                                      Submit
                                    </button>
                                    <button
                                      onClick={() => setReplyingToQId(null)}
                                      className="px-2 py-1.5 text-slate-400 hover:text-white text-xs"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setReplyingToQId(q.id);
                                      setReplyText('');
                                    }}
                                    className="text-[11px] font-medium text-teal-400 hover:underline"
                                  >
                                    + Reply to Question
                                  </button>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-xs text-slate-500">
                      No questions submitted for this session yet.
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="panel rounded-xl p-12 text-center text-slate-400 text-xs">
              Select a pitching session from the left column to enter the arena.
            </div>
          )}
        </div>
      </div>

      {/* Apply to Pitch Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title="Apply for Shark Tank Presentation Slot"
      >
        <form onSubmit={handleApply} className="space-y-4 text-xs">
          <p className="text-slate-300 leading-relaxed">
            Submit your approved startup for slot assignment in this Virtual Shark Tank pitching round.
          </p>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Select Published Startup *
            </label>
            {myIdeas.length > 0 ? (
              <select
                value={selectedIdeaId}
                onChange={(e) => setSelectedIdeaId(e.target.value)}
                className="w-full p-2.5 rounded bg-navy-950 border border-navy-750 text-white text-xs"
              >
                {myIdeas.map((idea) => (
                  <option key={idea.id} value={idea.id}>
                    {idea.title} (Viability: {idea.viability_score}/100)
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 rounded bg-navy-950 border border-amber-800/60 text-amber-300 text-xs">
                You do not have any <strong>Published</strong> ideas yet. Only approved ideas can pitch.
              </div>
            )}
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Pitch Notes / Preparation (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. 3-minute executive summary and verified unit economics prepared."
              value={applyNotes}
              onChange={(e) => setApplyNotes(e.target.value)}
              className="w-full p-2.5 rounded bg-navy-950 border border-navy-750 text-white text-xs"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-navy-800">
            <button
              type="button"
              onClick={() => setApplyModalOpen(false)}
              className="px-3 py-1.5 rounded bg-navy-850 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingApp || myIdeas.length === 0}
              className="px-4 py-1.5 rounded bg-ivory text-navy-950 font-medium hover:bg-white transition-colors"
            >
              {submittingApp ? 'Submitting...' : 'Submit Pitch Application'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
