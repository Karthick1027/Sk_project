import React, { useState } from 'react';
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

const Gallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const categories = ['All', 'Bridal', 'Party', 'Reception', 'Events', 'Classes'];

  const images: GalleryImage[] = [
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

  return (
    <div className="pt-20">
      <PageHero
        eyebrow="Our Portfolio"
        backdrop={<GalleryBackdrop />}
        title="Beauty Portfolio"
        subtitle="Every face tells a story, every look captures a moment. Explore my collection of beautiful transformations and witness the magic of professional makeup artistry."
      />

      {/* Category Filter */}
      <section className="sticky top-[72px] z-30 py-5 bg-ivory/90 backdrop-blur-md border-y border-sand/60">
        <div className="container mx-auto px-4">
          <div className="flex gap-3 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-0">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`shrink-0 px-6 py-2.5 rounded-lg font-inter text-sm font-medium tracking-wide transition-all duration-300 ${
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
      <section className="py-20 bg-ivory">
        <div className="container mx-auto px-4 max-w-[90%]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                    className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-700"
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
                <div className="px-6 py-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
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
          className="fixed inset-0 bg-chocolate/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-ivory rounded-2xl shadow-luxe"
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
                className="w-full h-96 lg:h-full object-cover bg-sand"
              />
              <div className="p-8 lg:p-10 flex flex-col justify-center">
                <p className="eyebrow mb-4">{selectedImage.category}</p>
                <h2 className="font-playfair text-3xl lg:text-4xl font-medium text-chocolate mb-4">
                  {selectedImage.title}
                </h2>
                <div className="ornament mb-6" />
                <p className="font-inter text-ink text-lg leading-relaxed mb-8">
                  {selectedImage.description}
                </p>
                <div className="flex items-center gap-4">
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
