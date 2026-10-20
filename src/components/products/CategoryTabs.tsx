import React from 'react';
import type { ProductCategory } from '../../types/product';

export type FilterTab = 'all' | ProductCategory;

interface CategoryTabsProps {
  active: FilterTab;
  onChange: (tab: FilterTab) => void;
  categories: ProductCategory[];
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ active, onChange, categories }) => {
  const tabs: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'All' },
    ...categories.map((c) => ({ id: c, label: c })),
  ];

  return (
    <div
      className="sticky top-[72px] z-30 -mx-4 border-b border-sand/70 bg-ivory/90 px-4 py-3 backdrop-blur-md sm:top-20 sm:mx-0 sm:rounded-2xl sm:border sm:border-sand/60 sm:py-4"
      role="tablist"
      aria-label="Filter by category"
    >
      <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-0">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              id={`tab-${tab.id}`}
              onClick={() => onChange(tab.id)}
              className={`font-inter shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                isActive
                  ? 'bg-chocolate text-ivory shadow-soft'
                  : 'bg-ivory text-cocoa ring-1 ring-sand hover:bg-beige hover:ring-champagne'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryTabs;
