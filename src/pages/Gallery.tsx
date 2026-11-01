import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  X, Heart, Calendar, ArrowRight, ChevronLeft, ChevronRight,
  Gem, Crown, Baby, PartyPopper, GraduationCap, Sparkles, Star, Flower2, MessageCircle,
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
const WHATSAPP_URL = 'https://wa.me/918668038093';

const enquiryUrl = (img: GalleryImage) =>
  `${WHATSAPP_URL}?text=${encodeURIComponent(`Hi SK Bridal Studio, I'd love a look like "${img.title}" (${img.category}) from your portfolio.`)}`;

const categories: Category[] = [
  { name: 'Muhurtham', tagline: 'Traditional & Timeless Looks', icon: Gem, cover: clientPhoto(2155) },
  { name: 'Reception', tagline: 'Elegant & Modern Styles', icon: Crown, cover: clientPhoto(2130) },
  { name: 'Engagement', tagline: 'Soft & Romantic Looks', icon: Heart, cover: clientPhoto(2144) },
  { name: 'Babyshower', tagline: 'Graceful & Comfortable', icon: Baby, cover: clientPhoto(2148) },
  { name: 'Events', tagline: 'For All Special Occasions', icon: PartyPopper, cover: clientPhoto(2175) },
  { name: 'Hairstyles', tagline: 'Braids · Buns · Waves', icon: Flower2, cover: clientPhoto(2167) },
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

// Shots where the hair is the hero; they also stay listed under their occasion
const hairstyleShots = new Set([2129, 2167, 2153, 2128, 2176, 2163, 2134, 2174, 2160, 2148]);

const inCategory = (img: GalleryImage, name: string) =>
  img.category === name || (name === 'Hairstyles' && hairstyleShots.has(img.id));

const imagesFor = (name: string) => images.filter((img) => inCategory(img, name));

// "All" view: take one photo from each category in turn, so every row shows a mix of looks
const featuredOrder: GalleryImage[] = (() => {
  const groups = categories.map((c) => imagesFor(c.name));
  const longest = Math.max(...groups.map((g) => g.length));
  const out: GalleryImage[] = [];
  const seen = new Set<number>(); // Hairstyle shots belong to two groups; show each once
  for (let i = 0; i < longest; i++) {
    groups.forEach((g) => {
      if (g[i] && !seen.has(g[i].id)) {
        seen.add(g[i].id);
        out.push(g[i]);
      }
    });
  }
  return out;
})();

const countFor = (name: string) => imagesFor(name).length;

const INITIAL_VISIBLE = 12;

// Hearted photos are kept in this browser so the wishlist survives reloads and return visits
const WISHLIST = 'Wishlist';
const WISHLIST_KEY = 'sk-wishlist';

const loadWishlist = (): number[] => {
  try {
    const saved = JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? '[]');
    return Array.isArray(saved) ? saved.filter((id) => images.some((img) => img.id === id)) : [];
  } catch {
    return [];
  }
};

const wishlistUrl = (saved: GalleryImage[]) =>
  `${WHATSAPP_URL}?text=${encodeURIComponent(
    `Hi SK Bridal Studio, these are the looks on my wishlist from your portfolio:\n${saved
      .map((img) => `• ${img.title} (${img.category})`)
      .join('\n')}`
  )}`;

const Gallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>(loadWishlist);
  const gridRef = useRef<HTMLElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canSlide, setCanSlide] = useState({ prev: false, next: false });
  const thumbsRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);

  const isSaved = (id: number) => wishlist.includes(id);
  const toggleLike = (id: number) =>
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch {
      // Storage blocked (private mode etc.): the wishlist still works for this visit
    }
  }, [wishlist]);

  const savedImages = useMemo(
    () => wishlist.map((id) => images.find((img) => img.id === id)).filter((img): img is GalleryImage => !!img),
    [wishlist]
  );

  // While a photo is open, the wishlist view holds still, so un-hearting it doesn't swap the photo out
  const shownSaved = useRef(savedImages);
  if (selectedIndex === null) shownSaved.current = savedImages;

  const filteredImages =
    selectedCategory === 'All'
      ? featuredOrder
      : selectedCategory === WISHLIST
        ? shownSaved.current
        : imagesFor(selectedCategory);
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

  const updateSlider = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;
    setCanSlide({ prev: el.scrollLeft > 4, next: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  }, []);

  // Move the category slider by one card
  const slide = (dir: 1 | -1) => {
    const el = sliderRef.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    el.scrollBy({ left: dir * (card.offsetWidth + 16), behavior: 'smooth' });
  };

  useEffect(() => {
    updateSlider();
    window.addEventListener('resize', updateSlider);
    return () => window.removeEventListener('resize', updateSlider);
  }, [updateSlider]);

  // Picking a category from the pills brings its card into view if it's off to one side
  useEffect(() => {
    const el = sliderRef.current;
    const card = el?.querySelector<HTMLElement>(`[data-category="${selectedCategory}"]`);
    if (!el || !card) return;
    // The slider is the cards' offsetParent, so offsetLeft is measured from its scroll origin
    const left = card.offsetLeft;
    if (left < el.scrollLeft || left + card.offsetWidth > el.scrollLeft + el.clientWidth) {
      el.scrollTo({ left: left - 16, behavior: 'smooth' });
    }
  }, [selectedCategory]);

  const step = useCallback(
    (dir: 1 | -1) =>
      setSelectedIndex((i) => (i === null ? i : (i + dir + filteredImages.length) % filteredImages.length)),
    [filteredImages.length]
  );
  const isOpen = selectedIndex !== null;

  // Keep the current photo's thumbnail centred in the lightbox strip
  useEffect(() => {
    const el = thumbsRef.current;
    const thumb = selectedIndex !== null ? (el?.children[selectedIndex] as HTMLElement | undefined) : undefined;
    if (!el || !thumb) return;
    el.scrollTo({ left: thumb.offsetLeft - el.clientWidth / 2 + thumb.offsetWidth / 2, behavior: 'smooth' });
  }, [selectedIndex]);

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
          {/* Skipped at lg, where the narrower photo puts the bride right under it */}
          <p className="hidden sm:block lg:hidden xl:block absolute right-6 bottom-8 xl:right-12 xl:bottom-12 font-script text-4xl lg:text-5xl leading-tight text-chocolate/80 -rotate-6 text-right drop-shadow-[0_1px_6px_rgba(255,252,246,0.9)]">
            Real People<br />
            <span className="pl-10">Real Stories</span>
          </p>
        </div>

        <div className="relative container mx-auto px-4 md:max-w-[90%] -mt-10 sm:-mt-14 pb-5 sm:pb-12 lg:mt-0 lg:py-20 xl:py-24">
          <div className="max-w-xl animate-fade-in">
            <p className="eyebrow mb-4 sm:mb-5">Our Portfolio</p>
            <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl font-medium text-chocolate leading-[1.1]">
              Moments Made
              <span className="block bg-gradient-to-r from-cocoa via-mocha to-cocoa bg-clip-text text-transparent pb-1">
                More Beautiful
              </span>
            </h1>
            <p className="font-inter text-base sm:text-lg text-ink leading-relaxed mt-4 sm:mt-6 max-w-md">
              Explore our real client looks for every special occasion. Get inspired and find the perfect style for your big day.
            </p>
            <div className="mt-4 sm:mt-8 flex items-center gap-3 text-champagne">
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
          {/* Below lg the categories scroll sideways while Wishlist stays pinned on the right, so it's always in view.
              From lg the scroller dissolves (contents) and every pill wraps together in one centred row. */}
          <div className="flex items-center gap-2 lg:flex-wrap lg:justify-center">
            <div className="no-scrollbar -ml-4 flex min-w-0 flex-1 gap-2 sm:gap-3 overflow-x-auto pl-4 pr-6 [mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)] lg:contents">
              {[{ name: 'All', icon: null as LucideIcon | null }, ...categories].map(({ name, icon: Icon }) => (
                <button
                  key={name}
                  onClick={() => selectCategory(name)}
                  aria-pressed={selectedCategory === name}
                  className={`shrink-0 inline-flex items-center gap-2 px-5 lg:px-4 py-2 sm:py-2.5 rounded-full font-inter text-sm font-medium tracking-wide transition-all duration-300 ${
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
            <button
              onClick={() => selectCategory(WISHLIST, true)}
              aria-pressed={selectedCategory === WISHLIST}
              className={`shrink-0 inline-flex items-center gap-2 px-4 sm:px-5 lg:px-4 py-2 sm:py-2.5 rounded-full font-inter text-sm font-medium tracking-wide transition-all duration-300 ${
                selectedCategory === WISHLIST
                  ? 'bg-chocolate text-ivory shadow-soft'
                  : 'bg-blush/60 text-cocoa border border-blush hover:border-champagne'
              }`}
            >
              <Heart className={`w-4 h-4 ${wishlist.length ? 'fill-clay text-clay' : ''}`} />
              {WISHLIST}
              <span
                key={wishlist.length} // Re-mounts on change so the count pops in
                className={`min-w-[1.25rem] rounded-full px-1.5 text-center text-xs leading-5 animate-fade-in ${
                  selectedCategory === WISHLIST ? 'bg-ivory/20' : 'bg-ivory'
                }`}
              >
                {wishlist.length}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="pt-3 sm:pt-10 bg-ivory">
        <div className="relative container mx-auto px-4 md:max-w-[90%]">
          {(['prev', 'next'] as const).map((dir) => {
            const Icon = dir === 'prev' ? ChevronLeft : ChevronRight;
            return (
              <button
                key={dir}
                onClick={() => slide(dir === 'prev' ? -1 : 1)}
                disabled={!canSlide[dir]}
                aria-label={dir === 'prev' ? 'Previous categories' : 'More categories'}
                className={`absolute top-1/2 z-10 hidden md:flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-sand bg-ivory text-chocolate shadow-soft transition-all duration-300 hover:border-champagne hover:bg-champagne disabled:pointer-events-none disabled:opacity-0 ${
                  dir === 'prev' ? '-left-3 xl:-left-10' : '-right-3 xl:-right-10'
                }`}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
          {/* Padded so the active card's lift, ring and glow aren't clipped by the scroller */}
          <div
            ref={sliderRef}
            onScroll={updateSlider}
            className="no-scrollbar relative -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pt-2 pb-6 md:-mx-2 md:scroll-px-2 md:px-2"
          >
            {categories.map((cat) => {
              const active = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  data-category={cat.name}
                  onClick={() => selectCategory(cat.name, true)}
                  className={`group relative w-[42vw] max-w-[200px] sm:w-[30vw] sm:max-w-[220px] shrink-0 snap-start overflow-hidden rounded-2xl bg-sand text-left transition-all duration-500 md:w-[calc((100%-2rem)/3)] md:max-w-none lg:w-[calc((100%-3rem)/4)] xl:w-[calc((100%-5rem)/6)] ${
                    active
                      ? '-translate-y-1.5 ring-[3px] ring-champagne shadow-[0_28px_50px_-22px_rgba(59,38,30,0.6),0_0_28px_rgba(216,194,165,0.6)]'
                      : 'shadow-soft hover:-translate-y-1.5 hover:shadow-luxe'
                  }`}
                >
                  <img
                    src={cat.cover}
                    alt={cat.name === 'Hairstyles' ? 'Bridal hairstyle' : `${cat.name} makeup look`}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/5] w-full object-cover object-[50%_20%] transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-chocolate/90 via-chocolate/25 to-transparent" />
                  <span className="absolute top-2 left-2 sm:top-3 sm:left-3 rounded-full bg-ivory/85 px-2 py-0.5 sm:px-2.5 sm:py-1 font-inter text-[10px] sm:text-[11px] font-medium text-cocoa backdrop-blur-sm">
                    {countFor(cat.name)} {countFor(cat.name) === 1 ? 'look' : 'looks'}
                  </span>
                  <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5 xl:p-4 2xl:p-5">
                    <h3 className="font-playfair text-lg sm:text-2xl xl:text-xl 2xl:text-2xl font-medium text-ivory">{cat.name}</h3>
                    <p className="mt-0.5 sm:mt-1 font-inter text-[10px] sm:text-xs text-sand/90">{cat.tagline}</p>
                    <span className="mt-2 sm:mt-3 inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-ivory px-3 py-1.5 sm:px-4 sm:py-2 font-inter text-[11px] sm:text-xs font-medium text-chocolate transition-colors duration-300 group-hover:bg-champagne">
                      View Portfolio <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section ref={gridRef} className="scroll-mt-36 py-8 sm:py-10 bg-ivory">
        <div className="container mx-auto px-4 md:max-w-[90%]">
          <div className="mb-6 sm:mb-8 flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-playfair text-2xl sm:text-3xl md:text-4xl font-medium text-chocolate">
                  {selectedCategory === WISHLIST
                    ? 'My Wishlist'
                    : activeCategory ? `${activeCategory.name} Portfolio` : 'Featured Portfolio'}
                </h2>
                <span className="hidden sm:flex items-center gap-2 text-champagne">
                  <span className="h-px w-10 bg-champagne" />
                  <Sparkles className="w-4 h-4" />
                </span>
              </div>
              <p className="mt-1 font-inter text-sm text-mocha">
                {selectedCategory === WISHLIST
                  ? 'Looks you have saved'
                  : activeCategory ? activeCategory.tagline : 'A handpicked mix from every occasion'} · {filteredImages.length} photos
              </p>
            </div>
            {selectedCategory === WISHLIST && savedImages.length > 0 && (
              <a
                href={wishlistUrl(savedImages)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary shrink-0 !px-5 !py-2.5 text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Send my wishlist</span>
                <span className="sm:hidden">Send</span>
              </a>
            )}
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
                    toggleLike(image.id);
                  }}
                  aria-label={isSaved(image.id) ? 'Remove from wishlist' : 'Save to wishlist'}
                  aria-pressed={isSaved(image.id)}
                  className="absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-ivory/80 backdrop-blur-sm transition-colors duration-300 hover:bg-ivory"
                >
                  <Heart
                    className={`w-4 h-4 transition-all duration-300 ${
                      isSaved(image.id) ? 'fill-clay text-clay drop-shadow-glow' : 'text-cocoa'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          {selectedCategory === WISHLIST && savedImages.length === 0 && (
            <div className="rounded-2xl border border-dashed border-champagne bg-beige/50 px-6 py-12 text-center">
              <Heart className="mx-auto h-8 w-8 text-clay" />
              <p className="mt-4 font-playfair text-xl text-chocolate">Your wishlist is empty</p>
              <p className="mt-2 font-inter text-sm text-mocha">
                Tap the heart on any look you love and it will be saved here.
              </p>
              <button onClick={() => selectCategory('All')} className="btn-outline mt-6">
                Browse all looks
              </button>
            </div>
          )}

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
      <section className="pb-10 sm:pb-14 bg-ivory">
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
            {/* Stacked until lg: on tablets the two buttons leave the heading too little room */}
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <h2 className="font-playfair text-2xl sm:text-3xl font-medium text-chocolate">
                  Looking for a Customized Look?
                </h2>
                <p className="mt-2 font-inter text-sm sm:text-base text-ink">
                  Let's create a look that's uniquely yours for your special day.
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
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
      {selectedImage && (() => {
        const CategoryIcon = categories.find((c) => c.name === selectedImage.category)?.icon ?? Sparkles;
        const position = (selectedIndex ?? 0) + 1;
        const hasMany = filteredImages.length > 1;
        const liked = isSaved(selectedImage.id);
        const navBtn = 'flex items-center justify-center rounded-full transition-all duration-300';
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-chocolate/85 p-3 backdrop-blur-md animate-fade-in sm:p-6"
            onClick={() => setSelectedIndex(null)}
            role="dialog"
            aria-modal="true"
            aria-label={selectedImage.title}
          >
            {/* Outside arrows only where there's room beside the panel */}
            {hasMany && (['prev', 'next'] as const).map((dir) => {
              const Icon = dir === 'prev' ? ChevronLeft : ChevronRight;
              return (
                <button
                  key={dir}
                  onClick={(e) => { e.stopPropagation(); step(dir === 'prev' ? -1 : 1); }}
                  aria-label={dir === 'prev' ? 'Previous photo' : 'Next photo'}
                  className={`${navBtn} absolute top-1/2 z-10 hidden xl:flex h-14 w-14 -translate-y-1/2 border border-ivory/25 bg-ivory/10 text-ivory hover:scale-105 hover:bg-ivory hover:text-chocolate ${
                    dir === 'prev' ? 'left-8' : 'right-8'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </button>
              );
            })}

            <div
              className="relative grid w-full max-w-5xl max-h-[92dvh] grid-cols-1 overflow-y-auto overflow-x-hidden rounded-2xl bg-ivory shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)] ring-1 ring-champagne/40 sm:rounded-3xl lg:h-[min(88dvh,42rem)] lg:grid-cols-[1.1fr_1fr] lg:grid-rows-1 lg:overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedIndex(null)}
                aria-label="Close"
                className={`${navBtn} absolute top-3 right-3 z-20 h-10 w-10 border border-sand bg-ivory/90 text-chocolate shadow-soft backdrop-blur-sm hover:rotate-90 hover:bg-chocolate hover:text-ivory sm:top-4 sm:right-4`}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Photo: shown whole, over a blurred copy of itself so portrait and landscape shots both fill the frame */}
              <div
                className="relative h-[50dvh] overflow-hidden bg-chocolate sm:h-[60dvh] lg:h-full"
                onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
                onTouchEnd={(e) => {
                  if (touchX.current === null) return;
                  const dx = e.changedTouches[0].clientX - touchX.current;
                  if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
                  touchX.current = null;
                }}
              >
                <img
                  src={selectedImage.src}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full scale-125 object-cover opacity-60 blur-2xl"
                />
                <img
                  key={selectedImage.id}
                  src={selectedImage.src}
                  alt={selectedImage.title}
                  className="relative h-full w-full object-contain animate-fade-in"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-chocolate/60 to-transparent" />
                {hasMany && (
                  <>
                    <span className="absolute bottom-4 left-4 rounded-full bg-chocolate/55 px-3 py-1 font-inter text-xs font-medium tracking-wider text-ivory backdrop-blur-sm">
                      {String(position).padStart(2, '0')} / {String(filteredImages.length).padStart(2, '0')}
                    </span>
                    <div className="absolute bottom-3 right-3 flex gap-2 xl:hidden">
                      {(['prev', 'next'] as const).map((dir) => {
                        const Icon = dir === 'prev' ? ChevronLeft : ChevronRight;
                        return (
                          <button
                            key={dir}
                            onClick={() => step(dir === 'prev' ? -1 : 1)}
                            aria-label={dir === 'prev' ? 'Previous photo' : 'Next photo'}
                            className={`${navBtn} h-10 w-10 bg-ivory/90 text-chocolate shadow-soft hover:bg-ivory`}
                          >
                            <Icon className="w-5 h-5" />
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Details */}
              <div className="relative flex min-h-0 flex-col bg-gradient-to-br from-ivory via-ivory to-beige p-6 sm:p-8 lg:overflow-y-auto lg:p-10">
                <div key={selectedImage.id} className="my-auto animate-fade-in">
                  <span className="inline-flex items-center gap-2 rounded-full border border-sand bg-beige px-3.5 py-1.5 font-inter text-[11px] font-semibold uppercase tracking-[0.25em] text-cocoa">
                    <CategoryIcon className="w-3.5 h-3.5 text-mocha" />
                    {selectedImage.category}
                  </span>
                  <h2 className="mt-5 pr-10 font-playfair text-2xl sm:text-3xl lg:text-[2.5rem] font-medium leading-tight text-chocolate">
                    {selectedImage.title}
                  </h2>
                  <div className="mt-4 flex items-center gap-2 text-champagne">
                    <span className="h-px w-10 bg-champagne" />
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <p className="mt-4 font-inter text-base leading-relaxed text-ink sm:text-[17px]">
                    {selectedImage.description}
                  </p>

                  <div className="mt-7 flex flex-wrap items-center gap-3">
                    {selectedImage.category === 'Bridal Class' ? (
                      <a href={CLASS_FORM_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">
                        <GraduationCap className="w-5 h-5" />
                        Join Class
                      </a>
                    ) : (
                      <Link to="/contact" className="btn-primary">
                        <Calendar className="w-5 h-5" />
                        Book Similar Look
                      </Link>
                    )}
                    <a href={enquiryUrl(selectedImage)} target="_blank" rel="noopener noreferrer" className="btn-outline">
                      <MessageCircle className="w-5 h-5" />
                      Enquire
                    </a>
                    <button
                      onClick={() => toggleLike(selectedImage.id)}
                      aria-label={liked ? 'Remove from wishlist' : 'Save to wishlist'}
                      aria-pressed={liked}
                      className={`${navBtn} h-12 w-12 border ${
                        liked ? 'border-clay/40 bg-blush/60' : 'border-sand bg-ivory hover:border-champagne hover:bg-beige'
                      }`}
                    >
                      <Heart className={`w-5 h-5 transition-all duration-300 ${liked ? 'scale-110 fill-clay text-clay' : 'text-cocoa'}`} />
                    </button>
                  </div>
                </div>

                {hasMany && (
                  <div className="mt-8 border-t border-sand/70 pt-5">
                    <div className="mb-3 flex items-center justify-between font-inter text-xs text-mocha">
                      <span className="font-semibold uppercase tracking-[0.2em]">
                        {activeCategory ? `More ${activeCategory.name}` : 'More Looks'}
                      </span>
                      <span className="hidden lg:inline">Use ← → keys</span>
                    </div>
                    <div ref={thumbsRef} className="no-scrollbar relative -mx-1 flex gap-2 overflow-x-auto px-1 py-1">
                      {filteredImages.map((img, i) => (
                        <button
                          key={img.id}
                          onClick={() => setSelectedIndex(i)}
                          aria-label={`View ${img.title}`}
                          aria-current={i === selectedIndex}
                          className={`h-16 w-12 shrink-0 overflow-hidden rounded-lg transition-all duration-300 ${
                            i === selectedIndex
                              ? 'ring-2 ring-chocolate ring-offset-2 ring-offset-ivory'
                              : 'opacity-55 hover:opacity-100'
                          }`}
                        >
                          <img src={img.src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover object-[50%_25%]" />
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 h-0.5 overflow-hidden rounded-full bg-sand">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-mocha to-chocolate transition-all duration-500"
                        style={{ width: `${(position / filteredImages.length) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default Gallery;
