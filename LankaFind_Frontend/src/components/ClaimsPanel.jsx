import React, { useState } from 'react';
import api from '../api/axios';
import { useLanguage } from '../context/LanguageContext';

// Shown on My Reports for found items that have a verification question set.
// Lets the owner (finder) see everyone who has tried to claim the item.
function ClaimsPanel({ itemId }) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const [claims, setClaims] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/claims/item/${itemId}`);
      setClaims(response.data);
    } catch (err) {
      console.error('Error fetching claims:', err);
      setClaims([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!expanded && claims === null) {
      fetchClaims();
    }
    setExpanded((v) => !v);
  };

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={handleToggle}
        className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
      >
        🔒 {expanded ? (t('hideClaims') || 'Hide claim requests') : (t('viewClaims') || 'View claim requests')}
      </button>

      {expanded && (
        <div className="mt-2 space-y-2">
          {loading && <p className="text-xs text-gray-400 dark:text-gray-500">{t('loadingItems')}</p>}

          {!loading && claims !== null && claims.length === 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500">{t('noClaimsYet') || 'No claim attempts yet.'}</p>
          )}

          {!loading && claims && claims.map((c) => (
            <div
              key={c._id}
              className={`text-xs rounded-xl p-2 border ${
                c.verified
                  ? 'bg-green-50 dark:bg-emerald-500/10 border-green-200 dark:border-emerald-500/30'
                  : 'bg-gray-50 dark:bg-slate-800/60 border-gray-200 dark:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={`font-semibold ${c.verified ? 'text-green-700 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-300'}`}>
                  {c.verified ? '✅ ' + (t('verified') || 'Verified') : '❌ ' + (t('notVerified') || 'Answer did not match')}
                </span>
                <span className="text-gray-400 dark:text-gray-500">{new Date(c.createdAt).toLocaleString()}</span>
              </div>
              {c.claimantName && <p className="text-gray-600 dark:text-gray-300">{c.claimantName}</p>}
              <p className="text-blue-600 dark:text-blue-400 font-medium">📞 {c.claimantContact}</p>
              <p className="text-gray-500 dark:text-gray-400 italic">"{c.answerGiven}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ClaimsPanel;
