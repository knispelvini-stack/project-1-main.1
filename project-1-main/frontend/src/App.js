import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { Layout } from "@/components/Layout";
import { Toaster } from "sonner";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import Register from "@/pages/Register";
import Login from "@/pages/Login";
import Checkout from "@/pages/Checkout";
import Payment from "@/pages/Payment";
import Complete from "@/pages/Complete";
import SalesInvoicing from "@/pages/SalesInvoicing";
import StockManagement from "@/pages/StockManagement";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/complete" element={<Complete />} />
              <Route path="/sales-invoicing" element={<SalesInvoicing />} />
              <Route path="/stock-management" element={<StockManagement />} />
            </Routes>
          </Layout>
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#0a0a0b',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                fontFamily: '"Outfit", sans-serif',
              }
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
