import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Rocket, Upload, FileText, ArrowLeft, Save, Send, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const INDUSTRIES = [
  'FinTech',
  'AgriTech',
  'HealthTech',
  'EV Charging',
  'CleanTech',
  'EdTech',
  'SaaS',
  'Hyperlocal Commerce',
  'Hardware & IoT',
  'Logistics'
];

const STAGES = ['Idea', 'Prototype', 'MVP', 'Early Traction', 'Scaling'];

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

export default function EditIdea() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [industry, setIndustry] = useState('FinTech');
  const [stage, setStage] = useState('MVP');
  const [targetCity, setTargetCity] = useState('Bengaluru');
  const [targetCustomer, setTargetCustomer] = useState('');

  const [fundingTarget, setFundingTarget] = useState('');
  const [equityOffered, setEquityOffered] = useState('');
  const [startupCost, setStartupCost] = useState('');
  const [monthlyRevenue, setMonthlyRevenue] = useState('');
  const [monthlyExpense, setMonthlyExpense] = useState('');
  const [demandScore, setDemandScore] = useState(75);
  const [competitionScore, setCompetitionScore] = useState(60);

  const [pitchFile, setPitchFile] = useState(null);
  const [fileError, setFileError] = useState('');

  useEffect(() => {
    async function fetchIdea() {
      try {
        const res = await api.getIdeaById(id);
        if (res.success && res.idea) {
          const i = res.idea;
          setTitle(i.title);
          setTagline(i.tagline);
          setProblem(i.problem);
          setSolution(i.solution);
          setIndustry(i.industry);
          setStage(i.stage);
          setTargetCity(i.target_city);
          setTargetCustomer(i.target_customer || '');
          setFundingTarget(i.funding_target);
          setEquityOffered(i.equity_offered);
          setStartupCost(i.startup_cost);
          setMonthlyRevenue(i.monthly_revenue);
          setMonthlyExpense(i.monthly_expense);
          setDemandScore(i.demand_score || 75);
          setCompetitionScore(i.competition_score || 60);
        }
      } catch (err) {
        addToast(err.message || 'Failed to load idea for editing.', 'error');
        navigate('/entrepreneur/dashboard');
      } finally {
        setLoading(false);
      }
    }
    fetchIdea();
  }, [id, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError('');
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setFileError('File exceeds 10MB limit.');
      return;
    }
    setPitchFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('tagline', tagline);
      formData.append('problem', problem);
      formData.append('solution', solution);
      formData.append('industry', industry);
      formData.append('stage', stage);
      formData.append('target_city', targetCity);
      formData.append('target_customer', targetCustomer);
      formData.append('funding_target', fundingTarget);
      formData.append('equity_offered', equityOffered);
      formData.append('startup_cost', startupCost);
      formData.append('monthly_revenue', monthlyRevenue);
      formData.append('monthly_expense', monthlyExpense);
      formData.append('demand_score', demandScore);
      formData.append('competition_score', competitionScore);

      if (pitchFile) {
        formData.append('pitch_deck', pitchFile);
      }

      const res = await api.updateIdea(id, formData);
      if (res.success) {
        addToast(res.message, 'success');
        navigate('/entrepreneur/dashboard');
      }
    } catch (err) {
      addToast(err.message || 'Failed to update idea.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-20 text-center text-slate-400">Loading idea...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 text-xs">
      <Link
        to="/entrepreneur/dashboard"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-white">Edit Startup Submission</h1>
        <p className="text-slate-400 mt-1">Update business details and refresh calculated financial viability.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Tagline *</label>
            <input
              type="text"
              required
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Industry</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
              >
                {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
              >
                {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Target City</label>
              <select
                value={targetCity}
                onChange={(e) => setTargetCity(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
              >
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Problem Statement</label>
            <textarea
              rows={3}
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Proposed Solution</label>
            <textarea
              rows={3}
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Financial Feasibility Numbers (INR ₹)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Startup Cost (₹)</label>
              <input
                type="number"
                value={startupCost}
                onChange={(e) => setStartupCost(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Monthly Revenue (₹)</label>
              <input
                type="number"
                value={monthlyRevenue}
                onChange={(e) => setMonthlyRevenue(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Monthly Expense (₹)</label>
              <input
                type="number"
                value={monthlyExpense}
                onChange={(e) => setMonthlyExpense(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Funding Target (₹)</label>
              <input
                type="number"
                value={fundingTarget}
                onChange={(e) => setFundingTarget(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            to="/entrepreneur/dashboard"
            className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-brand-emerald text-navy-950 font-bold hover:bg-emerald-400"
          >
            {submitting ? 'Saving Changes...' : 'Save Updates'}
          </button>
        </div>
      </form>
    </div>
  );
}
