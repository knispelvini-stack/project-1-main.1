import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableFooter } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/CartContext';
import { Trash2, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function Checkout() {
  const { items, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();

  const handleRemove = (item) => {
    removeFromCart(item.lpa_stock_ID);
    toast.success(`${item.lpa_stock_name} removed from cart`);
  };

  const handleConfirm = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/payment');
  };

  return (
    <div className="py-12 px-6 md:px-12" data-testid="checkout-page">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link to="/products" className="inline-flex items-center gap-2 text-zinc-500 hover:text-neon-cyan text-sm font-heading uppercase tracking-wider mb-8 transition-colors duration-200">
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-neon-cyan flex items-center justify-center" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 75%, 75% 100%, 0 100%)' }}>
              <ShoppingBag className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold uppercase tracking-wide text-white" data-testid="checkout-title">
                Shopping Cart
              </h1>
              <p className="text-zinc-500 text-xs font-mono tracking-wider">
                {cartCount} ITEM{cartCount !== 1 ? 'S' : ''} IN CART
              </p>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="glass-card p-16 text-center" data-testid="empty-cart">
              <ShoppingBag className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400 font-body text-lg mb-2">Your cart is empty</p>
              <p className="text-zinc-600 font-body text-sm mb-6">Browse our products and add items to your cart</p>
              <Link to="/products" className="btn-neon inline-flex items-center gap-2 text-sm">
                Browse Products <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="glass-card overflow-hidden" data-testid="cart-table-container">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="font-heading text-xs uppercase tracking-widest text-zinc-500 py-4">Product Code</TableHead>
                      <TableHead className="font-heading text-xs uppercase tracking-widest text-zinc-500 py-4">Product Name</TableHead>
                      <TableHead className="font-heading text-xs uppercase tracking-widest text-zinc-500 py-4 text-right">Price</TableHead>
                      <TableHead className="font-heading text-xs uppercase tracking-widest text-zinc-500 py-4 text-center">QTY</TableHead>
                      <TableHead className="font-heading text-xs uppercase tracking-widest text-zinc-500 py-4 text-right">Amount</TableHead>
                      <TableHead className="font-heading text-xs uppercase tracking-widest text-zinc-500 py-4 text-center w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map(item => (
                      <TableRow
                        key={item.lpa_stock_ID}
                        className="border-white/5 hover:bg-white/[0.02]"
                        data-testid={`cart-row-${item.lpa_stock_ID}`}
                      >
                        <TableCell className="font-mono text-xs text-zinc-500 py-4" data-testid="cart-product-code">
                          {item.lpa_stock_ID}
                        </TableCell>
                        <TableCell className="py-4" data-testid="cart-product-name">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.lpa_stock_image}
                              alt={item.lpa_stock_name}
                              className="w-10 h-10 object-cover bg-black/30 hidden sm:block"
                            />
                            <span className="font-heading font-semibold text-white text-sm">{item.lpa_stock_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-body text-zinc-300 text-sm text-right py-4" data-testid="cart-product-price">
                          ${item.lpa_stock_price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center py-4" data-testid="cart-product-qty">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.lpa_stock_ID, parseInt(e.target.value) || 1)}
                            className="w-16 h-8 text-center bg-black/50 border-white/10 text-white rounded-none text-sm mx-auto"
                            data-testid={`qty-input-${item.lpa_stock_ID}`}
                          />
                        </TableCell>
                        <TableCell className="font-heading font-bold text-neon-cyan text-right py-4" data-testid="cart-product-amount">
                          ${(item.lpa_stock_price * item.quantity).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center py-4">
                          <button
                            onClick={() => handleRemove(item)}
                            className="p-2 text-zinc-500 hover:text-neon-red transition-colors duration-200"
                            data-testid={`remove-btn-${item.lpa_stock_ID}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter className="bg-white/[0.02] border-t border-white/5">
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={4} className="text-right font-heading font-bold uppercase tracking-wider text-zinc-400 text-sm py-4" data-testid="cart-total-label">
                        Total
                      </TableCell>
                      <TableCell className="text-right font-heading font-bold text-neon-cyan text-xl py-4" data-testid="cart-total-amount">
                        ${cartTotal.toFixed(2)}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>

              <div className="p-6 border-t border-white/5 flex justify-end">
                <button
                  onClick={handleConfirm}
                  className="btn-neon text-sm inline-flex items-center gap-2"
                  data-testid="confirm-checkout-btn"
                >
                  Confirm & Proceed <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
