import React, { useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { affiliateProducts } from '../data/affiliateProducts';
import PageHero from '../components/PageHero';
import { ProductsBackdrop } from '../components/PageBackdrops';

const SEO_TITLE = 'Amazon Products | SK Bridal Studio';
const SEO_DESCRIPTION =
  'Shop the skincare, haircare, beauty and personal care products featured in SK Bridal Studio videos through our Amazon affiliate links.';

const Products: React.FC = () => {
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

  return (
    <div className="pt-20 min-h-screen bg-ivory">
      <PageHero
        eyebrow="Shop the Look"
        backdrop={<ProductsBackdrop />}
        title="Products Mentioned in This Video"
        subtitle="Shop all the products featured in our video. Tap any product below to check it out on Amazon."
      />

      <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20 md:max-w-[90%]">
        {/* Product Grid */}
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16">
          {affiliateProducts.map((product) => (
            <a
              key={product.id}
              href={product.affiliateLink}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="group"
            >
              <div className="flex h-full flex-col bg-ivory rounded-2xl border border-sand/70 shadow-soft hover:shadow-luxe hover:-translate-y-1 hover:border-champagne transition-all duration-500 overflow-hidden">
                {/* Product Image */}
                <div className="relative w-full h-44 sm:h-48 bg-beige overflow-hidden flex items-center justify-center p-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-ivory/90 text-cocoa border border-sand px-2.5 py-1 rounded-md font-inter text-[11px] font-semibold uppercase tracking-[0.15em]">
                    No. {String(product.id).padStart(2, '0')}
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-4 sm:p-6 flex flex-1 flex-col">
                  <span className="self-start bg-blush text-cocoa px-2.5 py-1 rounded-md font-inter text-[11px] font-semibold uppercase tracking-[0.15em] mb-3">
                    Affiliate Link
                  </span>

                  {/* Product Name */}
                  <h3 className="flex-1 font-playfair text-lg font-medium text-chocolate leading-snug mb-5 group-hover:text-cocoa transition-colors duration-300 break-words">
                    {product.name}
                  </h3>

                  {/* CTA Button */}
                  <div className="flex flex-col gap-2">
                    <span className="btn-primary w-full !px-4 !py-3 text-sm">
                      Shop on Amazon
                      <ExternalLink className="w-4 h-4" />
                    </span>
                    <p className="text-xs text-mocha text-center font-inter">
                      Affiliate commission earned
                    </p>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Affiliate Disclosure */}
        <div className="max-w-4xl mx-auto bg-beige rounded-2xl p-6 sm:p-8 border border-sand text-center">
          <p className="font-inter text-ink text-sm sm:text-base leading-relaxed">
            <span className="font-semibold text-chocolate">Affiliate Disclosure:</span> Some links on this page are Amazon affiliate links. If you purchase through these links, I may earn a small commission at no additional cost to you. Thank you for supporting my content! ❤️
          </p>
        </div>
      </div>
    </div>
  );
};

export default Products;
