import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Search, ShoppingCart, Check, Filter, X, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api`;

const CATEGORIES = ['All', 'Keyboards', 'Mice', 'Headsets', 'Monitors', 'Webcams', 'Mousepads'];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [addedIds, setAddedIds] = useState(new Set());
  const [fetchError, setFetchError] = useState('');
  const { addToCart } = useCart();

  const activeCategory = searchParams.get('category') || 'All';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        setFetchError('');
        const params = {};
        if (searchQuery) params.search = searchQuery;
        if (activeCategory !== 'All') params.category = activeCategory;
        const res = await axios.get(`${API}/products`, { params });
        const data = Array.isArray(res.data) ? res.data : [];
        setProducts(data);
      } catch (e) {
        console.error('Failed to fetch products', e);
        const detail = e.response?.data?.detail || e.message;
        setProducts([]);
        setFetchError(
          `Erro: ${detail}. Não foi possível conectar em ${API}/products. Verifique se o backend está rodando.`
        );
      }
      setLoading(false);
    };
    const timer = setTimeout(fetchProducts, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, activeCategory]);

  const handleCategoryChange = (cat) => {
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    setAddedIds(prev => new Set([...prev, product.lpa_stock_ID]));
    toast.success(`${product.lpa_stock_name} added to cart`);
    setTimeout(() => {
      setAddedIds(prev => {
        const next = new Set(prev);
        next.delete(product.lpa_stock_ID);
        return next;
      });
    }, 1500);
  };

  return (
    <div className="py-12 px-6 md:px-12" data-testid="products-page">
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <p className="font-mono text-xs tracking-[0.3em] text-neon-cyan mb-2">BROWSE</p>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight uppercase text-white">
            Product Catalog
          </h1>
        </motion.div>

        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10 space-y-6"
        >
          {/* Search bar */}
          <div className="relative max-w-md" data-testid="search-container">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-black/50 border-white/10 focus:border-neon-cyan focus-visible:ring-neon-cyan/30 text-white placeholder:text-zinc-600 h-11 rounded-none font-body"
              data-testid="search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                data-testid="search-clear"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2" data-testid="category-filters">
            <Filter className="w-4 h-4 text-zinc-500 mt-1.5 mr-1" />
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-1.5 text-xs font-heading font-semibold uppercase tracking-widest transition-all duration-200 border ${
                  activeCategory === cat
                    ? 'bg-neon-cyan text-black border-neon-cyan'
                    : 'bg-transparent text-zinc-400 border-white/10 hover:border-neon-cyan/40 hover:text-white'
                }`}
                data-testid={`filter-${cat.toLowerCase()}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {fetchError && (
          <div className="mb-6 glass-card border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3" data-testid="products-fetch-error">
            <AlertTriangle className="w-5 h-5 text-red-300 mt-0.5 shrink-0" />
            <p className="text-red-200 text-sm font-body">{fetchError}</p>
          </div>
        )}

        {/* Results count */}
        <div className="mb-6">
          <p className="text-sm text-zinc-500 font-mono" data-testid="results-count">
            {products.length} product{products.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Product grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="glass-card animate-pulse">
                <div className="aspect-square bg-white/5" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-white/5 rounded w-1/3" />
                  <div className="h-5 bg-white/5 rounded w-2/3" />
                  <div className="h-3 bg-white/5 rounded w-full" />
                  <div className="h-5 bg-white/5 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24" data-testid="no-results">
            <p className="text-zinc-500 font-body text-lg">No products found</p>
            <p className="text-zinc-600 font-body text-sm mt-2">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="product-grid">
            {products.map((product, idx) => (
              <motion.div
                key={product.lpa_stock_ID}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="product-card glass-card group overflow-hidden"
                data-testid={`product-card-${product.lpa_stock_ID}`}
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-black/30">
                  <img
                    src={product.lpa_stock_image}
                    alt={product.lpa_stock_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {product.lpa_stock_quantity <= 30 && (
                    <Badge className="absolute top-3 left-3 badge-sale rounded-none border-0" data-testid="low-stock-badge">
                      LOW STOCK
                    </Badge>
                  )}
                </div>

                {/* Info */}
                <div className="p-5">
                  <p className="font-mono text-[10px] tracking-widest text-zinc-600 mb-1" data-testid="product-category">
                    {product.lpa_stock_category?.toUpperCase()}
                  </p>
                  <h3 className="font-heading font-bold text-white text-lg tracking-wide mb-1" data-testid="product-name">
                    {product.lpa_stock_name}
                  </h3>
                  <p className="text-zinc-500 text-xs font-body line-clamp-2 mb-3" data-testid="product-description">
                    {product.lpa_stock_description}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-heading font-bold text-neon-cyan text-xl" data-testid="product-price">
                        ${product.lpa_stock_price.toFixed(2)}
                      </p>
                      <p className="font-mono text-[10px] text-zinc-600" data-testid="product-quantity">
                        {product.lpa_stock_quantity} in stock
                      </p>
                    </div>
                  </div>

                  {/* Add to cart */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={addedIds.has(product.lpa_stock_ID)}
                    className={`w-full py-3 text-xs font-heading font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
                      addedIds.has(product.lpa_stock_ID)
                        ? 'bg-green-500 text-black'
                        : 'bg-neon-cyan text-black hover:shadow-neon'
                    }`}
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% 75%, 95% 100%, 0 100%)' }}
                    data-testid={`add-to-cart-${product.lpa_stock_ID}`}
                  >
                    {addedIds.has(product.lpa_stock_ID) ? (
                      <>
                        <Check className="w-4 h-4" /> Added
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" /> Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
