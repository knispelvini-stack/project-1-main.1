import React from 'react';
import { motion } from 'framer-motion';
import { Boxes, AlertTriangle, PackageCheck, Warehouse, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const stockItems = [
  { sku: 'KB-X1-BLK', name: 'Mechanical Keyboard X1', category: 'Keyboards', qty: 18, min: 12, lastMovement: '+4' },
  { sku: 'MS-V2-WHT', name: 'Gaming Mouse V2', category: 'Mice', qty: 62, min: 20, lastMovement: '-6' },
  { sku: 'HS-71-PRO', name: 'Pro Headset 7.1', category: 'Headsets', qty: 9, min: 15, lastMovement: '-2' },
  { sku: 'MN-34-UWQ', name: 'UltraWide Monitor 34"', category: 'Monitors', qty: 7, min: 6, lastMovement: '+1' },
  { sku: 'WC-4K-STR', name: 'Streaming Cam 4K', category: 'Webcams', qty: 3, min: 8, lastMovement: '-1' },
];

const badgeByLevel = (qty, min) => {
  if (qty <= min) return 'bg-red-500/20 text-red-300 border-red-400/30';
  if (qty <= min + 6) return 'bg-amber-500/20 text-amber-300 border-amber-400/30';
  return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30';
};

const levelLabel = (qty, min) => {
  if (qty <= min) return 'Critical';
  if (qty <= min + 6) return 'Low';
  return 'Healthy';
};

export default function StockManagement() {
  const totalUnits = stockItems.reduce((acc, item) => acc + item.qty, 0);
  const critical = stockItems.filter((item) => item.qty <= item.min).length;
  const low = stockItems.filter((item) => item.qty > item.min && item.qty <= item.min + 6).length;
  const healthy = stockItems.length - critical - low;

  return (
    <div className="py-12 px-6 md:px-12" data-testid="stock-management-page">
      <div className="max-w-7xl mx-auto space-y-10">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          <p className="font-mono text-xs tracking-[0.3em] text-neon-cyan mb-2">BACKOFFICE</p>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight uppercase text-white">
            Stock Management
          </h1>
          <p className="text-zinc-500 font-body mt-4 max-w-3xl">
           Inventory control with alerts and real-time stock movements.
          </p>
        </motion.div>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <div className="glass-card p-5 border border-white/10">
            <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Total Units</p>
            <div className="mt-3 flex items-center justify-between">
              <h3 className="font-heading text-2xl text-white font-bold">{totalUnits}</h3>
              <Warehouse className="w-5 h-5 text-neon-cyan" />
            </div>
          </div>
          <div className="glass-card p-5 border border-white/10">
            <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Critical</p>
            <div className="mt-3 flex items-center justify-between">
              <h3 className="font-heading text-2xl text-white font-bold">{critical}</h3>
              <AlertTriangle className="w-5 h-5 text-red-300" />
            </div>
          </div>
          <div className="glass-card p-5 border border-white/10">
            <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Low</p>
            <div className="mt-3 flex items-center justify-between">
              <h3 className="font-heading text-2xl text-white font-bold">{low}</h3>
              <Boxes className="w-5 h-5 text-amber-300" />
            </div>
          </div>
          <div className="glass-card p-5 border border-white/10">
            <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Healthy</p>
            <div className="mt-3 flex items-center justify-between">
              <h3 className="font-heading text-2xl text-white font-bold">{healthy}</h3>
              <PackageCheck className="w-5 h-5 text-emerald-300" />
            </div>
          </div>
        </section>

        <section className="glass-card border border-white/10">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-heading text-xl uppercase tracking-wider text-white">Inventory Table</h2>
            <button className="btn-neon text-xs px-4 py-2">Add Item</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="text-left text-zinc-500 text-xs font-mono uppercase tracking-widest border-b border-white/10">
                  <th className="p-4">SKU</th>
                  <th className="p-4">Item</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Qty</th>
                  <th className="p-4">Min</th>
                  <th className="p-4">Movement</th>
                  <th className="p-4">Level</th>
                </tr>
              </thead>
              <tbody>
                {stockItems.map((item) => {
                  const down = item.lastMovement.startsWith('-');
                  return (
                    <tr key={item.sku} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 text-zinc-300 font-mono text-xs">{item.sku}</td>
                      <td className="p-4 text-white font-body text-sm">{item.name}</td>
                      <td className="p-4 text-zinc-400 font-body text-sm">{item.category}</td>
                      <td className="p-4 text-neon-cyan font-heading font-semibold">{item.qty}</td>
                      <td className="p-4 text-zinc-400 text-sm">{item.min}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-mono ${down ? 'text-red-300' : 'text-emerald-300'}`}>
                          {down ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          {item.lastMovement}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-1 border text-xs uppercase tracking-wider ${badgeByLevel(item.qty, item.min)}`}>
                          {levelLabel(item.qty, item.min)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
