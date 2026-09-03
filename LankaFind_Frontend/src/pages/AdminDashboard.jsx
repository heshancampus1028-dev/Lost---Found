import React, { useState, useEffect } from 'react';
import api, { getImageUrl } from '../api/axios';
import PageHeader from '../components/PageHeader';

// Simple horizontal bar row used for the status/category breakdowns below
// (kept as plain divs instead of a charting library, to match the project's minimal style)
function BarRow({ label, count, max, colorClass }) {
  const widthPercent = max > 0 ? Math.max((count / max) * 100, 4) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-28 shrink-0 text-gray-600 dark:text-gray-300">{label}</span>
      <div className="flex-1 bg-gray-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${widthPercent}%` }} />
      </div>
      <span className="w-8 text-right font-semibold text-gray-700 dark:text-gray-200">{count}</span>
    </div>
  );
}

const STATUS_COLORS = {
  Pending: 'bg-gray-400 dark:bg-slate-500',
  Matched: 'bg-blue-500',
  Claimed: 'bg-amber-500',
  Returned: 'bg-emerald-500'
};
const CATEGORY_COLORS = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-amber-500', 'bg-teal-500'];

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError('Failed to load dashboard statistics.');
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await api.get('/admin/items');
      setItems(response.data);
    } catch (err) {
      console.error('Error fetching all items:', err);
    } finally {
      setLoadingItems(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchItems();
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this item permanently? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/items/${id}`);
      setItems(items.filter((item) => item._id !== id));
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('Failed to delete item.');
    }
  };

  const statusEntries = stats ? Object.entries(stats.byStatus) : [];
  const categoryEntries = stats ? Object.entries(stats.byCategory) : [];
  const maxStatusCount = Math.max(1, ...statusEntries.map(([, c]) => c));
  const maxCategoryCount = Math.max(1, ...categoryEntries.map(([, c]) => c));
  const maxTrendCount = stats ? Math.max(1, ...stats.trend.map((t) => t.count)) : 1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors pt-[38px] pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">

        <PageHeader icon="🛠️" title="Admin Dashboard" subtitle="Platform-wide statistics and item moderation." accent="from-amber-600 to-orange-500" />

        {error && <div className="p-3 bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-300 text-sm rounded-xl text-center font-medium">{error}</div>}

        {/* Summary cards */}
        {loadingStats ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">Loading statistics...</div>
        ) : stats && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <StatCard label="Total Reports" value={stats.totalItems} accent="text-gray-800 dark:text-white" />
              <StatCard label="Lost" value={stats.totalLost} accent="text-red-600 dark:text-red-400" />
              <StatCard label="Found" value={stats.totalFound} accent="text-emerald-600 dark:text-emerald-400" />
              <StatCard label="Users" value={stats.totalUsers} accent="text-blue-600 dark:text-blue-400" />
              <StatCard label="Recovery Rate" value={`${stats.recoveryRate}%`} accent="text-amber-600 dark:text-amber-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status breakdown */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm dark:shadow-black/20 border border-gray-100 dark:border-slate-800">
                <h2 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4">Reports by Status</h2>
                <div className="space-y-3">
                  {statusEntries.map(([status, count]) => (
                    <BarRow key={status} label={status} count={count} max={maxStatusCount} colorClass={STATUS_COLORS[status] || 'bg-gray-400'} />
                  ))}
                </div>
              </div>

              {/* Category breakdown */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm dark:shadow-black/20 border border-gray-100 dark:border-slate-800">
                <h2 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4">Reports by Category</h2>
                <div className="space-y-3">
                  {categoryEntries.map(([category, count], i) => (
                    <BarRow key={category} label={category} count={count} max={maxCategoryCount} colorClass={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </div>
              </div>
            </div>

            {/* 14-day trend */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm dark:shadow-black/20 border border-gray-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4">Reports in the Last 14 Days</h2>
              {stats.trend.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500">No reports in this period.</p>
              ) : (
                <div className="flex items-end gap-2">
                  {stats.trend.map((t) => (
                    <div key={t.date} className="flex-1 flex flex-col items-center gap-1">
                      {/* Fixed-height wrapper (h-24 = 96px) gives the bar below a definite
                          height to resolve its percentage against - without this, a
                          percentage height on a flex-column child collapses to 0. */}
                      <div className="w-full h-24 flex items-end">
                        <div
                          className="w-full bg-blue-500 dark:bg-amber-500 rounded-t-md min-h-[4px]"
                          style={{ height: `${Math.max((t.count / maxTrendCount) * 100, 6)}%` }}
                          title={`${t.date}: ${t.count}`}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 rotate-0 whitespace-nowrap">{t.date.slice(5)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Item moderation table */}
        <div>
          <h2 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4">All Reports ({items.length})</h2>

          {loadingItems ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">Loading items...</div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-black/20 border border-gray-100 dark:border-slate-800 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-slate-800">
                    <th className="p-3 font-semibold">Item</th>
                    <th className="p-3 font-semibold">Type</th>
                    <th className="p-3 font-semibold">Category</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold">Posted By</th>
                    <th className="p-3 font-semibold">Date</th>
                    <th className="p-3 font-semibold"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item._id} className="border-b border-gray-50 dark:border-slate-800 last:border-0">
                      <td className="p-3 flex items-center gap-2">
                        {item.images && item.images.length > 0 ? (
                          <img src={getImageUrl(item.images[0])} alt={item.title} className="w-8 h-8 object-cover rounded-lg" />
                        ) : (
                          <span className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-sm">📦</span>
                        )}
                        <span className="font-medium text-gray-800 dark:text-white">{item.title}</span>
                      </td>
                      <td className="p-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.status === 'lost' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-green-50 dark:bg-emerald-500/10 text-green-600 dark:text-emerald-400'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3 text-gray-600 dark:text-gray-300">{item.category}</td>
                      <td className="p-3 text-gray-600 dark:text-gray-300">{item.reportStatus || 'Pending'}</td>
                      <td className="p-3 text-gray-500 dark:text-gray-400">{item.postedBy?.name || '—'}</td>
                      <td className="p-3 text-gray-400 dark:text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 font-semibold text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Registered users */}
        <div>
          <h2 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4">Users ({users.length})</h2>

          {loadingUsers ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">Loading users...</div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-black/20 border border-gray-100 dark:border-slate-800 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-slate-800">
                    <th className="p-3 font-semibold">Name</th>
                    <th className="p-3 font-semibold">Email</th>
                    <th className="p-3 font-semibold">Role</th>
                    <th className="p-3 font-semibold">Reports Posted</th>
                    <th className="p-3 font-semibold">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b border-gray-50 dark:border-slate-800 last:border-0">
                      <td className="p-3 font-medium text-gray-800 dark:text-white">{u.name}</td>
                      <td className="p-3 text-gray-600 dark:text-gray-300">{u.email}</td>
                      <td className="p-3">
                        {u.isAdmin ? (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">Admin</span>
                        ) : (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400">User</span>
                        )}
                      </td>
                      <td className="p-3 text-gray-600 dark:text-gray-300">{u.reportCount}</td>
                      <td className="p-3 text-gray-400 dark:text-gray-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm dark:shadow-black/20 border border-gray-100 dark:border-slate-800 text-center">
      <p className={`text-2xl font-bold ${accent}`}>{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
    </div>
  );
}

export default AdminDashboard;
