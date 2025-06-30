import React from 'react';
import { Award, Heart, Users, BookOpen, Star, Sparkles } from 'lucide-react';
import srinithiPic from '../../src/images/srinithi_pic.png';
import Sheeba from '../../src/images/Sheeba.png';
import Sabari from '../../src/images/Sabari.png';
import Ruby_Ganesh from '../../src/images/Ruby_Ganesh.png';
import Janani from '../../src/images/Janani.png';
import Chandru_pic from '../../src/images/Chandru_pic.png';

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

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blush-50 via-white to-rose-50">
        <div className="container mx-auto px-4 max-w-[90%]">
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
        <div className="container mx-auto px-4 max-w-[95%]">
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