import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FilterAccordionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  summary?: string;
  count?: number;
  children: React.ReactNode;
}

export const FilterAccordion: React.FC<FilterAccordionProps> = ({
  id,
  title,
  icon,
  summary,
  count = 0,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-slate-100 rounded-xl bg-white overflow-hidden shadow-sm hover:border-slate-200/80 transition-all duration-200">
      <button
        id={`accordion-trigger-${id}`}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50/50 transition duration-200 text-left"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
          <div className="text-slate-400 shrink-0">{icon}</div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800">{title}</span>
              {count > 0 && (
                <span className="inline-flex items-center justify-center bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-100 font-mono">
                  {count} selected
                </span>
              )}
            </div>
            
            {summary && !isOpen && (
              <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
                {summary}
              </p>
            )}
          </div>
        </div>

        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
      </button>

      {isOpen && (
        <div 
          id={`accordion-content-${id}`}
          className="border-t border-slate-100 bg-slate-50/20 p-4 animate-in slide-in-from-top-1 duration-200"
        >
          {children}
        </div>
      )}
    </div>
  );
};
