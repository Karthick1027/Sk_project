import React from 'react';

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: 'center' | 'left';
  className?: string;
}

const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow, title, subtitle, align = 'center', className = ''
}) => {
  const centered = align === 'center';

  return (
    <div className={`${centered ? 'text-center mx-auto' : 'text-left'} max-w-3xl ${className}`}>
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      <h2 className="font-playfair text-4xl md:text-5xl font-medium text-chocolate leading-tight">
        {title}
      </h2>
      <div className={`ornament mt-6 ${centered ? 'mx-auto' : ''}`} />
      {subtitle && (
        <p className="font-inter text-lg text-ink leading-relaxed mt-6">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeading;
