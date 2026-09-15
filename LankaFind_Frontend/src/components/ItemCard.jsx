import React, { useState, useEffect } from 'react';
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

// Inserts a Cloudinary transformation segment into an existing Cloudinary URL
// so the browser downloads a small, compressed, auto-format thumbnail instead
// of the original full-size upload. A card thumbnail never needs more than
// ~400px wide, so there's no reason to ship a 3000px original over the network.
// Non-Cloudinary URLs (or anything unexpected) are returned unchanged - this
// only ever narrows what gets requested, never breaks a working image.
function getThumbnailUrl(url) {
  if (!url || !url.includes('/upload/')) return url;
  return url.replace('/upload/', '/upload/w_400,q_auto,f_auto/');
}

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

  // Full-size image viewer (lightbox). The card only ever loads a small ~400px
  // thumbnail, so this fetches the full-resolution Cloudinary original instead
  // when the user actually wants to look at the photo properly.
  const [lightboxIndex, setLightboxIndex] = useState(null); // null = closed
  const images = item.images || [];
  const isLightboxOpen = lightboxIndex !== null;

  const closeLightbox = () => setLightboxIndex(null);
  const showPrev = () => setLightboxIndex((i) => (i - 1 + images.length) % images.length);
  const showNext = () => setLightboxIndex((i) => (i + 1) % images.length);

  // Escape closes, arrow keys move between photos when there's more than one.
  // Body scroll is locked while open so the page behind doesn't move.
  useEffect(() => {
    if (!isLightboxOpen) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (images.length > 1 && e.key === 'ArrowLeft') showPrev();
      if (images.length > 1 && e.key === 'ArrowRight') showNext();
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLightboxOpen, images.length]);

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
        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          className="relative w-full h-40 group cursor-zoom-in overflow-hidden"
          aria-label={`View full size photo of ${item.title}`}
        >
          <img
            src={getThumbnailUrl(getImageUrl(item.images[0]))}
            alt={item.title}
            loading="lazy"
            decoding="async"
            className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Hover hint so it's discoverable that the photo can be enlarged */}
          <span className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow"
            >
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="M21 21l-4.3-4.3M11 8v6M8 11h6" />
            </svg>
          </span>
          {images.length > 1 && (
            <span className="absolute bottom-2 right-2 text-[10px] font-semibold text-white bg-black/60 rounded-full px-2 py-0.5">
              1 / {images.length}
            </span>
          )}
        </button>
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

        <div className="mt-4 pt-3 border-t border-gray-50 dark:border-slate-800 flex items-center justify-between gap-2 text-xs flex-wrap">
          {showActions || !item.verificationQuestion ? (
            item.contact ? (
              <span className="text-blue-600 dark:text-blue-400 font-medium">📞 {item.contact}</span>
            ) : (
              <span className="text-gray-400 dark:text-gray-500 italic">{t('noContactProvided') || 'No contact number provided'}</span>
            )
          ) : (
            <ClaimVerification item={item} />
          )}

          {!showActions && isAuthenticated && !isOwnItem && (
            <button
              onClick={handleMessageClick}
              className="tap-scale text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/30 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition"
            >
              {t('sendMessage') || 'Message'}
            </button>
          )}

          {!showActions && isOwnItem && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-slate-700">
              {t('yourReport') || 'Your Report'}
            </span>
          )}

          {!showActions && !isAuthenticated && (
            <Link
              to="/login"
              className="tap-scale text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-100 dark:hover:border-blue-500/30 transition"
            >
              {t('loginToMessage') || 'Login to message'}
            </Link>
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
                onClick={() => onEdit(item)}
                className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition"
              >
                {t('editBtn') || 'Edit'}
              </button>
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

      {/* Full-size image viewer. Clicking the backdrop or the X closes it;
          with multiple photos, arrows (or the keyboard) move between them. */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[10000] bg-black/90 flex items-center justify-center p-4"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Close"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); showPrev(); }}
                aria-label="Previous photo"
                className="absolute left-3 sm:left-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); showNext(); }}
                aria-label="Next photo"
                className="absolute right-3 sm:right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* stopPropagation so clicking the photo itself doesn't close the viewer */}
          <img
            src={getImageUrl(images[lightboxIndex])}
            alt={item.title}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
          />

          <div className="absolute bottom-5 left-0 right-0 text-center text-white/80 text-sm px-4">
            <p className="font-semibold">{item.title}</p>
            {images.length > 1 && (
              <p className="text-xs text-white/60 mt-0.5">{lightboxIndex + 1} / {images.length}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Wrapped in memo so a card only re-renders when its own props actually
// change - without this, updating one item in a 20-card list state array
// causes React to re-render all 20 cards, not just the one that changed.
export default React.memo(ItemCard);
