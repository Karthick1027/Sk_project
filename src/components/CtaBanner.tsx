import React from 'react';

interface CtaBannerProps {
  eyebrow?: string;
  title: React.ReactNode;
  text: React.ReactNode;
  children: React.ReactNode;
}

const CtaBanner: React.FC<CtaBannerProps> = ({ eyebrow = "Let's Create Magic", title, text, children }) => {
  return (
    <section className="relative overflow-hidden bg-chocolate text-ivory">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-champagne/15 blur-3xl" />
      <div className="pointer-events-none absolute inset-4 md:inset-6 rounded-2xl border border-champagne/20" />

      <div className="relative container mx-auto px-6 py-20 md:py-24 text-center">
        <p className="font-script text-3xl md:text-4xl text-champagne mb-3">{eyebrow}</p>
        <h2 className="font-playfair text-4xl md:text-5xl font-medium leading-tight max-w-3xl mx-auto">
          {title}
        </h2>
        <div className="ornament mx-auto mt-8" />
        <p className="font-inter text-lg text-sand/90 max-w-2xl mx-auto leading-relaxed mt-8 mb-10">
          {text}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {children}
        </div>
      </div>
    </section>
  );
};

export default CtaBanner;
