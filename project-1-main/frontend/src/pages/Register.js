import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { UserPlus, ArrowLeft } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    address: '',
    phone: '',
    username: '',
    password: '',
    confirm_password: ''
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    if (!form.first_name || !form.last_name || !form.username || !form.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      const { confirm_password, ...data } = form;
      await register(data);
      toast.success('Registration successful! Welcome to LPA\'s Ecommerce');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    }
    setLoading(false);
  };

  const handleCancel = () => {
    navigate('/');
  };

  const inputClass = "bg-black/50 border-white/10 focus:border-neon-cyan focus-visible:ring-neon-cyan/30 text-white placeholder:text-zinc-600 h-11 rounded-none font-body";

  return (
    <div className="py-12 px-6 md:px-12" data-testid="register-page">
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-neon-cyan text-sm font-heading uppercase tracking-wider mb-8 transition-colors duration-200">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <div className="glass-card p-8 md:p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-neon-cyan flex items-center justify-center" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 75%, 75% 100%, 0 100%)' }}>
                <UserPlus className="w-5 h-5 text-black" />
              </div>
              <div>
                <h1 className="font-heading text-2xl font-bold uppercase tracking-wide text-white" data-testid="register-title">
                  Customer Registration
                </h1>
                <p className="text-zinc-500 text-xs font-mono tracking-wider">CREATE YOUR ACCOUNT</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" data-testid="register-form">
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
                    data-testid="register-first-name"
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
                    data-testid="register-last-name"
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
                  data-testid="register-address"
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
                  data-testid="register-phone"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-zinc-400 text-xs font-heading uppercase tracking-widest">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="johndoe"
                  required
                  className={inputClass}
                  data-testid="register-username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-400 text-xs font-heading uppercase tracking-widest">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  required
                  className={inputClass}
                  data-testid="register-password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password" className="text-zinc-400 text-xs font-heading uppercase tracking-widest">Confirm Password</Label>
                <Input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  required
                  className={inputClass}
                  data-testid="register-confirm-password"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-neon text-sm py-3 disabled:opacity-50"
                  data-testid="register-submit-btn"
                >
                  {loading ? 'Registering...' : 'Register'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-outline-neon text-sm px-6 py-3"
                  data-testid="register-cancel-btn"
                >
                  Cancel
                </button>
              </div>

              <p className="text-center text-zinc-500 text-sm font-body mt-4">
                Already have an account?{' '}
                <Link to="/login" className="text-neon-cyan hover:underline" data-testid="login-link">
                  Login here
                </Link>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
