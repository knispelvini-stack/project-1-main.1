import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Receipt, CreditCard, TrendingUp, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

const invoices = [
  { id: 'INV-1042', customer: 'Rafael Lima', date: '2026-03-10', total: 329.9, status: 'Paid' },
  { id: 'INV-1043', customer: 'Marina Costa', date: '2026-03-11', total: 899.0, status: 'Pending' },
  { id: 'INV-1044', customer: 'Pedro Souza', date: '2026-03-12', total: 159.5, status: 'Overdue' },
  { id: 'INV-1045', customer: 'Ana Martins', date: '2026-03-13', total: 2499.9, status: 'Paid' },
];

const sales = [
  { product: 'Mechanical Keyboard X1', qty: 14, revenue: 1958.6 },
  { product: 'Gaming Mouse V2', qty: 28, revenue: 2212.0 },
  { product: 'Pro Headset 7.1', qty: 12, revenue: 1788.0 },
  { product: 'UltraWide Monitor 34"', qty: 5, revenue: 3995.0 },
];

const statusStyles = {
  Paid: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
  Pending: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
  Overdue: 'bg-red-500/20 text-red-300 border-red-400/30',
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function SalesInvoicing() {
  const totalRevenue = sales.reduce((acc, item) => acc + item.revenue, 0);
  const paidCount = invoices.filter((inv) => inv.status === 'Paid').length;
  const pendingCount = invoices.filter((inv) => inv.status === 'Pending').length;
  const overdueCount = invoices.filter((inv) => inv.status === 'Overdue').length;

  return (
    <div className="py-12 px-6 md:px-12" data-testid="sales-invoicing-page">
      <div className="max-w-7xl mx-auto space-y-10">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          <p className="font-mono text-xs tracking-[0.3em] text-neon-cyan mb-2">BACKOFFICE</p>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight uppercase text-white">
            Sales & Invoicing
          </h1>
          <p className="text-zinc-500 font-body mt-4 max-w-3xl">
           Consolidated view of sales, invoices, and billing status with the same visual standard as the platform.
          </p>
        </motion.div>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <div className="glass-card p-5 border border-white/10">
            <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Gross Revenue</p>
            <div className="mt-3 flex items-center justify-between">
              <h3 className="font-heading text-2xl text-white font-bold">{formatCurrency(totalRevenue)}</h3>
              <TrendingUp className="w-5 h-5 text-neon-cyan" />
            </div>
          </div>
          <div className="glass-card p-5 border border-white/10">
            <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Paid Invoices</p>
            <div className="mt-3 flex items-center justify-between">
              <h3 className="font-heading text-2xl text-white font-bold">{paidCount}</h3>
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            </div>
          </div>
          <div className="glass-card p-5 border border-white/10">
            <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Pending</p>
            <div className="mt-3 flex items-center justify-between">
              <h3 className="font-heading text-2xl text-white font-bold">{pendingCount}</h3>
              <Clock className="w-5 h-5 text-amber-300" />
            </div>
          </div>
          <div className="glass-card p-5 border border-white/10">
            <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Overdue</p>
            <div className="mt-3 flex items-center justify-between">
              <h3 className="font-heading text-2xl text-white font-bold">{overdueCount}</h3>
              <AlertTriangle className="w-5 h-5 text-red-300" />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="glass-card border border-white/10 xl:col-span-2">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h2 className="font-heading text-xl uppercase tracking-wider text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-neon-cyan" />
                Recent Invoices
              </h2>
              <button className="btn-outline-neon text-xs px-4 py-2">Create Invoice</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px]">
                <thead>
                  <tr className="text-left text-zinc-500 text-xs font-mono uppercase tracking-widest border-b border-white/10">
                    <th className="p-4">Invoice</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 text-white font-mono text-sm">{inv.id}</td>
                      <td className="p-4 text-zinc-300 font-body text-sm">{inv.customer}</td>
                      <td className="p-4 text-zinc-400 font-body text-sm">{inv.date}</td>
                      <td className="p-4 text-neon-cyan font-heading font-semibold">{formatCurrency(inv.total)}</td>
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-1 border text-xs uppercase tracking-wider ${statusStyles[inv.status]}`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card border border-white/10 p-5">
              <h3 className="font-heading text-lg uppercase tracking-wider text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-neon-cyan" />
                Payment Summary
              </h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex justify-between text-zinc-300"><span>Card Payments</span><span>71%</span></li>
                <li className="flex justify-between text-zinc-300"><span>Pix</span><span>22%</span></li>
                <li className="flex justify-between text-zinc-300"><span>Boleto</span><span>7%</span></li>
              </ul>
            </div>

            <div className="glass-card border border-white/10 p-5">
              <h3 className="font-heading text-lg uppercase tracking-wider text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-neon-cyan" />
                Notes
              </h3>
              <p className="text-zinc-400 text-sm mt-3 leading-relaxed">
               Automation of invoice sending can be connected here with the backend, keeping this layout as an administrative module.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
