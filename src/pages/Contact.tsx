import React, { useState } from 'react';
import { Phone, Mail, Instagram, MapPin, Clock, Send, Heart, Calendar, MessageCircle } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create email body
      const emailBody = `
New Contact Form Submission:

Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}

Message:
${formData.message}

---
Sent from SK Bridal Studio Website
      `.trim();

      // Create mailto link for email
      const mailtoLink = `mailto:srinithibridalmakeupartist@gmail.com?subject=New Contact Form Submission from ${formData.name}&body=${encodeURIComponent(emailBody)}`;
      
      // Create WhatsApp message
      const whatsappMessage = `New website inquiry from ${formData.name}%0A%0AEmail: ${formData.email}%0APhone: ${formData.phone}%0A%0AMessage: ${formData.message}`;
      const whatsappLink = `https://wa.me/918668038093?text=${whatsappMessage}`;

      // Open email client
      window.open(mailtoLink, '_blank');
      
      // Small delay then open WhatsApp
      setTimeout(() => {
        window.open(whatsappLink, '_blank');
      }, 1000);

      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      // Reset status after 5 seconds
      setTimeout(() => setSubmitStatus('idle'), 5000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blush-50 via-white to-rose-50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-playfair text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blush-600 to-rose-600 bg-clip-text text-transparent">
            Let's Connect
          </h1>
          <p className="font-inter text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Ready to transform your look or learn professional makeup techniques? I'd love to hear from you. 
            Let's discuss your vision and create something beautiful together.
          </p>
        </div>
      </section>

      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="font-playfair text-3xl font-bold text-gray-800 mb-6">Get in Touch</h2>
                <p className="font-inter text-gray-600 text-lg leading-relaxed mb-8">
                  I'm here to make your beauty dreams come true. Whether you're planning your wedding, 
                  preparing for a special event, or want to master makeup artistry, let's chat!
                </p>
              </div>

              {/* Contact Methods */}
              <div className="space-y-6">
                <a
                  href="tel:+918668038093"
                  className="flex items-center space-x-4 p-6 bg-gradient-to-r from-blush-50 to-rose-50 rounded-2xl hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-blush-500 to-rose-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Phone className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-inter font-semibold text-gray-800 text-lg">Call Me</h3>
                    <p className="font-inter text-blush-600 font-medium">+91 8668038093</p>
                    <p className="font-inter text-sm text-gray-600">Available Mon-Sat, 9AM-7PM</p>
                  </div>
                </a>

                <a
                  href="mailto:srinithibridalmakeupartist@gmail.com"
                  className="flex items-center space-x-4 p-6 bg-gradient-to-r from-rose-50 to-blush-50 rounded-2xl hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-blush-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Mail className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-inter font-semibold text-gray-800 text-lg">Email Me</h3>
                    <p className="font-inter text-rose-600 font-medium">srinithibridalmakeupartist@gmail.com</p>
                    <p className="font-inter text-sm text-gray-600">I'll respond within 24 hours</p>
                  </div>
                </a>

                <a
                  href="https://instagram.com/srinithimakeupartist"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-4 p-6 bg-gradient-to-r from-blush-50 to-rose-50 rounded-2xl hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-blush-500 to-rose-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Instagram className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-inter font-semibold text-gray-800 text-lg">Follow Me</h3>
                    <p className="font-inter text-blush-600 font-medium">@srinithimakeupartist</p>
                    <p className="font-inter text-sm text-gray-600">Daily beauty inspiration</p>
                  </div>
                </a>

                <a
                  href="https://wa.me/918668038093"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <MessageCircle className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-inter font-semibold text-gray-800 text-lg">WhatsApp Me</h3>
                    <p className="font-inter text-green-600 font-medium">+91 8668038093</p>
                    <p className="font-inter text-sm text-gray-600">Quick responses & booking</p>
                  </div>
                </a>
              </div>

              {/* Business Hours */}
              <div className="bg-gradient-to-br from-gray-50 to-blush-50/30 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Clock className="w-6 h-6 text-blush-600" />
                  <h3 className="font-playfair text-xl font-semibold text-gray-800">Business Hours</h3>
                </div>
                <div className="space-y-2 font-inter text-gray-700">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="font-medium">9:00 AM - 7:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span className="font-medium">9:00 AM - 2:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="font-medium">By Appointment</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gradient-to-br from-white to-blush-50/30 rounded-3xl p-8 shadow-xl border border-blush-100">
              <div className="flex items-center space-x-3 mb-6">
                <Heart className="w-8 h-8 text-blush-500" />
                <h2 className="font-playfair text-3xl font-bold text-gray-800">Send a Message</h2>
              </div>

              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="font-inter text-green-800 text-center">
                    ✨ Thank you! Your message has been sent. I'll get back to you soon!
                  </p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="font-inter text-red-800 text-center">
                    Something went wrong. Please try calling or emailing directly.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block font-inter font-medium text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blush-500 focus:border-transparent transition-all duration-300 font-inter"
                      placeholder="Enter your full name"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block font-inter font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blush-500 focus:border-transparent transition-all duration-300 font-inter"
                      placeholder="your@email.com"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block font-inter font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blush-500 focus:border-transparent transition-all duration-300 font-inter"
                    placeholder="+91 XXXXX XXXXX"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block font-inter font-medium text-gray-700 mb-2">
                    Your Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blush-500 focus:border-transparent transition-all duration-300 font-inter resize-none"
                    placeholder="Tell me about your event date, preferred style, any specific requirements, or questions you have..."
                    disabled={isSubmitting}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blush-500 to-rose-500 text-white py-4 px-8 rounded-xl font-inter font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Send className="w-5 h-5" />
                  <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                </button>

                <p className="font-inter text-sm text-gray-600 text-center">
                  I'll get back to you within 24 hours. Can't wait to hear about your vision! ✨
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Location Section */}
      <section className="py-20 bg-gradient-to-br from-rose-50 to-blush-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Visit My Studio
            </h2>
            <p className="font-inter text-xl text-gray-600 max-w-2xl mx-auto">
              Located in the heart of Chennai, my studio provides a comfortable and professional environment 
              for all your beauty needs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <MapPin className="w-6 h-6 text-blush-600 mt-1" />
                <div>
                  <h3 className="font-inter font-semibold text-gray-800 text-lg mb-1">Studio Address</h3>
                  <p className="font-inter text-gray-600">
                    56, 11th Cross street,<br />
                    Prakash nagar, Thiruninravur<br />
                    Chennai, 602024
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h4 className="font-playfair text-xl font-semibold text-gray-800 mb-4">What to Expect</h4>
                <ul className="space-y-3 font-inter text-gray-600">
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blush-400 rounded-full"></div>
                    <span>Professional lighting for perfect makeup application</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                    <span>High-end makeup products and tools</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blush-400 rounded-full"></div>
                    <span>Comfortable seating and refreshments</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                    <span>Free parking available</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Embedded Google Map */}
            <div className="rounded-3xl overflow-hidden shadow-xl">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3885.0234567890123!2d80.1234567!3d13.1234567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDA3JzI0LjQiTiA4MMKwMDcnMjQuNCJF!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="SK Bridal Studio Location"
                className="w-full h-96"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-blush-500 via-rose-500 to-blush-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-6">
            Ready to Begin Your Beauty Journey?
          </h2>
          <p className="font-inter text-xl mb-10 opacity-90 max-w-2xl mx-auto">
            Don't wait for the perfect moment—create it. Book your session today and let's make magic happen together.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a
              href="tel:+918668038093"
              className="bg-white text-blush-600 px-8 py-4 rounded-full font-inter font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 inline-flex items-center justify-center space-x-2"
            >
              <Phone className="w-5 h-5" />
              <span>Call Now</span>
            </a>
            <a
              href="https://wa.me/918668038093"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-white text-white px-8 py-4 rounded-full font-inter font-semibold text-lg hover:bg-white/10 hover:scale-105 transition-all duration-300 inline-flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;