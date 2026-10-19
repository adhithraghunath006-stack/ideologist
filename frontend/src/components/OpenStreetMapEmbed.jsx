import React, { useState } from 'react';
import { MapPin, ExternalLink, TrendingUp, Users, Building } from 'lucide-react';

export default function OpenStreetMapEmbed({ locationInsight, city }) {
  const [mapError, setMapError] = useState(false);

  if (!locationInsight || !locationInsight.profile) {
    return (
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
        <MapPin className="w-6 h-6 text-slate-500 mx-auto mb-2" />
        Location data loading for {city}...
      </div>
    );
  }

  const { profile, industryFit, mapUrl, externalMapUrl, recommendedAlternatives } = locationInsight;

  return (
    <div className="space-y-4">
      {/* Map Embed or Fallback */}
      <div className="relative w-full h-64 rounded-xl overflow-hidden border border-slate-800 bg-navy-950">
        {!mapError ? (
          <iframe
            src={mapUrl}
            title={`Location Map: ${profile.name}`}
            className="w-full h-full border-0 filter contrast-[0.95] opacity-90 hover:opacity-100 transition-opacity"
            onError={() => setMapError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-slate-900">
            <MapPin className="w-8 h-8 text-brand-emerald mb-2" />
            <p className="text-sm font-semibold text-white">{profile.name}, {profile.state}</p>
            <p className="text-xs text-slate-400 mt-1">Interactive OpenStreetMap loaded offline.</p>
          </div>
        )}

        <div className="absolute bottom-2 right-2 z-10">
          <a
            href={externalMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg bg-navy-900/90 backdrop-blur-md border border-slate-700 text-[11px] font-medium text-slate-200 hover:text-white flex items-center gap-1 shadow-lg"
          >
            <span>OpenStreetMap</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* City Economic Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <Building className="w-3.5 h-3.5 text-brand-blue" />
            <span>Classification</span>
          </div>
          <span className="font-bold text-white">{profile.tier}</span>
          <span className="block text-[10px] text-slate-400 mt-0.5">{profile.state}</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-brand-amber" />
            <span>Cost Index</span>
          </div>
          <span className="font-bold text-white">{profile.costIndex}x Benchmark</span>
          <span className="block text-[10px] text-slate-400 mt-0.5">Commercial Overhead</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <Users className="w-3.5 h-3.5 text-brand-emerald" />
            <span>Talent Index</span>
          </div>
          <span className="font-bold text-white">{profile.techTalentIndex} / 100</span>
          <span className="block text-[10px] text-slate-400 mt-0.5">Engineering Density</span>
        </div>
      </div>

      {/* Cluster Analysis & Summary */}
      <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 font-medium">Industry Cluster Alignment:</span>
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20">
            {industryFit}
          </span>
        </div>
        <p className="text-slate-300 leading-relaxed text-[11px]">
          {profile.summary}
        </p>

        {recommendedAlternatives && recommendedAlternatives.length > 0 && (
          <div className="pt-2 border-t border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
              Alternative High-Cluster Cities:
            </span>
            <div className="flex flex-wrap gap-2">
              {recommendedAlternatives.map((alt, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[10px] border border-slate-700/60"
                  title={alt.reason}
                >
                  📍 {alt.name} ({alt.tier} • {alt.costIndex}x cost)
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="text-[10px] text-slate-400 italic">
        * Location benchmarks are illustrative demonstration indicators based on regional cost indices.
      </p>
    </div>
  );
}
