import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Rocket, Briefcase, UserCheck, Mail, Lock, User, MapPin, Building, ArrowRight } from 'lucide-react';

const CITIES = [
  'Bengaluru',
  'Mumbai',
  'Delhi NCR',
  'Hyderabad',
  'Pune',
  'Indore',
  'Jaipur',
  'Ahmedabad',
  'Kochi',
  'Coimbatore'
];

export default function Register() {
  const [role, setRole] = useState('entrepreneur');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [company, setCompany] = useState('');
  const [bio, setBio] = useState('');
  const [investmentRange, setInvestmentRange] = useState('₹10L - ₹50L');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await register({
      name,
      email,
      password,
      role,
      city,
      company,
      bio,
      investment_range: role === 'investor' ? investmentRange : null
    });
    setSubmitting(false);

    if (res.success) {
      if (role === 'investor') {
        navigate('/investor/dashboard');
      } else {
        navigate('/entrepreneur/dashboard');
      }
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-emerald to-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-brand-emerald/20">
            <Rocket className="w-6 h-6 text-navy-950 font-bold" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Create Your Ideologist Account
          </h2>
          <p className="text-xs text-slate-400">
            Join the platform as a startup founder or accredited angel syndicate investor.
          </p>
        </div>

        {/* Role Selection Toggle */}
        <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-navy-900 border border-slate-800">
          <button
            type="button"
            onClick={() => setRole('entrepreneur')}
            className={`p-3.5 rounded-xl flex items-center justify-center gap-2.5 font-bold text-xs transition-all ${
              role === 'entrepreneur'
                ? 'bg-brand-emerald text-navy-950 shadow-lg shadow-brand-emerald/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Entrepreneur (Founder)</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('investor')}
            className={`p-3.5 rounded-xl flex items-center justify-center gap-2.5 font-bold text-xs transition-all ${
              role === 'investor'
                ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Investor (Syndicate)</span>
          </button>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rohan Verma"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-emerald text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Work Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rohan@startup.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-emerald text-xs"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Password (min 6 characters) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-emerald text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Base City *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-emerald text-xs"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                {role === 'investor' ? 'Fund / Syndicate Name' : 'Company or Venture Name'}
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder={role === 'investor' ? 'Apex Capital' : 'HyperVentures Ltd'}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-emerald text-xs"
                />
              </div>
            </div>

            {role === 'investor' && (
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Investment Ticket Range
                </label>
                <select
                  value={investmentRange}
                  onChange={(e) => setInvestmentRange(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-emerald text-xs"
                >
                  <option value="₹10L - ₹25L">₹10 Lakh - ₹25 Lakh</option>
                  <option value="₹25L - ₹75L">₹25 Lakh - ₹75 Lakh</option>
                  <option value="₹75L - ₹2Cr">₹75 Lakh - ₹2 Crore</option>
                  <option value="₹2Cr+">₹2 Crore +</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Brief Professional Bio / Background
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other members about your entrepreneurial experience or investment focus..."
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-emerald text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-brand-emerald text-navy-950 font-bold text-sm hover:bg-emerald-400 transition-all shadow-lg shadow-brand-emerald/20 flex items-center justify-center gap-2 mt-4"
          >
            <span>{submitting ? 'Creating Account...' : 'Complete Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="text-brand-emerald font-semibold hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}
