import React, { useState } from 'react';
import { X, Heart, Star, Calendar } from 'lucide-react';
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

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blush-50 via-white to-rose-50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-playfair text-5xl !leading-[1.2] md:text-6xl font-bold mb-6 bg-gradient-to-r from-blush-600 to-rose-600 bg-clip-text text-transparent">
            Beauty Portfolio
          </h1>
          <p className="font-inter text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Every face tells a story, every look captures a moment. Explore my
            collection of beautiful transformations and witness the magic of
            professional makeup artistry.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full font-inter font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-blush-500 to-rose-500 text-white shadow-lg scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-blush-50 hover:text-blush-600"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blush-50/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="group cursor-pointer bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                onClick={() => setSelectedImage(image)}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={image.src}
                    alt={image.title}
                    className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="inline-block px-3 py-1 bg-blush-500 rounded-full text-sm font-inter font-medium mb-2">
                        {image.category}
                      </div>
                      <h3 className="font-playfair text-xl font-semibold mb-1">
                        {image.title}
                      </h3>
                      <p className="font-inter text-sm opacity-90">
                        {image.description}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-playfair text-xl font-semibold text-gray-800 mb-1">
                        {image.title}
                      </h3>
                      <span className="inline-block px-3 py-1 bg-blush-100 text-blush-700 rounded-full text-sm font-inter font-medium">
                        {image.category}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent parent click
                        setLikedImages((prev) => ({
                          ...prev,
                          [image.id]: !prev[image.id],
                        }));
                      }}
                      className="group"
                    >
                      <Heart
                        className={`w-6 h-6 transition-all duration-300
                        ${
                          likedImages[image.id]
                            ? "fill-pink-500 text-pink-500 drop-shadow-glow"
                            : "text-gray-400"
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
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors duration-300"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2">
              <img
                src={selectedImage.src}
                alt={selectedImage.title}
                className="w-full h-96 lg:h-full object-cover"
              />
              <div className="p-8 flex flex-col justify-center">
                <div className="inline-block px-4 py-2 bg-blush-100 text-blush-700 rounded-full text-sm font-inter font-medium mb-4 self-start">
                  {selectedImage.category}
                </div>
                <h2 className="font-playfair text-3xl font-bold text-gray-800 mb-4">
                  {selectedImage.title}
                </h2>
                <p className="font-inter text-gray-600 text-lg leading-relaxed mb-8">
                  {selectedImage.description}
                </p>
                <div className="flex items-center space-x-4">
                  <Link to="/contact">
                    <button className="flex items-center space-x-2 bg-gradient-to-r from-blush-500 to-rose-500 text-white px-6 py-3 rounded-full font-inter font-medium hover:shadow-lg transition-all duration-300">
                      <Calendar className="w-5 h-5" />
                      <span>Book Similar Look</span>
                    </button>
                  </Link>
                  {/* <button className="flex items-center space-x-2 text-blush-600 hover:text-rose-600 transition-colors duration-300">
                    <Heart className="w-5 h-5" />
                    <span className="font-inter font-medium">Save to Favorites</span>
                  </button> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blush-500 via-rose-500 to-blush-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-6">
            Ready for Your Close-Up?
          </h2>
          <p className="font-inter text-xl mb-10 opacity-90 max-w-2xl mx-auto">
            Let's create your perfect look together. Whether it's for your
            special day or learning new skills, I'm here to make you feel
            absolutely radiant.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/contact"
              className="bg-white text-blush-600 px-8 py-4 rounded-full font-inter font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 inline-flex items-center justify-center space-x-2"
            >
              <Calendar className="w-5 h-5" />
              <span>Book Your Session</span>
            </Link>
            <a
              href="https://docs.google.com/forms/d/1xsbl8JnCwmDV62Ib9qHI4mAb2puVRq4YArCf3WbypoI/edit"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-white text-white px-8 py-4 rounded-full font-inter font-semibold text-lg hover:bg-white/10 hover:scale-105 transition-all duration-300 inline-flex items-center justify-center space-x-2"
            >
              <Star className="w-5 h-5" />
              <span>Join Makeup Class</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Gallery;