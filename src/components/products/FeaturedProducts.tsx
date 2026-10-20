import React from 'react';
import type { Product } from '../../types/product';
import ProductCard from './ProductCard';

interface FeaturedProductsProps {
  products: Product[];
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ products }) => {
  if (products.length === 0) return null;

  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-sand/70 bg-beige p-6 shadow-sm sm:p-8"
      aria-labelledby="featured-heading"
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-champagne/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-blush/40 blur-3xl" />
      <div className="relative">
        <div className="mb-6 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-inter text-xs font-semibold uppercase tracking-widest text-mocha">
              Editor&apos;s choice
            </p>
            <h2
              id="featured-heading"
              className="font-playfair mt-1 text-2xl font-bold text-chocolate sm:text-3xl"
            >
              Featured products
            </h2>
            <p className="font-inter mt-1 max-w-xl text-sm text-ink">
              Standout picks we love — limited-time offers and cult favorites worth the click.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
