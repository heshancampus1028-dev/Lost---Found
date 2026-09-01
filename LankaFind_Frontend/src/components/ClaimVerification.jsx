import React, { useState } from 'react';
import api from '../api/axios';
import { useLanguage } from '../context/LanguageContext';

// Used on found-item cards that have a verificationQuestion set.
// The claimant answers the finder's secret question; contact is only revealed if correct.
function ClaimVerification({ item }) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const [claimantName, setClaimantName] = useState('');
  const [claimantContact, setClaimantContact] = useState('');
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { verified, msg, contact }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!claimantContact || !answer) return;

    setSubmitting(true);
    setResult(null);
    try {
      const response = await api.post('/claims', {
        itemId: item._id,
        claimantName,
        claimantContact,
        answer
      });
      setResult(response.data);
    } catch (err) {
      console.error('Error submitting claim:', err);
      setResult({ verified: false, msg: t('claimSubmitFailed') || 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Already verified -> just show the contact, no need to re-render the form
  if (result && result.verified) {
    return (
      <div className="text-xs">
        <p className="text-green-600 dark:text-emerald-400 font-semibold mb-1">✅ {result.msg}</p>
        <span className="text-blue-600 dark:text-blue-400 font-medium">📞 {result.contact}</span>
      </div>
    );
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
      >
        🔒 {t('verifyToClaim') || 'Answer to see contact'}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/30 rounded-xl p-3">
      <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
        🔒 {item.verificationQuestion}
      </p>

      <input
        type="text"
        placeholder={t('placeholderYourAnswer') || 'Your answer'}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        required
      />
      <input
        type="text"
        placeholder={t('placeholderYourName') || 'Your name (optional)'}
        value={claimantName}
        onChange={(e) => setClaimantName(e.target.value)}
        className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
      />
      <input
        type="text"
        placeholder={t('placeholderYourContact') || 'Your phone/email (so the finder can reach you)'}
        value={claimantContact}
        onChange={(e) => setClaimantContact(e.target.value)}
        className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        required
      />

      {result && !result.verified && (
        <p className="text-xs text-red-600 dark:text-red-400 font-medium">❌ {result.msg}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="text-xs font-semibold bg-amber-500 text-white px-3 py-1.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition"
        >
          {submitting ? (t('submitting') || 'Checking...') : (t('submitAnswer') || 'Submit Answer')}
        </button>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:underline"
        >
          {t('cancel') || 'Cancel'}
        </button>
      </div>
    </form>
  );
}

export default ClaimVerification;
