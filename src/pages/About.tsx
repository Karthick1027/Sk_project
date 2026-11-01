import React from 'react';
import { Award, Heart, Users, BookOpen, Sparkles, CalendarHeart } from 'lucide-react';
import srinithiPic from '../../src/images/srinithi_portrait.jpg';
import SectionHeading from '../components/SectionHeading';
import AboutBackdrop, { Mandala } from '../components/AboutBackdrop';

const About: React.FC = () => {
  const certifications = [
    "Professional Makeup Artist",
    "Advanced Color Theory",
    "Airbrush Makeup"
  ];

  const values = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'Passion Driven',
      text: 'Every look I create comes from genuine love for the art of beauty'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Client Focused',
      text: 'Your comfort, vision, and happiness are my top priorities'
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Excellence',
      text: 'Continuous learning and perfecting techniques for flawless results'
    }
  ];

  return (
    <div className="pt-20">
      {/* Hero Section */}
      {/* Extra top padding on phones clears the 52px garland across the top of the backdrop */}
      <section className="relative overflow-hidden pt-16 pb-10 sm:py-14 lg:py-16 bg-gradient-to-b from-beige to-ivory">
        <AboutBackdrop />
        <div className="relative container mx-auto px-4 md:max-w-[90%]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-14 items-center">
            <div className="animate-fade-in text-center lg:text-left">
              <p className="eyebrow mb-2 sm:mb-5">The Artist Behind SK Bridal Studio</p>
              <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl font-medium text-chocolate leading-[1.1]">
                Meet <span className="font-cormorant italic text-cocoa">Srinithi.A.K</span>
              </h1>
              <div className="ornament mt-4 sm:mt-8 mx-auto lg:mx-0" />
              <p className="font-inter text-base sm:text-lg md:text-xl text-ink mt-4 sm:mt-8 mb-8 sm:mb-10 leading-relaxed">
                Over 4 years into my professional makeup journey, which began in July 2022, I truly believe that beauty is not just about
                looking good - it's about feeling confident, radiant, and authentically yourself.
              </p>
              <div className="grid w-full sm:inline-grid sm:w-auto grid-cols-3 divide-x divide-sand card">
                {[
                  { value: '4+', label: 'Years Experience' },
                  { value: '230+', label: 'Happy Brides' },
                  { value: '5+', label: 'Students Trained' },
                ].map((stat) => (
                  <div key={stat.label} className="px-2 sm:px-8 py-4 sm:py-5 text-center">
                    <div className="font-playfair text-2xl sm:text-3xl font-medium text-chocolate">{stat.value}</div>
                    <div className="font-inter text-[10px] sm:text-[11px] uppercase tracking-[0.12em] sm:tracking-[0.2em] text-cocoa mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative mx-auto w-[calc(100%-2.5rem)] max-w-sm sm:max-w-md lg:max-w-lg">
              <Mandala className="pointer-events-none absolute left-1/2 top-[42%] w-[150%] max-w-none -translate-x-1/2 -translate-y-1/2 text-mocha opacity-25 animate-[spin_160s_linear_infinite] motion-reduce:animate-none" />
              <div className="absolute inset-0 -translate-x-5 translate-y-5 rounded-t-full border border-champagne" />
              <div className="relative overflow-hidden rounded-t-full shadow-luxe bg-sand">
                <img
                  src={srinithiPic}
                  alt="Srinithi - Professional Makeup Artist"
                  className="w-full h-[24rem] sm:h-[28rem] lg:h-[620px] object-cover object-[50%_15%]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-chocolate/25 via-transparent to-transparent"></div>
              </div>
              {/* Floating elements */}
              <div className="absolute top-10 -right-3 w-12 h-12 sm:w-16 sm:h-16 bg-chocolate rounded-full flex items-center justify-center shadow-luxe animate-float">
                <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 text-champagne" />
              </div>
              <div className="absolute -bottom-5 left-4 sm:left-6 card px-4 sm:px-5 py-3 animate-float" style={{ animationDelay: '1s' }}>
                <p className="font-script text-xl sm:text-2xl text-cocoa leading-none whitespace-nowrap">Makeup is an Art</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-10 md:py-16 bg-ivory">
        <div className="container mx-auto px-4">
          <SectionHeading eyebrow="Our Story" title="My Beauty Journey" className="mb-6" />
          <div className="mb-8 flex justify-center">
            {/* Shorter label and tighter tracking on phones keep the pill on one line */}
            <span className="inline-flex items-center gap-2 sm:gap-2.5 whitespace-nowrap rounded-full border border-champagne bg-beige px-4 sm:px-5 py-2 font-inter text-[11px] sm:text-sm font-medium uppercase tracking-[0.12em] sm:tracking-[0.2em] text-cocoa">
              <CalendarHeart className="w-4 h-4 shrink-0 text-mocha" />
              <span><span className="hidden sm:inline">Makeup </span>journey began ·</span>
              <span className="font-semibold text-chocolate">July 2022</span>
            </span>
          </div>
          <div className="max-w-3xl mx-auto space-y-6 font-inter text-base sm:text-lg text-ink leading-relaxed">
            <p className="first-letter:float-left first-letter:mr-3 first-letter:font-playfair first-letter:text-5xl sm:first-letter:text-6xl first-letter:leading-[0.85] first-letter:text-chocolate">
              My journey into the world of makeup began with a deep passion that grew within me from a young age. What started as a fascination soon became a dream to make people feel confident, beautiful, and special through my work.
            </p>
            <p>
            After completing my studies, my husband, Karthikeyan, became my biggest support system. From the very beginning of our 10-year journey of love, he believed in my talent and encouraged me to pursue makeup as a profession. His constant motivation helped me take the first step toward becoming a certified professional makeup artist, and in <span className='font-semibold text-chocolate'>July 2022</span>, my professional makeup journey officially began.
            </p>
            <p>
            Our journey together has not always been easy. We have faced many challenges, including financial struggles and medical difficulties. Despite everything, we stood strong, supporting each other through every situation. While I was working night shifts to support our financial needs, I also continued building my career in makeup with dedication and determination. At the same time, Karthikeyan, working in the IT field, managed both our responsibilities and supported my dreams without hesitation.
            </p>
            <blockquote className="my-8 sm:my-10 border-y border-sand py-6 sm:py-8 text-center">
              <p className="font-cormorant italic text-2xl sm:text-3xl md:text-4xl text-chocolate leading-snug">
                "Makeup is not just my passion it is my identity."
              </p>
            </blockquote>
            <p>
            Makeup is not just my passion it is my identity. And this business is not just mine, it is my husband’s dream too. Together, we have traveled across many places for events, gaining experience, meeting wonderful clients, and growing stronger both professionally and personally. Through love, fights, challenges, and happiness, we have always stood by each other.
            </p>
            <p>
            In 2026, we turned our long journey of love into a beautiful marriage. Today, I am proud to be a full-time professional makeup artist, while my husband continues to manage and support every aspect of our business.
            </p>
            <p>
            Together, we built our brand <span className='font-semibold text-chocolate'>SK Bridal Studio</span>, which is officially registered under MSME and also GST certified. This reflects our commitment to professionalism, trust, and quality service for every client we serve.
            </p>
             <p>
            Looking ahead, our next big dream is to start a professional makeup academy. Our goal is to train and inspire the next generation of makeup artists, helping them build successful careers, earn independently, and follow their passion with confidence.
            </p>
             <p>
            This journey is not just about makeup it is about love, perseverance, hard work, and believing in each other’s dreams. We are grateful for every experience, every client, and every moment that has shaped our story. And we look forward to continuing this beautiful journey together, creating more magic with makeup and inspiring others to follow their dreams as well.
            </p>
          </div>

          {/* Compact rows (icon beside the text) until md, where the three sit side by side as centred cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mt-8 md:mt-14 max-w-6xl mx-auto">
            {values.map((value) => (
              <div key={value.title} className="group card flex items-center gap-4 p-4 text-left md:block md:px-6 md:py-8 md:text-center lg:px-8 lg:py-10 hover:-translate-y-1 transition-transform duration-500">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-champagne bg-beige text-cocoa md:mx-auto md:mb-5 md:h-14 md:w-14 group-hover:bg-chocolate group-hover:text-ivory transition-colors duration-500 [&>svg]:h-5 [&>svg]:w-5 md:[&>svg]:h-6 md:[&>svg]:w-6">
                  {value.icon}
                </div>
                <div>
                  <h3 className="font-playfair text-lg md:text-2xl font-medium text-chocolate md:mb-3">{value.title}</h3>
                  <p className="mt-0.5 md:mt-0 font-inter text-sm md:text-base text-ink leading-relaxed">{value.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="py-10 md:py-16 bg-beige">
        <div className="container mx-auto px-4">
          <SectionHeading
            eyebrow="Certified Expertise"
            title="Professional Credentials"
            subtitle="Committed to excellence through continuous education and professional development"
            className="mb-8 md:mb-10"
          />

          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 max-w-6xl mx-auto">
            {certifications.map((cert) => (
              <div key={cert} className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] bg-ivory rounded-2xl p-5 sm:p-6 border border-sand/70 shadow-soft hover:shadow-luxe transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 shrink-0 bg-sand text-cocoa rounded-full flex items-center justify-center group-hover:bg-chocolate group-hover:text-champagne transition-colors duration-500">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-playfair text-lg font-medium text-chocolate">{cert}</h3>
                    <p className="font-inter text-xs uppercase tracking-[0.2em] text-mocha mt-1">Certified Professional</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
