/**
 * Ideologist Deterministic Viability & Financial Scoring Engine
 * 
 * Rules-based, transparent scoring algorithm designed for academic review
 * and student demonstration. Every step has verifiable mathematical formulas.
 */

function calculateViability(data) {
  const startupCost = Math.max(0, parseFloat(data.startup_cost) || 0);
  const monthlyRevenue = Math.max(0, parseFloat(data.monthly_revenue) || 0);
  const monthlyExpense = Math.max(0, parseFloat(data.monthly_expense) || 0);
  const fundingTarget = Math.max(0, parseFloat(data.funding_target) || 0);
  const equityOffered = Math.min(100, Math.max(0.1, parseFloat(data.equity_offered) || 10));
  const demandScore = Math.min(100, Math.max(0, parseFloat(data.demand_score) || 75));
  const competitionScore = Math.min(100, Math.max(0, parseFloat(data.competition_score) || 60));

  // 1. Core Financial Metrics
  const monthlyProfit = monthlyRevenue - monthlyExpense;
  const annualRevenue = monthlyRevenue * 12;
  const annualExpense = monthlyExpense * 12;
  const annualProfit = monthlyProfit * 12;

  const profitMarginPercent = monthlyRevenue > 0 
    ? ((monthlyProfit / monthlyRevenue) * 100) 
    : (monthlyExpense > 0 ? -100 : 0);

  // 2. Break-even Period (Months)
  let breakEvenMonths = null;
  let breakEvenStatus = 'Profitable Cashflow';

  if (monthlyProfit > 0) {
    breakEvenMonths = Math.ceil(startupCost / monthlyProfit);
    if (breakEvenMonths <= 12) {
      breakEvenStatus = 'Rapid Break-Even (< 1 year)';
    } else if (breakEvenMonths <= 24) {
      breakEvenStatus = 'Healthy Break-Even (1-2 years)';
    } else {
      breakEvenStatus = 'Extended Break-Even (> 2 years)';
    }
  } else if (monthlyProfit === 0) {
    breakEvenStatus = 'Zero Monthly Margin (Break-even not reachable)';
  } else {
    breakEvenStatus = 'Negative Cashflow (Expenses exceed revenue)';
  }

  // 3. Implied Post-Money Valuation
  const impliedValuation = fundingTarget > 0 && equityOffered > 0
    ? (fundingTarget / (equityOffered / 100))
    : 0;

  // 4. Component Scoring Breakdown

  // Factor A: Profitability Margin (35% Weight)
  let profitScore = 40;
  if (profitMarginPercent >= 40) {
    profitScore = Math.min(100, 85 + (profitMarginPercent - 40) * 0.5);
  } else if (profitMarginPercent >= 20) {
    profitScore = 70 + ((profitMarginPercent - 20) / 20) * 15;
  } else if (profitMarginPercent > 0) {
    profitScore = 50 + (profitMarginPercent / 20) * 20;
  } else {
    // Negative margin
    profitScore = Math.max(10, 40 + profitMarginPercent * 0.3);
  }

  // Factor B: Break-Even Speed (25% Weight)
  let breakEvenScore = 20;
  if (monthlyProfit > 0 && breakEvenMonths !== null) {
    if (breakEvenMonths <= 12) {
      breakEvenScore = Math.min(100, 95 - (breakEvenMonths - 1) * 1.5);
    } else if (breakEvenMonths <= 24) {
      breakEvenScore = 80 - ((breakEvenMonths - 12) / 12) * 20;
    } else if (breakEvenMonths <= 36) {
      breakEvenScore = 60 - ((breakEvenMonths - 24) / 12) * 20;
    } else {
      breakEvenScore = Math.max(25, 40 - ((breakEvenMonths - 36) / 24) * 15);
    }
  } else {
    breakEvenScore = 15; // Penalty for negative monthly cashflow
  }

  // Factor C: Funding Feasibility & Equity Structure (20% Weight)
  let fundingScore = 60;
  // Healthy startup funding: target covers at least 6 months of burn + startup cost
  const requiredRunwayCapital = startupCost + (monthlyProfit < 0 ? Math.abs(monthlyProfit) * 12 : 0);
  if (fundingTarget >= requiredRunwayCapital * 0.7 && fundingTarget <= requiredRunwayCapital * 2.5) {
    fundingScore = 85;
  } else if (fundingTarget < requiredRunwayCapital * 0.7) {
    fundingScore = 55; // Undercapitalized risk
  } else {
    fundingScore = 65; // High dilution or excessive valuation ask
  }

  // Equity dilution sanity check (healthy range 5% - 25%)
  if (equityOffered >= 8 && equityOffered <= 22) {
    fundingScore += 10;
  } else if (equityOffered > 35) {
    fundingScore -= 15; // Founder over-dilution warning
  }

  fundingScore = Math.min(100, Math.max(20, fundingScore));

  // Factor D: Market Demand & Competitive Dynamics (20% Weight)
  // Higher demand increases score; higher competition creates headwind
  const marketScore = Math.min(100, Math.max(15, (demandScore * 0.6) + ((100 - competitionScore) * 0.4)));

  // 5. Final Composite Viability Score (0 - 100)
  const weightedScore = (
    (profitScore * 0.35) +
    (breakEvenScore * 0.25) +
    (fundingScore * 0.20) +
    (marketScore * 0.20)
  );

  const finalViabilityScore = Math.round(Math.min(96, Math.max(12, weightedScore)));

  // Viability Grade & Badge
  let grade = 'Moderate';
  let color = '#F59E0B'; // Amber
  if (finalViabilityScore >= 80) {
    grade = 'High Viability';
    color = '#10B981'; // Emerald
  } else if (finalViabilityScore >= 65) {
    grade = 'Strong Potential';
    color = '#3B82F6'; // Blue
  } else if (finalViabilityScore >= 45) {
    grade = 'Moderate Viability';
    color = '#F59E0B'; // Amber
  } else {
    grade = 'High Risk / Early Stage';
    color = '#EF4444'; // Red
  }

  // 6. Actionable Academic Recommendations
  const recommendations = [];
  if (profitMarginPercent < 15) {
    recommendations.push('Optimize operating costs or revise pricing to achieve a target operating margin >= 20%.');
  }
  if (breakEvenMonths && breakEvenMonths > 24) {
    recommendations.push('Explore phased rollout to lower initial capital expenditure and shorten break-even duration.');
  }
  if (equityOffered > 30) {
    recommendations.push('Dilution above 30% in early rounds may limit future investment rounds. Consider convertible notes or SAFE agreements.');
  }
  if (competitionScore > 75) {
    recommendations.push('High market competition detected: formulate strong intellectual property or exclusive local distributor moats.');
  }
  if (monthlyProfit > 0 && breakEvenMonths && breakEvenMonths <= 18) {
    recommendations.push('Unit economics demonstrate robust cash generation. Highly attractive for angel and seed syndicate investors.');
  }

  return {
    viabilityScore: finalViabilityScore,
    grade,
    color,
    metrics: {
      startupCost,
      monthlyRevenue,
      monthlyExpense,
      monthlyProfit,
      annualRevenue,
      annualExpense,
      annualProfit,
      profitMarginPercent: parseFloat(profitMarginPercent.toFixed(1)),
      breakEvenMonths,
      breakEvenStatus,
      fundingTarget,
      equityOffered,
      impliedValuation: Math.round(impliedValuation),
      demandScore,
      competitionScore
    },
    breakdown: [
      {
        factor: 'Profitability Margin',
        weight: '35%',
        score: Math.round(profitScore),
        formula: 'Monthly Profit / Monthly Revenue × 100',
        assessment: profitMarginPercent >= 25 ? 'High Profit Margin' : (profitMarginPercent > 0 ? 'Acceptable Margin' : 'Negative Margin')
      },
      {
        factor: 'Break-Even Velocity',
        weight: '25%',
        score: Math.round(breakEvenScore),
        formula: 'Startup Cost / Monthly Net Profit',
        assessment: breakEvenMonths ? `${breakEvenMonths} Months to Break-Even` : 'Indefinite (Negative Monthly Cashflow)'
      },
      {
        factor: 'Funding Feasibility',
        weight: '20%',
        score: Math.round(fundingScore),
        formula: 'Valuation & Runway vs Requested Equity Ask',
        assessment: `Implied Valuation: ₹${(impliedValuation).toLocaleString('en-IN')}`
      },
      {
        factor: 'Market Demand & Competition',
        weight: '20%',
        score: Math.round(marketScore),
        formula: '(Demand × 0.6) + ((100 - Competition) × 0.4)',
        assessment: `Net Index: ${Math.round(marketScore)}/100`
      }
    ],
    recommendations
  };
}

module.exports = { calculateViability };
