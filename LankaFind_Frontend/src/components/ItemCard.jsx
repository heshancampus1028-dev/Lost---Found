import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../api/axios';
import ClaimVerification from './ClaimVerification';

// Color coding for each reportStatus value
const STATUS_STYLES = {
  Pending: 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700',
  Matched: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/30',
  Claimed: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/30',
  Returned: 'bg-green-50 dark:bg-emerald-500/10 text-green-600 dark:text-emerald-400 border-green-100 dark:border-emerald-500/30'
};
const STATUS_OPTIONS = ['Pending', 'Matched', 'Claimed', 'Returned'];

// Reusable card component for displaying a Lost/Found item
// showActions=true (used on the My Reports page) shows the status dropdown + Delete button
function ItemCard({ item, showActions = false, onStatusChange, onDelete }) {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isLost = item.status === 'lost';
  const reportStatus = item.reportStatus || 'Pending';
  const hasImage = item.images && item.images.length > 0;
  const isOwnItem = isAuthenticated && item.postedBy === user?.id;

  const handleMessageClick = () => {
    const params = new URLSearchParams({
      item: item._id,
      user: item.postedBy,
      title: item.title
    });
    navigate(`/messages?${params.toString()}`);
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-black/20 border flex flex-col justify-between hover:shadow-md dark:hover:border-amber-500/40 transition-colors overflow-hidden ${
        reportStatus === 'Returned' ? 'border-gray-100 dark:border-slate-700 opacity-60' : 'border-gray-100 dark:border-slate-700'
      }`}
    >
      {/* Image thumbnail, if the report has one */}
      {hasImage && (
        <img
          src={getImageUrl(item.images[0])}
          alt={item.title}
          className="w-full h-40 object-cover"
        />
      )}

      <div className="p-5 flex flex-col justify-between flex-1">
        <div>
          <div className="flex justify-between items-start mb-2 gap-2 flex-wrap">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                isLost
                  ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/30'
                  : 'bg-green-50 dark:bg-emerald-500/10 text-green-600 dark:text-emerald-400 border border-green-100 dark:border-emerald-500/30'
              }`}
            >
              {isLost ? t('badgeLost') : t('badgeFound')}
            </span>

            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[reportStatus]}`}>
              {reportStatus}
            </span>

            <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
              {new Date(item.createdAt).toLocaleDateString()}
            </span>
          </div>

          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
            <Link to={`/item/${item._id}`} className="hover:underline">{item.title}</Link>
          </h3>
          {item.category && (
            <span className="inline-block text-xs font-medium text-gray-500 dark:text-amber-300 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full px-2 py-0.5 mb-2">
              {item.category}
            </span>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-2">
            📍 <span className="font-medium text-gray-600 dark:text-gray-300">{item.location}</span>
          </p>
          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">{item.description}</p>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-50 dark:border-slate-800 flex items-center justify-between gap-2 text-xs flex-wrap">
          {showActions || !item.verificationQuestion ? (
            <span className="text-blue-600 dark:text-blue-400 font-medium">📞 {item.contact}</span>
          ) : (
            <ClaimVerification item={item} />
          )}

          {!showActions && isAuthenticated && !isOwnItem && (
            <button
              onClick={handleMessageClick}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              💬 {t('sendMessage') || 'Message'}
            </button>
          )}

          {showActions && (
            <div className="flex items-center gap-3">
              <select
                value={reportStatus}
                onChange={(e) => onStatusChange(item._id, e.target.value)}
                className="text-xs font-semibold border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button
                onClick={() => onDelete(item._id)}
                className="font-semibold text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition"
              >
                {t('deleteBtn')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ItemCard;
