import React from 'react';

const ProductListingSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse space-y-16" aria-hidden="true">
      {/* Featured skeleton */}
      <section className="rounded-3xl border border-sand/60 bg-ivory/60 p-6 sm:p-8">
        <div className="mb-6 h-8 w-48 rounded-lg bg-sand sm:h-9 sm:w-56" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-sand/70 bg-ivory">
              <div className="aspect-square bg-sand/60" />
              <div className="space-y-3 p-4">
                <div className="h-3 w-20 rounded bg-sand" />
                <div className="h-5 w-3/4 rounded bg-sand" />
                <div className="h-3 w-full rounded bg-beige" />
                <div className="h-3 w-5/6 rounded bg-beige" />
                <div className="flex justify-between pt-2">
                  <div className="h-6 w-14 rounded bg-sand" />
                  <div className="h-10 w-28 rounded-full bg-sand" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* Category block skeleton */}
      <section>
        <div className="mb-6 h-8 w-40 rounded-lg bg-sand" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-sand/70 bg-ivory">
              <div className="aspect-square bg-sand/60" />
              <div className="space-y-3 p-4">
                <div className="h-3 w-16 rounded bg-sand" />
                <div className="h-5 w-2/3 rounded bg-sand" />
                <div className="h-3 w-full rounded bg-beige" />
                <div className="flex justify-between pt-2">
                  <div className="h-6 w-12 rounded bg-sand" />
                  <div className="h-10 w-24 rounded-full bg-sand" />
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
