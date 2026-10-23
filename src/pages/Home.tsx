import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Star, GraduationCap, Heart, Award, Calendar, ArrowRight, Sparkles } from 'lucide-react';
// Service card photos come from the client gallery
import bridalImage from '../images/gallery/client_2170.jpg';
// Zoomed crop of gallery/4G4A3254.JPG.jpeg (client_3254)
import eventImage from '../images/event_3254.jpg';
import classImage from '../images/gallery/client_2133.jpg';
// Zoomed crop of IMG_2127 (same shoot as gallery/client_2127.jpg)
import clientImage from '../images/hero_bride_2127.jpg';
import SectionHeading from '../components/SectionHeading';
import CtaBanner from '../components/CtaBanner';
import HeroBackdrop, { LotusFlower } from '../components/HeroBackdrop';

const CLASS_FORM_URL = 'https://forms.gle/rfW2a95NHFgN874XA';

const Counter: React.FC<{ end: number; duration: number; label: string; icon: React.ReactNode }> = ({
  end, duration, label, icon
}) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

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
    <div ref={ref} className="text-center group px-4 py-6 md:px-6 md:py-8">
      <div className="flex justify-center mb-4 md:mb-5">
        <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full border border-champagne bg-beige text-cocoa group-hover:bg-chocolate group-hover:text-ivory transition-colors duration-500">
          {icon}
        </div>
      </div>
      <div className="font-playfair leading-tight text-4xl sm:text-5xl md:text-6xl font-medium text-chocolate mb-3">
        {count}+
      </div>
      <p className="font-inter text-xs md:text-sm uppercase tracking-[0.15em] md:tracking-[0.25em] text-cocoa">{label}</p>
    </div>
  );
};

