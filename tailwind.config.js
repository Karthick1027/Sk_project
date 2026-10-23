/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Only apply hover styles on devices that can hover, so taps don't leave cards stuck in their hover state
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      // SK Bridal Studio brand palette
      colors: {
        ivory: '#FFFCF6',      // Background / clean canvas
        beige: '#F5EFE6',      // Main & section backgrounds
        sand: '#E3D2BE',       // Cards, elements, soft sections
        champagne: '#D8C2A5',  // Accents, highlights, icons, dividers
        mocha: '#A78B73',      // Secondary text, borders, icons
        cocoa: '#6B4F3F',      // Text details, menu items, sub headings
        chocolate: '#3B261E',  // Headings, buttons, primary CTA
        ink: '#5F5047',        // Body text
        blush: '#F8D7D9',      // Offers / highlight banners
        sage: '#8A9A73',       // Success / availability
        clay: '#C96B6B',       // Error / alerts
        mist: '#E8E8E8',       // Form fields / borders
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'cormorant': ['Cormorant Garamond', 'serif'],
        'script': ['Great Vibes', 'cursive'],
        'inter': ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 18px 40px -24px rgba(59, 38, 30, 0.35)',
        'luxe': '0 30px 60px -28px rgba(59, 38, 30, 0.5)',
      },
      dropShadow: {
        glow: '0 0 6px rgba(201, 107, 107, 0.6)',
      },
      animation: {
        'fade-in': 'fadeIn 0.7s ease-out both',
        'float': 'float 4s ease-in-out infinite',
        'swing': 'swing 5s ease-in-out infinite',
        'petal': 'petal 15s linear infinite',
        'marquee': 'marquee 30s linear infinite',
        'sway-3d': 'sway3d 7s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        swing: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        // Content is rendered twice, so sliding by half loops seamlessly
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        sway3d: {
          '0%, 100%': { transform: 'rotateX(5deg) rotateY(-9deg)' },
          '50%': { transform: 'rotateX(-3deg) rotateY(9deg)' },
        },
        petal: {
          '0%': { transform: 'translate(0, 0) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '0.9' },
          '50%': { transform: 'translate(36px, 260px) rotate(170deg)' },
          '85%': { opacity: '0.7' },
          '100%': { transform: 'translate(-12px, 520px) rotate(340deg)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
};
