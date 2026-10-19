import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Printer, ShieldCheck, TrendingUp, Calculator, Award, Info } from 'lucide-react';
import { api } from '../../services/api';
import ViabilityMeter from '../../components/ViabilityMeter';
import FinancialBreakdownChart from '../../components/FinancialBreakdownChart';

export default function IdeaReport() {
  const { id } = useParams();
  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getIdeaById(id);
        if (res.success && res.idea) {
          setIdea(res.idea);
        }
      } catch (err) {
        console.error('Failed to load idea report:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading || !idea) {
    return <div className="p-20 text-center text-slate-400 text-sm">Generating evaluation report...</div>;
  }

  const analysis = idea.analysis;
  const metrics = analysis?.metrics;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8 text-xs">
      {/* Top Bar */}
      <div className="flex items-center justify-between no-print">
        <Link
          to="/entrepreneur/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold flex items-center gap-2 transition-colors border border-slate-700"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save PDF Report</span>
        </button>
      </div>

      {/* Main Report Document Container */}
      <div className="p-8 sm:p-12 rounded-3xl bg-navy-900 border border-slate-800 space-y-10 shadow-2xl">
        {/* Report Header */}
        <div className="border-b border-slate-800 pb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20 font-bold text-[10px] uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Official Academic Feasibility Audit</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">{idea.title}</h1>
            <p className="text-slate-300 text-sm">{idea.tagline}</p>
            <div className="flex gap-4 text-slate-400 text-[11px] pt-1">
              <span>Sector: <strong className="text-white">{idea.industry}</strong></span>
              <span>•</span>
              <span>Stage: <strong className="text-white">{idea.stage}</strong></span>
              <span>•</span>
              <span>Target City: <strong className="text-white">{idea.target_city}</strong></span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-4">
            <ViabilityMeter score={idea.viability_score} size="lg" />
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Monthly Net Margin</span>
            <span className={`text-lg font-bold ${metrics?.profitMarginPercent >= 0 ? 'text-brand-emerald' : 'text-red-400'}`}>
              {metrics?.profitMarginPercent}%
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Break-Even Timeline</span>
            <span className="text-lg font-bold text-brand-amber">
              {metrics?.breakEvenMonths ? `${metrics.breakEvenMonths} Months` : 'N/A'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Annual Projected Profit</span>
            <span className="text-lg font-bold text-white">
              ₹{((metrics?.annualProfit || 0) / 100000).toFixed(1)} Lakh
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Implied Valuation</span>
            <span className="text-lg font-bold text-brand-blue">
              ₹{((metrics?.impliedValuation || 0) / 10000000).toFixed(2)} Cr
            </span>
          </div>
        </div>

        {/* Financial Feasibility Chart */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-emerald" />
            <span>Unit Economics Breakdown</span>
          </h3>
          <FinancialBreakdownChart metrics={metrics} />
        </div>

        {/* Mathematical Factor Breakdown Table */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calculator className="w-4 h-4 text-brand-blue" />
            <span>Transparent Mathematical Scoring Engine Breakdown</span>
          </h3>
          <p className="text-slate-400">
            The composite viability score is derived from four weighted pillars:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Evaluation Pillar</th>
                  <th className="p-3">Weight</th>
                  <th className="p-3">Pillar Score</th>
                  <th className="p-3">Audit Formula</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                {analysis?.breakdown?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-3 font-semibold text-white">{item.factor}</td>
                    <td className="p-3 text-brand-blue font-bold">{item.weight}</td>
                    <td className="p-3 text-brand-emerald font-bold">{item.score} / 100</td>
                    <td className="p-3 font-mono text-[11px] text-slate-400">{item.formula}</td>
                    <td className="p-3 text-slate-300">{item.assessment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommendations */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <h4 className="font-bold text-brand-amber flex items-center gap-1.5">
            <Award className="w-4 h-4" />
            <span>Algorithmic Optimization Recommendations</span>
          </h4>
          <ul className="space-y-2 text-slate-300 list-disc list-inside">
            {analysis?.recommendations?.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>

        {/* Footer Notice */}
        <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-500 text-center">
          Ideologist Academic Feasibility Audit • Evaluated on {new Date().toLocaleDateString()} • Built with Deterministic Mathematical Algorithms
        </div>
      </div>
    </div>
  );
}
