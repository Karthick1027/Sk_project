import React from 'react';
import { Award, Heart, Users, BookOpen, Star, Sparkles } from 'lucide-react';
import srinithiPic from '../../src/images/srinithi_pic.png';

const About: React.FC = () => {
  const certifications = [
    "Professional Makeup Artistry Certification",
    "Bridal Makeup Specialist",
    "Advanced Color Theory",
    "Airbrush Makeup Certification",
    "Beauty Photography Makeup"
  ];

  const testimonials = [
    {
      name: "Saranya",
      event: "Wedding 2024",
      text: "Absolutely magical! I felt like a princess on my wedding day. The makeup lasted through tears of joy and dancing until midnight.",
      rating: 5,
      image: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150"
    },
    {
      name: "Vishali",
      event: "Makeup Student",
      text: "The classes transformed my skills completely. Now I do makeup professionally thanks to the amazing techniques I learned!",
      rating: 4,
      image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150"
    },
    {
      name: "Avila",
      event: "Anniversary Party",
      text: "Perfect for our 25th anniversary celebration. The attention to detail and artistry exceeded all expectations.",
      rating: 4,
      image: "https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=150"
    }
  ];

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blush-50 via-white to-rose-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="font-playfair text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blush-600 to-rose-600 bg-clip-text text-transparent">
                Meet Srinithi.A.K
              </h1>
              <p className="font-inter text-xl text-gray-700 mb-8 leading-relaxed">
                With over 3 years of experience in professional makeup artistry, I believe that beauty is not just about 
                looking good - it's about feeling confident, radiant, and authentically yourself.
              </p>
              <div className="flex items-center space-x-6 mb-8">
                <div className="text-center">
                  <div className="font-playfair text-3xl font-bold text-blush-600">3+</div>
                  <div className="font-inter text-sm text-gray-600">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="font-playfair text-3xl font-bold text-rose-600">150+</div>
                  <div className="font-inter text-sm text-gray-600">Happy Brides</div>
                </div>
                <div className="text-center">
                  <div className="font-playfair text-3xl font-bold text-blush-600">10+</div>
                  <div className="font-inter text-sm text-gray-600">Students Trained</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                {/* <img
                  src="https://images.pexels.com/photos/3373735/pexels-photo-3373735.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Srinithi - Professional Makeup Artist"
                  className="w-full h-96 lg:h-[500px] object-cover"
                /> */}
                 <img
                  src={srinithiPic}
                  alt="Srinithi - Professional Makeup Artist"
                  className="w-full h-96 lg:h-[650px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-blush-200 to-rose-200 rounded-full flex items-center justify-center animate-float">
                <Sparkles className="w-8 h-8 text-blush-600" />
              </div>
              <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-rose-200 to-blush-200 rounded-full flex items-center justify-center animate-float" style={{ animationDelay: '1s' }}>
                <Heart className="w-6 h-6 text-rose-600" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-gray-800 mb-8">
              My Beauty Journey
            </h2>
            <div className="space-y-6 font-inter text-lg text-gray-700 leading-relaxed">
              <p>
                My passion for makeup began as a young girl, watching my grandmother apply her signature red lipstick 
                with such grace and confidence. That moment sparked something in me—the understanding that makeup is 
                not just about enhancement, but about empowerment.
              </p>
              <p>
                After completing my professional training at the prestigious Beauty Academy, I specialized in bridal 
                and event makeup. Every bride who sits in my chair brings a unique story, and I consider myself 
                blessed to be part of their most beautiful chapters.
              </p>
              <p>
                Today, I not only create stunning looks for weddings and special events but also share my knowledge 
                through personalized makeup classes. My mission is simple: to help every person discover their unique 
                beauty and feel absolutely radiant.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-blush-100 to-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-8 h-8 text-blush-600" />
              </div>
              <h3 className="font-playfair text-xl font-semibold text-gray-800 mb-2">Passion Driven</h3>
              <p className="font-inter text-gray-600">Every look I create comes from genuine love for the art of beauty</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-blush-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="font-playfair text-xl font-semibold text-gray-800 mb-2">Client Focused</h3>
              <p className="font-inter text-gray-600">Your comfort, vision, and happiness are my top priorities</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-blush-100 to-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Award className="w-8 h-8 text-blush-600" />
              </div>
              <h3 className="font-playfair text-xl font-semibold text-gray-800 mb-2">Excellence</h3>
              <p className="font-inter text-gray-600">Continuous learning and perfecting techniques for flawless results</p>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="py-20 bg-gradient-to-br from-rose-50 to-blush-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Professional Credentials
            </h2>
            <p className="font-inter text-xl text-gray-600 max-w-2xl mx-auto">
              Committed to excellence through continuous education and professional development
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {certifications.map((cert, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-blush-100 group">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blush-100 to-rose-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="w-6 h-6 text-blush-600" />
                  </div>
                  <div>
                    <h3 className="font-inter font-semibold text-gray-800">{cert}</h3>
                    <p className="font-inter text-sm text-gray-600">Certified Professional</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              What Clients Say
            </h2>
            <p className="font-inter text-xl text-gray-600 max-w-2xl mx-auto">
              The joy and confidence of my clients is the greatest testament to my work
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-blush-50 to-rose-50 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="flex items-center space-x-4 mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-lg"
                  />
                  <div>
                    <h3 className="font-inter font-semibold text-gray-800">{testimonial.name}</h3>
                    <p className="font-inter text-sm text-gray-600">{testimonial.event}</p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-gold-400 fill-current" />
                  ))}
                </div>
                
                <blockquote className="font-inter text-gray-700 italic leading-relaxed">
                  "{testimonial.text}"
                </blockquote>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;