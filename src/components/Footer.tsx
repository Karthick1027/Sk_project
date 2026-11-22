import React from 'react';
import { Instagram, Mail, Phone, MapPin } from 'lucide-react';
import Logo_white from '../../src/images/SK_logo_white.png';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const linkClass = 'rounded-sm text-sand/90 hover:text-ivory transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne focus-visible:ring-offset-2 focus-visible:ring-offset-chocolate';
  const panelClass = 'min-w-0 space-y-4 rounded-2xl border border-champagne/15 bg-cocoa/30 p-4 sm:p-5 xl:p-4 2xl:p-5';
  const headingClass = 'border-b border-champagne/15 pb-3 text-center font-inter text-xs font-semibold uppercase tracking-[0.25em] text-champagne';

  return (
    <footer className="bg-chocolate text-ivory">
      <div className="container mx-auto px-4 pt-10 pb-6 md:max-w-[90%] sm:pt-12 sm:pb-8">
        <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.35fr)] xl:gap-5 2xl:gap-7">
          {/* Brand */}
          <div className="min-w-0 space-y-5 pb-2 sm:col-span-2 xl:col-span-1 xl:pr-2 xl:pt-1">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full ring-1 ring-champagne/60">
                <img
                  src={Logo_white}
                  alt="SK Bridal Studio logo"
                  className="w-12"
                />
              </div>
              <div className="leading-none">
                <h3 className="font-playfair text-lg sm:text-2xl xl:text-lg 2xl:text-xl font-medium uppercase tracking-[0.12em] text-ivory">
                   Bridal Studio
                </h3>
                <p className="mt-2 font-inter text-[10px] leading-relaxed uppercase tracking-[0.2em] text-champagne">
                  Beauty · Bridals · Academy
                </p>
              </div>
            </div>
            <p className="max-w-sm font-inter text-sm text-sand/80 leading-relaxed">
              Creating beautiful, confident looks for your most special moments. From bridal elegance to everyday glamour.
            </p>
            <p className="font-script text-3xl text-champagne">Makeup is an Art</p>
          </div>

          {/* Explore */}
          <div className={panelClass}>
            <h4 className={headingClass}>Explore</h4>
            <ul className="grid grid-flow-col grid-rows-4 grid-cols-2 gap-x-3 gap-y-3 font-inter text-sm leading-6">
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
          <div className={panelClass}>
            <h4 className={headingClass}>Services</h4>
            <ul className="font-inter space-y-3 text-sm leading-6">
              {['Bridal Makeup', 'Bridal Hairstyling', 'Saree & Lehenga Draping'].map((name) => (
                <li key={name}>
                  <Link to="/services" className={linkClass}>{name}</Link>
                </li>
              ))}
              <li>
                <Link to="/workshops" className={linkClass}>
                  Makeup Classes
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className={`${panelClass} sm:col-span-2 xl:col-span-1`}>
            <h4 className={headingClass}>Connect</h4>
            <div className="grid gap-3 font-inter text-sm leading-6 sm:grid-cols-2 xl:grid-cols-1">
              <a href="tel:+918668038093" className={`flex items-center gap-3 group ${linkClass}`}>
                <Phone className="w-4 h-4 shrink-0 text-champagne" />
                <span>+91 8668038093</span>
              </a>
              <a href="mailto:skbridalstudioteam@gmail.com" className={`flex min-w-0 items-center gap-3 group [overflow-wrap:anywhere] ${linkClass}`}>
                <Mail className="w-4 h-4 shrink-0 text-champagne" />
                <span className="min-w-0">skbridalstudioteam@gmail.com</span>
              </a>
              <a
                href="https://instagram.com/srinithimakeupartist"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 group ${linkClass}`}
              >
                <Instagram className="w-4 h-4 shrink-0 text-champagne" />
                <span className="min-w-0 [overflow-wrap:anywhere]">@srinithimakeupartist</span>
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

        <div className="border-t border-champagne/20 mt-8 pt-5 flex flex-col xl:flex-row items-center justify-between gap-3 text-center xl:text-left">
          <p className="font-inter text-sm text-sand/60">
            © 2022 SK Bridal Studio. All rights reserved.
            <span className="mx-2">·</span>
            <Link to="/privacy-policy" className="hover:text-champagne transition-colors duration-300">
              Privacy Policy
            </Link>
          </p>
          <p className="font-inter text-xs leading-relaxed uppercase tracking-[0.2em] text-sand/60">
            Crafted with love for beautiful moments
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
