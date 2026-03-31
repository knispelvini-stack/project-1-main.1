import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { CreditCard, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Payment() {
  const { user } = useAuth();
  const { items, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    address: '',
    phone: '',
    payment_method: ''
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/checkout');
    }
  }, [items, navigate]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      toast.error('Please login to proceed with payment');
      navigate('/login');
    }
  }, [user, navigate]);

  // Auto-fill fields if user is logged in
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        address: user.address || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.payment_method) {
      toast.error('Please select a payment option');
      return;
    }
    if (!form.first_name || !form.last_name || !form.address || !form.phone) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        customer_id: user?.id || 'guest',
        first_name: form.first_name,
        last_name: form.last_name,
        address: form.address,
        phone: form.phone,
        payment_method: form.payment_method,
        items: items.map(item => ({
          lpa_stock_ID: item.lpa_stock_ID,
          lpa_stock_name: item.lpa_stock_name,
          lpa_stock_price: item.lpa_stock_price,
          quantity: item.quantity,
          amount: item.lpa_stock_price * item.quantity
        })),
        total: cartTotal
      };

      await axios.post(`${API}/orders`, orderData);
      clearCart();
      toast.success('Payment successful!');
      navigate('/complete');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Payment failed. Please try again.');
    }
    setLoading(false);
  };

  const handleCancel = () => {
    navigate('/checkout');
  };

  const inputClass = "bg-black/50 border-white/10 focus:border-neon-cyan focus-visible:ring-neon-cyan/30 text-white placeholder:text-zinc-600 h-11 rounded-none font-body";

  return (
    <div className="py-12 px-6 md:px-12" data-testid="payment-page">
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link to="/checkout" className="inline-flex items-center gap-2 text-zinc-500 hover:text-neon-cyan text-sm font-heading uppercase tracking-wider mb-8 transition-colors duration-200">
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </Link>

          <div className="glass-card p-8 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-neon-cyan flex items-center justify-center" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 75%, 75% 100%, 0 100%)' }}>
                <CreditCard className="w-5 h-5 text-black" />
              </div>
              <div>
                <h1 className="font-heading text-2xl font-bold uppercase tracking-wide text-white" data-testid="payment-title">
                  Checkout Payment
                </h1>
                <p className="text-zinc-500 text-xs font-mono tracking-wider">COMPLETE YOUR ORDER</p>
              </div>
            </div>

            {/* Order summary */}
            <div className="bg-black/30 border border-white/5 p-4 mb-8" data-testid="order-summary">
              <p className="font-mono text-xs text-zinc-500 tracking-widest uppercase mb-2">Order Summary</p>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-sm font-body">{items.length} item{items.length !== 1 ? 's' : ''}</span>
                <span className="font-heading font-bold text-neon-cyan text-lg" data-testid="payment-total">${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" data-testid="payment-form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-zinc-400 text-xs font-heading uppercase tracking-widest">First Name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    placeholder="John"
                    required
                    className={inputClass}
                    data-testid="payment-first-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-zinc-400 text-xs font-heading uppercase tracking-widest">Last Name</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    placeholder="Doe"
                    required
                    className={inputClass}
                    data-testid="payment-last-name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-zinc-400 text-xs font-heading uppercase tracking-widest">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="123 Main St, City"
                  required
                  className={inputClass}
                  data-testid="payment-address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-zinc-400 text-xs font-heading uppercase tracking-widest">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  required
                  className={inputClass}
                  data-testid="payment-phone"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs font-heading uppercase tracking-widest">Payment Option</Label>
                <Select
                  value={form.payment_method}
                  onValueChange={(val) => setForm(prev => ({ ...prev, payment_method: val }))}
                >
                  <SelectTrigger
                    className="bg-black/50 border-white/10 focus:border-neon-cyan text-white h-11 rounded-none font-body"
                    data-testid="payment-method-select"
                  >
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-white/10 rounded-none">
                    <SelectItem value="PayPal" className="text-white font-body" data-testid="payment-option-paypal">PayPal</SelectItem>
                    <SelectItem value="VISA" className="text-white font-body" data-testid="payment-option-visa">VISA</SelectItem>
                    <SelectItem value="MasterCard" className="text-white font-body" data-testid="payment-option-mastercard">MasterCard</SelectItem>
                    <SelectItem value="Direct deposit" className="text-white font-body" data-testid="payment-option-deposit">Direct Deposit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-neon text-sm py-3 disabled:opacity-50"
                  data-testid="pay-now-btn"
                >
                  {loading ? 'Processing...' : 'Pay Now'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-outline-neon text-sm px-6 py-3"
                  data-testid="payment-cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
