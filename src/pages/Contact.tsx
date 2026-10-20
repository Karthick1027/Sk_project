import React, { useState, useEffect } from 'react';
import { Phone, Instagram, MapPin, Clock, Send, MessageCircle, ArrowUpRight, Check } from 'lucide-react';
import PageHero from '../components/PageHero';
import { ContactBackdrop } from '../components/PageBackdrops';
import SectionHeading from '../components/SectionHeading';
import CtaBanner from '../components/CtaBanner';

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
      const mailtoLink = `mailto:skbridalstudioteam@gmail.com?subject=New Contact Form Submission from ${formData.name}&body=${encodeURIComponent(emailBody)}`;

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

  useEffect(() => {
  const section = document.getElementById("contact");
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
}, []);

  const contactMethods = [
    {
      href: 'tel:+918668038093',
      icon: <Phone className="w-6 h-6" />,
      title: 'Call Me',
      value: '+91 8668038093',
      note: 'Available Mon-Sun, 10AM-6PM',
      external: false
    },
    {
      href: 'https://instagram.com/srinithimakeupartist',
      icon: <Instagram className="w-6 h-6" />,
      title: 'Follow Me',
      value: '@srinithimakeupartist',
      note: 'Daily beauty inspiration',
      external: true
    },
    {
      href: 'https://wa.me/918668038093',
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'WhatsApp Me',
      value: '+91 8668038093',
      note: 'Quick responses & booking',
      external: true
    }
  ];

  const labelClass = 'block font-inter text-xs font-semibold uppercase tracking-[0.2em] text-cocoa mb-2';

  return (
    <div className="pt-20">
      <PageHero
        eyebrow="Get in Touch"
        backdrop={<ContactBackdrop />}
        title="Let's Connect"
        subtitle="Ready to transform your look or learn professional makeup techniques? I'd love to hear from you. Let's discuss your vision and create something beautiful together."
      />

      <div id="contact" className="py-16 md:py-24 bg-ivory scroll-mt-20">
        <div className="container mx-auto px-4 md:max-w-[90%]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <p className="eyebrow mb-4">Reach Out</p>
                <h2 className="font-playfair text-3xl sm:text-4xl font-medium text-chocolate mb-6">Get in Touch</h2>
                <div className="ornament mb-6" />
                <p className="font-inter text-ink text-base sm:text-lg leading-relaxed">
                  I'm here to make your beauty dreams come true. Whether you're planning your wedding,
                  preparing for a special event, or want to master makeup artistry, let's chat!
                </p>
              </div>

              {/* Contact Methods */}
              <div className="space-y-4">
                {contactMethods.map((method) => (
                  <a
                    key={method.title}
                    href={method.href}
                    {...(method.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="flex items-center gap-4 sm:gap-5 p-4 sm:p-5 bg-ivory border border-sand/70 rounded-2xl shadow-soft hover:shadow-luxe hover:border-champagne transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 bg-chocolate text-champagne rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      {method.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-inter text-xs font-semibold uppercase tracking-[0.25em] text-mocha">{method.title}</h3>
                      <p className="font-playfair text-lg sm:text-xl text-chocolate mt-1 break-words">{method.value}</p>
                      <p className="font-inter text-sm text-ink">{method.note}</p>
                    </div>
                    <ArrowUpRight className="w-5 h-5 shrink-0 text-mocha group-hover:text-chocolate group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all duration-300" />
                  </a>
                ))}
              </div>

              {/* Business Hours */}
              <div className="bg-beige border border-sand/70 rounded-2xl p-5 sm:p-7">
                <div className="flex items-center gap-3 mb-5">
                  <Clock className="w-5 h-5 text-cocoa" />
                  <h3 className="font-playfair text-2xl font-medium text-chocolate">Business Hours</h3>
                </div>
                <div className="divide-y divide-sand font-inter text-ink">
                  <div className="flex justify-between gap-4 py-3 text-sm sm:text-base">
                    <span>Monday - Friday</span>
                    <span className="font-medium text-chocolate whitespace-nowrap">9:00 AM - 7:00 PM</span>
                  </div>
                  <div className="flex justify-between gap-4 py-3 text-sm sm:text-base">
                    <span>Saturday</span>
                    <span className="font-medium text-chocolate whitespace-nowrap">9:00 AM - 2:00 PM</span>
                  </div>
                  <div className="flex justify-between gap-4 py-3 text-sm sm:text-base">
                    <span>Sunday</span>
                    <span className="font-medium text-chocolate whitespace-nowrap">By Appointment</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="relative bg-beige rounded-2xl p-5 sm:p-8 md:p-10 border border-sand/70 shadow-luxe self-start">
              <p className="font-script text-3xl text-mocha mb-1">Say hello</p>
              <h2 className="font-playfair text-2xl sm:text-3xl md:text-4xl font-medium text-chocolate mb-2">Send a Message</h2>
              <p className="font-inter text-sm text-ink mb-8">Your message opens in Email & WhatsApp so I can reply quickly.</p>

              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-sage/15 border border-sage/50 rounded-lg flex items-center gap-3">
                  <Check className="w-5 h-5 text-sage shrink-0" />
                  <p className="font-inter text-chocolate">
                    Thank you! Your message has been sent. I'll get back to you soon!
                  </p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-clay/10 border border-clay/50 rounded-lg">
                  <p className="font-inter text-clay text-center">
                    Something went wrong. Please try calling or emailing directly.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className={labelClass}>
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="field"
                      placeholder="Enter your full name"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className={labelClass}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="field"
                      placeholder="your@email.com"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className={labelClass}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="field"
                    placeholder="+91 XXXXX XXXXX"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="message" className={labelClass}>
                    Your Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="field resize-none"
                    placeholder="Tell me about your event date, preferred style, any specific requirements, or questions you have..."
                    disabled={isSubmitting}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full !py-4 text-base"
                >
                  <Send className="w-5 h-5" />
                  <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                </button>

                <p className="font-inter text-sm text-ink text-center">
                  I'll get back to you within 24 hours. Can't wait to hear about your vision!
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Location Section */}
      <section className="py-16 md:py-24 bg-beige">
        <div className="container mx-auto px-4 md:max-w-[90%]">
          <SectionHeading
            eyebrow="Find Us"
            title="Visit My Studio"
            subtitle="Located in the Thiruninravur near Chennai, my studio provides a comfortable and professional environment for all your beauty needs."
            className="mb-10 md:mb-16"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start gap-4 card p-5 sm:p-6">
                <div className="w-12 h-12 shrink-0 bg-sand text-cocoa rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-inter text-xs font-semibold uppercase tracking-[0.25em] text-mocha mb-2">Studio Address</h3>
                  <p className="font-playfair text-lg text-chocolate leading-relaxed">
                    56, 11th Cross street,<br />
                    Prakash nagar, Thiruninravur<br />
                    Chennai, 602024
                  </p>
                </div>
              </div>

              <div className="card p-5 sm:p-7">
                <h4 className="font-playfair text-2xl font-medium text-chocolate mb-5">What to Expect</h4>
                <ul className="space-y-4 font-inter text-ink">
                  {[
                    'Professional lighting for perfect makeup application',
                    'High-end makeup products and tools',
                    'Comfortable seating and refreshments',
                    'Free parking available'
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-beige border border-champagne">
                        <Check className="w-3.5 h-3.5 text-cocoa" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Embedded Google Map */}
            <div className="rounded-2xl overflow-hidden shadow-luxe border-4 border-ivory">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3885.477101878278!2d80.04585987484434!3d13.132277787198033!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a528927b98383a9%3A0x3c986555f3a183ad!2sSrinithi%20Makeup%20Artist!5e0!3m2!1sen!2sin!4v1750842139765!5m2!1sen!2sin"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="SK Bridal Studio Location"
                className="w-full h-72 sm:h-96 grayscale-[30%] sepia-[15%]"
              ></iframe>

            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <CtaBanner
        title="Ready to Begin Your Beauty Journey?"
        text="Don't wait for the perfect moment—create it. Book your session today and let's make magic happen together."
      >
        <a href="tel:+918668038093" className="btn-light">
          <Phone className="w-5 h-5" />
          Call Now
        </a>
        <a
          href="https://wa.me/918668038093"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost-light"
        >
          <MessageCircle className="w-5 h-5" />
          WhatsApp
        </a>
      </CtaBanner>
    </div>
  );
};

export default Contact;
