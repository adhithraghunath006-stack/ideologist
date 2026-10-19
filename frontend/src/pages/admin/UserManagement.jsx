import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowLeft, Search, Shield, UserX, UserCheck, Mail, MapPin } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import SkeletonLoader from '../../components/SkeletonLoader';
import EmptyState from '../../components/EmptyState';

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getAllUsers({
        search,
        role: roleFilter,
        status: statusFilter
      });
      if (res.success && res.users) {
        setUsers(res.users);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, roleFilter, statusFilter]);

  const handleToggleStatus = async (user) => {
    if (user.id === currentUser.id) {
      addToast('Security restriction: You cannot suspend your own administrative account.', 'error');
      return;
    }

    try {
      const res = await api.toggleUserStatus(user.id);
      addToast(res.message, 'success');
      loadUsers();
    } catch (err) {
      addToast(err.message || 'Failed to toggle status.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-xs">
      <Link
        to="/admin/dashboard"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Admin Console</span>
      </Link>

      <div>
        <div className="flex items-center gap-2 text-brand-amber text-xs font-semibold uppercase tracking-wider mb-1">
          <Users className="w-4 h-4" />
          <span>Identity & Role Administration</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          User Account Directory
        </h1>
        <p className="text-slate-400 mt-1">
          Review registered founders and accredited investors. Manage platform account states.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-brand-emerald text-xs"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
        >
          <option value="All">All Roles</option>
          <option value="entrepreneur">Entrepreneurs</option>
          <option value="investor">Investors</option>
          <option value="admin">Administrators</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
        >
          <option value="All">All Account States</option>
          <option value="active">Active Only</option>
          <option value="suspended">Suspended Only</option>
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <SkeletonLoader count={3} />
      ) : users.length > 0 ? (
        <div className="rounded-2xl bg-navy-900 border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Base City</th>
                  <th className="p-4">Organization</th>
                  <th className="p-4">Account State</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {users.map((u) => {
                  const isCurrent = u.id === currentUser.id;
                  const roleStyles = {
                    admin: 'bg-brand-amber/20 text-brand-amber border-brand-amber/30',
                    entrepreneur: 'bg-brand-emerald/20 text-brand-emerald border-brand-emerald/30',
                    investor: 'bg-brand-blue/20 text-brand-blue border-brand-blue/30'
                  };

                  return (
                    <tr key={u.id} className="hover:bg-slate-950/40">
                      <td className="p-4">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{u.name}</span>
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                              (You)
                            </span>
                          )}
                        </div>
                        <span className="text-slate-400 text-[11px] block">{u.email}</span>
                      </td>

                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${roleStyles[u.role]}`}>
                          {u.role}
                        </span>
                      </td>

                      <td className="p-4 text-slate-300">
                        {u.city || 'Not Specified'}
                      </td>

                      <td className="p-4 text-slate-300">
                        {u.company || 'Independent'}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            u.status === 'active'
                              ? 'bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>

                      <td className="p-4 text-slate-400 text-[11px]">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>

                      <td className="p-4 text-right">
                        {!isCurrent && (
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                              u.status === 'active'
                                ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                                : 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20 hover:bg-brand-emerald/20'
                            }`}
                          >
                            {u.status === 'active' ? 'Suspend Account' : 'Reactivate Account'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No users match your criteria"
          description="Try clearing search query or selecting a different role filter."
          icon={Users}
        />
      )}
    </div>
  );
}
