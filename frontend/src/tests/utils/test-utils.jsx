import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from '../../contexts/CartContext';

export function renderWithProviders(ui, options = {}) {
  const AllProviders = ({ children }) => {
    return (
      <BrowserRouter>
        <CartProvider>
          {children}
        </CartProvider>
      </BrowserRouter>
    );
  };

  return render(ui, { wrapper: AllProviders, ...options });
}