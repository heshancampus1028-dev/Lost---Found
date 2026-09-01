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
// Matching, slightly stronger tone used for the editable status pill in the actions row
const STATUS_SELECT_STYLES = {
  Pending: 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-slate-600 focus:ring-gray-400',
  Matched: 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30 focus:ring-blue-400',
  Claimed: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30 focus:ring-amber-400',
  Returned: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30 focus:ring-emerald-400'
};
const STATUS_OPTIONS = ['Pending', 'Matched', 'Claimed', 'Returned'];

// Reusable card component for displaying a Lost/Found item
// showActions=true (used on the My Reports page) shows the status dropdown + Delete button
function ItemCard({ item, showActions = false, onStatusChange, onDelete, onEdit }) {
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
      {/* Image thumbnail - always a fixed h-40 slot so every card lines up,
          even when the report has no photo. A muted placeholder icon fills
          the space instead of leaving it blank or shrinking the card. */}
      {hasImage ? (
        <img
          src={getImageUrl(item.images[0])}
          alt={item.title}
          className="w-full h-40 object-cover"
        />
      ) : (
        <div className="w-full h-40 flex items-center justify-center bg-gray-100 dark:bg-slate-800 text-gray-300 dark:text-slate-600">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="8.5" cy="10" r="1.5" />
            <path d="M21 15l-5-5-9 9" />
          </svg>
        </div>
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

        <div className="mt-4 pt-3 border-t border-gray-50 dark:border-slate-800">
          {!showActions && (
            <div className="flex items-center justify-between gap-2 text-xs flex-wrap">
              {!item.verificationQuestion ? (
                item.contact ? (
                  <span className="text-blue-600 dark:text-blue-400 font-medium">📞 {item.contact}</span>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500 italic">{t('noContactProvided') || 'No contact number provided'}</span>
                )
              ) : (
                <ClaimVerification item={item} />
              )}

              {isAuthenticated && !isOwnItem && (
                <button
                  onClick={handleMessageClick}
                  className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 rounded-full px-3 py-1.5 transition"
                >
                  Message
                </button>
              )}
            </div>
          )}

          {showActions && (
            <div className="flex flex-col gap-3">
              {item.contact && (
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">📞 {item.contact}</span>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={reportStatus}
                  onChange={(e) => onStatusChange(item._id, e.target.value)}
                  className={`text-xs font-semibold rounded-full pl-3 pr-7 py-1.5 border focus:outline-none focus:ring-2 appearance-none bg-no-repeat bg-[right_0.6rem_center] ${STATUS_SELECT_STYLES[reportStatus]}`}
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23888'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.19l3.71-3.96a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E\")",
                    backgroundSize: '0.9em'
                  }}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <button
                  onClick={() => onEdit(item)}
                  className="text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-100 dark:border-blue-500/30 rounded-full px-3 py-1.5 transition"
                >
                  {t('editBtn') || 'Edit'}
                </button>

                <button
                  onClick={() => onDelete(item._id)}
                  className="text-xs font-semibold text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-100 dark:border-red-500/30 rounded-full px-3 py-1.5 transition"
                >
                  {t('deleteBtn') || 'Delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ItemCard;
