import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  X, Heart, Calendar, ArrowRight, ChevronLeft, ChevronRight,
  Gem, Crown, Baby, PartyPopper, GraduationCap, Sparkles, Star,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import studentSuccess from '../../src/images/studentSuccess.png';
import Garden_wedding from '../../src/images/Garden_wedding.jpeg';
import Reception from '../../src/images/Reception.jpeg';
import Special_Occasion from '../../src/images/Special_Occasion.jpeg';
import Classic_Bridal from '../../src/images/Classic_Bridal.jpeg';
import Glamorous from '../../src/images/Glamorous.jpg';
import Bridal_Look from '../../src/images/Bridal_Look.jpeg';

interface GalleryImage {
  id: number;
  src: string;
  category: string;
  title: string;
  description: string;
}

interface Category {
  name: string;
  tagline: string;
  icon: LucideIcon;
  cover: string;
}

// Client shoot photos, web-optimised copies of the originals (src/images/IMG_*.jpeg / .CR3)
const clientPhotos = import.meta.glob<string>('../images/gallery/*.jpg', { eager: true, import: 'default' });
const clientPhoto = (num: number) => clientPhotos[`../images/gallery/client_${num}.jpg`];

const CLASS_FORM_URL = 'https://forms.gle/rfW2a95NHFgN874XA';

const categories: Category[] = [
  { name: 'Muhurtham', tagline: 'Traditional & Timeless Looks', icon: Gem, cover: clientPhoto(2155) },
  { name: 'Reception', tagline: 'Elegant & Modern Styles', icon: Crown, cover: clientPhoto(2130) },
  { name: 'Engagement', tagline: 'Soft & Romantic Looks', icon: Heart, cover: clientPhoto(2144) },
  { name: 'Babyshower', tagline: 'Graceful & Comfortable', icon: Baby, cover: clientPhoto(2148) },
  { name: 'Events', tagline: 'For All Special Occasions', icon: PartyPopper, cover: clientPhoto(2175) },
  { name: 'Bridal Class', tagline: 'Learn · Practice · Grow', icon: GraduationCap, cover: clientPhoto(2133) },
];

