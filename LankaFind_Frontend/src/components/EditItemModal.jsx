import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api, { getImageUrl } from '../api/axios';
import { useLanguage } from '../context/LanguageContext';

// A modal for editing an already-published report - text fields, the
// verification Q&A, and now photos (add new ones, or remove existing ones).
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

  // Existing photos already on the item (filenames), minus any the user removes.
  // newImages holds newly selected File objects to upload alongside the edit.
  const [existingImages, setExistingImages] = useState(item.images || []);
  const [removedImages, setRemovedImages] = useState([]); // filenames explicitly removed
  const [newImages, setNewImages] = useState([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const totalPhotoCount = existingImages.length + newImages.length;

  // Same validation as the report-creation forms - only accept real image
  // types so a bad file never reaches the upload request.
  const handleImageChange = (e) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const selected = Array.from(e.target.files);
    const validFiles = selected.filter((file) => allowedTypes.includes(file.type));
    const rejectedCount = selected.length - validFiles.length;

    if (rejectedCount > 0) {
      setError(`${rejectedCount} file(s) skipped - only JPG, PNG, or WEBP images are supported.`);
    } else {
      setError('');
    }

    // Cap combined existing + new photos at 3
    const room = Math.max(0, 3 - existingImages.length);
    setNewImages(validFiles.slice(0, room));
  };

  const handleRemoveExisting = (filename) => {
    setExistingImages((prev) => prev.filter((f) => f !== filename));
    setRemovedImages((prev) => [...prev, filename]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || !category || !location) {
      setError(t('fillRequiredFields') || 'Please fill in the required fields.');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      formData.append('location', location);
      formData.append('description', description);
      formData.append('contact', contact);
      if (isFound) {
        formData.append('verificationQuestion', verificationQuestion);
        if (verificationAnswer) {
          formData.append('verificationAnswer', verificationAnswer);
        }
      }
      if (removedImages.length > 0) {
        formData.append('removeImages', JSON.stringify(removedImages));
      }
      newImages.forEach((file) => formData.append('images', file));

      const response = await api.patch(`/items/${item._id}`, formData);
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

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              {t('labelPhoto') || 'Photo (optional, up to 3)'}
            </label>

            {existingImages.length > 0 && (
              <div className="flex gap-2 mb-2 flex-wrap">
                {existingImages.map((filename) => (
                  <div key={filename} className="relative w-16 h-16">
                    <img
                      src={getImageUrl(filename)}
                      alt="Current"
                      className="w-16 h-16 object-cover rounded-xl border border-gray-200 dark:border-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExisting(filename)}
                      title="Remove this photo"
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs leading-none flex items-center justify-center shadow"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}

            {totalPhotoCount < 3 && (
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={handleImageChange}
                className="w-full text-sm text-gray-600 dark:text-gray-300 file:mr-3 file:py-2 file:px-4 file:rounded-2xl file:border-0 file:bg-blue-50 dark:file:bg-blue-500/10 file:text-blue-600 dark:file:text-blue-400 file:font-medium hover:file:bg-blue-100 dark:hover:file:bg-blue-500/20"
              />
            )}
            {newImages.length > 0 && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{newImages.length} new file(s) selected</p>
            )}
            {totalPhotoCount >= 3 && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Maximum of 3 photos reached - remove one to add another.</p>
            )}
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
