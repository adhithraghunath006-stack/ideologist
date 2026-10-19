import React from 'react';
import { Inbox, Compass, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  title = 'No records found',
  description = 'Try adjusting your search criteria or filters.',
  actionLabel,
  actionLink,
  onAction,
  icon: Icon = Inbox
}) {
  return (
    <div className="py-16 px-6 text-center rounded-2xl bg-navy-900/40 border border-slate-800/80 max-w-lg mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mx-auto mb-4 text-slate-400">
        <Icon className="w-7 h-7 text-brand-emerald" />
      </div>
      <h3 className="text-base font-bold text-white mb-1.5">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6 leading-relaxed">
        {description}
      </p>

      {actionLabel && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-emerald text-navy-950 text-xs font-semibold hover:bg-emerald-400 transition-colors shadow-md shadow-brand-emerald/10"
        >
          {actionLabel}
        </Link>
      )}

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-emerald text-navy-950 text-xs font-semibold hover:bg-emerald-400 transition-colors shadow-md shadow-brand-emerald/10"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