const clientShoots: [number, string, string, string][] = [
  [2126, 'Muhurtham', 'Golden Kanjeevaram Bride', 'Classic temple-gold silk with a soft, luminous base that glows under stage lights'],
  [2127, 'Muhurtham', 'Muhurtham Moments', 'Radiant, long-wear bridal glam that stays flawless through every wedding ritual'],
  [2128, 'Muhurtham', 'Garden Profile', 'Softly sculpted features and a sleek bun finished with fresh jasmine'],
  [2129, 'Muhurtham', 'Jasmine Jadai', 'Traditional braided hairstyle adorned with jasmine and a gold-tasselled kunjalam'],
  [2130, 'Reception', 'Ruby Sequin Glow', 'Rosy eyes and dewy skin to match a shimmering red sequin saree'],
  [2131, 'Reception', 'Scarlet Evening', 'Soft waves and a luminous finish paired with red sequins and pearls'],
  [2132, 'Reception', 'Red Carpet Ready', 'A head-to-toe glam look built to shine at an evening celebration'],
  [2133, 'Reception', 'Behind the Scenes', 'Precision lip work in progress, perfecting every detail before the big moment'],
  [2134, 'Muhurtham', 'Blush Silk Bride', 'Soft pink tones and a braided updo for a fresh, romantic bridal look'],
  [2135, 'Muhurtham', 'Rose Gold Radiance', 'Warm rose-gold eyes and a glowing base to complement a pink silk saree'],
  [2142, 'Engagement', 'Ivory Engagement Glam', 'Elegant ivory lehenga styled with emerald jewellery and a soft-glam finish'],
  [2143, 'Engagement', 'Family Blessings', 'Joyful moments with loved ones, with makeup that looks perfect up close'],
  [2144, 'Engagement', 'Emerald & Ivory', 'Defined eyes and a radiant smile framed by emerald statement jewellery'],
  [2145, 'Engagement', 'Floral Wall Elegance', 'A graceful full-length look against a wall of white roses'],
  [2146, 'Engagement', 'Regal Repose', 'Effortless elegance with a long-lasting, camera-ready finish'],
  [2147, 'Engagement', 'Graceful Gaze', 'Soft contour and luminous skin for a timeless engagement portrait'],
  [2148, 'Babyshower', 'Blush Lehenga Glam', 'Pastel pink lehenga paired with soft curls and a radiant, camera-ready base'],
  [2149, 'Muhurtham', 'Maroon & Mustard Bride', 'Rich silk saree with a warm, glowing bridal base and temple jewellery'],
  [2150, 'Events', 'Golden Hour Drama', 'Dramatic light and shadow showing off a luminous, sculpted finish'],
  [2151, 'Muhurtham', 'Final Touches', 'Perfecting the bridal look moments before she steps out'],
  [2152, 'Muhurtham', 'Timeless Silk Bride', 'Classic South Indian bridal glam with a confident, joyful finish'],
  [2153, 'Muhurtham', 'Jasmine Bridal Braid', 'Intricate jasmine-woven braid complementing a richly embroidered blouse'],
  [2154, 'Muhurtham', 'Morning Light Bride', 'Violet silk and antique gold jewellery with a fresh, natural glow'],
  [2155, 'Muhurtham', 'Violet Temple Bride', 'Traditional matha patti and temple gold paired with flawless bridal skin'],
  [2156, 'Muhurtham', 'Joyful Bride', 'A bright, happy bridal look that photographs beautifully in natural light'],
  [2157, 'Muhurtham', 'Window-Light Glow', 'Luminous skin and defined eyes that shine in soft daylight'],
  [2158, 'Reception', 'Golden Lehenga Reception', 'Champagne-gold lehenga with soft waves and a glamorous reception finish'],
  [2159, 'Reception', 'Mehendi & Sparkle', 'Delicate details, from intricate mehendi to statement rings and bangles'],
  [2160, 'Reception', 'Champagne Elegance', 'Soft glam with long, flowing waves for an elegant evening look'],
  [2161, 'Reception', 'Reception Radiance', 'A warm, glowing base that holds up through hours of celebration'],
  [2162, 'Reception', 'Golden Smile', 'Natural glam that lets the bride\'s joy take centre stage'],
  [2163, 'Reception', 'Soft Waves & Shimmer', 'Shimmering eyes and voluminous waves to complete the reception look'],
  [2164, 'Reception', 'Grand Entrance', 'A full-length reception look made for the big walk-in'],
  [2165, 'Reception', 'Candlelight Glow', 'Luminous skin that catches every bit of warm candlelight'],
  [2166, 'Reception', 'Spotlight Moment', 'A sculpted, radiant finish that shines under dramatic lighting'],
  [2167, 'Muhurtham', 'Bridal Hair Artistry', 'Ornate bun adorned with jasmine strands and a jewelled hair brooch'],
  [2168, 'Muhurtham', 'Purple Silk Bride', 'Classic matha patti and temple jewellery with a soft, luminous finish'],
  [2169, 'Muhurtham', 'Matha Patti Close-Up', 'Fluttery lashes and soft rosy tones up close'],
  [2170, 'Muhurtham', 'Mehendi & Smiles', 'Fresh, glowing bridal skin paired with intricate mehendi and bangles'],
  [2171, 'Muhurtham', 'Garden Bloom', 'A soft, natural bridal look framed by blooming greenery'],
  [2172, 'Muhurtham', 'Violet Garden Bride', 'Rich violet silk and gold jewellery with a timeless traditional finish'],
  [2173, 'Events', 'Midnight Sequin Glam', 'Navy sequin lehenga paired with defined eyes and soft glam'],
  [2174, 'Events', 'Traditional Elegance', 'Olive and purple silk with a classic braided hairstyle'],
  [2175, 'Events', 'Mustard & Plum', 'Kundan jewellery and fresh, glowing skin for a traditional celebration'],
  [2176, 'Events', 'Floral Braid Glam', 'A braided crown with fresh flowers and a soft, youthful glow'],
  [2177, 'Events', 'Pink Silk Celebration', 'Vibrant pink silk saree with a fresh, radiant finish'],
  [2178, 'Events', 'Scarlet Silk Smile', 'Bright red silk, pearls and a natural glow for a festive occasion'],
  [3237, 'Reception', 'Emerald Serenity', 'Bronzed shimmer eyes and glossy nude lips paired with a diamond choker'],
  [3254, 'Reception', 'Behind the Curtain', 'A radiant reception glow framed by rich velvet drapes and emerald embroidery'],
  [3799, 'Reception', 'The Grand Twirl', 'An emerald lehenga in full swirl with a flawless finish built for the stage'],
];

