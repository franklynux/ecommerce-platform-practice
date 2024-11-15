import React, { createContext, useReducer, useCallback } from 'react';

export const CartContext = createContext(undefined);

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, {
          product: action.payload.product,
          quantity: action.payload.quantity
        }],
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.product._id !== action.payload),
      };
    default:
      return state;
  }
};

export const CartProvider = ({ children, initialItems = [] }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: initialItems
  });

  const addItem = useCallback((product, quantity = 1) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: { product, quantity }
    });
  }, []);

  const removeItem = useCallback((productId) => {
    dispatch({
      type: 'REMOVE_ITEM',
      payload: productId
    });
  }, []);

  const getCartTotal = useCallback(() => {
    return state.items.reduce(
      (total, item) => total + (item.product.price * item.quantity),
      0
    );
  }, [state.items]);

  return (
    <CartContext.Provider value={{
      items: state.items,
      addItem,
      removeItem,
      getCartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};