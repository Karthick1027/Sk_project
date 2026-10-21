import React, { useState, useEffect } from 'react';
import { X, Heart, Star, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import classImage from '../../src/images/bridal_class.jpg';
import studentSuccess from '../../src/images/studentSuccess.png';
import birthdayGlam from '../../src/images/birthday_glam.png';
import Garden_wedding from '../../src/images/Garden_wedding.jpeg';
import Reception from '../../src/images/Reception.jpeg';
import Special_Occasion from '../../src/images/Special_Occasion.jpeg';
import Classic_Bridal from '../../src/images/Classic_Bridal.jpeg';
import Glamorous from '../../src/images/Glamorous.jpg';
import Bridal_Look from '../../src/images/Bridal_Look.jpeg';
import { useNavigate } from "react-router-dom";
import PageHero from '../components/PageHero';
import { GalleryBackdrop } from '../components/PageBackdrops';
import CtaBanner from '../components/CtaBanner';

interface GalleryImage {
  id: number;
  src: string;
  category: string;
  title: string;
  description: string;
}

// Client shoot photos, web-optimised copies of the originals (src/images/IMG_*.jpeg / .CR3)
const clientPhotos = import.meta.glob<string>('../images/gallery/*.jpg', { eager: true, import: 'default' });

const clientShoots: [number, string, string, string][] = [
  [2126, 'Bridal', 'Golden Kanjeevaram Bride', 'Classic temple-gold silk with a soft, luminous base that glows under stage lights'],
  [2127, 'Bridal', 'Muhurtham Moments', 'Radiant, long-wear bridal glam that stays flawless through every wedding ritual'],
  [2128, 'Bridal', 'Garden Profile', 'Softly sculpted features and a sleek bun finished with fresh jasmine'],
  [2129, 'Bridal', 'Jasmine Jadai', 'Traditional braided hairstyle adorned with jasmine and a gold-tasselled kunjalam'],
  [2130, 'Reception', 'Ruby Sequin Glow', 'Rosy eyes and dewy skin to match a shimmering red sequin saree'],
  [2131, 'Reception', 'Scarlet Evening', 'Soft waves and a luminous finish paired with red sequins and pearls'],
  [2132, 'Reception', 'Red Carpet Ready', 'A head-to-toe glam look built to shine at an evening celebration'],
  [2133, 'Reception', 'Behind the Scenes', 'Precision lip work in progress, perfecting every detail before the big moment'],
  [2134, 'Bridal', 'Blush Silk Bride', 'Soft pink tones and a braided updo for a fresh, romantic bridal look'],
  [2135, 'Bridal', 'Rose Gold Radiance', 'Warm rose-gold eyes and a glowing base to complement a pink silk saree'],
  [2142, 'Reception', 'Ivory Engagement Glam', 'Elegant ivory lehenga styled with emerald jewellery and a soft-glam finish'],
  [2143, 'Reception', 'Family Blessings', 'Joyful moments with loved ones, with makeup that looks perfect up close'],
  [2144, 'Reception', 'Emerald & Ivory', 'Defined eyes and a radiant smile framed by emerald statement jewellery'],
  [2145, 'Reception', 'Floral Wall Elegance', 'A graceful full-length look against a wall of white roses'],
  [2146, 'Reception', 'Regal Repose', 'Effortless elegance with a long-lasting, camera-ready finish'],
  [2147, 'Reception', 'Graceful Gaze', 'Soft contour and luminous skin for a timeless engagement portrait'],
  [2148, 'Events', 'Blush Lehenga Glam', 'Pastel pink lehenga paired with soft curls and a radiant, camera-ready base'],
  [2149, 'Bridal', 'Maroon & Mustard Bride', 'Rich silk saree with a warm, glowing bridal base and temple jewellery'],
  [2150, 'Events', 'Golden Hour Drama', 'Dramatic light and shadow showing off a luminous, sculpted finish'],
  [2151, 'Bridal', 'Final Touches', 'Perfecting the bridal look moments before she steps out'],
  [2152, 'Bridal', 'Timeless Silk Bride', 'Classic South Indian bridal glam with a confident, joyful finish'],
  [2153, 'Bridal', 'Jasmine Bridal Braid', 'Intricate jasmine-woven braid complementing a richly embroidered blouse'],
  [2154, 'Bridal', 'Morning Light Bride', 'Violet silk and antique gold jewellery with a fresh, natural glow'],
  [2155, 'Bridal', 'Violet Temple Bride', 'Traditional matha patti and temple gold paired with flawless bridal skin'],
  [2156, 'Bridal', 'Joyful Bride', 'A bright, happy bridal look that photographs beautifully in natural light'],
  [2157, 'Bridal', 'Window-Light Glow', 'Luminous skin and defined eyes that shine in soft daylight'],
  [2158, 'Reception', 'Golden Lehenga Reception', 'Champagne-gold lehenga with soft waves and a glamorous reception finish'],
  [2159, 'Reception', 'Mehendi & Sparkle', 'Delicate details, from intricate mehendi to statement rings and bangles'],
  [2160, 'Reception', 'Champagne Elegance', 'Soft glam with long, flowing waves for an elegant evening look'],
  [2161, 'Reception', 'Reception Radiance', 'A warm, glowing base that holds up through hours of celebration'],
  [2162, 'Reception', 'Golden Smile', 'Natural glam that lets the bride\'s joy take centre stage'],
  [2163, 'Reception', 'Soft Waves & Shimmer', 'Shimmering eyes and voluminous waves to complete the reception look'],
  [2164, 'Reception', 'Grand Entrance', 'A full-length reception look made for the big walk-in'],
  [2165, 'Reception', 'Candlelight Glow', 'Luminous skin that catches every bit of warm candlelight'],
  [2166, 'Reception', 'Spotlight Moment', 'A sculpted, radiant finish that shines under dramatic lighting'],
  [2167, 'Bridal', 'Bridal Hair Artistry', 'Ornate bun adorned with jasmine strands and a jewelled hair brooch'],
  [2168, 'Bridal', 'Purple Silk Bride', 'Classic matha patti and temple jewellery with a soft, luminous finish'],
  [2169, 'Bridal', 'Matha Patti Close-Up', 'Fluttery lashes and soft rosy tones up close'],
  [2170, 'Bridal', 'Mehendi & Smiles', 'Fresh, glowing bridal skin paired with intricate mehendi and bangles'],
  [2171, 'Bridal', 'Garden Bloom', 'A soft, natural bridal look framed by blooming greenery'],
  [2172, 'Bridal', 'Violet Garden Bride', 'Rich violet silk and gold jewellery with a timeless traditional finish'],
  [2173, 'Party', 'Midnight Sequin Glam', 'Navy sequin lehenga paired with defined eyes and soft glam'],
  [2174, 'Events', 'Traditional Elegance', 'Olive and purple silk with a classic braided hairstyle'],
  [2175, 'Events', 'Mustard & Plum', 'Kundan jewellery and fresh, glowing skin for a traditional celebration'],
  [2176, 'Events', 'Floral Braid Glam', 'A braided crown with fresh flowers and a soft, youthful glow'],
  [2177, 'Events', 'Pink Silk Celebration', 'Vibrant pink silk saree with a fresh, radiant finish'],
  [2178, 'Events', 'Scarlet Silk Smile', 'Bright red silk, pearls and a natural glow for a festive occasion'],
];

const clientImages: GalleryImage[] = clientShoots.map(([num, category, title, description]) => ({
  id: num,
  src: clientPhotos[`../images/gallery/client_${num}.jpg`],
  category,
  title,
  description,
}));

const Gallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const categories = ['All', 'Bridal', 'Party', 'Reception', 'Events', 'Classes'];

  const images: GalleryImage[] = [
    ...clientImages,
    {
      id: 1,
      src: Bridal_Look,
      category: 'Bridal',
      title: 'Bridal Look',
      description: 'Soft, romantic makeup with natural glowing skin and subtle rose tones'
    },
    {
      id: 2,
      src: Glamorous,
      category: 'Party',
      title: 'Glamorous Evening',
      description: 'Bold, dramatic eyes with perfect contouring for a night to remember'
    },
    {
      id: 3,
      src: classImage,
      category: 'Classes',
      title: 'Makeup Masterclass',
      description: 'Teaching advanced contouring techniques in our professional studio'
    },
    {
      id: 4,
      src: Reception,
      category: 'Reception',
      title: 'Reception Ready',
      description: 'Long-lasting makeup perfect for dancing and celebrating all night'
    },
    {
      id: 5,
      src: Classic_Bridal,
      category: 'Bridal',
      title: 'Classic Bridal Beauty',
      description: 'Timeless elegance with perfect winged liner and natural radiance'
    },
    {
      id: 6,
      src: Special_Occasion,
      category: 'Events',
      title: 'Special Occasion',
      description: 'Sophisticated look for corporate events and milestone celebrations'
    },
    {
      id: 7,
      src: birthdayGlam,
      category: 'Party',
      title: 'Birthday Glam',
      description: 'Sparkling eyes and glossy lips for an unforgettable birthday celebration'
    },
    {
      id: 8,
      src: Garden_wedding,
      category: 'Bridal',
      title: 'Garden Wedding',
      description: 'Fresh, dewy makeup perfect for outdoor ceremonies and natural lighting'
    },
    {
      id: 9,
      src: studentSuccess,
      category: 'Classes',
      title: 'Student Success',
      description: 'Proud moment as students master professional makeup techniques'
    }
  ];

  const filteredImages = selectedCategory === 'All'
    ? images
    : images.filter(img => img.category === selectedCategory);

 const [likedImages, setLikedImages] = useState<{ [key: string]: boolean }>({});

 const navigate = useNavigate();

  // While the lightbox is open, stop the page behind it from scrolling (important on touch devices) and close on Escape
  useEffect(() => {
    if (!selectedImage) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [selectedImage]);

  return (
    <div className="pt-20">
      <PageHero
        eyebrow="Our Portfolio"
        backdrop={<GalleryBackdrop />}
        title="Beauty Portfolio"
        subtitle="Every face tells a story, every look captures a moment. Explore my collection of beautiful transformations and witness the magic of professional makeup artistry."
      />

      {/* Category Filter */}
      <section className="sticky top-[72px] z-30 py-3 sm:py-5 bg-ivory/90 backdrop-blur-md border-y border-sand/60">
        <div className="container mx-auto px-4">
          <div className="no-scrollbar -mx-4 flex gap-2 sm:gap-3 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`shrink-0 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-inter text-sm font-medium tracking-wide transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-chocolate text-ivory shadow-soft"
                    : "bg-ivory text-cocoa border border-sand hover:border-champagne hover:bg-beige"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 sm:py-16 md:py-20 bg-ivory">
        <div className="container mx-auto px-4 md:max-w-[90%]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="group cursor-pointer bg-ivory rounded-2xl overflow-hidden border border-sand/60 shadow-soft hover:shadow-luxe transition-all duration-500 hover:-translate-y-2 animate-fade-in"
                onClick={() => setSelectedImage(image)}
              >
                <div className="relative overflow-hidden bg-sand">
                  <img
                    src={image.src}
                    alt={image.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full aspect-[4/5] lg:aspect-auto lg:h-96 object-cover object-[50%_30%] group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-chocolate/80 via-chocolate/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute bottom-5 left-5 right-5 text-ivory">
                      <p className="font-inter text-sm text-sand leading-relaxed">
                        {image.description}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-2 font-inter text-xs uppercase tracking-[0.25em] text-champagne">
                        View Look <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
                <div className="px-5 py-4 sm:px-6 sm:py-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <span className="font-inter text-[11px] font-semibold uppercase tracking-[0.25em] text-mocha">
                        {image.category}
                      </span>
                      <h3 className="font-playfair text-xl font-medium text-chocolate mt-1">
                        {image.title}
                      </h3>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent parent click
                        setLikedImages((prev) => ({
                          ...prev,
                          [image.id]: !prev[image.id],
                        }));
                      }}
                      aria-label={likedImages[image.id] ? "Unlike" : "Like"}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-sand hover:border-champagne transition-colors duration-300"
                    >
                      <Heart
                        className={`w-5 h-5 transition-all duration-300
                        ${
                          likedImages[image.id]
                            ? "fill-clay text-clay drop-shadow-glow"
                            : "text-mocha"
                        }
                      `}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-chocolate/90 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label={selectedImage.title}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90dvh] overflow-y-auto bg-ivory rounded-2xl shadow-luxe"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              aria-label="Close"
              className="absolute top-4 right-4 z-10 w-11 h-11 bg-ivory/90 text-chocolate rounded-full flex items-center justify-center hover:bg-champagne transition-colors duration-300"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2">
              <img
                src={selectedImage.src}
                alt={selectedImage.title}
                className="w-full h-72 sm:h-96 md:h-[28rem] lg:h-full lg:min-h-[32rem] object-cover bg-sand"
              />
              <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
                <p className="eyebrow mb-4">{selectedImage.category}</p>
                <h2 className="font-playfair text-2xl sm:text-3xl lg:text-4xl font-medium text-chocolate mb-4">
                  {selectedImage.title}
                </h2>
                <div className="ornament mb-6" />
                <p className="font-inter text-ink text-base sm:text-lg leading-relaxed mb-6 sm:mb-8">
                  {selectedImage.description}
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {selectedImage?.category === "Classes" ? (
                    <a
                      href="https://forms.gle/rfW2a95NHFgN874XA"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                    >
                      <Calendar className="w-5 h-5" />
                      Join Class
                    </a>
                  ) : (
                    <Link to="/contact" className="btn-primary">
                      <Calendar className="w-5 h-5" />
                      Book Similar Look
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <CtaBanner
        title="Ready for Your Close-Up?"
        text="Let's create your perfect look together. Whether it's for your special day or learning new skills, I'm here to make you feel absolutely radiant."
      >
        <button onClick={() => navigate("/contact")} className="btn-light">
          <Calendar className="w-5 h-5" />
          Book Your Session
        </button>
        <a
          href="https://forms.gle/rfW2a95NHFgN874XA"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost-light"
        >
          <Star className="w-5 h-5" />
          Join Makeup Class
        </a>
      </CtaBanner>
    </div>
  );
};

export default Gallery;
