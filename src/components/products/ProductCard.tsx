import React from "react";
import type { Product } from "../../types/product";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-sand/70 bg-ivory shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-champagne hover:shadow-luxe">
      <div className="relative aspect-square overflow-hidden bg-beige">
        <img
          src={product.image}
          alt={`${product.name} — ${product.category}`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-chocolate/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="font-inter text-xs font-medium uppercase tracking-wide text-mocha">
          {product.category}
        </p>
        <h3 className="font-playfair mt-1 text-lg font-semibold leading-snug text-chocolate sm:text-xl">
          {product.name}
        </h3>
        <p className="font-inter mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-ink">
          {product.description}
        </p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          {product.price != null && product.price !== "" ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                {product.discount && (
                  <span className="text-sm font-semibold text-chocolate">
                    -{product.discount}%
                  </span>
                )}

                <span className="font-inter text-xl font-bold text-chocolate">
                  ₹{product.price}
                </span>

                {product.weight && (
                  <span className="text-xs text-ink">
                    ({product.weight})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm">
                {product.mrp && (
                  <span className="text-mocha line-through">
                    ₹{product.mrp}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <span className="font-inter text-sm text-mocha">
              See retailer
            </span>
          )}
          <a
            href={product.affiliateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="font-inter inline-flex min-h-[44px] min-w-[120px] items-center justify-center rounded-lg bg-chocolate px-5 text-sm font-semibold text-ivory shadow-soft transition-all duration-300 hover:bg-cocoa focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
          >
            Buy Now
          </a>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
