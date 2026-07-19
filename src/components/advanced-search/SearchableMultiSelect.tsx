import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface Option {
  label: string;
  value: string;
}

interface SearchableMultiSelectProps {
  id: string;
  options: Option[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  isSearchable?: boolean;
  searchPlaceholder?: string;
  layout?: 'chips' | 'grid' | 'list';
}

export const SearchableMultiSelect: React.FC<SearchableMultiSelectProps> = ({
  id,
  options,
  selectedValues = [],
  onChange,
  isSearchable = false,
  searchPlaceholder = 'Search...',
  layout = 'grid',
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleToggle = (val: string) => {
    let updated: string[];
    if (selectedValues.includes(val)) {
      updated = selectedValues.filter((v) => v !== val);
    } else {
      updated = [...selectedValues, val];
    }
    onChange(updated);
  };

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 1. RENDER CHIPS LAYOUT
  if (layout === 'chips') {
    return (
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selectedValues.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleToggle(opt.value)}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition ${
                isSelected
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  }

  // 2. RENDER GRID/LIST LAYOUT (WITH OPTIONAL SEARCH INBOX)
  return (
    <div className="space-y-3">
      {isSearchable && options.length > 5 && (
        <div className="flex items-center gap-2 border border-slate-200 rounded-lg py-1.5 px-3 bg-white max-w-xs shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs text-slate-600 bg-transparent border-0 focus:outline-none focus:ring-0 p-0"
          />
        </div>
      )}

      <div 
        className={`max-h-48 overflow-y-auto pr-1 ${
          layout === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5' 
            : 'space-y-2'
        }`}
      >
        {filteredOptions.length === 0 ? (
          <div className="text-xs text-slate-400 py-2 font-mono">
            No options found matching search.
          </div>
        ) : (
          filteredOptions.map((opt) => {
            const isChecked = selectedValues.includes(opt.value);
            return (
              <label
                key={opt.value}
                className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition select-none ${
                  isChecked
                    ? 'bg-indigo-50/20 border-indigo-100 text-slate-900'
                    : 'bg-transparent border-transparent text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  id={`multi-select-${id}-${opt.value}`}
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggle(opt.value)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="text-xs font-medium truncate">{opt.label}</span>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
};
