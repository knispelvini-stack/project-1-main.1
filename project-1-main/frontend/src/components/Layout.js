import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, User, Menu, X, Zap, LogOut, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Header = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
    { to: '/sales-invoicing', label: 'Sales & Invoicing' },
    { to: '/stock-management', label: 'Stock Management' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5" data-testid="global-header">
      <div className="bg-void/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group" data-testid="logo-link">
              <div className="w-8 h-8 bg-neon-cyan flex items-center justify-center" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 75%, 75% 100%, 0 100%)' }}>
                <Zap className="w-5 h-5 text-black" />
              </div>
              <span className="font-heading font-bold text-xl tracking-wider text-white">
                LPA<span className="text-neon-cyan">'s</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8" data-testid="desktop-nav">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`font-heading font-semibold text-sm uppercase tracking-widest transition-colors duration-200 ${
                    isActive(link.to) ? 'text-neon-cyan' : 'text-zinc-400 hover:text-white'
                  }`}
                  data-testid={`nav-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-4">
              {/* Cart */}
              <Link
                to="/checkout"
                className="relative p-2 text-zinc-400 hover:text-neon-cyan transition-colors duration-200"
                data-testid="cart-icon"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-neon-cyan text-black text-xs font-bold flex items-center justify-center rounded-full" data-testid="cart-count">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User */}
              {user ? (
                <div className="hidden md:flex items-center gap-3">
                  <span className="text-sm text-zinc-400 font-body" data-testid="user-greeting">
                    {user.first_name}
                  </span>
                  <button
                    onClick={() => { logout(); navigate('/'); }}
                    className="p-2 text-zinc-400 hover:text-neon-red transition-colors duration-200"
                    data-testid="logout-btn"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-sm font-heading font-semibold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors duration-200 px-3 py-1.5"
                    data-testid="nav-login"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm font-heading font-semibold uppercase tracking-wider bg-neon-cyan text-black px-4 py-1.5 hover:shadow-neon transition-shadow duration-300"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% 75%, 90% 100%, 0 100%)' }}
                    data-testid="nav-register"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile toggle */}
              <button
                className="md:hidden p-2 text-zinc-400"
                onClick={() => setMobileOpen(!mobileOpen)}
                data-testid="mobile-menu-toggle"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-void/95 backdrop-blur-xl border-b border-white/5"
            data-testid="mobile-menu"
          >
            <div className="px-6 py-4 space-y-2">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between py-3 font-heading font-semibold uppercase tracking-wider text-sm ${
                    isActive(link.to) ? 'text-neon-cyan' : 'text-zinc-400'
                  }`}
                >
                  {link.label}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ))}
              {user ? (
                <button
                  onClick={() => { logout(); navigate('/'); setMobileOpen(false); }}
                  className="flex items-center gap-2 py-3 text-zinc-400 font-heading font-semibold uppercase tracking-wider text-sm"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="block py-3 text-zinc-400 font-heading font-semibold uppercase tracking-wider text-sm">
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="block py-3 text-neon-cyan font-heading font-semibold uppercase tracking-wider text-sm">
                    Register
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-void" data-testid="global-footer">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-neon-cyan flex items-center justify-center" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 75%, 75% 100%, 0 100%)' }}>
                <Zap className="w-5 h-5 text-black" />
              </div>
              <span className="font-heading font-bold text-xl tracking-wider text-white">
                LPA<span className="text-neon-cyan">'s</span> Ecommerce
              </span>
            </div>
            <p className="text-zinc-500 font-body text-sm leading-relaxed max-w-md">
              Premium gaming peripherals for the next generation of gamers. 
              Elevate your setup with cutting-edge technology and design.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-widest text-zinc-300 mb-4">Navigation</h4>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/products', label: 'Products' },
                { to: '/sales-invoicing', label: 'Sales & Invoicing' },
                { to: '/stock-management', label: 'Stock Management' },
                { to: '/checkout', label: 'Cart' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-zinc-500 hover:text-neon-cyan text-sm font-body transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-widest text-zinc-300 mb-4">Categories</h4>
            <ul className="space-y-2">
              {['Keyboards', 'Mice', 'Headsets', 'Monitors', 'Webcams', 'Mousepads'].map(cat => (
                <li key={cat}>
                  <Link to={`/products?category=${cat}`} className="text-zinc-500 hover:text-neon-cyan text-sm font-body transition-colors duration-200">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-600 text-xs font-mono tracking-wider">
            &copy; {new Date().getFullYear()} LPA'S ECOMMERCE. ALL RIGHTS RESERVED.
          </p>
          <p className="text-zinc-700 text-xs font-mono tracking-wider">
            GEAR FOR THE NEXT LEVEL
          </p>
        </div>
      </div>
    </footer>
  );
};

export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-void noise-overlay flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
};
