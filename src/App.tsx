import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Gallery from './pages/Gallery';
import Reviews from './pages/Reviews';
import Contact from './pages/Contact';
import Packages from './pages/Packages';
import Services from './pages/Services';
import Workshops from './pages/Workshops';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ScrollToTop from './components/ScrollToTop';
import BackToTop from './components/BackToTop';
import CanonicalUrl from './components/CanonicalUrl';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-ivory overflow-x-clip">
        <Header />
        <main>
            <ScrollToTop />
            <CanonicalUrl />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/portfolio" element={<Gallery />} />
            {/* Old Gallery links now land on Portfolio */}
            <Route path="/gallery" element={<Navigate to="/portfolio" replace />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/workshops" element={<Workshops />} />
            {/* Old Products page links now land on Packages */}
            <Route path="/products" element={<Navigate to="/packages" replace />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          </Routes>
        </main>
        <Footer />
        <BackToTop />
      </div>
    </Router>
  );
}

export default App;