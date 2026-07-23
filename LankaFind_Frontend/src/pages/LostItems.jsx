import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ItemCard from '../components/ItemCard';
import SearchFilterBar from '../components/SearchFilterBar';
import MatchSuggestions from '../components/MatchSuggestions';
import LocationPicker from '../components/LocationPicker';
import PageHeader from '../components/PageHeader';

function LostItems() {
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
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  // Items fetched from the database
  const [lostItemsList, setLostItemsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search + filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterLocation, setFilterLocation] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Alert message state
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [lastPostedId, setLastPostedId] = useState(null); // used to auto-show matches right after posting

  // Re-fetch items whenever search/filter changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchLostItems = async () => {
        setLoading(true);
        try {
          const params = { status: 'lost' };
          if (searchTerm) params.search = searchTerm;
          if (filterCategory !== 'All') params.category = filterCategory;
          if (filterLocation) params.location = filterLocation;
          if (dateFrom) params.dateFrom = dateFrom;
          if (dateTo) params.dateTo = dateTo;

          const response = await api.get('/items', { params });
          setLostItemsList(response.data);
          setLoading(false);
        } catch (err) {
          console.error("Error fetching lost items:", err);
          setLoading(false);
        }
      };
      fetchLostItems();
    }, 300); // debounce so we don't spam requests on every keystroke

    return () => clearTimeout(timer);
  }, [searchTerm, filterCategory, filterLocation, dateFrom, dateTo]);

  // Handle image selection (limit to 3 files)
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    setImages(files);
  };

  // Submit a new lost item report
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Must be logged in to post
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!title || !category || !location || !contact) return;

    setMessage('');
    setError('');

    try {
      // Using FormData so images (if any) travel alongside the text fields.
      // Axios sets the correct multipart Content-Type header automatically for FormData.
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('status', 'lost');
      formData.append('location', location);
      formData.append('contact', contact);
      formData.append('category', category);
      if (latitude && longitude) {
        formData.append('latitude', latitude);
        formData.append('longitude', longitude);
      }
      images.forEach((file) => formData.append('images', file));

      const response = await api.post('/items', formData);

      setMessage(response.data.msg);
      setLostItemsList([response.data.item, ...lostItemsList]);
      setLastPostedId(response.data.item._id); // triggers the auto-match panel below

      // Clear the form
      setTitle('');
      setCategory('');
      setLocation('');
      setDescription('');
      setContact('');
      setImages([]);
      setLatitude(null);
      setLongitude(null);

    } catch (err) {
      console.error("Error posting lost item:", err);
      if (err.response && err.response.status === 401) {
        setError(t('sessionExpired'));
      } else {
        setError(t('postFailed'));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          icon="🔴"
          title={t('recentLostReports')}
          subtitle={t('recentLostSubtitle')}
          accent="from-red-600 to-orange-500"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Report form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm dark:shadow-black/20 border border-gray-100 dark:border-slate-800 h-fit"
        >
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            {t('reportLostTitle')}
          </h2>

          {!isAuthenticated && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 text-sm rounded-xl text-center font-medium">
              {t('loginToReportPrompt')}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-emerald-500/10 text-green-700 dark:text-emerald-300 text-sm rounded-xl text-center font-medium">
              {message}
              {lastPostedId && <MatchSuggestions itemId={lastPostedId} autoFetch accentColor="red" />}
            </div>
          )}
          {error && <div className="mb-4 p-3 bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-300 text-sm rounded-xl text-center font-medium">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('labelItemTitle')}</label>
              <input 
                type="text" 
                placeholder={t('placeholderLostTitle')} 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('labelCategory')}</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition bg-white"
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
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('labelLostLocation')}</label>
              <input 
                type="text" 
                placeholder={t('placeholderLostLocation')} 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition"
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
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('labelContact')}</label>
              <input 
                type="tel" 
                placeholder={t('placeholderContact')} 
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('labelDescription')}</label>
              <textarea 
                rows="3" 
                placeholder={t('placeholderLostDescription')} 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                {t('labelPhoto') || 'Photo (optional, up to 3)'}
              </label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={handleImageChange}
                className="w-full text-sm text-gray-600 dark:text-gray-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-red-50 dark:file:bg-red-500/10 file:text-red-600 dark:file:text-red-400 file:font-medium hover:file:bg-red-100 dark:hover:file:bg-red-500/20"
              />
              {images.length > 0 && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{images.length} file(s) selected</p>
              )}
            </div>

            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 dark:from-red-500 dark:to-amber-500 text-white font-semibold py-2.5 rounded-xl hover:opacity-90 shadow-md transition"
            >
              {isAuthenticated ? t('publishReport') : t('loginToPublish')}
            </button>
          </form>
        </motion.div>

        {/* Feed */}
        <div className="lg:col-span-2 space-y-6">
          <SearchFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            category={filterCategory}
            onCategoryChange={setFilterCategory}
            location={filterLocation}
            onLocationChange={setFilterLocation}
            dateFrom={dateFrom}
            onDateFromChange={setDateFrom}
            dateTo={dateTo}
            onDateToChange={setDateTo}
            accentColor="red"
          />

          {loading ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">{t('loadingItems')}</div>
          ) : lostItemsList.length === 0 ? (
            <div className="text-center text-gray-400 dark:text-gray-500 py-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
              {t('noLostMatch')}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lostItemsList.map((item, i) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.35, delay: (i % 6) * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <ItemCard item={item} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        </div>
      </div>
    </div>
  );
}

export default LostItems;
