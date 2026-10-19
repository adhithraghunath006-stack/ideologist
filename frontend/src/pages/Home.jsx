import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ArrowUpRight, 
  TrendingUp, 
  MapPin, 
  FileText, 
  Tv, 
  Calendar,
  Layers,
  Calculator,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { api } from '../services/api';
import IdeaCard from '../components/IdeaCard';
import ViabilityMeter from '../components/ViabilityMeter';
import SkeletonLoader from '../components/SkeletonLoader';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const [ideas, setIdeas] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, isEntrepreneur } = useAuth();

  useEffect(() => {
    async function loadData() {
      try {
        const [ideasRes, eventsRes] = await Promise.all([
          api.getIdeas({ sortBy: 'score_desc' }),
          api.getPitchEvents()
        ]);
        if (ideasRes.success && ideasRes.ideas) {
          setIdeas(ideasRes.ideas.slice(0, 4));
        }
        if (eventsRes.success && eventsRes.events) {
          setEvents(eventsRes.events.slice(0, 2));
        }
      } catch (err) {
        console.error('Failed to load landing data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const featured = ideas[0];
  const secondaryList = ideas.slice(1, 4);

  return (
    <div className="space-y-24 pb-20">
      {/* Editorial Hero Section */}
      <section className="pt-16 pb-12 border-b border-navy-700/60 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Typography & Actions (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-[11px] font-semibold text-teal-300 uppercase tracking-widest block">
                Venture Intelligence Platform
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal text-white tracking-tight leading-[1.12]">
                Every big business starts somewhere.
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl font-normal">
                Ideologist helps founders evaluate business viability through transparent unit economics, benchmark regional overhead, and connect with prospective investors through verified pitch decks.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  to="/discover"
                  className="px-5 py-2.5 rounded-lg bg-ivory hover:bg-white text-navy-950 font-medium text-xs tracking-tight transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span>Explore Startups</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  to={isAuthenticated ? (isEntrepreneur ? "/entrepreneur/create" : "/discover") : "/register"}
                  className="px-5 py-2.5 rounded-lg bg-navy-850 hover:bg-navy-800 text-slate-200 border border-navy-700 transition-colors text-xs font-medium"
                >
                  Pitch Your Idea
                </Link>
              </div>

              <div className="pt-6 border-t border-navy-800/80 flex items-center gap-8 text-xs text-slate-400">
                <div>
                  <span className="block text-white font-medium">Deterministic Scoring</span>
                  <span className="text-[11px] text-slate-500">Formulas you can defend</span>
                </div>
                <div className="w-px h-6 bg-navy-800" />
                <div>
                  <span className="block text-white font-medium">Verified Documents</span>
                  <span className="text-[11px] text-slate-500">PDF & presentation deck vault</span>
                </div>
                <div className="w-px h-6 bg-navy-800" />
                <div>
                  <span className="block text-white font-medium">Virtual Shark Tank</span>
                  <span className="text-[11px] text-slate-500">Scheduled syndicate pitching</span>
                </div>
              </div>
              <div className="pt-1">
                <a
                  href="#opportunities"
                  className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-emerald-300 transition-colors"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-navy-700 text-emerald-300">↓</span>
                  Scroll to explore opportunities
                </a>
              </div>
            </div>

            {/* Right: Ideologist physics-meets-business brand mark */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="relative w-full max-w-[470px] aspect-square max-h-[470px] flex items-center justify-center overflow-hidden rounded-[2rem] border border-navy-800/80 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.10)_0%,rgba(10,15,27,0.35)_42%,rgba(7,10,18,0.15)_72%)]">
                {/* Quiet coordinate grid gives the mark a crafted, scientific feel */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-[0.14]"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(100,116,139,.25) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,.25) 1px, transparent 1px)',
                    backgroundSize: '34px 34px',
                    maskImage: 'radial-gradient(ellipse at center, black 15%, transparent 76%)'
                  }}
                />

                <svg
                  viewBox="0 0 440 440"
                  role="img"
                  aria-label="Ideologist logo: an orbital physics symbol with an upward business growth trajectory"
                  className="relative z-10 w-[88%] h-[88%] overflow-visible"
                  fill="none"
                >
                  <defs>
                    <linearGradient id="ideoOrbit" x1="70" y1="70" x2="370" y2="365" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#F4C66A" />
                      <stop offset=".48" stopColor="#34D399" />
                      <stop offset="1" stopColor="#0F766E" />
                    </linearGradient>
                    <linearGradient id="ideoCore" x1="160" y1="140" x2="285" y2="290" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#F8FAFC" />
                      <stop offset="1" stopColor="#9CA3AF" />
                    </linearGradient>
                    <radialGradient id="ideoGlow" cx="0" cy="0" r="1" gradientTransform="translate(220 220) rotate(90) scale(125)" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#10B981" stopOpacity=".2" />
                      <stop offset="1" stopColor="#10B981" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  <circle cx="220" cy="220" r="150" fill="url(#ideoGlow)" />
                  <circle cx="220" cy="220" r="139" stroke="#334155" strokeOpacity=".55" strokeDasharray="2 10" />
                  <ellipse cx="220" cy="220" rx="145" ry="58" stroke="url(#ideoOrbit)" strokeWidth="2.2" transform="rotate(-38 220 220)" opacity=".95" />
                  <ellipse cx="220" cy="220" rx="145" ry="58" stroke="#64748B" strokeOpacity=".65" strokeWidth="1.2" transform="rotate(42 220 220)" />
                  <ellipse cx="220" cy="220" rx="115" ry="43" stroke="#34D399" strokeOpacity=".45" strokeWidth="1.2" transform="rotate(90 220 220)" />

                  {/* Central idea / mass */}
                  <circle cx="220" cy="220" r="55" fill="#0D1725" stroke="#334155" strokeWidth="1.5" />
                  <circle cx="220" cy="220" r="43" stroke="#34D399" strokeOpacity=".45" />
                  <path d="M196 238V202L220 186L244 202V238" stroke="url(#ideoCore)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M205 238V215H235V238M215 238V224H225V238" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M188 248H252" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />

                  {/* Business trajectory: a clear upward path, not a generic chart */}
                  <path d="M103 290C139 280 158 261 182 249C207 236 227 223 246 199C261 181 279 158 309 139" stroke="#071018" strokeWidth="12" strokeLinecap="round" />
                  <path d="M103 290C139 280 158 261 182 249C207 236 227 223 246 199C261 181 279 158 309 139" stroke="url(#ideoOrbit)" strokeWidth="4" strokeLinecap="round" />
                  <path d="M286 139H309V162" stroke="#F4C66A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="103" cy="290" r="5" fill="#F4C66A" />
                  <circle cx="182" cy="249" r="4" fill="#34D399" />
                  <circle cx="246" cy="199" r="4" fill="#34D399" />
                  <circle cx="309" cy="139" r="6" fill="#F4C66A" stroke="#0D1322" strokeWidth="3" />

                  {/* Orbiting particles */}
                  <circle cx="101" cy="166" r="5" fill="#34D399" />
                  <circle cx="339" cy="257" r="4" fill="#F4C66A" />
                  <circle cx="273" cy="333" r="3" fill="#64748B" />
                  <circle cx="154" cy="103" r="3" fill="#64748B" />
                </svg>

                <div className="absolute bottom-7 left-0 right-0 text-center px-5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-300">
                    IDEOLOGIST
                  </div>
                  <div className="mt-2 text-sm sm:text-base text-slate-200 font-medium tracking-tight">
                    Where ideas find their trajectory.
                  </div>
                  <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-slate-500">
                    Business • Physics • Possibility
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Opportunities Section: Varied Editorial Layout */}
      <section id="opportunities" className="scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-navy-750 pb-4 mb-8">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
              Marketplace Pipeline
            </span>
            <h2 className="text-2xl font-serif font-normal text-white mt-1">
              Curated Startup Opportunities
            </h2>
          </div>

          <Link
            to="/discover"
            className="text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1 group"
          >
            <span>Browse Complete Directory</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <SkeletonLoader count={3} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Lead highlight card (7 cols) */}
            {featured && (
              <div className="lg:col-span-7 panel-card rounded-xl p-6 sm:p-7 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-teal-300 uppercase tracking-wide">
                        {featured.industry}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-xs text-slate-400">
                        {featured.stage}
                      </span>
                    </div>

                    <ViabilityMeter score={featured.viability_score} size="md" />
                  </div>

                  <div>
                    <Link to={`/ideas/${featured.id}`} className="hover:text-teal-300 transition-colors">
                      <h3 className="text-xl font-semibold text-white tracking-tight">
                        {featured.title}
                      </h3>
                    </Link>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                      {featured.tagline}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-lg bg-navy-900 border border-navy-800 text-xs">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold mb-1">
                        Core Problem
                      </span>
                      <p className="text-slate-300 text-xs line-clamp-3 leading-relaxed">
                        {featured.problem}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-navy-900 border border-navy-800 text-xs">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold mb-1">
                        Proposed Moat
                      </span>
                      <p className="text-slate-300 text-xs line-clamp-3 leading-relaxed">
                        {featured.solution}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-navy-750 flex items-center justify-between mt-6">
                  <div className="flex items-center gap-6 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Ask</span>
                      <span className="font-semibold text-white">
                        ₹{(featured.funding_target / 100000).toFixed(1)} Lakh ({featured.equity_offered}%)
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">City</span>
                      <span className="text-slate-300 font-medium">{featured.target_city}</span>
                    </div>
                  </div>

                  <Link
                    to={`/ideas/${featured.id}`}
                    className="px-4 py-2 rounded-lg bg-navy-850 hover:bg-navy-800 text-slate-200 border border-navy-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <span>Inspect Full Pitch</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* Secondary compact list (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {secondaryList.map((idea) => (
                <div key={idea.id} className="panel-card rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className="text-teal-300 font-medium uppercase tracking-wide">
                        {idea.industry}
                      </span>
                      <span className="text-slate-400">{idea.target_city}</span>
                    </div>

                    <Link to={`/ideas/${idea.id}`} className="hover:text-teal-300 transition-colors">
                      <h4 className="text-sm font-semibold text-white tracking-tight">
                        {idea.title}
                      </h4>
                    </Link>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5 leading-relaxed">
                      {idea.tagline}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-navy-750 flex items-center justify-between mt-3 text-xs">
                    <span className="text-slate-300">
                      ₹{(idea.funding_target / 100000).toFixed(1)}L ({idea.equity_offered}%)
                    </span>

                    <div className="flex items-center gap-2">
                      <ViabilityMeter score={idea.viability_score} size="sm" showLabel={false} />
                      <Link
                        to={`/ideas/${idea.id}`}
                        className="text-slate-400 hover:text-white p-1"
                        title="Inspect Pitch"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Editorial Methodology Section: 3 Clear Steps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-navy-750 pb-4 mb-10">
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
            System Design
          </span>
          <h2 className="text-2xl font-serif font-normal text-white mt-1">
            The Founder-to-Investor Workflow
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
          <div className="space-y-3">
            <span className="font-mono text-xs text-teal-400 font-semibold block">01 / SUBMIT & VALIDATE</span>
            <h3 className="text-base font-semibold text-white">Structured Financial Feasibility</h3>
            <p className="text-slate-400 leading-relaxed font-normal">
              Founders enter operational cost inputs, revenue estimates, and upload official presentation decks. The deterministic scoring algorithm checks cashflow sustainability without relying on black-box claims.
            </p>
          </div>

          <div className="space-y-3">
            <span className="font-mono text-xs text-blue-400 font-semibold block">02 / DISCOVERY & BENCHMARKING</span>
            <h3 className="text-base font-semibold text-white">Location Intelligence & Diligence</h3>
            <p className="text-slate-400 leading-relaxed font-normal">
              Syndicates explore curated opportunities with OpenStreetMap cluster embeds and regional operating cost indices, previewing PDF decks directly inside browser viewers.
            </p>
          </div>

          <div className="space-y-3">
            <span className="font-mono text-xs text-amber-400 font-semibold block">03 / SYNDICATE ALLOCATION</span>
            <h3 className="text-base font-semibold text-white">Virtual Shark Tank & Inquiries</h3>
            <p className="text-slate-400 leading-relaxed font-normal">
              Approved startups participate in scheduled pitching events with real-time Q&A threads and direct investor meeting requests to coordinate follow-on diligence.
            </p>
          </div>
        </div>
      </section>

      {/* Transparent Viability Breakdown Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="panel rounded-2xl p-8 sm:p-10 space-y-6">
          <div className="max-w-2xl">
            <span className="text-[10px] uppercase font-semibold text-teal-300 tracking-wider block">
              Transparent Scoring Engine
            </span>
            <h2 className="text-2xl font-serif font-normal text-white mt-1">
              The Four Auditable Pillars of Viability
            </h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed font-normal">
              Unlike opaque neural networks or arbitrary ratings, Ideologist evaluates every startup against four mathematically verifiable benchmarks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs pt-2">
            <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-1.5">
              <span className="text-teal-400 font-semibold font-mono">35% WEIGHT</span>
              <h4 className="text-sm font-semibold text-white">Profitability Margin</h4>
              <p className="text-[11px] text-slate-400 font-mono">
                (Monthly Profit / Revenue) × 100
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                Rewards sustainable unit cashflow and operating efficiency.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-1.5">
              <span className="text-blue-400 font-semibold font-mono">25% WEIGHT</span>
              <h4 className="text-sm font-semibold text-white">Break-Even Velocity</h4>
              <p className="text-[11px] text-slate-400 font-mono">
                Startup Cost / Net Monthly Profit
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                Measures capital recovery timeline; horizons under 18 months score highest.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-1.5">
              <span className="text-amber-400 font-semibold font-mono">20% WEIGHT</span>
              <h4 className="text-sm font-semibold text-white">Funding Feasibility</h4>
              <p className="text-[11px] text-slate-400 font-mono">
                Runway Capital vs. Equity Ask
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                Ensures requested funding covers runway without excessive dilution.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-1.5">
              <span className="text-slate-300 font-semibold font-mono">20% WEIGHT</span>
              <h4 className="text-sm font-semibold text-white">Market Dynamics</h4>
              <p className="text-[11px] text-slate-400 font-mono">
                (Demand × 0.6) + (100 - Comp × 0.4)
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                Balances sector customer demand against competitive rivalry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Shark Tank Pitch Events Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-navy-750 pb-4 mb-6">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
              Virtual Pitching Arena
            </span>
            <h2 className="text-2xl font-serif font-normal text-white mt-1">
              Scheduled Pitching Sessions
            </h2>
          </div>

          <Link
            to="/pitch-events"
            className="text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1 group"
          >
            <span>View All Sessions</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((ev) => (
            <div key={ev.id} className="panel-card rounded-xl p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                    ev.status === 'Live Demo' 
                      ? 'bg-teal-950 text-teal-300 border border-teal-800' 
                      : 'bg-navy-850 text-slate-300 border border-navy-750'
                  }`}>
                    {ev.status}
                  </span>
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {ev.event_date}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-white tracking-tight">
                  {ev.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                  {ev.description}
                </p>
              </div>

              <div className="pt-3 border-t border-navy-750 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  {ev.approved_startups_count || 0} Startups Slotted
                </span>
                <Link
                  to="/pitch-events"
                  className="font-medium text-slate-200 hover:text-white flex items-center gap-1"
                >
                  <span>Enter Session</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Restrained Editorial CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="panel rounded-xl p-8 sm:p-12 text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-serif font-normal text-white tracking-tight">
            Ready to evaluate or discover your next venture?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            Join founders and angel syndicates building with transparent unit economics and structured due diligence.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-lg bg-ivory text-navy-950 hover:bg-white text-xs font-medium transition-colors"
            >
              Create Account
            </Link>
            <Link
              to="/discover"
              className="px-5 py-2.5 rounded-lg bg-navy-850 hover:bg-navy-800 text-slate-200 border border-navy-700 text-xs font-medium transition-colors"
            >
              Explore Directory
            </Link>
          </div>
        </div>
      </section>
      
      {/* Legends of Entrepreneurship */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-emerald-400 mb-3">
              Inspiration for the Next Generation
            </p>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              Great Minds.{" "}
              <span className="text-emerald-400">Bold Ideas.</span>
              <br className="hidden sm:block" /> Lasting Impact.
            </h2>

            <p className="mt-4 text-sm sm:text-base text-slate-400 leading-relaxed">
              Discover the visionaries who transformed industries and turned
              ambitious ideas into businesses that shaped the world.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[
              {
                name: "John D. Rockefeller",
                field: "OIL & ENERGY",
                initials: "JR",
                description:
                  "Built Standard Oil through large-scale integration, reshaping the modern oil industry.",
              },
              {
                name: "Andrew Carnegie",
                field: "STEEL & INDUSTRY",
                initials: "AC",
                description:
                  "Advanced industrial growth through efficient steel production and cost-control innovations.",
              },
              {
                name: "Henry Ford",
                field: "AUTOMOTIVE",
                initials: "HF",
                description:
                  "Popularized assembly-line manufacturing, making automobiles more accessible to everyday people.",
              },
              {
                name: "Steve Jobs",
                field: "TECHNOLOGY & DESIGN",
                initials: "SJ",
                description:
                  "Co-founded Apple and transformed personal computing, music and mobile technology.",
              },
              {
                name: "Elon Musk",
                field: "INNOVATION & ENGINEERING",
                initials: "EM",
                description:
                  "Built and scaled ambitious ventures across electric vehicles and space exploration.",
              },
              {
                name: "Thomas Edison",
                field: "INVENTION & R&D",
                initials: "TE",
                description:
                  "Helped commercialize inventions and develop electrical technologies into viable businesses.",
              },
              {
                name: "Walt Disney",
                field: "ENTERTAINMENT & MEDIA",
                initials: "WD",
                description:
                  "Turned storytelling and animation into a global entertainment and theme-park business.",
              },
            ].map((person) => (
              <article
                key={person.name}
                className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0D1322] p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:bg-[#101B2B]"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-lg font-bold text-emerald-400">
                    {person.initials}
                  </div>

                  <span className="text-[10px] font-semibold tracking-wider text-slate-500">
                    ENTREPRENEER
                  </span>
                </div>

                <p className="text-[10px] font-bold tracking-[0.16em] text-emerald-400 mb-2">
                  {person.field}
                </p>

                <h3 className="text-lg font-semibold text-white leading-snug mb-3">
                  {person.name}
                </h3>

                <p className="text-sm text-slate-400 leading-6">
                  {person.description}
                </p>

                <div className="mt-5 h-px w-10 bg-emerald-500/50 transition-all duration-300 group-hover:w-16" />
              </article>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
