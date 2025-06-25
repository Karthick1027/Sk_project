import React from 'react';
import { Instagram, Mail, Phone, Sparkles } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-br from-blush-400 to-rose-500 rounded-full">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-playfair text-2xl font-bold bg-gradient-to-r from-blush-300 to-rose-300 bg-clip-text text-transparent">
                  SK Bridal Studio
                </h3>
                <p className="font-inter text-sm text-gray-400">Professional Makeup Artist</p>
              </div>
            </div>
            <p className="font-inter text-gray-300 leading-relaxed">
              Creating beautiful, confident looks for your most special moments. From bridal elegance to everyday glamour.
            </p>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="font-playfair text-xl font-semibold text-blush-300">Services</h4>
            <ul className="font-inter space-y-2 text-gray-300">
              <li className="hover:text-blush-300 transition-colors duration-300 cursor-pointer">Bridal Makeup</li>
              <li className="hover:text-blush-300 transition-colors duration-300 cursor-pointer">Event Makeup</li>
              <li className="hover:text-blush-300 transition-colors duration-300 cursor-pointer">Party Makeup</li>
              <li className="hover:text-blush-300 transition-colors duration-300 cursor-pointer">Makeup Classes</li>
              <li className="hover:text-blush-300 transition-colors duration-300 cursor-pointer">Online Tutorials</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-playfair text-xl font-semibold text-blush-300">Connect</h4>
            <div className="space-y-3">
              <a
                href="tel:+1234567890"
                className="flex items-center space-x-3 font-inter text-gray-300 hover:text-blush-300 transition-colors duration-300 group"
              >
                <Phone className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span>+91 8668038093</span>
              </a>
              <a
                href="mailto:srinithibridalmakeupartist@gmail.com"
                className="flex items-center space-x-3 font-inter text-gray-300 hover:text-blush-300 transition-colors duration-300 group"
              >
                <Mail className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span>srinithibridalmakeupartist@gmail.com</span>
              </a>
              <a
                href="https://instagram.com/srinithimakeupartist"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 font-inter text-gray-300 hover:text-blush-300 transition-colors duration-300 group"
              >
                <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span>@srinithimakeupartist</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 text-center">
          <p className="font-inter text-gray-400">
            © 2022 SK Bridal Studio. All rights reserved. | Crafted with love for beautiful moments.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;