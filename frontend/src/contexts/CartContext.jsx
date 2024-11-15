import React, { createContext, useReducer, useContext } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      return { ...state, items: [...state.items, action.payload] };
    case 'REMOVE_FROM_CART':
      return { 
        ...state, 
        items: state.items.filter(item => item.id !== action.payload.id) 
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const addToCart = item => dispatch({ type: 'ADD_TO_CART', payload: item });
  const removeFromCart = item => dispatch({ type: 'REMOVE_FROM_CART', payload: item });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const value = {
    items: state.items,
    addToCart,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use the Cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
