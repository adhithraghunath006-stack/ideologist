import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tv, ArrowLeft, PlusCircle, Calendar, Clock, CheckCircle2, XCircle, Users, Radio } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';

export default function EventManagement() {
  const { addToast } = useToast();

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [eventDetail, setEventDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  // Create Event Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [maxSlots, setMaxSlots] = useState('5');
  const [creating, setCreating] = useState(false);

  // Application Slotting Modal
  const [activeApp, setActiveApp] = useState(null);
  const [slotNumber, setSlotNumber] = useState('1');
  const [appStatus, setAppStatus] = useState('Approved');
  const [savingApp, setSavingApp] = useState(false);

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
      setLoading(false);
    }
  };

  const loadEventDetail = async (id) => {
    if (!id) return;
    try {
      const res = await api.getPitchEventById(id);
      if (res.success) {
        setEventDetail(res);
      }
    } catch (err) {
      console.error('Failed to load event detail:', err);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadEventDetail(selectedEventId);
    }
  }, [selectedEventId]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.createEvent({
        title: newTitle,
        event_date: newDate,
        description: newDesc,
        max_slots: maxSlots
      });
      addToast(res.message, 'success');
      setCreateModalOpen(false);
      setNewTitle('');
      setNewDate('');
      setNewDesc('');
      loadEvents();
    } catch (err) {
      addToast(err.message || 'Failed to create event.', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedEventId) return;
    try {
      const res = await api.updateEventStatus(selectedEventId, newStatus);
      addToast(res.message, 'success');
      loadEvents();
      loadEventDetail(selectedEventId);
    } catch (err) {
      addToast(err.message || 'Failed to update event status.', 'error');
    }
  };

  const handleSlottingSubmit = async (e) => {
    e.preventDefault();
    if (!activeApp) return;

    setSavingApp(true);
    try {
      const res = await api.reviewEventApplication(activeApp.application_id, {
        status: appStatus,
        pitch_slot: appStatus === 'Approved' ? parseInt(slotNumber, 10) : null
      });
      addToast(res.message, 'success');
      setActiveApp(null);
      loadEventDetail(selectedEventId);
    } catch (err) {
      addToast(err.message || 'Failed to review application.', 'error');
    } finally {
      setSavingApp(false);
    }
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-blue text-xs font-semibold uppercase tracking-wider mb-1">
            <Tv className="w-4 h-4" />
            <span>Virtual Shark Tank Administration</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Pitch Event Session Management
          </h1>
          <p className="text-slate-400 mt-1">
            Schedule pitching sessions, approve startup applications, assign presentation slots, and toggle Live Demo status.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-brand-emerald text-navy-950 font-bold hover:bg-emerald-400 transition-colors flex items-center gap-2 self-start sm:self-auto shadow-lg shadow-brand-emerald/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Pitch Session</span>
        </button>
      </div>

      {/* Main Split: Left Sessions List, Right Session Manager */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Events List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Active & Upcoming Sessions
          </h3>

          {events.map((ev) => {
            const isSelected = ev.id === selectedEventId;
            return (
              <div
                key={ev.id}
                onClick={() => setSelectedEventId(ev.id)}
                className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                  isSelected
                    ? 'bg-navy-900 border-brand-blue shadow-lg'
                    : 'bg-navy-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      ev.status === 'Live Demo'
                        ? 'bg-brand-emerald/20 text-brand-emerald'
                        : ev.status === 'Upcoming'
                        ? 'bg-brand-blue/20 text-brand-blue'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {ev.status}
                  </span>
                  <span className="text-[11px] text-slate-400">{ev.event_date}</span>
                </div>
                <h4 className="font-bold text-white text-sm">{ev.title}</h4>
                <p className="text-slate-400 text-[11px] line-clamp-1 mt-1">{ev.description}</p>
              </div>
            );
          })}
        </div>

        {/* Right Session Controller */}
        <div className="lg:col-span-2 space-y-6">
          {eventDetail ? (
            <>
              {/* Status Control Card */}
              <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">{eventDetail.event.title}</h3>
                    <p className="text-slate-400 text-xs mt-0.5">{eventDetail.event.description}</p>
                  </div>

                  {/* Live Status Toggle Buttons */}
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
                    {['Upcoming', 'Live Demo', 'Completed'].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(st)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          eventDetail.event.status === st
                            ? st === 'Live Demo'
                              ? 'bg-brand-emerald text-navy-950 font-extrabold'
                              : 'bg-brand-blue text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {st === 'Live Demo' && <span className="inline-block w-2 h-2 rounded-full bg-navy-950 live-indicator mr-1"></span>}
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Slotted Startups Manager */}
              <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">
                    Slotted Pitches ({eventDetail.pitches?.length || 0})
                  </h4>
                  <span className="text-[11px] text-slate-400">Assigned Order</span>
                </div>

                {eventDetail.pitches && eventDetail.pitches.length > 0 ? (
                  <div className="space-y-3">
                    {eventDetail.pitches.map((p) => (
                      <div
                        key={p.application_id}
                        className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded font-mono font-bold bg-brand-emerald/20 text-brand-emerald text-[11px]">
                              Slot #{p.pitch_slot || '1'}
                            </span>
                            <span className="font-bold text-white text-sm">{p.title}</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400">Founder: {p.founder_name}</span>
                          </div>
                          <p className="text-slate-400 text-xs">{p.tagline}</p>
                        </div>

                        <button
                          onClick={() => {
                            setActiveApp(p);
                            setSlotNumber(p.pitch_slot?.toString() || '1');
                            setAppStatus('Approved');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                        >
                          Change Slot
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    No startups currently slotted in this event.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-500">Select a pitch session to manage.</div>
          )}
        </div>
      </div>

      {/* Create Event Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Schedule New Virtual Shark Tank Pitch Session"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Session Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Cleantech & EV Velocity Summit 2026"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Scheduled Date & Time *</label>
            <input
              type="text"
              required
              placeholder="e.g. 2026-11-12 18:00 IST"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Session Description *</label>
            <textarea
              rows={3}
              required
              placeholder="Explain the syndicate theme, evaluation criteria, and participating venture funds..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Max Pitch Slots</label>
            <input
              type="number"
              min="1"
              max="10"
              value={maxSlots}
              onChange={(e) => setMaxSlots(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-6 py-2 rounded-xl bg-brand-emerald text-navy-950 font-bold hover:bg-emerald-400"
            >
              {creating ? 'Creating...' : 'Create Session'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Application Slotting Modal */}
      {activeApp && (
        <Modal
          isOpen={!!activeApp}
          onClose={() => setActiveApp(null)}
          title={`Slot Pitch Presentation: ${activeApp.title}`}
        >
          <form onSubmit={handleSlottingSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Status</label>
              <select
                value={appStatus}
                onChange={(e) => setAppStatus(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
              >
                <option value="Approved">Approved (Slotted)</option>
                <option value="Rejected">Rejected</option>
                <option value="Pending">Pending Review</option>
              </select>
            </div>

            {appStatus === 'Approved' && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assigned Slot Number</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={slotNumber}
                  onChange={(e) => setSlotNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
            )}

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveApp(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingApp}
                className="px-6 py-2 rounded-xl bg-brand-emerald text-navy-950 font-bold hover:bg-emerald-400"
              >
                {savingApp ? 'Updating...' : 'Save Slot'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
