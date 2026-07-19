import React from 'react';
import { SidebarFilter } from './SidebarFilter';
import { FilterOptions } from '../../types/filter';
import { X, Check } from 'lucide-react';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeFilters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onClearAll: () => void;
  resultsCount: number;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  activeFilters,
  onFilterChange,
  onClearAll,
  resultsCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-sm md:hidden animate-in fade-in duration-250">
      
      {/* Background closer */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer content box */}
      <div 
        id="mobile-filter-drawer-box"
        className="w-full bg-white max-h-[85vh] rounded-t-3xl shadow-2xl overflow-y-auto relative flex flex-col justify-between animate-in slide-in-from-bottom duration-300"
      >
        {/* Header bar */}
        <div className="sticky top-0 bg-white border-b border-slate-100 py-4 px-6 flex items-center justify-between z-10">
          <div>
            <h2 className="font-bold text-slate-900 text-base">Refine Advertisements</h2>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{resultsCount} profiles match</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-700 rounded-full border border-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable filters container */}
        <div className="p-6 overflow-y-auto flex-1">
          <SidebarFilter
            activeFilters={activeFilters}
            onFilterChange={onFilterChange}
            onClearAll={onClearAll}
          />
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 bg-white border-t border-slate-100 p-4 flex gap-3 z-10">
          <button
            onClick={onClearAll}
            className="flex-1 py-3 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 transition"
          >
            Reset Filters
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-900 text-white font-semibold text-xs rounded-xl hover:bg-slate-800 transition flex items-center justify-center gap-1"
          >
            <Check className="w-4 h-4" />
            <span>Apply ({resultsCount})</span>
          </button>
        </div>

      </div>
    </div>
  );
};
