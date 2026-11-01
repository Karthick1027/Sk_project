import React from 'react';
import { Instagram, Mail, Phone, MapPin } from 'lucide-react';
import Logo_white from '../../src/images/SK_logo_white.png';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const linkClass = 'text-sand/80 hover:text-champagne transition-colors duration-300';

  return (
    <footer className="bg-chocolate text-ivory">
      <div className="container mx-auto px-4 pt-12 pb-8 md:max-w-[90%]">
        {/* Connect gets the widest column (2 of 4 on tablets, 4 of 12 on desktops) so the email address fits on one line */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-12 gap-x-6 gap-y-10 sm:gap-x-10 sm:gap-y-12 xl:gap-x-8">
          {/* Brand */}
          <div className="col-span-2 space-y-6 md:col-span-4 xl:col-span-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full ring-1 ring-champagne/60">
                <img
                  src={Logo_white}
                  alt="SK Bridal Studio logo"
                  className="w-12"
                />
              </div>
              <div className="leading-none">
                <h3 className="font-playfair text-lg sm:text-2xl xl:text-xl font-medium uppercase tracking-[0.12em] sm:tracking-[0.15em] text-ivory whitespace-nowrap">
                  SK Bridal Studio
                </h3>
                <p className="mt-2 font-inter text-[10px] uppercase tracking-[0.35em] text-champagne">
                  Beauty · Bridals · Academy
                </p>
              </div>
            </div>
            <p className="font-inter text-sand/80 leading-relaxed max-w-sm">
              Creating beautiful, confident looks for your most special moments. From bridal elegance to everyday glamour.
            </p>
            <p className="font-script text-3xl text-champagne">Makeup is an Art</p>
          </div>

          {/* Explore */}
          <div className="space-y-5 xl:col-span-2">
            <h4 className="font-inter text-xs font-semibold uppercase tracking-[0.3em] text-champagne">Explore</h4>
            <ul className="font-inter space-y-3">
              {[
                { name: 'Home', path: '/' },
                { name: 'About', path: '/about' },
                { name: 'Services', path: '/services' },
                { name: 'Portfolio', path: '/portfolio' },
                { name: 'Reviews', path: '/reviews' },
                { name: 'Packages', path: '/packages' },
                { name: 'Workshops', path: '/workshops' },
                { name: 'Contact', path: '/contact' },
              ].map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className={linkClass}>{item.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-5 xl:col-span-2">
            <h4 className="font-inter text-xs font-semibold uppercase tracking-[0.3em] text-champagne">Services</h4>
            <ul className="font-inter space-y-3 text-sand/80">
              {['Bridal Makeup', 'Event Makeup', 'Party Makeup'].map((name) => (
                <li key={name}>
                  <Link to="/services" className={linkClass}>{name}</Link>
                </li>
              ))}
              <li>
                <a
                  href="https://forms.gle/rfW2a95NHFgN874XA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  Makeup Classes Online / Offline
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 space-y-5 xl:col-span-4">
            <h4 className="font-inter text-xs font-semibold uppercase tracking-[0.3em] text-champagne">Connect</h4>
            <div className="space-y-4 font-inter">
              <a href="tel:+918668038093" className={`flex items-center gap-3 group ${linkClass}`}>
                <Phone className="w-4 h-4 text-champagne" />
                <span>+91 8668038093</span>
              </a>
              <a href="mailto:skbridalstudioteam@gmail.com" className={`flex items-center gap-3 group break-all ${linkClass}`}>
                <Mail className="w-4 h-4 shrink-0 text-champagne" />
                <span>skbridalstudioteam@gmail.com</span>
              </a>
              <a
                href="https://instagram.com/srinithimakeupartist"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 group ${linkClass}`}
              >
                <Instagram className="w-4 h-4 text-champagne" />
                <span>@srinithimakeupartist</span>
              </a>
              <a
                href="https://maps.app.goo.gl/3iLmA85LitEpHVCa6"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open studio location in Google Maps"
                className={`flex items-start gap-3 group ${linkClass}`}
              >
                <MapPin className="w-4 h-4 mt-1 shrink-0 text-champagne" />
                <span>Thiruninravur, Chennai 602024</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-champagne/20 mt-10 pt-6 flex flex-col lg:flex-row items-center justify-between gap-3 text-center">
          <p className="font-inter text-sm text-sand/60">
            © 2022 SK Bridal Studio. All rights reserved.
            <span className="mx-2">·</span>
            <Link to="/privacy-policy" className="hover:text-champagne transition-colors duration-300">
              Privacy Policy
            </Link>
          </p>
          <p className="font-inter text-xs uppercase tracking-[0.3em] text-sand/60">
            Crafted with love for beautiful moments
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
