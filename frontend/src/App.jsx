// src/App.jsx
import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { ProtectedContent, GuestContent } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import ProductList from './components/products/ProductList';
import ProductDetails from './components/products/ProductDetails';
import Checkout from './components/checkout/Checkout';
import Cart from './components/cart/Cart';
import { Login, Register } from './components/auth';
import { Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';  

const App = () => {
  useEffect(() => {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 300);
    }
  }, []);

  return (
    <>
      <CartProvider>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            
            {/* Guest Routes */}
            <Route path="/login" element={
              <GuestContent fallback={<Navigate to="/" />}>
                <Login />
              </GuestContent>
            } />
            <Route path="/register" element={
              <GuestContent fallback={<Navigate to="/" />}>
                <Register />
              </GuestContent>
            } />
            
            {/* Protected Routes */}
            <Route path="/checkout" element={
              <ProtectedContent fallback={<Navigate to="/login" />}>
                <Checkout />
              </ProtectedContent>
            } />
          </Routes>
        </Layout>
      </CartProvider>
      
      {/* Add Toaster outside of CartProvider but inside the fragment */}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#4F46E5',
            },
          },
          error: {
            duration: 3000,
            style: {
              background: '#EF4444',
            },
          },
        }}
      />
    </>
  );
};

export default App;