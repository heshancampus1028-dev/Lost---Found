import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { useLanguage } from '../context/LanguageContext';
import ItemCard from '../components/ItemCard';
import SearchFilterBar from '../components/SearchFilterBar';
import PageHeader from '../components/PageHeader';

function FoundItems() {
  const { t } = useLanguage();

  // Items fetched from the database
  const [foundItemsList, setFoundItemsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search + filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterLocation, setFilterLocation] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Re-fetch items whenever search/filter changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchFoundItems = async () => {
        setLoading(true);
        try {
          const params = { status: 'found' };
          if (searchTerm) params.search = searchTerm;
          if (filterCategory !== 'All') params.category = filterCategory;
          if (filterLocation) params.location = filterLocation;
          if (dateFrom) params.dateFrom = dateFrom;
          if (dateTo) params.dateTo = dateTo;

          const response = await api.get('/items', { params });
          setFoundItemsList(response.data);
          setLoading(false);
        } catch (err) {
          console.error("Error fetching found items:", err);
          setLoading(false);
        }
      };
      fetchFoundItems();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, filterCategory, filterLocation, dateFrom, dateTo]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors pt-[38px] pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          icon="🟢"
          title={t('recentFoundReports')}
          subtitle={t('recentFoundSubtitle')}
          accent="from-emerald-600 to-teal-500"
          action={
            <Link
              to="/found/report"
              className="whitespace-nowrap bg-white/15 hover:bg-white/25 text-white font-semibold px-5 py-2.5 rounded-xl border border-white/30 backdrop-blur-sm transition text-center"
            >
              {t('reportFoundTitle') || 'Report a Found Item'}
            </Link>
          }
        />

        <div className="space-y-6 mt-6">
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
            accentColor="emerald"
          />

          {loading ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">{t('loadingItems')}</div>
          ) : foundItemsList.length === 0 ? (
            <div className="text-center text-gray-400 dark:text-gray-500 py-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
              {t('noFoundMatch')}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {foundItemsList.map((item, i) => (
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
  );
}

export default FoundItems;
