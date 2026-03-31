import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowRight, Keyboard, Mouse, Headphones, Monitor, Camera, Square } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORIES = [
  { name: 'Keyboards', icon: Keyboard, color: '#00f0ff' },
  { name: 'Mice', icon: Mouse, color: '#7000ff' },
  { name: 'Headsets', icon: Headphones, color: '#ff003c' },
  { name: 'Monitors', icon: Monitor, color: '#00f0ff' },
  { name: 'Webcams', icon: Camera, color: '#7000ff' },
  { name: 'Mousepads', icon: Square, color: '#ff003c' },
];

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API}/products`);
        setFeatured(res.data.slice(0, 4));
      } catch (e) {
        console.error('Failed to fetch products', e);
      }
    };
    fetchProducts();
    // Log page access
    axios.post(`${API}/log`, { level: 'INFO', message: 'Home page accessed', category: 'ACTIVITY' }).catch(() => {});
  }, []);

  return (
    <div data-testid="home-page">
      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden" data-testid="hero-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              <motion.p variants={fadeUp} className="font-mono text-xs tracking-[0.3em] text-neon-cyan mb-4">
                PREMIUM PERIPHERALS
              </motion.p>
              <motion.h1 variants={fadeUp} className="font-heading text-5xl md:text-7xl font-bold tracking-tight uppercase text-white leading-[0.9]">
                Gear for<br />
                <span className="text-neon-cyan">the Next</span><br />
                Level
              </motion.h1>
              <motion.p variants={fadeUp} className="mt-6 text-zinc-400 font-body text-base md:text-lg leading-relaxed max-w-md">
                Discover cutting-edge gaming peripherals engineered for precision, speed, and immersion.
              </motion.p>
              <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/products"
                  className="btn-neon inline-flex items-center gap-2 text-sm"
                  data-testid="hero-shop-btn"
                >
                  Shop Now <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/products"
                  className="btn-outline-neon inline-flex items-center gap-2 text-sm px-6 py-3"
                  data-testid="hero-catalog-btn"
                >
                  View Catalog
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:block relative"
            >
              <div className="relative aspect-square">
                <img
                  src="https://images.unsplash.com/photo-1767800766055-1cdbd2e351b9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwzfHxnYW1lciUyMHJvb20lMjBzZXR1cCUyMG5lb258ZW58MHx8fHwxNzczODIxNzk1fDA&ixlib=rb-4.1.0&q=85"
                  alt="Gaming setup"
                  className="w-full h-full object-cover rounded-sm"
                  style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 95%, 95% 100%, 0 100%, 0 5%)' }}
                />
                <div className="absolute inset-0 border border-neon-cyan/20 rounded-sm pointer-events-none" style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 95%, 95% 100%, 0 100%, 0 5%)' }} />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Decorative line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent" />
      </section>

      {/* Categories */}
      <section className="py-24 px-6 md:px-12" data-testid="categories-section">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
          >
            <motion.p variants={fadeUp} className="font-mono text-xs tracking-[0.3em] text-neon-cyan mb-2">
              BROWSE BY
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-heading text-3xl md:text-5xl font-bold tracking-wide uppercase text-white mb-12">
              Categories
            </motion.h2>

            <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.name}
                    to={`/products?category=${cat.name}`}
                    className="group glass-card p-6 text-center hover:border-neon-cyan/30 transition-all duration-300"
                    data-testid={`category-${cat.name.toLowerCase()}`}
                  >
                    <div className="mb-3 flex justify-center">
                      <Icon className="w-8 h-8 text-zinc-500 group-hover:text-neon-cyan transition-colors duration-300" />
                    </div>
                    <span className="font-heading font-semibold text-xs uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors duration-300">
                      {cat.name}
                    </span>
                  </Link>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 px-6 md:px-12 bg-surface" data-testid="featured-section">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="flex items-end justify-between mb-12">
              <div>
                <p className="font-mono text-xs tracking-[0.3em] text-neon-cyan mb-2">TOP PICKS</p>
                <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-wide uppercase text-white">
                  Featured Gear
                </h2>
              </div>
              <Link
                to="/products"
                className="hidden md:inline-flex items-center gap-2 text-sm font-heading font-semibold uppercase tracking-wider text-zinc-400 hover:text-neon-cyan transition-colors duration-200"
                data-testid="view-all-btn"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((product, idx) => (
                <motion.div
                  key={product.lpa_stock_ID}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link
                    to="/products"
                    className="product-card glass-card block overflow-hidden group"
                    data-testid={`featured-product-${product.lpa_stock_ID}`}
                  >
                    <div className="aspect-square overflow-hidden bg-black/30">
                      <img
                        src={product.lpa_stock_image}
                        alt={product.lpa_stock_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <p className="font-mono text-[10px] tracking-widest text-zinc-600 mb-1">{product.lpa_stock_category?.toUpperCase()}</p>
                      <h3 className="font-heading font-bold text-white text-lg tracking-wide">{product.lpa_stock_name}</h3>
                      <p className="mt-2 font-heading font-bold text-neon-cyan text-xl">${product.lpa_stock_price.toFixed(2)}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            <div className="md:hidden mt-8 text-center">
              <Link
                to="/products"
                className="btn-outline-neon inline-flex items-center gap-2 text-sm px-6 py-3"
              >
                View All Products <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 px-6 md:px-12" data-testid="cta-section">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="font-mono text-xs tracking-[0.3em] text-neon-cyan mb-4">READY TO UPGRADE?</p>
              <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-wide uppercase text-white mb-6">
                Level Up Your Setup
              </h2>
              <p className="text-zinc-400 font-body max-w-lg mx-auto mb-8">
                Browse our full collection of premium peripherals and find the perfect gear for your playstyle.
              </p>
              <Link
                to="/products"
                className="btn-neon inline-flex items-center gap-2 text-sm"
                data-testid="cta-shop-btn"
              >
                Explore Products <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
