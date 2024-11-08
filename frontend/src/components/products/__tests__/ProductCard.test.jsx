import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../tests/utils/renderWithProviders';
import ProductCard from '../ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    name: 'Test Product',
    description: 'Test Description',
    price: 9.99,
    imageUrl: '/test.jpg'
  };

  it('renders product information correctly', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
    expect(screen.getByText(mockProduct.description)).toBeInTheDocument();
    expect(screen.getByText('$9.99')).toBeInTheDocument();
  });
});