const images: GalleryImage[] = [
  ...clientShoots.map(([num, category, title, description]) => ({
    id: num,
    src: clientPhoto(num),
    category,
    title,
    description,
  })),
  { id: 1, src: Bridal_Look, category: 'Muhurtham', title: 'Bridal Look', description: 'Soft, romantic makeup with natural glowing skin and subtle rose tones' },
  { id: 2, src: Glamorous, category: 'Events', title: 'Glamorous Evening', description: 'Bold, dramatic eyes with perfect contouring for a night to remember' },
  { id: 3, src: Reception, category: 'Reception', title: 'Reception Ready', description: 'Long-lasting makeup perfect for dancing and celebrating all night' },
  { id: 4, src: Classic_Bridal, category: 'Muhurtham', title: 'Classic Bridal Beauty', description: 'Timeless elegance with perfect winged liner and natural radiance' },
  { id: 5, src: Special_Occasion, category: 'Events', title: 'Special Occasion', description: 'Sophisticated look for corporate events and milestone celebrations' },
  { id: 6, src: Garden_wedding, category: 'Muhurtham', title: 'Garden Wedding', description: 'Fresh, dewy makeup perfect for outdoor ceremonies and natural lighting' },
  { id: 7, src: studentSuccess, category: 'Bridal Class', title: 'Student Success', description: 'Proud moment as students master professional makeup techniques' },
];

// "All" view: take one photo from each category in turn, so every row shows a mix of looks
const featuredOrder: GalleryImage[] = (() => {
  const groups = categories.map((c) => images.filter((img) => img.category === c.name));
  const longest = Math.max(...groups.map((g) => g.length));
  const out: GalleryImage[] = [];
  for (let i = 0; i < longest; i++) {
    groups.forEach((g) => g[i] && out.push(g[i]));
  }
  return out;
})();

const countFor = (name: string) => images.filter((img) => img.category === name).length;

const INITIAL_VISIBLE = 12;

const Gallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [likedImages, setLikedImages] = useState<{ [key: number]: boolean }>({});
  const gridRef = useRef<HTMLElement>(null);

  const filteredImages = useMemo(
    () => (selectedCategory === 'All' ? featuredOrder : images.filter((img) => img.category === selectedCategory)),
    [selectedCategory]
  );
  const visibleImages = showAll ? filteredImages : filteredImages.slice(0, INITIAL_VISIBLE);
  const selectedImage = selectedIndex !== null ? filteredImages[selectedIndex] : null;
  const activeCategory = categories.find((c) => c.name === selectedCategory);

  const selectCategory = (name: string, scroll = false) => {
    setSelectedCategory(name);
    setShowAll(false);
    if (scroll) gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const viewAll = () => {
    setShowAll(true);
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const step = useCallback(
    (dir: 1 | -1) =>
      setSelectedIndex((i) => (i === null ? i : (i + dir + filteredImages.length) % filteredImages.length)),
    [filteredImages.length]
  );
  const isOpen = selectedIndex !== null;

  // While the lightbox is open, stop the page behind it from scrolling (important on touch devices); Escape closes, arrows navigate
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedIndex(null);
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, step]);

  return (
    <div className="pt-20 bg-ivory">
      {/* Hero */}
      <section className="relative overflow-hidden bg-beige">
        <div className="relative h-[22rem] sm:h-[28rem] lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[62%]">
          {/* Landscape photo with the bride on the left third: zoom in on her, centred on mobile and pushed right on desktop (clear of the text fade) */}
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={clientPhoto(2154)}
              alt="Smiling bride in a violet silk saree and temple-gold jewellery"
              className="h-full w-full object-cover object-[0%_30%] scale-150 origin-[49%_30%] lg:object-center lg:scale-[1.8] lg:origin-[4%_24%]"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-beige via-beige/10 to-transparent lg:bg-gradient-to-r lg:via-beige/30 lg:via-25% lg:to-50%" />
          <p className="hidden sm:block absolute right-6 bottom-8 lg:right-12 lg:bottom-12 font-script text-4xl lg:text-5xl leading-tight text-chocolate/80 -rotate-6 text-right drop-shadow-[0_1px_6px_rgba(255,252,246,0.9)]">
            Real People<br />
            <span className="pl-10">Real Stories</span>
          </p>
        </div>

        <div className="relative container mx-auto px-4 md:max-w-[90%] -mt-20 pb-12 sm:pb-16 lg:mt-0 lg:py-28 xl:py-32">
          <div className="max-w-xl animate-fade-in">
            <p className="eyebrow mb-4 sm:mb-5">Our Gallery</p>
            <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl font-medium text-chocolate leading-[1.1]">
              Moments Made
              <span className="block bg-gradient-to-r from-cocoa via-mocha to-cocoa bg-clip-text text-transparent pb-1">
                More Beautiful
              </span>
            </h1>
            <p className="font-inter text-base sm:text-lg text-ink leading-relaxed mt-5 sm:mt-6 max-w-md">
              Explore our real client looks for every special occasion. Get inspired and find the perfect style for your big day.
            </p>
            <div className="mt-6 sm:mt-8 flex items-center gap-3 text-champagne">
              <span className="h-px w-12 bg-gradient-to-r from-transparent to-champagne" />
              <Sparkles className="w-4 h-4" />
              <span className="h-px w-12 bg-gradient-to-l from-transparent to-champagne" />
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="sticky top-[72px] z-30 py-3 sm:py-4 bg-ivory/90 backdrop-blur-md border-b border-sand/60">
        <div className="container mx-auto px-4">
          <div className="no-scrollbar -mx-4 flex gap-2 sm:gap-3 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:justify-center lg:overflow-visible lg:px-0">
            {[{ name: 'All', icon: null as LucideIcon | null }, ...categories].map(({ name, icon: Icon }) => (
              <button
                key={name}
                onClick={() => selectCategory(name)}
                aria-pressed={selectedCategory === name}
                className={`shrink-0 inline-flex items-center gap-2 px-5 py-2 sm:py-2.5 rounded-full font-inter text-sm font-medium tracking-wide transition-all duration-300 ${
                  selectedCategory === name
                    ? 'bg-chocolate text-ivory shadow-soft'
                    : 'bg-beige text-cocoa border border-sand/70 hover:border-champagne hover:bg-sand/50'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="pt-8 sm:pt-12 bg-ivory">
        <div className="container mx-auto px-4 md:max-w-[90%]">
          <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 xl:grid-cols-6">
            {categories.map((cat) => {
              const active = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => selectCategory(cat.name, true)}
                  className={`group relative w-[62vw] max-w-[260px] shrink-0 snap-start overflow-hidden rounded-2xl bg-sand text-left transition-all duration-500 md:w-auto md:max-w-none ${
                    active
                      ? '-translate-y-1.5 ring-[3px] ring-champagne shadow-[0_28px_50px_-22px_rgba(59,38,30,0.6),0_0_28px_rgba(216,194,165,0.6)]'
                      : 'shadow-soft hover:-translate-y-1.5 hover:shadow-luxe'
                  }`}
                >
                  <img
                    src={cat.cover}
                    alt={`${cat.name} makeup look`}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[5/7] w-full object-cover object-[50%_20%] transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-chocolate/90 via-chocolate/25 to-transparent" />
                  <span className="absolute top-3 left-3 rounded-full bg-ivory/85 px-2.5 py-1 font-inter text-[11px] font-medium text-cocoa backdrop-blur-sm">
                    {countFor(cat.name)} looks
                  </span>
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <h3 className="font-playfair text-2xl font-medium text-ivory">{cat.name}</h3>
                    <p className="mt-1 font-inter text-xs text-sand/90">{cat.tagline}</p>
                    <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-ivory px-4 py-2 font-inter text-xs font-medium text-chocolate transition-colors duration-300 group-hover:bg-champagne">
                      View Gallery <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section ref={gridRef} className="scroll-mt-36 py-10 sm:py-14 bg-ivory">
        <div className="container mx-auto px-4 md:max-w-[90%]">
          <div className="mb-6 sm:mb-8 flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-playfair text-2xl sm:text-3xl md:text-4xl font-medium text-chocolate">
                  {activeCategory ? `${activeCategory.name} Gallery` : 'Featured Gallery'}
                </h2>
                <span className="hidden sm:flex items-center gap-2 text-champagne">
                  <span className="h-px w-10 bg-champagne" />
                  <Sparkles className="w-4 h-4" />
                </span>
              </div>
              <p className="mt-1 font-inter text-sm text-mocha">
                {activeCategory ? activeCategory.tagline : 'A handpicked mix from every occasion'} · {filteredImages.length} photos
              </p>
            </div>
            {!showAll && filteredImages.length > INITIAL_VISIBLE && (
              <button
                onClick={viewAll}
                className="shrink-0 inline-flex items-center gap-2 font-inter text-sm font-medium text-chocolate hover:text-cocoa transition-colors duration-300"
              >
                View All Photos <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
            {visibleImages.map((image, index) => (
              <div
                key={image.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedIndex(index)}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedIndex(index)}
                className="group relative cursor-pointer overflow-hidden rounded-xl bg-sand shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-luxe animate-fade-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne"
              >
                <img
                  src={image.src}
                  alt={image.title}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[3/4] w-full object-cover object-[50%_25%] transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-chocolate/85 via-chocolate/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 text-ivory">
                    <span className="font-inter text-[10px] font-semibold uppercase tracking-[0.25em] text-champagne">
                      {image.category}
                    </span>
                    <h3 className="font-playfair text-base sm:text-lg leading-snug">{image.title}</h3>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Don't open the lightbox
                    setLikedImages((prev) => ({ ...prev, [image.id]: !prev[image.id] }));
                  }}
                  aria-label={likedImages[image.id] ? 'Unlike' : 'Like'}
                  className="absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-ivory/80 backdrop-blur-sm transition-colors duration-300 hover:bg-ivory"
                >
                  <Heart
                    className={`w-4 h-4 transition-all duration-300 ${
                      likedImages[image.id] ? 'fill-clay text-clay drop-shadow-glow' : 'text-cocoa'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          {!showAll && filteredImages.length > INITIAL_VISIBLE && (
            <div className="mt-8 sm:mt-10 text-center">
              <button onClick={() => setShowAll(true)} className="btn-outline">
                Show All {filteredImages.length} Photos
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Customized Look */}
      <section className="pb-14 sm:pb-20 bg-ivory">
        <div className="container mx-auto px-4 md:max-w-[90%]">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-sand/70 bg-gradient-to-r from-beige via-sand/40 to-beige px-6 py-8 sm:px-10 sm:py-10 md:px-14">
            <svg
              aria-hidden="true"
              viewBox="0 0 200 120"
              className="pointer-events-none absolute -right-4 -bottom-6 w-56 sm:w-72 text-mocha/30"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            >
              <path d="M10 115 C60 90 110 70 190 10" />
              {[[40, 98, -30], [70, 84, -40], [100, 68, -45], [130, 50, -50], [160, 30, -55]].map(([x, y, r]) => (
                <g key={x} transform={`translate(${x} ${y}) rotate(${r})`}>
                  <path d="M0 0 C6 -12 18 -14 26 -10 C18 -4 8 0 0 0Z" />
                  <path d="M0 0 C-4 12 4 22 12 26 C12 16 8 6 0 0Z" />
                </g>
              ))}
            </svg>
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <h2 className="font-playfair text-2xl sm:text-3xl font-medium text-chocolate">
                  Looking for a Customized Look?
                </h2>
                <p className="mt-2 font-inter text-sm sm:text-base text-ink">
                  Let's create a look that's uniquely yours for your special day.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link to="/contact" className="btn-primary">
                  Book a Consultation <ArrowRight className="w-4 h-4" />
                </Link>
                <a href={CLASS_FORM_URL} target="_blank" rel="noopener noreferrer" className="btn-outline">
                  <Star className="w-4 h-4" />
                  Join Makeup Class
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-chocolate/90 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in"
          onClick={() => setSelectedIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label={selectedImage.title}
        >
          {filteredImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); step(-1); }}
                aria-label="Previous photo"
                className="absolute left-2 sm:left-6 top-1/2 z-10 hidden sm:flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/15 text-ivory hover:bg-ivory/30 transition-colors duration-300"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); step(1); }}
                aria-label="Next photo"
                className="absolute right-2 sm:right-6 top-1/2 z-10 hidden sm:flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/15 text-ivory hover:bg-ivory/30 transition-colors duration-300"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div
            className="relative max-w-4xl w-full max-h-[90dvh] overflow-y-auto bg-ivory rounded-2xl shadow-luxe"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedIndex(null)}
              aria-label="Close"
              className="absolute top-4 right-4 z-10 w-11 h-11 bg-ivory/90 text-chocolate rounded-full flex items-center justify-center hover:bg-champagne transition-colors duration-300"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2">
              <img
                key={selectedImage.id}
                src={selectedImage.src}
                alt={selectedImage.title}
                className="w-full h-72 sm:h-96 md:h-[28rem] lg:h-full lg:min-h-[32rem] object-cover bg-sand animate-fade-in"
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
                  {selectedImage.category === 'Bridal Class' ? (
                    <a href={CLASS_FORM_URL} target="_blank" rel="noopener noreferrer" className="btn-secondary">
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
                {filteredImages.length > 1 && (
                  <div className="mt-8 flex items-center justify-between font-inter text-sm text-mocha">
                    <button onClick={() => step(-1)} className="inline-flex items-center gap-1 hover:text-chocolate sm:hidden">
                      <ChevronLeft className="w-4 h-4" /> Prev
                    </button>
                    <span>{(selectedIndex ?? 0) + 1} / {filteredImages.length}</span>
                    <button onClick={() => step(1)} className="inline-flex items-center gap-1 hover:text-chocolate sm:hidden">
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
