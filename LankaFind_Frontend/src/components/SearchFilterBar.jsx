import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

// Category *values* stay in English since they must match the backend enum exactly.
// Only the *displayed label* is translated.
const CATEGORY_VALUES = ['All', 'Electronics', 'Documents', 'Personal Items', 'Keys', 'Other'];
const CATEGORY_LABEL_KEYS = {
  All: 'allCategories',
  Electronics: 'categoryElectronics',
  Documents: 'categoryDocuments',
  'Personal Items': 'categoryPersonalItems',
  Keys: 'categoryKeys',
  Other: 'categoryOther',
};

// Search input + Category dropdown, with an optional expandable row for
// location text filter and date-range filter. Reused across Home/Lost/Found pages.
function SearchFilterBar({
  searchTerm, onSearchChange,
  category, onCategoryChange,
  location = '', onLocationChange,
  dateFrom = '', dateTo = '', onDateFromChange, onDateToChange,
  accentColor = 'blue'
}) {
  const { t } = useLanguage();
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const ringClass = {
    blue: 'focus:ring-blue-500 dark:focus:ring-blue-400',
    red: 'focus:ring-red-500 dark:focus:ring-red-400',
    emerald: 'focus:ring-emerald-500 dark:focus:ring-emerald-400'
  }[accentColor] || 'focus:ring-blue-500 dark:focus:ring-blue-400';

  const showLocationAndDate = onLocationChange || onDateFromChange || onDateToChange;
  const activeExtraFilters = (location ? 1 : 0) + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0);

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">🔍</span>
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 ${ringClass} transition bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500`}
          />
        </div>

        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className={`px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 ${ringClass} transition bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 sm:w-56`}
        >
          {CATEGORY_VALUES.map((c) => (
            <option key={c} value={c}>
              {t(CATEGORY_LABEL_KEYS[c])}
            </option>
          ))}
        </select>

        {showLocationAndDate && (
          <button
            type="button"
            onClick={() => setShowMoreFilters((v) => !v)}
            className={`px-4 py-2.5 border rounded-xl transition text-sm font-medium whitespace-nowrap ${
              activeExtraFilters > 0
                ? 'border-transparent bg-gray-800 dark:bg-amber-500 text-white'
                : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300'
            }`}
          >
            {t('moreFilters') || 'More Filters'} {activeExtraFilters > 0 ? `(${activeExtraFilters})` : ''}
          </button>
        )}
      </div>

      {showLocationAndDate && showMoreFilters && (
        <div className="flex flex-col sm:flex-row gap-3 mt-3 p-3 bg-gray-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 rounded-xl">
          {onLocationChange && (
            <input
              type="text"
              placeholder={t('filterByLocation') || 'Filter by location...'}
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              className={`flex-grow px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 ${ringClass} transition bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500`}
            />
          )}

          {onDateFromChange && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{t('fromDate') || 'From'}</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => onDateFromChange(e.target.value)}
                className={`px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 ${ringClass} transition bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100`}
              />
            </div>
          )}

          {onDateToChange && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{t('toDate') || 'To'}</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => onDateToChange(e.target.value)}
                className={`px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 ${ringClass} transition bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100`}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchFilterBar;
