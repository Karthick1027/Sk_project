import React from 'react';

interface PageHeroProps {
  eyebrow: string;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  backdrop?: React.ReactNode;
}

const PageHero: React.FC<PageHeroProps> = ({ eyebrow, title, subtitle, backdrop }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-beige to-ivory">
      <div className="pointer-events-none absolute -top-40 -right-32 h-96 w-96 rounded-full bg-champagne/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-blush/40 blur-3xl" />
      {backdrop}

      <div className="relative container mx-auto px-4 py-20 md:py-28 text-center animate-fade-in">
        <p className="eyebrow mb-5">{eyebrow}</p>
        <h1 className="font-playfair text-5xl md:text-6xl font-medium text-chocolate leading-[1.15]">
          {title}
        </h1>
        <div className="ornament mx-auto mt-8" />
        <p className="font-inter text-lg md:text-xl text-ink max-w-3xl mx-auto leading-relaxed mt-8">
          {subtitle}
        </p>
      </div>
    </section>
  );
};

export default PageHero;
