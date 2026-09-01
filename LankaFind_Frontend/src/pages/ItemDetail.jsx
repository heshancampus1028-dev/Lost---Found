import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import ItemCard from '../components/ItemCard';
import MatchSuggestions from '../components/MatchSuggestions';
import QRPoster from '../components/QRPoster';

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPoster, setShowPoster] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await api.get(`/items/${id}`);
        setItem(response.data);
      } catch (err) {
        console.error('Error fetching item:', err);
        setError('This report could not be found. It may have been removed.');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const posterUrl = `${window.location.origin}/item/${id}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link to="/" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">&larr; Back to LankaFind</Link>

        {loading ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-12">Loading...</div>
        ) : error ? (
          <div className="text-center text-gray-400 dark:text-gray-500 py-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
            {error}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <ItemCard item={item} />

            <MatchSuggestions itemId={item._id} autoFetch accentColor={item.status === 'lost' ? 'red' : 'emerald'} />

            <div className="text-center">
              <button
                onClick={() => setShowPoster((v) => !v)}
                className="text-sm font-semibold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
              >
                🖨️ {showPoster ? 'Hide QR Poster' : 'Generate QR Poster'}
              </button>
            </div>

            <AnimatePresence>
              {showPoster && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-center overflow-hidden"
                >
                  <QRPoster
                    url={posterUrl}
                    title={item.title}
                    subtitle={`${item.status === 'lost' ? 'LOST' : 'FOUND'} · ${item.location}`}
                    accentColor={item.status === 'lost' ? '#dc2626' : '#059669'}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default ItemDetail;
