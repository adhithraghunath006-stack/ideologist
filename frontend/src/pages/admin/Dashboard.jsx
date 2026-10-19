import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Users, 
  Layers, 
  Tv, 
  FileText, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Clock,
  History
} from 'lucide-react';
import { api } from '../../services/api';
import SkeletonLoader from '../../components/SkeletonLoader';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentAudits, setRecentAudits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.getAdminStats();
        if (res.success) {
          setStats(res.stats);
          setRecentAudits(res.recentAudits || []);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Admin Header */}
      <div className="p-8 rounded-3xl bg-navy-900 border border-brand-amber/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-brand-amber text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Platform Governance & Moderation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Administrator Command Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Audit submission quality, moderate pitch decks, coordinate Shark Tank events, and manage system accounts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/submissions"
            className="px-4 py-2.5 rounded-xl bg-brand-emerald text-navy-950 font-bold text-xs uppercase tracking-wider hover:bg-emerald-400 transition-colors shadow-lg shadow-brand-emerald/20 flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4" />
            <span>Review Submissions ({stats?.pendingIdeas || 0})</span>
          </Link>

          <Link
            to="/admin/events"
            className="px-4 py-2.5 rounded-xl bg-brand-blue text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-600 transition-colors shadow-lg shadow-brand-blue/20 flex items-center gap-1.5"
          >
            <Tv className="w-4 h-4" />
            <span>Manage Events</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      {loading ? (
        <SkeletonLoader count={4} />
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium block">Total Users</span>
            <span className="text-3xl font-extrabold text-white mt-1 block">{stats.totalUsers}</span>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {stats.entrepreneurs} Founders • {stats.investors} Investors
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium block">Pending Reviews</span>
            <span className="text-3xl font-extrabold text-brand-amber mt-1 block">{stats.pendingIdeas}</span>
            <span className="text-[11px] text-slate-500 mt-1 block">Awaiting Administrator Decision</span>
          </div>

          <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium block">Published Startups</span>
            <span className="text-3xl font-extrabold text-brand-emerald mt-1 block">{stats.publishedIdeas}</span>
            <span className="text-[11px] text-slate-500 mt-1 block">Live in Investor Marketplace</span>
          </div>

          <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium block">Pitch Events</span>
            <span className="text-3xl font-extrabold text-brand-blue mt-1 block">{stats.totalEvents}</span>
            <span className="text-[11px] text-slate-500 mt-1 block">Virtual Shark Tank Sessions</span>
          </div>
        </div>
      ) : null}

      {/* Navigation Quick Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/submissions"
          className="p-6 rounded-2xl bg-navy-900 border border-slate-800 hover:border-brand-emerald/40 transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-emerald/10 border border-brand-emerald/20 flex items-center justify-center text-brand-emerald">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-brand-emerald transition-colors">
            Submission Moderation Workflow
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Inspect startup descriptions, verify uploaded pitch decks (PDF/PPT/DOC), and Approve or Reject with feedback.
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-emerald">
            <span>Moderate Submissions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          to="/admin/events"
          className="p-6 rounded-2xl bg-navy-900 border border-slate-800 hover:border-brand-blue/40 transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue">
            <Tv className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-brand-blue transition-colors">
            Virtual Shark Tank Controls
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Create events, review founder pitch applications, assign presentation slots, and toggle simulated "Live Demo" status.
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue">
            <span>Configure Sessions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          to="/admin/users"
          className="p-6 rounded-2xl bg-navy-900 border border-slate-800 hover:border-brand-amber/40 transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-amber/10 border border-brand-amber/20 flex items-center justify-center text-brand-amber">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-brand-amber transition-colors">
            User Account Management
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Search user registry by role or city, inspect founder profiles, and suspend or reactivate platform privileges.
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-amber">
            <span>Manage Users</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>

      {/* Recent Audit Trail Preview */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4 text-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-brand-emerald" />
            <span>Recent Administrative Actions Audit Log</span>
          </h3>
          <Link to="/admin/audit-logs" className="text-brand-emerald font-semibold hover:underline">
            View Full Audit Trail →
          </Link>
        </div>

        <div className="divide-y divide-slate-800">
          {recentAudits.map((log) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between">
              <div>
                <span className="font-mono text-brand-emerald font-semibold">{log.action}</span>
                <span className="text-slate-400 ml-2">Target: {log.target_type} #{log.target_id}</span>
              </div>
              <span className="text-[11px] text-slate-500">{log.created_at}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