const Home: React.FC = () => {
  const services = [
    {
      title: 'Bridal Makeup',
      description: 'Your wedding day deserves perfection. Timeless, elegant looks that photograph beautifully.',
      image: bridalImage,
      position: 'object-[50%_28%]',
      icon: <Heart className="w-5 h-5" />
    },
    {
      title: 'Event Makeup',
      description: 'Special occasions call for glamorous looks. From galas to parties, shine bright.',
      image: eventImage,
      position: 'object-[50%_20%]',
      icon: <Star className="w-5 h-5" />
    },
    {
      title: 'Makeup Classes',
      description: 'Learn professional techniques in personalized sessions. Master the art of beauty.',
      image: classImage,
      position: 'object-[50%_50%]',
      icon: <GraduationCap className="w-5 h-5" />
    }
  ];

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-beige via-ivory to-ivory">
        <HeroBackdrop />

        <div className="relative container mx-auto md:max-w-[90%] px-4 py-12 sm:py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="animate-fade-in text-center lg:text-left">
            <p className="eyebrow">Bridal Makeup · Events · Academy</p>
            <h1 className="mt-6 font-playfair text-4xl min-[400px]:text-5xl md:text-6xl xl:text-7xl font-medium text-chocolate leading-[1.08]">
              Beauty Beyond
              <span className="block font-cormorant italic font-medium text-cocoa mt-2">Expectations</span>
            </h1>
            <div className="ornament mt-6 sm:mt-8 mx-auto lg:mx-0" />
            <p className="mt-6 sm:mt-8 font-inter text-base sm:text-lg md:text-xl text-ink max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Professional makeup artistry for your most precious moments. From dreamy bridal looks to glamorous events,
              I create beauty that reflects your unique radiance.
            </p>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row sm:flex-wrap gap-4 justify-center lg:justify-start">
              <Link to="/contact" className="btn-primary">
                Book Your Makeup
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={CLASS_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                Join Makeup Class
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="mt-10 sm:mt-12 flex items-center justify-center lg:justify-start gap-4 sm:gap-6 text-cocoa">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-mocha fill-current" />
                ))}
              </div>
              <span className="h-4 w-px bg-champagne" />
              <p className="font-inter text-sm">
                Loved by <span className="font-semibold text-chocolate">230+ brides</span>
              </p>
            </div>
          </div>

          {/* Arched portrait */}
          <div className="relative mx-auto mt-12 lg:mt-0 w-[calc(100%-2rem)] max-w-xs sm:max-w-sm md:max-w-md animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {/* Outer hairline arch */}
            <div className="absolute -inset-4 rounded-t-full border border-champagne" />
            {/* Lotus crowning the arch */}
            <svg
              viewBox="-95 -112 190 128"
              className="absolute -top-[4.5rem] left-1/2 w-28 -translate-x-1/2 text-mocha"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <LotusFlower x={0} y={0} />
            </svg>
            {/* Gold rim */}
            <div className="relative aspect-[4/5] rounded-t-full p-1.5 bg-gradient-to-b from-champagne via-mocha to-champagne shadow-luxe">
              <div className="relative h-full w-full overflow-hidden rounded-t-full bg-sand ring-1 ring-ivory/70">
                <img
                  src={clientImage}
                  alt="Our bridal client, makeup by SK Bridal Studio"
                  className="h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-chocolate/30 via-transparent to-transparent" />
              </div>
            </div>

            <div className="absolute -bottom-6 -left-4 sm:-left-10 card px-4 py-3 sm:px-5 sm:py-4 flex items-center gap-3 sm:gap-4 animate-float">
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full bg-chocolate text-champagne">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="font-playfair text-lg text-chocolate leading-tight">Our Client</p>
                <p className="font-inter text-xs uppercase tracking-[0.2em] text-mocha">Real Bride · Real Glow</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-24 bg-ivory">
        <div className="container mx-auto px-4">
          <SectionHeading
            eyebrow="Our Promise"
            title="Trusted by Beautiful People"
            subtitle="Every client is a testament to our commitment to excellence and artistry"
            className="mb-10 md:mb-16"
          />

          <div className="card grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-sand/70 max-w-5xl mx-auto">
            <Counter
              end={230}
              duration={2500}
              label="Happy Bridal Clients"
              icon={<Heart className="w-6 h-6" />}
            />
            <Counter
              end={5}
              duration={1500}
              label="Years of Artistry"
              icon={<Award className="w-6 h-6" />}
            />
            <Counter
              end={5}
              duration={1500}
              label="Students Trained"
              icon={<GraduationCap className="w-6 h-6" />}
            />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24 bg-beige">
        <div className="container mx-auto px-4 md:max-w-[90%]">
          <SectionHeading
            eyebrow="What We Offer"
            title="Signature Services"
            subtitle="From intimate celebrations to grand occasions, I bring your vision to life"
            className="mb-10 md:mb-16"
          />

          {/* Flex-wrap rather than grid so the odd card out centres on two-column tablet layouts */}
          <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
            {services.map((service) => {
              const isClass = service.title === 'Makeup Classes';
              const linkClass = 'inline-flex items-center gap-2 font-inter text-sm font-semibold uppercase tracking-[0.2em] text-cocoa hover:text-chocolate transition-colors duration-300';
              const linkContent = (
                <>
                  {isClass ? 'Join Class' : 'Learn More'}
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                </>
              );

              return (
                <div key={service.title} className="group w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1.334rem)] bg-ivory rounded-2xl overflow-hidden border border-sand/60 shadow-soft hover:shadow-luxe transition-all duration-500 hover:-translate-y-2">
                  <div className="relative overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.title}
                      className={`w-full h-64 sm:h-72 object-cover ${service.position} group-hover:scale-105 transition-transform duration-700`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-chocolate/40 via-transparent to-transparent"></div>
                  </div>
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sand text-cocoa">
                        {service.icon}
                      </div>
                      <h3 className="font-playfair text-2xl font-medium text-chocolate">{service.title}</h3>
                    </div>
                    <p className="font-inter text-ink leading-relaxed mb-6">{service.description}</p>
                    <div className="h-px w-full bg-sand/70 mb-5" />
                    {isClass ? (
                      <a href={CLASS_FORM_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
                        {linkContent}
                      </a>
                    ) : (
                      <Link to="/contact" className={linkClass}>
                        {linkContent}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CtaBanner
        title="Ready to Look Absolutely Stunning?"
        text="Whether it's your special day or you want to master the art of makeup, let's create something beautiful together."
      >
        <Link to="/contact" className="btn-light">
          <Calendar className="w-5 h-5" />
          Book Appointment
        </Link>
        <Link to="/gallery" className="btn-ghost-light">
          <Award className="w-5 h-5" />
          View Portfolio
        </Link>
      </CtaBanner>
    </div>
  );
};

export default Home;
