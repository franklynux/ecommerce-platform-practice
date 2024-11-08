import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CartProvider } from '../../contexts/CartContext';
import { useCart } from '../useCart';

const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;

describe('useCart', () => {
  it('adds item to cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    
    const mockProduct = {
      _id: '1',
      name: 'Test Product',
      price: 10,
    };

    act(() => {
      result.current.addItem(mockProduct);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].product._id).toBe(mockProduct._id);
  });
});