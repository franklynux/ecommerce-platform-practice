import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../tests/utils/test-utils';
import Cart from '../Cart';

describe('Cart', () => {
  it('shows empty cart message when no items', () => {
    renderWithProviders(<Cart />);
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it('displays cart items and total', async () => {
    const { rerender } = renderWithProviders(<Cart />);
    
    // Verify empty state first
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
    
    // Update cart context with items
    // Note: You might need to modify this based on your actual CartContext implementation
    rerender(<Cart initialItems={[{
      product: {
        _id: '1',
        name: 'Test Product',
        price: 10.99
      },
      quantity: 1
    }]} />);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('$10.99')).toBeInTheDocument();
    });
  });

  it('allows removing items from cart', async () => {
    renderWithProviders(<Cart initialItems={[{
      product: {
        _id: '1',
        name: 'Test Product',
        price: 10.99
      },
      quantity: 1
    }]} />);

    const removeButton = screen.getByText(/remove/i);
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
    });
  });
});