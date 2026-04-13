import React from 'react';

const ProductListingSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse space-y-16" aria-hidden="true">
      {/* Featured skeleton */}
      <section className="rounded-3xl border border-rose-100/60 bg-white/60 p-6 sm:p-8">
        <div className="mb-6 h-8 w-48 rounded-lg bg-rose-100 sm:h-9 sm:w-56" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-rose-100/80 bg-white">
              <div className="aspect-square bg-gradient-to-br from-rose-100 to-blush-100" />
              <div className="space-y-3 p-4">
                <div className="h-3 w-20 rounded bg-rose-100" />
                <div className="h-5 w-3/4 rounded bg-rose-100" />
                <div className="h-3 w-full rounded bg-rose-50" />
                <div className="h-3 w-5/6 rounded bg-rose-50" />
                <div className="flex justify-between pt-2">
                  <div className="h-6 w-14 rounded bg-rose-100" />
                  <div className="h-10 w-28 rounded-full bg-blush-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* Category block skeleton */}
      <section>
        <div className="mb-6 h-8 w-40 rounded-lg bg-rose-100" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-rose-100/80 bg-white">
              <div className="aspect-square bg-gradient-to-br from-rose-100 to-blush-100" />
              <div className="space-y-3 p-4">
                <div className="h-3 w-16 rounded bg-rose-100" />
                <div className="h-5 w-2/3 rounded bg-rose-100" />
                <div className="h-3 w-full rounded bg-rose-50" />
                <div className="flex justify-between pt-2">
                  <div className="h-6 w-12 rounded bg-rose-100" />
                  <div className="h-10 w-24 rounded-full bg-blush-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductListingSkeleton;
