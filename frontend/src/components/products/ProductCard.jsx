// src/components/products/ProductCard.jsx
import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { ShoppingCartIcon, EyeIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import QuickView from './QuickView';

const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const handleAddToCart = () => {
    addItem(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]">
        <div className="relative">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
          <button
            onClick={() => setQuickViewOpen(true)}
            className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
          >
            <EyeIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
          <p className="text-gray-600 mb-4 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold">
              ${product.price.toFixed(2)}
            </span>
            <button
              onClick={handleAddToCart}
              disabled={isAdded}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                isAdded
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isAdded ? (
                <>
                  <CheckIcon className="h-5 w-5" />
                  Added
                </>
              ) : (
                <>
                  <ShoppingCartIcon className="h-5 w-5" />
                  Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <QuickView
        product={product}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
};

export default ProductCard;