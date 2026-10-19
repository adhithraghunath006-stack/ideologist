import React from 'react';

export default function SkeletonLoader({ count = 3, type = 'card' }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="p-6 rounded-2xl bg-navy-900/60 border border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-5 w-24 bg-slate-800 rounded-full"></div>
            <div className="h-8 w-8 bg-slate-800 rounded-full"></div>
          </div>
          <div className="h-6 w-3/4 bg-slate-800 rounded-lg"></div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-slate-800/60 rounded"></div>
            <div className="h-4 w-5/6 bg-slate-800/60 rounded"></div>
          </div>
          <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
            <div className="h-6 w-20 bg-slate-800 rounded"></div>
            <div className="h-8 w-8 bg-slate-800 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
