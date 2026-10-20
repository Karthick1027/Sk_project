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
    { name: 'Gallery', path: '/gallery' },
    { name: 'Products', path: '/products' },
    { name: 'Contact', path: '/contact' },
  ];

  const isSolid = isScrolled || isMenuOpen;

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-500 border-b ${
      isSolid
        ? 'bg-ivory/90 backdrop-blur-md border-sand/60 shadow-[0_10px_30px_-24px_rgba(59,38,30,0.6)]'
        : 'bg-ivory/40 backdrop-blur-sm border-transparent'
    }`}>
      <nav className="container mx-auto px-4 py-3 max-w-[90%]">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chocolate ring-1 ring-champagne ring-offset-2 ring-offset-ivory transition-transform duration-500 group-hover:scale-105">
              <img
                src={Logo_white}
                alt="SK Bridal Studio logo"
                className="w-11"
              />
            </div>
            <div className="hidden sm:block leading-none">
              <span className="block font-playfair text-xl font-medium uppercase tracking-[0.2em] text-chocolate">
                SK Bridal Studio
              </span>
              <span className="mt-1.5 block font-inter text-[10px] uppercase tracking-[0.35em] text-mocha">
                Beauty · Bridals · Academy
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 lg:gap-10">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative group py-1 font-inter text-[13px] font-medium uppercase tracking-[0.2em] transition-colors duration-300 ${
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
            <Link to="/contact" className="btn-primary !px-5 !py-2.5 text-sm">
              Book Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-chocolate hover:bg-beige transition-colors duration-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 mb-2 py-3 bg-ivory rounded-2xl shadow-luxe border border-sand/60 animate-fade-in">
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
              <Link
                to="/contact"
                className="btn-primary w-full"
                onClick={() => setIsMenuOpen(false)}
              >
                Book Your Makeup
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
