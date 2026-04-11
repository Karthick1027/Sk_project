import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Users, GraduationCap, Heart, Award, Calendar } from 'lucide-react';
import classImage from '../../src/images/bridal_class.jpg';
import bridalImage from '../../src/images/Bridal_pic.png';
import eventImage from '../../src/images/event_makeup.png';

const Counter: React.FC<{ end: number; duration: number; label: string; icon: React.ReactNode }> = ({ 
  end, duration, label, icon 
}) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById(`counter-${label}`);
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [label]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return (
    <div id={`counter-${label}`} className="text-center group">
      <div className="flex justify-center mb-4">
        <div className="p-4 bg-gradient-to-br from-blush-100 to-rose-100 rounded-2xl group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
      </div>
      <div className="font-playfair !leading-tight text-4xl md:text-5xl font-bold bg-gradient-to-r from-blush-600 to-rose-600 bg-clip-text text-transparent mb-2">
        {count}+
      </div>
      <p className="font-inter text-gray-600 font-medium">{label}</p>
    </div>
  );
};

const Home: React.FC = () => {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blush-50/90 via-white/95 to-rose-50/90"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/3373746/pexels-photo-3373746.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&fit=crop)'
          }}
        ></div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="animate-fade-in">
            <h1 className=" font-playfair text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blush-600 via-rose-600 to-blush-700 bg-clip-text text-transparent leading-tight">
              Beauty Beyond
              <br />
              <span className="italic !leading-[1.2]">Expectations</span>
            </h1>
            <p className="font-inter text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              Professional makeup artistry for your most precious moments. From dreamy bridal looks to glamorous events, 
              I create beauty that reflects your unique radiance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/contact"
                className="bg-gradient-to-r from-blush-500 to-rose-500 text-white px-8 py-4 rounded-full font-inter font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 inline-flex items-center space-x-2"
              >
                <Calendar className="w-5 h-5" />
                <span>Book Your Session</span>
              </Link>
             <a
              href="https://forms.gle/rfW2a95NHFgN874XA"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-blush-400 text-blush-600 px-8 py-4 rounded-full font-inter font-semibold text-lg hover:bg-blush-50 hover:scale-105 transition-all duration-300 inline-flex items-center space-x-2"
            >
              <GraduationCap className="w-5 h-5" />
              <span>Join Makeup Class</span>
            </a>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-20 left-10 animate-float">
            <div className="w-3 h-3 bg-gradient-to-r from-blush-400 to-rose-400 rounded-full opacity-60"></div>
          </div>
          <div className="absolute top-40 right-16 animate-float" style={{ animationDelay: '1s' }}>
            <div className="w-2 h-2 bg-gradient-to-r from-rose-400 to-blush-400 rounded-full opacity-60"></div>
          </div>
          <div className="absolute bottom-40 left-20 animate-float" style={{ animationDelay: '2s' }}>
            <div className="w-4 h-4 bg-gradient-to-r from-blush-300 to-rose-300 rounded-full opacity-40"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Trusted by Beautiful People
            </h2>
            <p className="font-inter text-xl text-gray-600 max-w-2xl mx-auto">
              Every client is a testament to our commitment to excellence and artistry
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <Counter
              end={220}
              duration={2500}
              label="Happy Bridal Clients"
              icon={<Heart className="w-8 h-8 text-blush-500" />}
            />
            <Counter
              end={3}
              duration={2500}
              label="Makeup Students Trained"
              icon={<GraduationCap className="w-8 h-8 text-rose-500" />}
            />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gradient-to-br from-blush-50 to-rose-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Signature Services
            </h2>
            <p className="font-inter text-xl text-gray-600 max-w-2xl mx-auto">
              From intimate celebrations to grand occasions, I bring your vision to life
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Bridal Makeup',
                description: 'Your wedding day deserves perfection. Timeless, elegant looks that photograph beautifully.',
                image: bridalImage,
                icon: <Heart className="w-6 h-6" />
              },
              {
                title: 'Event Makeup',
                description: 'Special occasions call for glamorous looks. From galas to parties, shine bright.',
                image: eventImage,
                icon: <Star className="w-6 h-6" />
              },
              {
                title: 'Makeup Classes',
                description: 'Learn professional techniques in personalized sessions. Master the art of beauty.',
                image: classImage,
                icon: <GraduationCap className="w-6 h-6" />
              }
            ].map((service, index) => (
              <div key={index} className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="relative overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-blush-100 to-rose-100 rounded-xl text-blush-600">
                      {service.icon}
                    </div>
                    <h3 className="font-playfair text-2xl font-semibold text-gray-800">{service.title}</h3>
                  </div>
                  <p className="font-inter text-gray-600 leading-relaxed mb-6">{service.description}</p>
                  {service.title === "Makeup Classes" ? (
                    <a
                      href="https://forms.gle/rfW2a95NHFgN874XA"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center font-inter font-semibold text-green-600 group-hover:text-emerald-600 transition-colors duration-300"
                    >
                      Join Class
                      <span className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </a>
                  ) : (
                    <Link
                      to="/contact"
                      className="inline-flex items-center font-inter font-semibold text-blush-600 group-hover:text-rose-600 transition-colors duration-300"
                    >
                      Learn More
                      <span className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blush-500 via-rose-500 to-blush-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-6">
              Ready to Look Absolutely Stunning?
            </h2>
            <p className="font-inter text-xl mb-10 opacity-90 leading-relaxed">
              Whether it's your special day or you want to master the art of makeup, 
              let's create something beautiful together.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/contact"
                className="bg-white text-blush-600 px-8 py-4 rounded-full font-inter font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 inline-flex items-center justify-center space-x-2"
              >
                <Calendar className="w-5 h-5" />
                <span>Book Appointment</span>
              </Link>
              <Link
                to="/gallery"
                className="border-2 border-white text-white px-8 py-4 rounded-full font-inter font-semibold text-lg hover:bg-white/10 hover:scale-105 transition-all duration-300 inline-flex items-center justify-center space-x-2"
              >
                <Award className="w-5 h-5" />
                <span>View Portfolio</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;