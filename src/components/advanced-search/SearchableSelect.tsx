import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

interface Option {
  label: string;
  value: string;
}

interface SearchableSelectProps {
  id: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  label: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  id,
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset search when opening/closing
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className="space-y-1.5 flex-1 min-w-[200px]" ref={containerRef}>
      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
        {label}
      </label>
      
      <div className="relative">
        <button
          id={id}
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between py-2.5 px-3.5 text-sm rounded-xl border text-left transition-all ${
            disabled
              ? 'bg-slate-100/60 border-slate-200 text-slate-400 cursor-not-allowed'
              : isOpen
              ? 'bg-white border-indigo-500 ring-1 ring-indigo-500 text-slate-800 shadow-sm'
              : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
          }`}
        >
          <span className={`truncate font-medium ${!selectedOption ? 'text-slate-400' : 'text-slate-800'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          
          <div className="flex items-center gap-1.5 shrink-0 ml-1">
            {selectedOption && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-0.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition"
                title="Clear selection"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {/* Dropdown panel */}
        {isOpen && !disabled && (
          <div className="absolute z-50 left-0 right-0 mt-1.5 rounded-xl border border-slate-100 bg-white shadow-xl max-h-72 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Search box (only if there are more than 5 options) */}
            {options.length > 5 && (
              <div className="flex items-center gap-2 border-b border-slate-50 px-3 py-2 bg-slate-50/50">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs text-slate-700 bg-transparent border-0 focus:outline-none focus:ring-0 p-0"
                />
              </div>
            )}

            {/* Scrollable list */}
            <div className="overflow-y-auto flex-1 max-h-48 py-1" ref={listRef}>
              {filteredOptions.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-4 px-2 font-mono">
                  No matching options
                </div>
              ) : (
                filteredOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition ${
                      opt.value === value
                        ? 'bg-indigo-50/60 text-indigo-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {opt.value === value && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
