import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import ItemCard from '../components/ItemCard';
import MatchSuggestions from '../components/MatchSuggestions';
import ClaimsPanel from '../components/ClaimsPanel';
import PageHeader from '../components/PageHeader';
import EditItemModal from '../components/EditItemModal';
import { useLanguage } from '../context/LanguageContext';

// Shows the reports the logged-in user has posted, and lets them
// toggle resolved/unresolved, edit, or delete a report.
function MyReports() {
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingItem, setEditingItem] = useState(null); // the item currently open in the edit modal, or null

  const fetchMyItems = async () => {
    try {
      const response = await api.get('/items/my');
      setItems(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching my items:", err);
      setError(t('loadReportsFailed'));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyItems();
  }, []);

  // Change an item's reportStatus (Pending / Matched / Claimed / Returned)
  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await api.patch(`/items/${id}/status`, { status: newStatus });
      setItems(items.map((item) => (item._id === id ? response.data.item : item)));
    } catch (err) {
      console.error("Error updating item:", err);
      alert(t('updateFailed'));
    }
  };

  // Delete a report
  const handleDelete = async (id) => {
    if (!window.confirm(t('confirmDelete'))) return;

    try {
      await api.delete(`/items/${id}`);
      setItems(items.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Error deleting item:", err);
      alert(t('deleteFailed'));
    }
  };

  // Called by EditItemModal after a successful save
  const handleEditSaved = (updatedItem) => {
    setItems(items.map((item) => (item._id === updatedItem._id ? updatedItem : item)));
    setEditingItem(null);
  };

  const activeItems = items.filter((item) => (item.reportStatus || 'Pending') !== 'Returned');
  const resolvedItems = items.filter((item) => item.reportStatus === 'Returned');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors pt-[38px] pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">

        <PageHeader
          title={t('myReportsTitle')}
          subtitle={t('myReportsSubtitle')}
          accent="from-blue-600 to-indigo-500"
        />

        {error && <div className="p-3 bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-300 text-sm rounded-xl text-center font-medium">{error}</div>}

        {loading ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-12">{t('loadingItems')}</div>
        ) : items.length === 0 ? (
          <div className="text-center text-gray-400 dark:text-gray-500 py-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
            {t('noReportsYet')}
          </div>
        ) : (
          <>
            <div>
              <h2 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4">{t('activeReports')} ({activeItems.length})</h2>
              {activeItems.length === 0 ? (
                <p className="text-gray-400 dark:text-gray-500 text-sm">{t('noActiveReports')}</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeItems.map((item, i) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: (i % 6) * 0.05 }}
                      whileHover={{ y: -4 }}
                    >
                      <ItemCard
                        item={item}
                        showActions
                        onStatusChange={handleStatusChange}
                        onDelete={handleDelete}
                        onEdit={setEditingItem}
                      />
                      <MatchSuggestions itemId={item._id} accentColor={item.status === 'lost' ? 'red' : 'emerald'} />
                      {item.verificationQuestion && <ClaimsPanel itemId={item._id} />}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {resolvedItems.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4">{t('resolvedReports')} ({resolvedItems.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resolvedItems.map((item) => (
                    <ItemCard
                      key={item._id}
                      item={item}
                      showActions
                      onStatusChange={handleStatusChange}
                      onDelete={handleDelete}
                      onEdit={setEditingItem}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {editingItem && (
          <EditItemModal
            item={editingItem}
            onClose={() => setEditingItem(null)}
            onSaved={handleEditSaved}
          />
        )}
      </div>
    </div>
  );
}

export default MyReports;
