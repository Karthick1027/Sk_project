import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import Logo_white from '../../src/images/SK_logo_white.png';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'Reviews', path: '/reviews' },
    { name: 'Packages', path: '/packages' },
    { name: 'Workshops', path: '/workshops' },
    { name: 'Contact', path: '/contact' },
  ];

  const isSolid = isScrolled || isMenuOpen;

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-500 border-b ${
      isSolid
        ? 'bg-ivory/90 backdrop-blur-md border-sand/60 shadow-[0_10px_30px_-24px_rgba(59,38,30,0.6)]'
        : 'bg-ivory/40 backdrop-blur-sm border-transparent'
    }`}>
      <nav className="container mx-auto px-4 py-3 md:max-w-[90%]">
        <div className="flex items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex min-w-0 items-center gap-3 group">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-chocolate ring-1 ring-champagne ring-offset-2 ring-offset-ivory transition-transform duration-500 group-hover:scale-105">
              <img
                src={Logo_white}
                alt="SK Bridal Studio logo"
                className="w-11"
              />
            </div>
            {/* Brand text is hidden on the narrowest phones and on laptops below 1440px, where the full nav needs the room */}
            <div className="hidden min-[360px]:block lg:hidden min-[1440px]:block leading-none">
              <span className="block font-playfair text-base sm:text-xl font-medium uppercase tracking-[0.15em] sm:tracking-[0.2em] text-chocolate whitespace-nowrap">
                SK Bridal Studio
              </span>
              <span className="mt-1.5 flex items-center gap-2 font-inter text-[9px] sm:text-[10px] uppercase tracking-[0.25em] sm:tracking-[0.35em] text-mocha whitespace-nowrap">
                <span className="h-px w-2 sm:w-3 bg-mocha/60" aria-hidden="true" />
                Beauty. Elegance. Grace.
                <span className="h-px w-2 sm:w-3 bg-mocha/60" aria-hidden="true" />
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-5 2xl:gap-6">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative group rounded-sm py-1 font-inter text-[13px] font-medium uppercase tracking-[0.1em] xl:tracking-[0.15em] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne focus-visible:ring-offset-4 focus-visible:ring-offset-ivory ${
                    isActive ? 'text-chocolate' : 'text-cocoa/80 hover:text-chocolate'
                  }`}
                >
                  {item.name}
                  <span className={`absolute -bottom-0.5 left-1/2 h-px -translate-x-1/2 bg-mocha transition-all duration-300 ${
                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}></span>
                </Link>
              );
            })}
            <a
              href="https://wa.me/918668038093"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary !px-5 !py-2.5 text-sm"
            >
              Book Now
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden shrink-0 p-2 rounded-lg text-chocolate hover:bg-beige transition-colors duration-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 mb-2 py-3 max-h-[calc(100dvh-6rem)] overflow-y-auto bg-ivory rounded-2xl shadow-luxe border border-sand/60 animate-fade-in">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`block px-6 py-3 font-inter text-sm font-medium uppercase tracking-[0.2em] transition-colors duration-300 ${
                  location.pathname === item.path
                    ? 'text-chocolate bg-beige'
                    : 'text-cocoa hover:text-chocolate hover:bg-beige'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="px-6 pt-3 pb-1">
              <a
                href="https://wa.me/918668038093"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full"
                onClick={() => setIsMenuOpen(false)}
              >
                Book Your Makeup
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
