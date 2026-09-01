import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { useLanguage } from '../context/LanguageContext';

// A simple modal for editing the text fields of an already-published report.
// Images are left untouched here - only title/category/location/description/
// contact/verification Q&A can be changed after posting.
function EditItemModal({ item, onClose, onSaved }) {
  const { t } = useLanguage();
  const isFound = item.status === 'found';
  const ringClass = isFound ? 'focus:ring-emerald-500' : 'focus:ring-red-500';

  const [title, setTitle] = useState(item.title || '');
  const [category, setCategory] = useState(item.category || '');
  const [location, setLocation] = useState(item.location || '');
  const [description, setDescription] = useState(item.description || '');
  const [contact, setContact] = useState(item.contact || '');
  const [verificationQuestion, setVerificationQuestion] = useState(item.verificationQuestion || '');
  const [verificationAnswer, setVerificationAnswer] = useState(''); // left blank unless the owner wants to change it

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || !category || !location) {
      setError(t('fillRequiredFields') || 'Please fill in the required fields.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title,
        category,
        location,
        description,
        contact,
        verificationQuestion: isFound ? verificationQuestion : undefined
      };
      if (isFound && verificationAnswer) {
        payload.verificationAnswer = verificationAnswer;
      }

      const response = await api.patch(`/items/${item._id}`, payload);
      onSaved(response.data.item);
    } catch (err) {
      console.error('Error updating item:', err);
      setError(t('updateFailed') || 'Update failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 24 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-black/20 dark:shadow-black/50 ring-1 ring-black/5 dark:ring-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
          onClick={(e) => e.stopPropagation()}
        >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            {t('editReportTitle') || 'Edit Report'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-300 text-sm rounded-2xl text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('labelItemTitle')}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-4 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-2 ${ringClass} transition`}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('labelCategory')}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full px-4 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-2 ${ringClass} transition bg-white`}
              required
            >
              <option value="">{t('selectCategory')}</option>
              <option value="Electronics">{t('categoryElectronics')}</option>
              <option value="Documents">{t('categoryDocuments')}</option>
              <option value="Personal Items">{t('categoryPersonalItems')}</option>
              <option value="Keys">{t('categoryKeys')}</option>
              <option value="Other">{t('categoryOther')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              {isFound ? t('labelFoundLocation') : t('labelLostLocation')}
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={`w-full px-4 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-2 ${ringClass} transition`}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              {t('labelContact')} <span className="text-gray-400 font-normal">({t('optional') || 'optional'})</span>
            </label>
            <input
              type="tel"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className={`w-full px-4 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-2 ${ringClass} transition`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('labelDescription')}</label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-4 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-2 ${ringClass} transition resize-none`}
            ></textarea>
          </div>

          {isFound && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  {t('labelVerificationQuestion') || 'Verification Question (optional)'}
                </label>
                <input
                  type="text"
                  value={verificationQuestion}
                  onChange={(e) => setVerificationQuestion(e.target.value)}
                  className={`w-full px-4 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-2 ${ringClass} transition`}
                />
              </div>

              {verificationQuestion && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                    {t('labelCorrectAnswer') || 'Correct Answer'}
                  </label>
                  <input
                    type="text"
                    placeholder={t('leaveBlankToKeep') || 'Leave blank to keep the current answer'}
                    value={verificationAnswer}
                    onChange={(e) => setVerificationAnswer(e.target.value)}
                    className={`w-full px-4 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-gray-500 rounded-2xl focus:outline-none focus:ring-2 ${ringClass} transition`}
                  />
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {t('leaveBlankHint') || 'Leave this empty to keep the previously saved answer.'}
                  </p>
                </div>
              )}
            </>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="tap-scale flex-1 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 font-semibold py-2.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800 transition"
            >
              {t('cancelBtn') || 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`tap-scale glow-hover flex-1 bg-gradient-to-r ${isFound ? 'from-emerald-500 to-teal-500' : 'from-red-500 to-orange-500'} text-white font-semibold py-2.5 rounded-2xl shadow-md transition disabled:opacity-60`}
            >
              {saving ? (t('savingBtn') || 'Saving...') : (t('saveChangesBtn') || 'Save Changes')}
            </button>
          </div>
        </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default EditItemModal;
