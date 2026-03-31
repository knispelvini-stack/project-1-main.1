import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { LogIn, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(username, password);
      toast.success('Login successful!');
      // Log the login activity
      axios.post(`${API}/log`, { level: 'INFO', message: `User logged in: ${username}`, category: 'AUTH' }).catch(() => {});
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed');
    }
    setLoading(false);
  };

  const inputClass = "bg-black/50 border-white/10 focus:border-neon-cyan focus-visible:ring-neon-cyan/30 text-white placeholder:text-zinc-600 h-11 rounded-none font-body";

  return (
    <div className="py-12 px-6 md:px-12 min-h-[80vh] flex items-center justify-center" data-testid="login-page">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-neon-cyan text-sm font-heading uppercase tracking-wider mb-8 transition-colors duration-200">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Dialog-style centered login */}
        <Dialog open={true} onOpenChange={() => {}}>
          <DialogContent
            className="bg-surface border-white/10 backdrop-blur-xl sm:max-w-md rounded-none"
            onPointerDownOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
            data-testid="login-dialog"
          >
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-neon-cyan flex items-center justify-center" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 75%, 75% 100%, 0 100%)' }}>
                  <LogIn className="w-5 h-5 text-black" />
                </div>
                <div>
                  <DialogTitle className="font-heading text-xl font-bold uppercase tracking-wide text-white" data-testid="login-dialog-title">
                    Customer Login
                  </DialogTitle>
                  <DialogDescription className="text-zinc-500 text-xs font-mono tracking-wider">
                    ENTER YOUR CREDENTIALS
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5 mt-4" data-testid="login-form">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-zinc-400 text-xs font-heading uppercase tracking-widest">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  className={inputClass}
                  data-testid="login-username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-400 text-xs font-heading uppercase tracking-widest">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className={inputClass}
                  data-testid="login-password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-neon text-sm py-3 disabled:opacity-50"
                data-testid="login-submit-btn"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <p className="text-center text-zinc-500 text-sm font-body">
                Don't have an account?{' '}
                <Link to="/register" className="text-neon-cyan hover:underline" data-testid="register-link">
                  Register here
                </Link>
              </p>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}
