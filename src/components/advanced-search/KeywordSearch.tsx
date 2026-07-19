import React from 'react';
import { useAdvancedSearch } from '../../context/AdvancedSearchContext';
import { Search } from 'lucide-react';

export const KeywordSearch: React.FC = () => {
  const { draftState, setDraftState } = useAdvancedSearch();

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDraftState(prev => ({
      ...prev,
      q: e.target.value || undefined
    }));
  };

  return (
    <div className="space-y-2">
      <label 
        htmlFor="adv-search-keyword"
        className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-mono"
      >
        Keywords / Search Term
      </label>
      <div className="relative rounded-xl border border-slate-200 bg-slate-50 shadow-sm transition-all focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 focus-within:bg-white">
        <input
          id="adv-search-keyword"
          type="text"
          value={draftState.q || ''}
          onChange={handleQueryChange}
          placeholder="Search listings... (e.g. Aria, Russian, Massage)"
          className="w-full pl-11 pr-4 py-3 text-sm text-slate-800 bg-transparent border-0 focus:outline-none focus:ring-0"
        />
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
      </div>
    </div>
  );
};
