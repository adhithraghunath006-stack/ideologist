import React from 'react';
import { 
  Rocket, 
  Users, 
  ShieldCheck, 
  Calculator, 
  MapPin, 
  FileText, 
  Tv 
} from 'lucide-react';

export default function HowItWorks() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 text-xs">
      {/* Header */}
      <div className="space-y-3 border-b border-navy-750 pb-6">
        <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
          Platform Methodology
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-normal text-white tracking-tight">
          How Ideologist Operates
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed max-w-2xl font-normal">
          Ideologist provides a structured, quantitative bridge between early-stage innovation and venture capital through deterministic viability metrics, pitch document management, and interactive virtual pitching sessions.
        </p>
      </div>

      {/* The 3 Core Journeys */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Entrepreneur */}
        <div className="panel rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Rocket className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-semibold text-white">For Entrepreneurs</h3>
          </div>
          <p className="text-slate-400 leading-relaxed font-normal">
            Validate ideas with mathematical unit economics before approaching capital partners.
          </p>

          <div className="pt-3 border-t border-navy-800 space-y-3 text-slate-300">
            <div>
              <strong className="text-white block text-xs">1. Structured Modeling</strong>
              <p className="text-[11px] text-slate-400 mt-0.5">Enter monthly burn, setup capital, and projected revenue to generate your break-even horizon.</p>
            </div>
            <div>
              <strong className="text-white block text-xs">2. Pitch Deck Vault</strong>
              <p className="text-[11px] text-slate-400 mt-0.5">Attach your official pitch PDF or presentation file (up to 10MB) stored on dedicated local storage.</p>
            </div>
            <div>
              <strong className="text-white block text-xs">3. Virtual Shark Tank</strong>
              <p className="text-[11px] text-slate-400 mt-0.5">Apply for scheduled pitching sessions and field due diligence questions directly from investors.</p>
            </div>
          </div>
        </div>

        {/* Investor */}
        <div className="panel rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">For Investors</h3>
          </div>
          <p className="text-slate-400 leading-relaxed font-normal">
            Discover verified early-stage dealflow with transparent margins and regional benchmarks.
          </p>

          <div className="pt-3 border-t border-navy-800 space-y-3 text-slate-300">
            <div>
              <strong className="text-white block text-xs">1. Filtered Discovery</strong>
              <p className="text-[11px] text-slate-400 mt-0.5">Filter opportunities across 9 sectors, business stages, and 10 regional economic clusters.</p>
            </div>
            <div>
              <strong className="text-white block text-xs">2. In-Browser PDF Review</strong>
              <p className="text-[11px] text-slate-400 mt-0.5">Preview full pitch decks directly in browser modals without external viewer dependencies.</p>
            </div>
            <div>
              <strong className="text-white block text-xs">3. Direct Inquiries</strong>
              <p className="text-[11px] text-slate-400 mt-0.5">Bookmark promising startups to your watchlist and dispatch structured preliminary meeting requests.</p>
            </div>
          </div>
        </div>

        {/* Governance */}
        <div className="panel rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">For Governance & Review</h3>
          </div>
          <p className="text-slate-400 leading-relaxed font-normal">
            Platform moderation, submission verification, and session coordination.
          </p>

          <div className="pt-3 border-t border-navy-800 space-y-3 text-slate-300">
            <div>
              <strong className="text-white block text-xs">1. Submission Vetting</strong>
              <p className="text-[11px] text-slate-400 mt-0.5">Inspect business proposals and attached pitch files, approving or rejecting with feedback.</p>
            </div>
            <div>
              <strong className="text-white block text-xs">2. Event Scheduling</strong>
              <p className="text-[11px] text-slate-400 mt-0.5">Create Shark Tank sessions, review founder applications, and assign presentation slot orders.</p>
            </div>
            <div>
              <strong className="text-white block text-xs">3. Audit Trail Logging</strong>
              <p className="text-[11px] text-slate-400 mt-0.5">Maintain a tamper-evident administrative log of all approval, review, and user status actions.</p>
            </div>
          </div>
        </div>
      </div>

      {/* The Transparent Scoring Formula Section */}
      <div className="panel rounded-xl p-8 space-y-6">
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
            Mathematical Engine
          </span>
          <h2 className="text-xl font-serif font-normal text-white mt-1">
            Deterministic Viability Formula
          </h2>
          <p className="text-slate-300 mt-1 leading-relaxed">
            The platform calculates a composite viability score (0–100) using four weighted factors:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-lg bg-navy-950 border border-navy-800 space-y-1">
            <span className="font-mono text-xs font-semibold text-teal-400 block">35% WEIGHT</span>
            <strong className="text-white text-xs block">Profitability Margin</strong>
            <p className="text-[11px] text-slate-400 font-mono pt-1">(Profit / Revenue) × 100</p>
          </div>

          <div className="p-4 rounded-lg bg-navy-950 border border-navy-800 space-y-1">
            <span className="font-mono text-xs font-semibold text-blue-400 block">25% WEIGHT</span>
            <strong className="text-white text-xs block">Break-Even Velocity</strong>
            <p className="text-[11px] text-slate-400 font-mono pt-1">Cost / Monthly Profit</p>
          </div>

          <div className="p-4 rounded-lg bg-navy-950 border border-navy-800 space-y-1">
            <span className="font-mono text-xs font-semibold text-amber-400 block">20% WEIGHT</span>
            <strong className="text-white text-xs block">Funding Feasibility</strong>
            <p className="text-[11px] text-slate-400 font-mono pt-1">Runway Buffer vs. Dilution</p>
          </div>

          <div className="p-4 rounded-lg bg-navy-950 border border-navy-800 space-y-1">
            <span className="font-mono text-xs font-semibold text-slate-300 block">20% WEIGHT</span>
            <strong className="text-white text-xs block">Market Dynamics</strong>
            <p className="text-[11px] text-slate-400 font-mono pt-1">(Demand×0.6) + (Comp×0.4)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
