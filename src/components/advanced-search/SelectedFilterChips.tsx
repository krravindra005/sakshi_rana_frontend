import React from 'react';
import { useAdvancedSearch } from '../../context/AdvancedSearchContext';
import { X, Trash2 } from 'lucide-react';

export const SelectedFilterChips: React.FC = () => {
  const { draftState, setDraftState, clearAllFilters } = useAdvancedSearch();

  // Extract all drafted attributes
  const chips: { field: string; value: string; label: string }[] = [];

  // Group text labels
  const groupLabels: Record<string, string> = {
    category: 'Category',
    city: 'City',
    area: 'Area',
    state: 'State',
    nationality: 'Nationality',
    ethnicity: 'Ethnicity',
    bodyType: 'Body Build',
    hairColor: 'Hair',
    services: 'Service',
    intendedAudience: 'Audience',
    placeOfService: 'Place',
  };

  Object.entries(draftState).forEach(([key, val]) => {
    if (!val || key === 'q' || key === 'country') return; // Skip keyword & raw country ID

    const group = groupLabels[key] || key;

    if (Array.isArray(val)) {
      val.forEach((itemVal) => {
        chips.push({
          field: key,
          value: itemVal,
          label: `${group}: ${itemVal}`,
        });
      });
    } else if (typeof val === 'string') {
      chips.push({
        field: key,
        value: val,
        label: `${group}: ${val}`,
      });
    }
  });

  if (chips.length === 0) return null;

  const handleRemove = (field: string, value: string) => {
    const currentVal = draftState[field as keyof typeof draftState];
    if (Array.isArray(currentVal)) {
      const updated = currentVal.filter((v) => v !== value);
      setDraftState((prev) => ({
        ...prev,
        [field]: updated.length > 0 ? updated : undefined,
      }));
    } else {
      setDraftState((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  return (
    <div className="space-y-2 py-1">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
          Selected Criteria ({chips.length})
        </h4>
        <button
          type="button"
          onClick={clearAllFilters}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All</span>
        </button>
      </div>

      {/* Horizontally scrollable container on mobile */}
      <div className="flex flex-wrap items-center gap-2 max-h-24 overflow-y-auto overflow-x-auto pb-1 scrollbar-thin">
        {chips.map((chip, idx) => (
          <span
            key={`${chip.field}-${chip.value}-${idx}`}
            className="inline-flex items-center gap-1.5 bg-indigo-50/60 hover:bg-indigo-100/80 text-indigo-700 text-xs py-1.5 px-3 rounded-lg border border-indigo-100 transition cursor-pointer shrink-0 font-medium"
            onClick={() => handleRemove(chip.field, chip.value)}
          >
            <span className="capitalize">{chip.label}</span>
            <X className="w-3.5 h-3.5 text-indigo-400 hover:text-indigo-600 transition" />
          </span>
        ))}
      </div>
    </div>
  );
};
