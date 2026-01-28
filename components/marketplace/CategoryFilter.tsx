/**
 * CategoryFilter.tsx
 * Horizontal scrollable category chips for filtering listings
 */

import React from 'react';
import { ProductCategory, PRODUCT_CATEGORIES } from '../../types/MarketplaceTypes';

interface CategoryFilterProps {
    selectedCategory: ProductCategory | null;
    onSelectCategory: (category: ProductCategory | null) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
    selectedCategory,
    onSelectCategory,
}) => {
    return (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {/* All Categories */}
            <button
                onClick={() => onSelectCategory(null)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === null
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                        : 'bg-white/10 text-white/70 hover:bg-white/15'
                    }`}
            >
                Tất cả
            </button>

            {/* Category Chips */}
            {PRODUCT_CATEGORIES.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => onSelectCategory(cat.id)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${selectedCategory === cat.id
                            ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                            : 'bg-white/10 text-white/70 hover:bg-white/15'
                        }`}
                >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                </button>
            ))}
        </div>
    );
};

export default CategoryFilter;
