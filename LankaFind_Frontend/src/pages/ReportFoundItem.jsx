import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import MatchSuggestions from '../components/MatchSuggestions';
import LocationPicker from '../components/LocationPicker';
import PageHeader from '../components/PageHeader';
import { isAllowedImageFile, IMAGE_ACCEPT_ATTR } from '../utils/fileValidation';

function ReportFoundItem() {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [images, setImages] = useState([]); // File objects selected by the user (max 3)
  const [verificationQuestion, setVerificationQuestion] = useState('');
  const [verificationAnswer, setVerificationAnswer] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [lastPostedId, setLastPostedId] = useState(null); // used to auto-show matches right after posting

  // Handle image selection (limit to 3 files)
  // Only jpg/jpeg/png/webp are accepted by the backend - filter out anything
  // else here (e.g. .avif, .heic) so a bad file never gets sent in the request.
  // isAllowedImageFile also falls back to checking the extension, since some
  // browsers report an empty file.type for .webp files.
  const handleImageChange = (e) => {
    const selected = Array.from(e.target.files);

    const validFiles = selected.filter(isAllowedImageFile);
    const rejectedCount = selected.length - validFiles.length;

    if (rejectedCount > 0) {
      setError(`${rejectedCount} file(s) skipped - only JPG, PNG, or WEBP images are supported.`);
    } else {
      setError('');
    }

    setImages(validFiles.slice(0, 3));
  };

  // Submit a new found item report
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!title || !category || !location) return;

    setMessage('');
    setError('');

    try {
      // Using FormData so images (if any) travel alongside the text fields.
      // Axios sets the correct multipart Content-Type header automatically for FormData.
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('status', 'found');
      formData.append('location', location);
      formData.append('contact', contact);
      formData.append('category', category);
      if (verificationQuestion && verificationAnswer) {
        formData.append('verificationQuestion', verificationQuestion);
        formData.append('verificationAnswer', verificationAnswer);
      }
      if (latitude && longitude) {
        formData.append('latitude', latitude);
        formData.append('longitude', longitude);
      }
      images.forEach((file) => formData.append('images', file));

      const response = await api.post('/items', formData);

      setMessage(response.data.msg);
      setLastPostedId(response.data.item._id); // triggers the auto-match panel below

      // Clear the form
      setTitle('');
      setCategory('');
      setLocation('');
      setDescription('');
      setContact('');
      setImages([]);
      setVerificationQuestion('');
      setVerificationAnswer('');
      setLatitude(null);
      setLongitude(null);

    } catch (err) {
      console.error("Error posting found item:", err);
      if (err.response && err.response.status === 401) {
        setError(t('sessionExpired'));
      } else {
        setError(t('postFailed'));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <PageHeader
          icon="🟢"
          title={t('reportFoundTitle')}
          subtitle={t('recentFoundSubtitle')}
          accent="from-emerald-600 to-teal-500"
        />

        <div className="mb-4">
          <Link
            to="/found"
            className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition"
          >
            &larr; {t('backToFoundItems') || 'Back to Found Items'}
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm dark:shadow-black/20 border border-gray-100 dark:border-slate-800"
        >
          {!isAuthenticated && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 text-sm rounded-xl text-center font-medium">
              {t('loginToReportPrompt')}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-emerald-500/10 text-green-700 dark:text-emerald-300 text-sm rounded-xl text-center font-medium">
              {message}
              {lastPostedId && <MatchSuggestions itemId={lastPostedId} autoFetch accentColor="emerald" />}
              <div className="mt-3">
                <Link to="/found" className="underline font-semibold">
                  {t('viewFoundItems') || 'View Found Items'}
                </Link>
              </div>
            </div>
          )}
          {error && <div className="mb-4 p-3 bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-300 text-sm rounded-xl text-center font-medium">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('labelItemTitle')}</label>
              <input 
                type="text" 
                placeholder={t('placeholderFoundTitle')} 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('labelCategory')}</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition bg-white"
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
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('labelFoundLocation')}</label>
              <input 
                type="text" 
                placeholder={t('placeholderFoundLocation')} 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                required
              />
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 mb-2">
                {t('mapPinHint') || '📍 Optional: click the map below to pin the exact spot'}
              </p>
              <LocationPicker
                latitude={latitude}
                longitude={longitude}
                onChange={(lat, lng) => { setLatitude(lat); setLongitude(lng); }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                {t('labelContact')} <span className="text-gray-400 font-normal">({t('optional') || 'optional'})</span>
              </label>
              <input 
                type="tel" 
                placeholder={t('placeholderContact')} 
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('labelDescription')}</label>
              <textarea 
                rows="3" 
                placeholder={t('placeholderFoundDescription')} 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                {t('labelVerificationQuestion') || 'Verification Question (optional)'}
              </label>
              <input
                type="text"
                placeholder={t('placeholderVerificationQuestion') || "e.g. What's inside the wallet?"}
                value={verificationQuestion}
                onChange={(e) => setVerificationQuestion(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {t('verificationHint') || "If set, claimants must answer this correctly before they see your contact info."}
              </p>
            </div>

            {verificationQuestion && (
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  {t('labelCorrectAnswer') || 'Correct Answer'}
                </label>
                <input
                  type="text"
                  placeholder={t('placeholderCorrectAnswer') || 'Only you will know this'}
                  value={verificationAnswer}
                  onChange={(e) => setVerificationAnswer(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                {t('labelPhoto') || 'Photo (optional, up to 3)'}
              </label>
              <input
                type="file"
                accept={IMAGE_ACCEPT_ATTR}
                multiple
                onChange={handleImageChange}
                className="w-full text-sm text-gray-600 dark:text-gray-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-emerald-50 dark:file:bg-emerald-500/10 file:text-emerald-600 dark:file:text-emerald-400 file:font-medium hover:file:bg-emerald-100 dark:hover:file:bg-emerald-500/20"
              />
              {images.length > 0 && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{images.length} file(s) selected</p>
              )}
            </div>

            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-500 dark:to-amber-500 text-white font-semibold py-2.5 rounded-xl hover:opacity-90 shadow-md transition"
            >
              {isAuthenticated ? t('publishReport') : t('loginToPublish')}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default ReportFoundItem;
