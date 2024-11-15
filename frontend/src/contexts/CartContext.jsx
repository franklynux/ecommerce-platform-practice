import React, { createContext, useReducer, useCallback } from 'react';

export const CartContext = createContext(null);

// Initial state
const initialState = {
  items: []
};

// Action types
const ADD_ITEM = 'ADD_ITEM';
const REMOVE_ITEM = 'REMOVE_ITEM';
const INITIALIZE = 'INITIALIZE';

const cartReducer = (state, action) => {
  switch (action.type) {
    case ADD_ITEM: {
      const existingItemIndex = state.items.findIndex(
        item => item.product._id === action.payload.product._id
      );

      if (existingItemIndex > -1) {
        const newItems = [...state.items];
        newItems[existingItemIndex].quantity += action.payload.quantity;
        return { ...state, items: newItems };
      }

      return {
        ...state,
        items: [...state.items, action.payload]
      };
    }

    case REMOVE_ITEM:
      return {
        ...state,
        items: state.items.filter(item => item.product._id !== action.payload)
      };

    case INITIALIZE:
      return {
        ...state,
        items: action.payload
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children, initialItems = [] }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    ...initialState,
    items: initialItems
  });

  const addItem = useCallback((product, quantity = 1) => {
    dispatch({
      type: ADD_ITEM,
      payload: { product, quantity }
    });
  }, []);

  const removeItem = useCallback((productId) => {
    dispatch({
      type: REMOVE_ITEM,
      payload: productId
    });
  }, []);

  const getCartTotal = useCallback(() => {
    return state.items.reduce(
      (total, item) => total + (item.product.price * item.quantity),
      0
    );
  }, [state.items]);

  const value = {
    items: state.items,
    addItem,
    removeItem,
    getCartTotal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};