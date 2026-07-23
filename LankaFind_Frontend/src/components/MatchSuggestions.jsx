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

  const ringClass = {
    blue: 'text-blue-600 dark:text-blue-400',
    red: 'text-red-600 dark:text-red-400',
    emerald: 'text-emerald-600 dark:text-emerald-400'
  }[accentColor] || 'text-blue-600 dark:text-blue-400';

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
          className={`text-xs font-semibold ${ringClass} hover:underline flex items-center gap-1`}
        >
          🔍 {expanded ? (t('hideMatches') || 'Hide possible matches') : (t('checkMatches') || 'Check for possible matches')}
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
                  ✨ {t('possibleMatchesFound') || 'Possible matches found'} ({matches.length})
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
                    <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-lg flex-shrink-0">
                      📦
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{m.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">📍 {m.location} · {new Date(m.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">📞 {m.contact}</span>
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
