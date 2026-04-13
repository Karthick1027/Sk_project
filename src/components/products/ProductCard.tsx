import React from "react";
import type { Product } from "../../types/product";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-rose-100/80 bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-blush-200 hover:shadow-xl hover:shadow-blush-100/60">
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-rose-50 to-blush-50">
        <img
          src={product.image}
          alt={`${product.name} — ${product.category}`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="font-inter text-xs font-medium uppercase tracking-wide text-blush-500/90">
          {product.category}
        </p>
        <h3 className="font-playfair mt-1 text-lg font-semibold leading-snug text-gray-900 sm:text-xl">
          {product.name}
        </h3>
        <p className="font-inter mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-gray-600">
          {product.description}
        </p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          {product.price != null && product.price !== "" ? (
            <div className="flex flex-col gap-1">
              {/* Top Row: Discount + Price */}
              <div className="flex items-center gap-2">
                {product.discount && (
                  <span className="text-sm font-semibold text-blush-700">
                    -{product.discount}%
                  </span>
                )}

                <span className="font-inter text-xl font-bold text-blush-700">
                  ₹{product.price}
                </span>

                {product.weight && (
                  <span className="text-xs text-gray-500">
                    ({product.weight})
                  </span>
                )}
              </div>

              {/* Bottom Row: MRP + Price History */}
              <div className="flex items-center gap-2 text-sm">
                {product.mrp && (
                  <span className="text-gray-400 line-through">
                    ₹{product.mrp}
                  </span>
                )}

                <span className="text-gray-300">|</span>

                <button className="text-blush-700 hover:underline text-sm">
                  Price history
                </button>
              </div>
            </div>
          ) : (
            <span className="font-inter text-sm text-gray-400">
              See retailer
            </span>
          )}
          <a
            href={product.affiliateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="font-inter inline-flex min-h-[44px] min-w-[120px] items-center justify-center rounded-full bg-gradient-to-r from-blush-500 to-rose-500 px-5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blush-500"
          >
            Buy Now
          </a>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
