import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, MessageCircle, ArrowRight } from 'lucide-react';
import PageHero from '../components/PageHero';
import CtaBanner from '../components/CtaBanner';
import TestimonialSlider from '../components/TestimonialSlider';
import { ReviewsBackdrop } from '../components/PageBackdrops';
import { GOOGLE_REVIEWS_URL } from '../data/reviews';
import { useGoogleReviews } from '../hooks/useGoogleReviews';

const SEO_TITLE = 'Client Reviews | SK Bridal Studio';
const SEO_DESCRIPTION =
  'Read what brides and families say about their bridal, engagement and reception makeup with SK Bridal Studio in Chennai.';

const WHATSAPP_URL = 'https://wa.me/918668038093';

const Reviews: React.FC = () => {
  // Live rating, count and latest reviews from Google, falling back to data/reviews.ts
  const { rating, count, testimonials } = useGoogleReviews();

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
        eyebrow="Kind Words"
        backdrop={<ReviewsBackdrop />}
        title={
          <>
            Reviews from <span className="font-cormorant italic text-cocoa">Happy Clients</span>
          </>
        }
        subtitle="The joy and confidence of my clients is the greatest testament to my work"
      >
        {/* Rating summary */}
        <div className="mt-7 sm:mt-9 inline-flex items-center gap-3 rounded-full border border-sand bg-ivory/80 px-5 py-2.5 shadow-soft backdrop-blur-sm">
          <span className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 text-mocha fill-current" />
            ))}
          </span>
          <span className="font-playfair text-lg font-semibold text-chocolate">{rating.toFixed(1)}</span>
          <span className="font-inter text-xs uppercase tracking-[0.2em] text-mocha">
            {count} Google reviews
          </span>
        </div>
      </PageHero>

      {/* Reviews slider: new Google reviews appear automatically; older ones live in data/reviews.ts */}
      <section className="container mx-auto px-4 pt-8 pb-8 sm:pt-10 md:pb-12 md:max-w-[90%]">
        <TestimonialSlider testimonials={testimonials} rows={2} />
        <div className="mt-2 text-center">
          <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" className="btn-outline">
            <Star className="h-4 w-4" />
            See all reviews on Google
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <CtaBanner
        eyebrow="Your Story Next"
        title="Let's make your day one to remember"
        text="Share your wedding date and the look you have in mind, and let's plan a finish you'll love in person and in every photo."
      >
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-light">
          <MessageCircle className="h-4 w-4" />
          Chat on WhatsApp
        </a>
        <Link to="/portfolio" className="btn-ghost-light">
          View Portfolio
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CtaBanner>
    </div>
  );
};

export default Reviews;
