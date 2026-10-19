import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-navy-700/60 bg-navy-950 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-navy-850 border border-navy-700 flex items-center justify-center text-ivory font-serif font-bold text-xs">
                I
              </div>
              <span className="text-sm font-semibold text-white tracking-tight">Ideologist</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              From an idea to an opportunity. A structured evaluation engine and deal discovery platform for early-stage entrepreneurs and venture syndicates.
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed max-w-sm">
              All financial models, break-even projections, and investor matching functions are illustrative demonstration tools designed to assist preliminary venture analysis.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-3">
              Navigation
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/discover" className="hover:text-slate-200 transition-colors">Startup Directory</Link>
              </li>
              <li>
                <Link to="/pitch-events" className="hover:text-slate-200 transition-colors">Virtual Shark Tank</Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-slate-200 transition-colors">Platform Methodology</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-slate-200 transition-colors">Member Sign In</Link>
              </li>
            </ul>
          </div>

          {/* Systems */}
          <div>
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-3">
              Platform Features
            </span>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Deterministic Viability Scoring</li>
              <li>Document & Pitch Deck Vault</li>
              <li>Location Feasibility Mapping</li>
              <li>Syndicate Diligence & Inquiries</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-navy-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Ideologist. Engineered for startup validation and venture discovery.</p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>React · Express · SQLite</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
