import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Rocket, ShieldCheck, UserCheck, Briefcase, Lock, Mail, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);

    if (res.success) {
      if (from) {
        navigate(from, { replace: true });
      } else if (res.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (res.user.role === 'investor') {
        navigate('/investor/dashboard');
      } else {
        navigate('/entrepreneur/dashboard');
      }
    }
  };

  // Quick 1-click demo filler
  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-emerald to-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-brand-emerald/20">
            <Rocket className="w-6 h-6 text-navy-950 font-bold" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Sign In to Ideologist
          </h2>
          <p className="text-xs text-slate-400">
            Access your founder workspace, investor syndicate, or platform admin console.
          </p>
        </div>

        {/* Demo Fast-Login Strip */}
        <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800 space-y-2.5">
          <span className="text-[11px] font-bold text-slate-400 block tracking-wide uppercase">
            ⚡ Quick 1-Click Evaluation Accounts:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('admin@ideologist.com', 'Admin123!')}
              className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-brand-amber/30 text-amber-300 text-[11px] font-bold flex flex-col items-center gap-1 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-brand-amber" />
              <span>Admin</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemo('founder1@ideologist.com', 'Password123!')}
              className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-brand-emerald/30 text-brand-emerald text-[11px] font-bold flex flex-col items-center gap-1 transition-all"
            >
              <UserCheck className="w-4 h-4 text-brand-emerald" />
              <span>Founder</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemo('investor1@ideologist.com', 'Password123!')}
              className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-brand-blue/30 text-blue-300 text-[11px] font-bold flex flex-col items-center gap-1 transition-all"
            >
              <Briefcase className="w-4 h-4 text-brand-blue" />
              <span>Investor</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@ideologist.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-emerald"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-emerald"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-brand-emerald text-navy-950 font-bold text-sm hover:bg-emerald-400 transition-all shadow-lg shadow-brand-emerald/20 flex items-center justify-center gap-2 mt-2"
          >
            <span>{submitting ? 'Authenticating...' : 'Sign In to Workspace'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-emerald font-semibold hover:underline">
            Register as Entrepreneur or Investor
          </Link>
        </p>
      </div>
    </div>
  );
}
