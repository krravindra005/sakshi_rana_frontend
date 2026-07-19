import React from 'react';
import { FilterOptions } from '../../types/filter';
import { X, Trash2 } from 'lucide-react';

interface ActiveChipsProps {
  activeFilters: FilterOptions;
  onRemoveFilter: (field: keyof FilterOptions, value: string) => void;
  onClearAll: () => void;
}

export const ActiveChips: React.FC<ActiveChipsProps> = ({
  activeFilters,
  onRemoveFilter,
  onClearAll,
}) => {
  // Extract all active filter tags
  const chips: { field: keyof FilterOptions; value: string; label: string }[] = [];

  Object.entries(activeFilters).forEach(([key, val]) => {
    const field = key as keyof FilterOptions;
    if (!val) return;

    if (Array.isArray(val)) {
      val.forEach((itemValue) => {
        chips.push({
          field,
          value: itemValue,
          label: `${field === 'placeOfService' ? 'Place' : field === 'hairColor' ? 'Hair' : field === 'intendedAudience' ? 'Audience' : field}: ${itemValue}`,
        });
      });
    } else if (typeof val === 'string' && field !== 'city') {
      chips.push({
        field,
        value: val,
        label: `${field}: ${val}`,
      });
    }
  });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 py-3 border-b border-slate-50">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
        Active Filters:
      </span>
      
      {chips.map((chip, idx) => (
        <span
          key={`${chip.field}-${chip.value}-${idx}`}
          className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs py-1 px-2.5 rounded-lg border border-slate-200/50 transition cursor-pointer"
          onClick={() => onRemoveFilter(chip.field, chip.value)}
        >
          <span className="capitalize font-medium">{chip.label}</span>
          <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 transition" />
        </span>
      ))}

      <button
        onClick={onClearAll}
        className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1.5 ml-2"
        title="Clear all filters"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>Reset</span>
      </button>
    </div>
  );
};
