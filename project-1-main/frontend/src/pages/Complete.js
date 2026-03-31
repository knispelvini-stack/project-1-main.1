import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Home } from 'lucide-react';

export default function Complete() {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="py-12 px-6 md:px-12 min-h-[80vh] flex items-center justify-center" data-testid="complete-page">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-md w-full"
      >
        <div className="glass-card p-10 md:p-14 text-center">
          {/* Animated check icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
            className="mb-6 flex justify-center"
          >
            <div className="w-20 h-20 bg-neon-cyan/10 border-2 border-neon-cyan rounded-full flex items-center justify-center animate-glow-pulse">
              <CheckCircle className="w-10 h-10 text-neon-cyan" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p className="font-mono text-xs tracking-[0.3em] text-neon-cyan mb-3">ORDER CONFIRMED</p>
            <h1 className="font-heading text-3xl md:text-4xl font-bold uppercase tracking-wide text-white mb-4" data-testid="complete-title">
              Payment Successful
            </h1>
            <p className="text-zinc-400 font-body leading-relaxed mb-8" data-testid="complete-message">
              Your order is now complete. Thank you for shopping with LPA's Ecommerce. 
              You will receive a confirmation with your order details.
            </p>

            <button
              onClick={handleClose}
              className="btn-neon text-sm inline-flex items-center gap-2 mx-auto"
              data-testid="close-btn"
            >
              <Home className="w-4 h-4" /> Close
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
