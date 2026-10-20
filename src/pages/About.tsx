import React from 'react';
import { Award, Heart, Users, BookOpen, Star, Sparkles, Quote } from 'lucide-react';
import srinithiPic from '../../src/images/srinithi_pic.png';
import Sheeba from '../../src/images/Sheeba.png';
import Sabari from '../../src/images/Sabari.png';
import Ruby_Ganesh from '../../src/images/Ruby_Ganesh.png';
import Janani from '../../src/images/Janani.png';
import Chandru_pic from '../../src/images/Chandru_pic.png';
import SectionHeading from '../components/SectionHeading';
import AboutBackdrop, { Mandala } from '../components/AboutBackdrop';

const About: React.FC = () => {
  const certifications = [
    "Professional Makeup Artist",
    "Advanced Mehendi",
    "Advanced Color Theory",
    "Airbrush Makeup",
    "Professional Nail Art"
  ];

  const testimonials = [
    {
      name: "Janani",
      event: "Engagement",
      text: "I booked for my engagement makeup I'm so happy and satisfied with her amazing work everyone complimented me once again thank you for the beautiful work and make my day so beautiful",
      rating: 5,
      image: Janani
    },
    {
      name: "Chandra Prakash",
      event: "Wedding 2025",
      text: "We booked srinithimakeupartist for our wedding and reception. Make up was subtle, which we asked for. The output came out very well in the photoshoot as well. Overall it was very satisfying. Price is very reasonable. I would also recommend them for all your party events.",
      rating: 5,
      image: Chandru_pic
    },
    {
      name: "Ruby Ganesh",
      event: "Wedding & Reception",
      text: "Worth for money. Loved the look on my big day. It was amazing no words can explain the joy I had... Thanks a lot ❤❤❤Wishing you to achieve the greatest heights..... ❤",
      rating: 5,
      image: Ruby_Ganesh
    },
    {
      name: "Nivetha",
      event: "Engagement, Wedding, Reception",
      text: "Hi, I am nivetha. I booked makeup for my engagement, reception, marriage.. She done a great job. Makeup turn so good I like very much... Thank u for making my big day spl❤️😊.. All the best for your career srinithi 😊",
      rating: 5,
      image: ""
    },
    {
      name: "Sheeba Fathima",
      event: "Reception",
      text: "I really love how you made my makeup look so natural and enhanced my features, I'm so glad the makeup lasted all day without any touch-ups! Thank you for making my wedding day look so perfect❤️",
      rating: 5,
      image: Sheeba
    },
    {
      name: "Sabari Nathan",
      event: "Wedding",
      text: "Srinithi is absolutely amazing! She made my sister feel so confident and beautiful on her special day. The makeup was flawless, long-lasting, and looked stunning both in person and in photos. My sister received so many compliments! Thank you, Srinithi, for making my sister feel like the best version of herself. Highly recommended! 💖✨",
      rating: 5,
      image: Sabari
    },

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
      <section className="relative overflow-hidden py-14 sm:py-20 lg:py-24 bg-gradient-to-b from-beige to-ivory">
        <AboutBackdrop />
        <div className="relative container mx-auto px-4 md:max-w-[90%]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-16 items-center">
            <div className="animate-fade-in text-center lg:text-left">
              <p className="eyebrow mb-5">The Artist Behind SK Bridal Studio</p>
              <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl font-medium text-chocolate leading-[1.1]">
                Meet <span className="font-cormorant italic text-cocoa">Srinithi.A.K</span>
              </h1>
              <div className="ornament mt-6 sm:mt-8 mx-auto lg:mx-0" />
              <p className="font-inter text-base sm:text-lg md:text-xl text-ink mt-6 sm:mt-8 mb-8 sm:mb-10 leading-relaxed">
                With over 5 years of experience in professional makeup artistry, I believe that beauty is not just about
                looking good - it's about feeling confident, radiant, and authentically yourself.
              </p>
              <div className="grid w-full sm:inline-grid sm:w-auto grid-cols-3 divide-x divide-sand card">
                {[
                  { value: '5+', label: 'Years Experience' },
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
                  className="w-full h-[24rem] sm:h-[28rem] lg:h-[620px] object-cover"
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
      <section className="py-16 md:py-24 bg-ivory">
        <div className="container mx-auto px-4">
          <SectionHeading eyebrow="Our Story" title="My Beauty Journey" className="mb-12" />
          <div className="max-w-3xl mx-auto space-y-6 font-inter text-base sm:text-lg text-ink leading-relaxed">
            <p className="first-letter:float-left first-letter:mr-3 first-letter:font-playfair first-letter:text-5xl sm:first-letter:text-6xl first-letter:leading-[0.85] first-letter:text-chocolate">
              My journey into the world of makeup began with a deep passion that grew within me from a young age. What started as a fascination soon became a dream to make people feel confident, beautiful, and special through my work.
            </p>
            <p>
            After completing my studies, my husband, Karthikeyan, became my biggest support system. From the very beginning of our 10-year journey of love, he believed in my talent and encouraged me to pursue makeup as a profession. His constant motivation helped me take the first step toward becoming a certified professional makeup artist.
            </p>
            <p>
            Our journey together has not always been easy. We have faced many challenges, including financial struggles and medical difficulties. Despite everything, we stood strong, supporting each other through every situation. While I was working night shifts to support our financial needs, I also continued building my career in makeup with dedication and determination. At the same time, Karthikeyan, working in the IT field, managed both our responsibilities and supported my dreams without hesitation.
            </p>
            <blockquote className="my-8 sm:my-10 border-y border-sand py-6 sm:py-8 text-center">
              <p className="font-cormorant italic text-2xl sm:text-3xl md:text-4xl text-chocolate leading-snug">
                "Makeup is not just my passion—it is my identity."
              </p>
            </blockquote>
            <p>
            Makeup is not just my passion—it is my identity. And this business is not just mine, it is my husband’s dream too. Together, we have traveled across many places for events, gaining experience, meeting wonderful clients, and growing stronger both professionally and personally. Through love, fights, challenges, and happiness, we have always stood by each other.
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14 md:mt-20 max-w-6xl mx-auto">
            {values.map((value) => (
              <div key={value.title} className="text-center group card px-6 py-8 lg:px-8 lg:py-10 hover:-translate-y-1 transition-transform duration-500">
                <div className="w-14 h-14 border border-champagne bg-beige text-cocoa rounded-full flex items-center justify-center mx-auto mb-5 group-hover:bg-chocolate group-hover:text-ivory transition-colors duration-500">
                  {value.icon}
                </div>
                <h3 className="font-playfair text-2xl font-medium text-chocolate mb-3">{value.title}</h3>
                <p className="font-inter text-ink leading-relaxed">{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="py-16 md:py-24 bg-beige">
        <div className="container mx-auto px-4">
          <SectionHeading
            eyebrow="Certified Expertise"
            title="Professional Credentials"
            subtitle="Committed to excellence through continuous education and professional development"
            className="mb-10 md:mb-16"
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

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-ivory">
        <div className="container mx-auto px-4 md:max-w-[90%]">
          <SectionHeading
            eyebrow="Kind Words"
            title="What Clients Say"
            subtitle="The joy and confidence of my clients is the greatest testament to my work"
            className="mb-10 md:mb-16"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="relative flex flex-col bg-beige rounded-2xl p-6 sm:p-8 border border-sand/60 hover:shadow-luxe hover:-translate-y-1 transition-all duration-500">
                <Quote className="absolute top-6 right-6 w-10 h-10 text-champagne/70" />

                <div className="flex mb-5">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-mocha fill-current" />
                  ))}
                </div>

                <blockquote className="flex-1 font-inter text-ink leading-relaxed mb-8">
                  "{testimonial.text}"
                </blockquote>

                <div className="flex items-center gap-4 pt-6 border-t border-sand">
                  {testimonial.image ? (
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-ivory shadow-soft"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-chocolate ring-2 ring-ivory shadow-soft flex items-center justify-center font-playfair text-xl text-champagne">
                      {testimonial.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-playfair text-lg font-medium text-chocolate">{testimonial.name}</h3>
                    <p className="font-inter text-xs uppercase tracking-[0.2em] text-mocha mt-0.5">{testimonial.event}</p>
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
