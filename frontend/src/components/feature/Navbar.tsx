import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { label: 'Home',        path: '/',            icon: 'ri-home-4-line' },
  { label: 'Live',        path: '/live',         icon: 'ri-live-line' },
  { label: 'Upload',      path: '/upload',       icon: 'ri-upload-cloud-line' },
  { label: 'History',     path: '/history',      icon: 'ri-history-line' },
  { label: 'Insights',    path: '/insights',     icon: 'ri-bar-chart-2-line' },
  { label: 'About',       path: '/about',        icon: 'ri-information-line' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  return (
    <motion.nav
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass border-b border-white/[0.06]' : ''
      }`}
    >
      <div className="px-5 flex items-center justify-between h-15 max-w-screen-2xl mx-auto" style={{ height: '60px' }}>
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 cursor-pointer shrink-0">
          <div className="w-8 h-8 flex items-center justify-center">
            <img src="https://public.readdy.ai/ai/img_res/4b4939bd-4d5f-4300-8443-da446ea38097.png" alt="SignAI Logo" className="w-8 h-8 object-contain" />
          </div>
          <span className="font-bold text-white text-sm tracking-wide hidden sm:block">
            Sign<span className="text-fuchsia-400">AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-0.5">
          {navLinks.map(link => {
            const active = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  active ? 'text-fuchsia-400' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg bg-fuchsia-400/10 border border-fuchsia-400/20"
                    transition={{ type: 'spring', duration: 0.4 }}
                  />
                )}
                <div className="w-3.5 h-3.5 flex items-center justify-center relative z-10">
                  <i className={link.icon} />
                </div>
                <span className="relative z-10">{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* CTA + mobile toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/live"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all duration-200 cursor-pointer whitespace-nowrap glow-primary"
            style={{ background: 'linear-gradient(135deg,#d946ef,#ec4899)' }}
          >
            <div className="w-3.5 h-3.5 flex items-center justify-center">
              <i className="ri-camera-line" />
            </div>
            Start Live
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white cursor-pointer"
          >
            <i className={`${menuOpen ? 'ri-close-line' : 'ri-menu-line'} text-xl`} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden glass border-t border-white/[0.06] px-5 py-4 grid grid-cols-2 gap-2"
          >
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  location.pathname === link.path
                    ? 'text-fuchsia-400 bg-fuchsia-400/10'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className={link.icon} />
                </div>
                {link.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
