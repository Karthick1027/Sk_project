import React from 'react';
import type { Product, ProductCategory } from '../../types/product';
import ProductCard from './ProductCard';

interface CategorySectionProps {
  category: ProductCategory;
  products: Product[];
}

const CategorySection: React.FC<CategorySectionProps> = ({ category, products }) => {
  const sectionId = `category-${category.toLowerCase()}`;

  return (
    <section
      id={sectionId}
      aria-labelledby={`${sectionId}-heading`}
      className="scroll-mt-28"
    >
      <div className="mb-6 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id={`${sectionId}-heading`}
            className="font-playfair text-2xl font-bold text-gray-900 sm:text-3xl"
          >
            {category}
          </h2>
          <p className="font-inter mt-1 text-sm text-gray-500">
            Hand-picked {category.toLowerCase()} favorites
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
