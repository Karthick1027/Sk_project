import React, { useEffect } from 'react';
import { ShoppingBag, ExternalLink } from 'lucide-react';
import { affiliateProducts } from '../data/affiliateProducts';

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
    <div className="pt-20 min-h-screen bg-gradient-to-br from-rose-50 via-white to-blush-50">
      <div className="container mx-auto max-w-6xl px-4 py-10 sm:py-14">
        {/* Header Section */}
        <div className="text-center mb-12 sm:mb-16">
          {/* Shopping Bag Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-blush-100 to-rose-100 rounded-full">
              <ShoppingBag className="w-10 h-10 text-blush-600" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Products Mentioned in This Video
          </h1>

          {/* Subtitle */}
          <p className="font-inter text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Shop all the products featured in our video. Tap any product below to check it out on Amazon.
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-16">
          {affiliateProducts.map((product) => (
            <a
              key={product.id}
              href={product.affiliateLink}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="group"
            >
              <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden h-full hover:scale-105">
                {/* Card Content */}
                <div className="p-6 sm:p-8 h-full flex flex-col justify-between">
                  {/* Product Badge and Number */}
                  <div className="mb-4 flex items-center gap-2 flex-wrap">
                    <span className="inline-block bg-gradient-to-r from-blush-100 to-rose-100 text-blush-700 px-3 py-1 rounded-full text-sm font-semibold">
                      Product {product.id}
                    </span>
                    <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">
                      🔗 Affiliate Link
                    </span>
                  </div>

                  {/* Product Name */}
                  <h3 className="font-playfair text-lg sm:text-xl font-bold text-gray-900 mb-6 group-hover:text-blush-600 transition-colors duration-300 break-words">
                    {product.name}
                  </h3>

                  {/* CTA Button */}
                  <div className="flex flex-col gap-2">
                    <button className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blush-500 to-rose-500 hover:from-blush-600 hover:to-rose-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 group-hover:shadow-lg w-full">
                      Shop on Amazon
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <p className="text-xs text-gray-500 text-center font-inter">
                      Affiliate commission earned
                    </p>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Affiliate Disclosure */}
        <div className="bg-gradient-to-r from-blush-50 to-rose-50 rounded-2xl p-6 sm:p-8 border border-blush-200 text-center mb-12">
          <p className="font-inter text-gray-700 text-sm sm:text-base leading-relaxed">
            <span className="font-semibold">Affiliate Disclosure:</span> Some links on this page are Amazon affiliate links. If you purchase through these links, I may earn a small commission at no additional cost to you. Thank you for supporting my content! ❤️
          </p>
        </div>
      </div>
    </div>
  );
};

export default Products;
