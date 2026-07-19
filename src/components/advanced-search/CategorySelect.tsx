import React from 'react';
import { useAdvancedSearch } from '../../context/AdvancedSearchContext';
import { mockCategories } from '../../data/mock-categories';
import { Grid } from 'lucide-react';

export const CategorySelect: React.FC = () => {
  const { draftState, setDraftState } = useAdvancedSearch();

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryVal = e.target.value;
    setDraftState(prev => ({
      ...prev,
      category: categoryVal || undefined,
      // When category changes, reset category-specific filters to prevent lingering mismatch values
      nationality: undefined,
      ethnicity: undefined,
      bodyType: undefined,
      hairColor: undefined,
      services: undefined,
      intendedAudience: undefined,
      placeOfService: undefined
    }));
  };

  return (
    <div className="space-y-2">
      <label 
        htmlFor="adv-search-category"
        className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-mono"
      >
        Classified Category
      </label>
      <div className="relative rounded-xl border border-slate-200 bg-slate-50 shadow-sm transition-all focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 focus-within:bg-white">
        <select
          id="adv-search-category"
          value={draftState.category || ''}
          onChange={handleCategoryChange}
          className="w-full pl-11 pr-10 py-3 text-sm text-slate-700 bg-transparent border-0 focus:outline-none focus:ring-0 appearance-none cursor-pointer font-medium"
        >
          <option value="">All Categories</option>
          {mockCategories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
        <Grid className="w-5 h-5 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
        <div className="absolute right-4 top-4.5 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-400 w-0 h-0" />
      </div>
    </div>
  );
};
