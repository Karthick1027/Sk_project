import React from 'react';
import { Phone, Instagram, MapPin, Clock, MessageCircle, Check, Users } from 'lucide-react';
import PageHero from '../components/PageHero';
import { ContactBackdrop } from '../components/PageBackdrops';
import SectionHeading from '../components/SectionHeading';
import StudioMapBackdrop from '../components/StudioMapBackdrop';

const Contact: React.FC = () => {
  const contactMethods = [
    {
      href: 'tel:+918668038093',
      icon: <Phone className="w-6 h-6" />,
      title: 'Call Me',
      value: '+91 8668038093',
      note: 'Call for appointment availability',
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

  return (
    <div className="pt-20">
      <PageHero
        eyebrow="Get in Touch"
        backdrop={<ContactBackdrop />}
        title="Let's Connect"
        subtitle="For appointments, studio visits or a quick question, find the best way to reach us below."
      />

      <div id="contact" className="py-10 md:py-14 bg-ivory scroll-mt-20">
        <div className="container mx-auto px-4 md:max-w-[90%]">
          <div className="max-w-6xl mx-auto">
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="max-w-2xl mx-auto text-center">
                <p className="eyebrow mb-4">Reach Out</p>
                <h2 className="font-playfair text-3xl sm:text-4xl font-medium text-chocolate mb-6">Get in Touch</h2>
                <div className="ornament mx-auto mb-6" />
                <p className="font-inter text-ink text-base sm:text-lg leading-relaxed">
                  I'm here to make your beauty dreams come true. Whether you're planning your wedding,
                  preparing for a special event, or want to master makeup artistry, let's chat!
                </p>
              </div>

              {/* Contact Methods */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {contactMethods.map((method) => (
                  <a
                    key={method.title}
                    href={method.href}
                    {...(method.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="flex items-center gap-4 p-5 md:flex-col md:items-start lg:p-6 bg-ivory border border-sand/70 rounded-2xl shadow-soft hover:shadow-luxe hover:border-champagne transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 bg-chocolate text-champagne rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      {method.icon}
                    </div>
                    <div className="flex-1 min-w-0 w-full">
                      <h3 className="font-inter text-xs font-semibold uppercase tracking-[0.25em] text-mocha">{method.title}</h3>
                      <p className="font-playfair text-lg sm:text-xl text-chocolate mt-1 break-words">{method.value}</p>
                      <p className="font-inter text-sm text-ink">{method.note}</p>
                    </div>
                  </a>
                ))}
              </div>

              {/* Business Hours and Studio Owners */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
              <div className="bg-beige border border-sand/70 rounded-2xl p-5 sm:p-7">
                <div className="flex items-center gap-3 mb-5">
                  <Clock className="w-5 h-5 text-cocoa" />
                  <h3 className="font-playfair text-2xl font-medium text-chocolate">Business Hours</h3>
                </div>
                <div className="divide-y divide-sand font-inter text-ink">
                  <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-3 text-sm sm:text-base">
                    <span>Monday - Friday</span>
                    <span className="font-medium text-chocolate whitespace-nowrap">9:00 AM - 7:00 PM</span>
                  </div>
                  <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-3 text-sm sm:text-base">
                    <span>Saturday</span>
                    <span className="font-medium text-chocolate whitespace-nowrap">9:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-3 text-sm sm:text-base">
                    <span>Sunday</span>
                    <span className="font-medium text-chocolate whitespace-nowrap">By Appointment</span>
                  </div>
                </div>
              </div>
              <div className="bg-beige border border-sand/70 rounded-2xl p-5 sm:p-7">
                <div className="flex items-center gap-3 mb-5">
                  <Users className="w-5 h-5 shrink-0 text-cocoa" aria-hidden="true" />
                  <h3 className="font-playfair text-2xl font-medium text-chocolate">SK Bridal Studio Owners</h3>
                </div>
                <dl className="divide-y divide-sand font-inter">
                  <div className="py-3">
                    <dt className="font-semibold text-chocolate">Srinithi A</dt>
                    <dd className="mt-1 text-sm sm:text-base leading-relaxed text-ink">Founder | Lead Makeup Artist | Mentor</dd>
                  </div>
                  <div className="py-3">
                    <dt className="font-semibold text-chocolate">Karthikeyan N</dt>
                    <dd className="mt-1 text-sm sm:text-base leading-relaxed text-ink">Co-Founder | Business Director</dd>
                  </div>
                </dl>
              </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Location Section */}
      <section className="relative isolate overflow-hidden py-10 md:py-16 bg-beige">
        <StudioMapBackdrop />
        <div className="container relative z-10 mx-auto px-4 md:max-w-[90%]">
          <SectionHeading
            eyebrow="Find Us"
            title="Visit My Studio"
            subtitle="Located in the Thiruninravur near Chennai, my studio provides a comfortable and professional environment for all your beauty needs."
            className="mb-8 md:mb-10"
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

    </div>
  );
};

export default Contact;
