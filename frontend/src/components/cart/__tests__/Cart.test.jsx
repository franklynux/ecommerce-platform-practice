import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen, render, fireEvent, waitFor } from '@testing-library/react';
import Cart from '../Cart';
import { CartProvider } from '../../../contexts/CartContext';
import { useCart } from '../../../hooks/useCart';

// Test component to manipulate cart
const TestCart = () => {
  const { addItem } = useCart();

  const handleAddItem = () => {
    addItem({
      _id: '1',
      name: 'Test Product',
      price: 10.99
    });
  };

  return (
    <div>
      <Cart />
      <button onClick={handleAddItem} data-testid="add-item-button">
        Add Item
      </button>
    </div>
  );
};

describe('Cart', () => {
  it('shows empty cart message when no items', () => {
    render(
      <CartProvider>
        <Cart />
      </CartProvider>
    );
    
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it('displays cart items and total', async () => {
    render(
      <CartProvider>
        <TestCart />
      </CartProvider>
    );

    // First verify cart is empty
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();

    // Click add item button
    const addButton = screen.getByTestId('add-item-button');
    fireEvent.click(addButton);

    // Wait for and verify item appears
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    // Verify price is displayed
    await waitFor(() => {
      expect(screen.getByText('$10.99')).toBeInTheDocument();
    });
  });

  it('allows removing items from cart', async () => {
    render(
      <CartProvider>
        <TestCart />
      </CartProvider>
    );

    // Add an item
    const addButton = screen.getByTestId('add-item-button');
    fireEvent.click(addButton);

    // Wait for item to appear
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    // Click remove button
    const removeButton = screen.getByText('Remove');
    fireEvent.click(removeButton);

    // Verify item is removed
    await waitFor(() => {
      expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
    });
  });
});