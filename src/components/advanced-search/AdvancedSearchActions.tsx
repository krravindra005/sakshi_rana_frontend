import React, { useState } from 'react';
import { useAdvancedSearch } from '../../context/AdvancedSearchContext';
import { Search, RotateCcw, AlertTriangle } from 'lucide-react';

export const AdvancedSearchActions: React.FC = () => {
  const { 
    applySearch, 
    clearAllFilters, 
    resultCount, 
    isCounting, 
    activeFiltersCount 
  } = useAdvancedSearch();

  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const handleClearClick = () => {
    // If they have more than 5 filters active, show a friendly confirmation step
    if (activeFiltersCount >= 6) {
      setShowConfirmClear(true);
    } else {
      clearAllFilters();
    }
  };

  const handleConfirmClear = () => {
    clearAllFilters();
    setShowConfirmClear(false);
  };

  return (
    <div className="relative bg-white border-t border-slate-100 p-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3.5 z-20">
      
      {/* Light Confirmation Layer for Clear All */}
      {showConfirmClear ? (
        <div className="flex-1 flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl p-3 w-full animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-amber-800 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Reset all {activeFiltersCount} active filter selections?</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowConfirmClear(false)}
              className="text-xs text-slate-500 hover:text-slate-700 px-2.5 py-1 font-bold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmClear}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
            >
              Confirm Reset
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Reset Action */}
          <button
            type="button"
            onClick={handleClearClick}
            disabled={activeFiltersCount === 0}
            className={`flex items-center gap-1.5 text-xs font-semibold py-2.5 px-4 rounded-xl transition ${
              activeFiltersCount === 0
                ? 'text-slate-300 cursor-not-allowed'
                : 'text-rose-600 hover:text-rose-700 hover:bg-rose-50/40'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset All Filters</span>
          </button>

          {/* Apply / Search Action */}
          <button
            type="button"
            onClick={applySearch}
            className="w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-3 px-6 rounded-xl shadow-md shadow-indigo-200 hover:shadow-indigo-300 active:scale-[0.98] transition-all duration-150"
          >
            <Search className="w-4 h-4" />
            <span>
              {isCounting ? 'Counting Results...' : `Show ${resultCount} Results`}
            </span>
          </button>
        </>
      )}
    </div>
  );
};
