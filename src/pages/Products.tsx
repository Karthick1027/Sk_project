import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { products as allProducts, CATEGORY_ORDER } from '../data/products';
import type { ProductCategory } from '../types/product';
import CategoryTabs, { type FilterTab } from '../components/products/CategoryTabs';
import CategorySection from '../components/products/CategorySection';
import FeaturedProducts from '../components/products/FeaturedProducts';
import ProductListingSkeleton from '../components/products/ProductListingSkeleton';

const SEO_TITLE = 'Best Beauty Products - Affiliate Picks';
const SEO_DESCRIPTION =
  'Curated affiliate picks for makeup, skincare, haircare, and beauty tools. Compare trusted products and shop via secure partner links.';

const Products: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const skipTabScrollRef = useRef(true);

  useEffect(() => {
    const prevTitle = document.title;
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const created = !meta;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    const prevDesc = meta.getAttribute('content') ?? '';

    document.title = SEO_TITLE;
    meta.setAttribute('content', SEO_DESCRIPTION);

    return () => {
      document.title = prevTitle;
      if (created) {
        meta?.remove();
      } else {
        meta?.setAttribute('content', prevDesc);
      }
    };
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 900);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (skipTabScrollRef.current) {
      skipTabScrollRef.current = false;
      return;
    }
    if (activeTab === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(`category-${activeTab.toLowerCase()}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [activeTab]);

  const featured = useMemo(
    () => allProducts.filter((p) => p.featured),
    []
  );

  const featuredIds = useMemo(
    () => new Set(featured.map((p) => p.id)),
    [featured]
  );

  /** Category grids on "All" exclude featured items so cards are not duplicated under Featured. */
  const productsByCategoryExcludingFeatured = useMemo(() => {
    const map = new Map<ProductCategory, typeof allProducts>();
    for (const cat of CATEGORY_ORDER) {
      map.set(
        cat,
        allProducts.filter((p) => p.category === cat && !featuredIds.has(p.id))
      );
    }
    return map;
  }, [featuredIds]);

  const productsForCategory = useCallback(
    (category: ProductCategory) => {
      if (activeTab === 'all') {
        return productsByCategoryExcludingFeatured.get(category) ?? [];
      }
      return allProducts.filter((p) => p.category === category);
    },
    [activeTab, productsByCategoryExcludingFeatured]
  );

  if (loading) {
    return (
      <div className="pt-20">
        <div className="container mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <header className="mb-10 text-center sm:mb-14">
            <p className="font-inter text-sm font-medium uppercase tracking-widest text-blush-600">
              Shop
            </p>
            <h1 className="font-playfair mt-2 text-3xl font-bold text-gray-900 sm:text-4xl md:text-5xl">
              Beauty picks
            </h1>
            <p className="font-inter mx-auto mt-3 max-w-2xl text-gray-600">
              Loading curated products…
            </p>
          </header>
          <ProductListingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      <div className="container mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <header className="mb-8 text-center sm:mb-10">
          <p className="font-inter text-sm font-medium uppercase tracking-widest text-blush-600">
            Affiliate boutique
          </p>
          <h1 className="font-playfair mt-2 text-3xl font-bold text-gray-900 sm:text-4xl md:text-5xl">
            Beauty products we love
          </h1>
          <p className="font-inter mx-auto mt-3 max-w-2xl text-gray-600">
            Honest picks across makeup, skincare, haircare, and tools. When you buy through our
            links, we may earn a commission at no extra cost to you.
          </p>
        </header>

        <div className="mb-10 sm:mb-12">
          <CategoryTabs
            active={activeTab}
            onChange={setActiveTab}
            categories={CATEGORY_ORDER}
          />
        </div>

        <div className="space-y-14 sm:space-y-16">
          {activeTab === 'all' && <FeaturedProducts products={featured} />}

          {activeTab === 'all'
            ? CATEGORY_ORDER.map((category) => {
                const list = productsForCategory(category);
                if (list.length === 0) return null;
                return (
                  <CategorySection key={category} category={category} products={list} />
                );
              })
            : (() => {
                const list = productsForCategory(activeTab);
                if (list.length === 0) {
                  return (
                    <p className="font-inter text-center text-gray-500">
                      No products in this category yet.
                    </p>
                  );
                }
                return <CategorySection category={activeTab} products={list} />;
              })()}
        </div>
      </div>
    </div>
  );
};

export default Products;
