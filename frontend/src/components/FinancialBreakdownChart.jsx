import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function FinancialBreakdownChart({ metrics }) {
  if (!metrics) return null;

  const data = [
    {
      name: 'Monthly Revenue',
      amount: metrics.monthlyRevenue || 0,
      fill: '#10B981'
    },
    {
      name: 'Operating Expense',
      amount: metrics.monthlyExpense || 0,
      fill: '#EF4444'
    },
    {
      name: 'Net Monthly Profit',
      amount: metrics.monthlyProfit || 0,
      fill: metrics.monthlyProfit >= 0 ? '#3B82F6' : '#DC2626'
    }
  ];

  const formatCurrency = (val) => {
    if (Math.abs(val) >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (Math.abs(val) >= 100000) return `₹${(val / 100000).toFixed(1)} Lakh`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="w-full">
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="name"
              stroke="#64748B"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickFormatter={formatCurrency}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <Tooltip
              formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
              contentStyle={{
                backgroundColor: '#0F172A',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                color: '#F8FAFC',
                fontSize: '12px'
              }}
            />
            <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-slate-400 block text-[11px]">Net Margin</span>
          <span className={`font-semibold text-sm ${metrics.profitMarginPercent >= 0 ? 'text-brand-emerald' : 'text-red-400'}`}>
            {metrics.profitMarginPercent}%
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-slate-400 block text-[11px]">Break-Even</span>
          <span className="font-semibold text-sm text-brand-amber">
            {metrics.breakEvenMonths ? `${metrics.breakEvenMonths} Mo.` : 'N/A'}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-slate-400 block text-[11px]">Annual Profit</span>
          <span className={`font-semibold text-sm ${metrics.annualProfit >= 0 ? 'text-brand-blue' : 'text-red-400'}`}>
            {formatCurrency(metrics.annualProfit)}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-slate-400 block text-[11px]">Post-Money Val</span>
          <span className="font-semibold text-sm text-white">
            {formatCurrency(metrics.impliedValuation)}
          </span>
        </div>
      </div>
    </div>
  );
}
