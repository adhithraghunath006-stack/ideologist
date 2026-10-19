import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Rocket, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  Percent, 
  TrendingUp, 
  MapPin, 
  Save, 
  Send, 
  ArrowLeft 
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ViabilityMeter from '../../components/ViabilityMeter';

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

export default function CreateIdea() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Form Fields
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [industry, setIndustry] = useState('FinTech');
  const [stage, setStage] = useState('MVP');
  const [targetCity, setTargetCity] = useState('Bengaluru');
  const [targetCustomer, setTargetCustomer] = useState('');
  
  // Financial Fields
  const [fundingTarget, setFundingTarget] = useState('5000000');
  const [equityOffered, setEquityOffered] = useState('10');
  const [startupCost, setStartupCost] = useState('3000000');
  const [monthlyRevenue, setMonthlyRevenue] = useState('800000');
  const [monthlyExpense, setMonthlyExpense] = useState('450000');
  const [demandScore, setDemandScore] = useState(80);
  const [competitionScore, setCompetitionScore] = useState(55);

  // File Upload
  const [pitchFile, setPitchFile] = useState(null);
  const [fileError, setFileError] = useState('');

  // Live Viability Preview State
  const [liveViability, setLiveViability] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Calculate live preview as user adjusts numbers
  useEffect(() => {
    const timer = setTimeout(async () => {
      setCalculating(true);
      try {
        const res = await api.calculateViability({
          startup_cost: startupCost,
          monthly_revenue: monthlyRevenue,
          monthly_expense: monthlyExpense,
          funding_target: fundingTarget,
          equity_offered: equityOffered,
          demand_score: demandScore,
          competition_score: competitionScore,
          target_city: targetCity,
          industry
        });

        if (res.success) {
          setLiveViability(res.calculation);
        }
      } catch (e) {
        console.error('Realtime calculate error:', e);
      } finally {
        setCalculating(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [startupCost, monthlyRevenue, monthlyExpense, fundingTarget, equityOffered, demandScore, competitionScore, targetCity, industry]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError('');

    if (!file) {
      setPitchFile(null);
      return;
    }

    // 10MB limit check
    if (file.size > 10 * 1024 * 1024) {
      setFileError('File size exceeds the 10MB maximum limit.');
      setPitchFile(null);
      return;
    }

    const allowed = ['.pdf', '.ppt', '.pptx', '.doc', '.docx'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowed.includes(ext)) {
      setFileError(`Unsupported format (${ext}). Please upload a PDF, PPT, PPTX, DOC, or DOCX file.`);
      setPitchFile(null);
      return;
    }

    setPitchFile(file);
  };

  const handleSubmit = async (statusMode) => {
    if (!title.trim() || !tagline.trim() || !problem.trim() || !solution.trim()) {
      addToast('Please complete all core business description fields.', 'error');
      return;
    }

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
      formData.append('target_customer', targetCustomer || 'General Consumers / Enterprises');
      formData.append('funding_target', fundingTarget);
      formData.append('equity_offered', equityOffered);
      formData.append('startup_cost', startupCost);
      formData.append('monthly_revenue', monthlyRevenue);
      formData.append('monthly_expense', monthlyExpense);
      formData.append('demand_score', demandScore);
      formData.append('competition_score', competitionScore);
      formData.append('status', statusMode);

      if (pitchFile) {
        formData.append('pitch_deck', pitchFile);
      }

      const res = await api.createIdea(formData);
      if (res.success) {
        addToast(res.message, 'success');
        navigate('/entrepreneur/dashboard');
      }
    } catch (err) {
      addToast(err.message || 'Failed to submit idea.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb */}
      <Link
        to="/entrepreneur/dashboard"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Founder Dashboard</span>
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-brand-emerald text-xs font-semibold tracking-wider uppercase mb-1">
          <Rocket className="w-4 h-4" />
          <span>New Venture Submission Wizard</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Create & Validate Business Idea
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Provide operational parameters and pitch assets. The deterministic algorithm evaluates viability scores in real time.
        </p>
      </div>

      {/* Main Grid: Left Form, Right Live Viability Engine Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Comprehensive Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Business Overview */}
          <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4 text-xs">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-brand-emerald/20 text-brand-emerald flex items-center justify-center text-xs font-bold">1</span>
              <span>Executive Summary & Proposition</span>
            </h3>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Business / Startup Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. VoltGrid Mobility"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-emerald text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">High-Impact Tagline *</label>
              <input
                type="text"
                required
                placeholder="e.g. Decentralized Solar-Buffered Highway EV Fast Chargers for Tier-2 Corridors"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-emerald text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Industry Sector *</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-emerald text-xs"
                >
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Venture Stage *</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-emerald text-xs"
                >
                  {STAGES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Base City *</label>
                <select
                  value={targetCity}
                  onChange={(e) => setTargetCity(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-emerald text-xs"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Target Customer Persona / Segment</label>
              <input
                type="text"
                placeholder="e.g. Fleet commercial drivers, logistics aggregators, and private EV owners"
                value={targetCustomer}
                onChange={(e) => setTargetCustomer(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-emerald text-xs"
              />
            </div>
          </div>

          {/* Section 2: Problem & Solution */}
          <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4 text-xs">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-brand-emerald/20 text-brand-emerald flex items-center justify-center text-xs font-bold">2</span>
              <span>Problem Statement & Value Proposition</span>
            </h3>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">The Critical Problem *</label>
              <textarea
                rows={3}
                required
                placeholder="Describe the exact pain point, market friction, or inefficiency you are solving..."
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-emerald text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Your Proposed Solution & Moat *</label>
              <textarea
                rows={3}
                required
                placeholder="Explain how your product or service delivers an order-of-magnitude improvement..."
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-emerald text-xs"
              />
            </div>
          </div>

          {/* Section 3: Financial Feasibility Inputs */}
          <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4 text-xs">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-brand-emerald/20 text-brand-emerald flex items-center justify-center text-xs font-bold">3</span>
              <span>Financial Parameters & Unit Economics (INR ₹)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Estimated Startup Setup Cost (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={startupCost}
                  onChange={(e) => setStartupCost(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-emerald text-xs"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Initial capital expenditure to launch</span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Expected Monthly Revenue (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={monthlyRevenue}
                  onChange={(e) => setMonthlyRevenue(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-emerald text-xs"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Gross sales/subscriptions per month</span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Estimated Monthly Operating Costs (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={monthlyExpense}
                  onChange={(e) => setMonthlyExpense(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-emerald text-xs"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Salaries, server, rent, marketing burn</span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Investor Funding (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  value={fundingTarget}
                  onChange={(e) => setFundingTarget(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-emerald text-xs"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Capital sought from angel investors</span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Equity Dilution Offered (%)</label>
                <input
                  type="number"
                  min="0.5"
                  max="100"
                  step="0.5"
                  value={equityOffered}
                  onChange={(e) => setEquityOffered(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-emerald text-xs"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Healthy seed range: 8% - 20%</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Demand Index (0-100)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={demandScore}
                    onChange={(e) => setDemandScore(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Competition (0-100)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={competitionScore}
                    onChange={(e) => setCompetitionScore(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Document Pitch Deck Vault */}
          <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4 text-xs">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-brand-emerald/20 text-brand-emerald flex items-center justify-center text-xs font-bold">4</span>
              <span>Pitch Deck Document Attachment</span>
            </h3>

            <div className="border-2 border-dashed border-slate-700/80 hover:border-brand-emerald rounded-2xl p-6 text-center transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-white">
                Drag and drop or select your pitch deck document
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Supported formats: PDF, PPT, PPTX, DOC, DOCX • Max limit: 10MB
              </p>

              <input
                type="file"
                id="pitchFileInput"
                onChange={handleFileChange}
                accept=".pdf,.ppt,.pptx,.doc,.docx"
                className="hidden"
              />

              <label
                htmlFor="pitchFileInput"
                className="mt-4 inline-block px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium cursor-pointer transition-colors"
              >
                Browse Local File
              </label>

              {pitchFile && (
                <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-brand-emerald/30 inline-flex items-center gap-2 text-brand-emerald">
                  <FileText className="w-4 h-4" />
                  <span>{pitchFile.name} ({(pitchFile.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}

              {fileError && (
                <div className="mt-3 text-red-400 flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>{fileError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Submission Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-4">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit('Draft')}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save as Draft</span>
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit('Pending Review')}
              className="px-6 py-3 rounded-xl bg-brand-emerald hover:bg-emerald-400 text-navy-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-brand-emerald/20"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Submit for Admin Review'}</span>
            </button>
          </div>
        </div>

        {/* Right 1 Col: Live Viability Engine Previewer */}
        <div className="space-y-6">
          <div className="sticky top-24 p-6 rounded-3xl bg-navy-900 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-brand-emerald uppercase font-bold tracking-wider">
                  Live Engine Simulator
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Real-time Viability Gauge
                </h3>
              </div>
              {calculating && (
                <div className="w-4 h-4 border-2 border-brand-emerald border-t-transparent rounded-full animate-spin" />
              )}
            </div>

            {liveViability && (
              <>
                <div className="flex items-center justify-center py-4 bg-slate-950/80 rounded-2xl border border-slate-800">
                  <ViabilityMeter score={liveViability.viabilityScore} size="lg" />
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Net Monthly Profit</span>
                    <span className={`font-bold ${liveViability.metrics?.monthlyProfit >= 0 ? 'text-brand-emerald' : 'text-red-400'}`}>
                      ₹{(liveViability.metrics?.monthlyProfit || 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Operating Margin</span>
                    <span className="font-bold text-white">
                      {liveViability.metrics?.profitMarginPercent}%
                    </span>
                  </div>

                  <div className="flex justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Break-Even Velocity</span>
                    <span className="font-bold text-brand-amber">
                      {liveViability.metrics?.breakEvenMonths ? `${liveViability.metrics.breakEvenMonths} Months` : 'N/A'}
                    </span>
                  </div>

                  <div className="flex justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Implied Post-Money</span>
                    <span className="font-bold text-white">
                      ₹{((liveViability.metrics?.impliedValuation || 0) / 10000000).toFixed(2)} Cr
                    </span>
                  </div>
                </div>

                {/* Formula Breakdown preview */}
                <div className="pt-4 border-t border-slate-800 space-y-2 text-[11px]">
                  <span className="font-semibold text-slate-300 block">Weighted Factor Breakdown:</span>
                  {liveViability.breakdown?.map((b, i) => (
                    <div key={i} className="flex justify-between text-slate-400">
                      <span>{b.factor} ({b.weight})</span>
                      <span className="text-white font-mono">{b.score}/100</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <p className="text-[10px] text-slate-500 leading-relaxed italic">
              * Evaluated in real-time by Ideologist rules-based mathematical scoring engine.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
