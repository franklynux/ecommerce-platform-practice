import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCart } from '../useCart';
import { CartProvider } from '../../contexts/CartContext';
import { BrowserRouter } from 'react-router-dom';

describe('useCart', () => {
  const wrapper = ({ children }) => (
    <BrowserRouter>
      <CartProvider>{children}</CartProvider>
    </BrowserRouter>
  );

  it('adds item to cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem({
        _id: '1',
        name: 'Test Product',
        price: 10
      });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].product._id).toBe('1');
  });

  it('calculates total correctly', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem({
        _id: '1',
        name: 'Test Product',
        price: 10
      }, 2); // Add 2 quantities
    });

    expect(result.current.getCartTotal()).toBe(20);
  });
});
