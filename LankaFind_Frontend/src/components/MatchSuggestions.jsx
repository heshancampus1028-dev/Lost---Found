import React, { useState, useEffect } from 'react';
import api, { getImageUrl } from '../api/axios';
import { useLanguage } from '../context/LanguageContext';

// Shows possible matches for a given item (a lost item's matches are found items, and vice-versa).
// autoFetch=true loads matches immediately (used right after posting a new report).
// autoFetch=false shows a button so the user can check on demand (used on My Reports).
function MatchSuggestions({ itemId, autoFetch = false, accentColor = 'blue' }) {
  const { t } = useLanguage();
  const [matches, setMatches] = useState(null); // null = not fetched yet
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(autoFetch);

  // Pill-style button, color-matched to the item type (red for lost, emerald for found)
  const buttonClass = {
    blue: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 border-blue-100 dark:border-blue-500/30',
    red: 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border-red-100 dark:border-red-500/30',
    emerald: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border-emerald-100 dark:border-emerald-500/30'
  }[accentColor] || 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 border-blue-100 dark:border-blue-500/30';

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/items/${itemId}/matches`);
      setMatches(response.data);
    } catch (err) {
      console.error('Error fetching matches:', err);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch && itemId) {
      fetchMatches();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId, autoFetch]);

  const handleToggle = () => {
    if (!expanded && matches === null) {
      fetchMatches();
    }
    setExpanded((v) => !v);
  };

  return (
    <div className="mt-3">
      {!autoFetch && (
        <button
          type="button"
          onClick={handleToggle}
          className={`text-xs font-semibold rounded-full px-3 py-1.5 border transition ${buttonClass}`}
        >
          {expanded ? (t('hideMatches') || 'Hide possible matches') : (t('checkMatches') || 'Check possible matches')}
        </button>
      )}

      {expanded && (
        <div className="mt-2">
          {loading && (
            <p className="text-xs text-gray-400 dark:text-gray-500">{t('searchingMatches') || 'Searching for matches...'}</p>
          )}

          {!loading && matches !== null && matches.length === 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500">{t('noMatchesFound') || 'No possible matches found yet.'}</p>
          )}

          {!loading && matches !== null && matches.length > 0 && (
            <div className="space-y-2">
              {autoFetch && (
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {t('possibleMatchesFound') || 'Possible matches found'} ({matches.length})
                </p>
              )}
              {matches.map((m) => (
                <div
                  key={m._id}
                  className="flex gap-3 items-center bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl p-2"
                >
                  {m.images && m.images.length > 0 ? (
                    <img
                      src={getImageUrl(m.images[0])}
                      alt={m.title}
                      className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-400 dark:text-slate-500 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <circle cx="8.5" cy="10" r="1.5" />
                        <path d="M21 15l-5-5-9 9" />
                      </svg>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{m.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{m.location} · {new Date(m.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">{m.contact}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MatchSuggestions;
