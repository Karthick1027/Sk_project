import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sparkles } from 'lucide-react';
import Logo_white from '../../src/images/SK_logo_white.png';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <nav className="container mx-auto px-4 py-4 max-w-[90%]">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-0 bg-gradient-to-br from-blush-400 to-rose-500 rounded-full group-hover:scale-110 transition-transform duration-300">
              {/* <Sparkles className="w-6 h-6 text-white" /> */}
                <img
                  src={Logo_white}
                  alt="SK Logo"
                  className="w-[50px]"
                />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-playfair text-2xl font-bold bg-gradient-to-r from-blush-600 to-rose-600 bg-clip-text text-transparent">
                SK Bridal Studio
              </h1>
              <p className="font-inter text-xs text-gray-600 -mt-1">Makeup is an Art</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`font-inter font-medium transition-colors duration-300 relative group ${
                  location.pathname === item.path
                    ? 'text-blush-600'
                    : 'text-gray-700 hover:text-blush-600'
                }`}
              >
                {item.name}
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blush-400 to-rose-500 transition-all duration-300 group-hover:w-full ${
                  location.pathname === item.path ? 'w-full' : ''
                }`}></span>
              </Link>
            ))}
            {/* <Link
              to="/contact"
              className="bg-gradient-to-r from-blush-500 to-rose-500 text-white px-6 py-2 rounded-full font-inter font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              Book Now
            </Link> */}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-blush-50 transition-colors duration-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 bg-white rounded-2xl shadow-xl border animate-fade-in">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`block px-6 py-3 font-inter font-medium transition-colors duration-300 ${
                  location.pathname === item.path
                    ? 'text-blush-600 bg-blush-50'
                    : 'text-gray-700 hover:text-blush-600 hover:bg-blush-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {/* <div className="px-6 pt-3">
              <Link
                to="/contact"
                className="block w-full text-center bg-gradient-to-r from-blush-500 to-rose-500 text-white px-6 py-3 rounded-full font-inter font-medium hover:shadow-lg transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Book Now
              </Link>
            </div> */}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;