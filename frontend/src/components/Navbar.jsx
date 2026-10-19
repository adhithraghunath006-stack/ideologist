import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Compass, 
  Tv, 
  HelpCircle, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Plus, 
  Bookmark, 
  ShieldCheck, 
  Layers
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout, isEntrepreneur, isInvestor, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-navy-700/60 bg-navy-950/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-navy-850 border border-navy-700 flex items-center justify-center text-ivory font-serif font-bold text-base">
            I
          </div>
          <div>
            <span className="text-base font-semibold tracking-tight text-white block leading-none">
              Ideologist
            </span>
            <span className="text-[10px] text-slate-400 tracking-normal block mt-1">
              From an idea to an opportunity
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/discover"
            className={`text-xs font-medium transition-colors ${
              isActive('/discover') ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Discover Startups
          </Link>

          <Link
            to="/pitch-events"
            className={`text-xs font-medium transition-colors ${
              isActive('/pitch-events') ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Virtual Shark Tank
          </Link>

          <Link
            to="/how-it-works"
            className={`text-xs font-medium transition-colors ${
              isActive('/how-it-works') ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            How It Works
          </Link>
        </nav>

        {/* Right Auth controls */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative flex items-center gap-2.5">
              {isEntrepreneur && (
                <Link
                  to="/entrepreneur/create"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-navy-850 hover:bg-navy-800 text-slate-200 border border-navy-700 transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-brand-emerald" />
                  <span>New Idea</span>
                </Link>
              )}

              {isInvestor && (
                <Link
                  to="/investor/saved"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-navy-850 hover:bg-navy-800 text-slate-200 border border-navy-700 transition-colors flex items-center gap-1.5"
                >
                  <Bookmark className="w-3.5 h-3.5 text-brand-amber" />
                  <span>Watchlist</span>
                </Link>
              )}

              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-navy-900 border border-navy-700/80 hover:border-navy-600 transition-colors text-xs text-white"
              >
                <div className="w-5 h-5 rounded bg-navy-800 border border-navy-700 flex items-center justify-center font-medium text-[11px] text-slate-300">
                  {user.name.charAt(0)}
                </div>
                <span className="font-medium text-slate-200">{user.name}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider capitalize px-1 py-0.2 rounded bg-navy-800">
                  {user.role}
                </span>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div 
                  className="absolute right-0 top-full mt-2 w-52 rounded-lg bg-navy-900 border border-navy-700 shadow-xl py-1 z-50 divide-y divide-navy-800"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="px-3 py-2">
                    <p className="text-[11px] font-medium text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  </div>

                  <div className="py-1 text-xs">
                    {isEntrepreneur && (
                      <>
                        <Link
                          to="/entrepreneur/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-1.5 text-slate-300 hover:text-white hover:bg-navy-800"
                        >
                          <Layers className="w-3.5 h-3.5 text-slate-400" />
                          Founder Dashboard
                        </Link>
                        <Link
                          to="/entrepreneur/create"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-1.5 text-slate-300 hover:text-white hover:bg-navy-800"
                        >
                          <Plus className="w-3.5 h-3.5 text-slate-400" />
                          Create New Idea
                        </Link>
                      </>
                    )}

                    {isInvestor && (
                      <>
                        <Link
                          to="/investor/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-1.5 text-slate-300 hover:text-white hover:bg-navy-800"
                        >
                          <Compass className="w-3.5 h-3.5 text-slate-400" />
                          Investor Feed
                        </Link>
                        <Link
                          to="/investor/saved"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-1.5 text-slate-300 hover:text-white hover:bg-navy-800"
                        >
                          <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                          Saved Watchlist
                        </Link>
                        <Link
                          to="/investor/interests"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-1.5 text-slate-300 hover:text-white hover:bg-navy-800"
                        >
                          <Tv className="w-3.5 h-3.5 text-slate-400" />
                          Sent Inquiries
                        </Link>
                      </>
                    )}

                    {isAdmin && (
                      <>
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-1.5 text-slate-300 hover:text-white hover:bg-navy-800"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                          Admin Console
                        </Link>
                        <Link
                          to="/admin/submissions"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-1.5 text-slate-300 hover:text-white hover:bg-navy-800"
                        >
                          <Layers className="w-3.5 h-3.5 text-slate-400" />
                          Submissions Queue
                        </Link>
                        <Link
                          to="/admin/events"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-1.5 text-slate-300 hover:text-white hover:bg-navy-800"
                        >
                          <Tv className="w-3.5 h-3.5 text-slate-400" />
                          Event Management
                        </Link>
                      </>
                    )}
                  </div>

                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-navy-800 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-ivory text-navy-950 hover:bg-white transition-colors shadow-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-navy-700 bg-navy-950 px-4 py-4 space-y-2 text-xs">
          <Link
            to="/discover"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-300 hover:text-white"
          >
            Discover Startups
          </Link>
          <Link
            to="/pitch-events"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-300 hover:text-white"
          >
            Virtual Shark Tank
          </Link>
          <Link
            to="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-300 hover:text-white"
          >
            How It Works
          </Link>

          {isAuthenticated ? (
            <div className="pt-3 border-t border-navy-800 space-y-2">
              <div className="text-[11px] text-slate-400">
                {user.name} ({user.role})
              </div>
              {isEntrepreneur && (
                <Link
                  to="/entrepreneur/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1.5 text-brand-emerald"
                >
                  Founder Dashboard
                </Link>
              )}
              {isInvestor && (
                <Link
                  to="/investor/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1.5 text-brand-blue"
                >
                  Investor Feed
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1.5 text-brand-amber"
                >
                  Admin Console
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left py-1.5 text-red-400"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-navy-800 flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-1/2 text-center py-2 rounded bg-navy-850 text-slate-200"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-1/2 text-center py-2 rounded bg-ivory text-navy-950 font-medium"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
