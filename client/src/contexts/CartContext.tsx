import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

// Types
export interface CartItem {
  id: string;
  productId: string;
  name: string;
  sku: string;
  image?: string;
  quantity: number;
  rentalType: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  unitPrice: number;
  totalPrice: number;
  startDate: Date;
  endDate: Date;
  minimumDays: number;
  maximumDays?: number;
}

interface CartState {
  items: CartItem[];
  totalAmount: number;
  securityDeposit: number;
  grandTotal: number;
}

interface CartContextType extends CartState {
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<CartItem>) => void;
  updateItemQuantity: (id: string, quantity: number) => void;
  updateItemDates: (id: string, startDate: Date, endDate: Date) => void;
  updateItemRentalType: (id: string, rentalType: CartItem['rentalType']) => void;
  clearCart: () => void;
  calculateTotals: () => void;
}

// Action types
type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_ITEM'; payload: { id: string; updates: Partial<CartItem> } }
  | { type: 'UPDATE_ITEM_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'UPDATE_ITEM_DATES'; payload: { id: string; startDate: Date; endDate: Date } }
  | { type: 'UPDATE_ITEM_RENTAL_TYPE'; payload: { id: string; rentalType: CartItem['rentalType'] } }
  | { type: 'CLEAR_CART' }
  | { type: 'CALCULATE_TOTALS' };

// Initial state
const initialState: CartState = {
  items: [],
  totalAmount: 0,
  securityDeposit: 0,
  grandTotal: 0,
};

// Helper function to calculate rental duration in days
const calculateRentalDays = (startDate: Date, endDate: Date): number => {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Helper function to calculate price based on rental type and duration
const calculatePrice = (
  basePrice: number,
  rentalType: CartItem['rentalType'],
  startDate: Date,
  endDate: Date
): number => {
  const days = calculateRentalDays(startDate, endDate);
  
  switch (rentalType) {
    case 'HOURLY':
      return basePrice * days * 24;
    case 'DAILY':
      return basePrice * days;
    case 'WEEKLY':
      return basePrice * Math.ceil(days / 7);
    case 'MONTHLY':
      return basePrice * Math.ceil(days / 30);
    case 'YEARLY':
      return basePrice * Math.ceil(days / 365);
    default:
      return basePrice * days;
  }
};

// Reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => item.productId === action.payload.productId && 
                item.rentalType === action.payload.rentalType &&
                item.startDate.getTime() === action.payload.startDate.getTime() &&
                item.endDate.getTime() === action.payload.endDate.getTime()
      );

      let newItems;
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        // Add new item
        newItems = [...state.items, action.payload];
      }

      return {
        ...state,
        items: newItems,
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        items: newItems,
      };
    }

    case 'UPDATE_ITEM': {
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, ...action.payload.updates }
          : item
      );
      return {
        ...state,
        items: newItems,
      };
    }

    case 'UPDATE_ITEM_QUANTITY': {
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return {
        ...state,
        items: newItems,
      };
    }

    case 'UPDATE_ITEM_DATES': {
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { 
              ...item, 
              startDate: action.payload.startDate, 
              endDate: action.payload.endDate,
              totalPrice: calculatePrice(item.unitPrice, item.rentalType, action.payload.startDate, action.payload.endDate)
            }
          : item
      );
      return {
        ...state,
        items: newItems,
      };
    }

    case 'UPDATE_ITEM_RENTAL_TYPE': {
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { 
              ...item, 
              rentalType: action.payload.rentalType,
              totalPrice: calculatePrice(item.unitPrice, action.payload.rentalType, item.startDate, item.endDate)
            }
          : item
      );
      return {
        ...state,
        items: newItems,
      };
    }

    case 'CLEAR_CART': {
      return {
        ...state,
        items: [],
        totalAmount: 0,
        securityDeposit: 0,
        grandTotal: 0,
      };
    }

    case 'CALCULATE_TOTALS': {
      const totalAmount = state.items.reduce((sum, item) => sum + item.totalPrice, 0);
      const securityDeposit = totalAmount * 0.2; // 20% security deposit
      const grandTotal = totalAmount + securityDeposit;

      return {
        ...state,
        totalAmount,
        securityDeposit,
        grandTotal,
      };
    }

    default:
      return state;
  }
};

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('rentalCart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Convert date strings back to Date objects
        const itemsWithDates = parsedCart.items.map((item: any) => ({
          ...item,
          startDate: new Date(item.startDate),
          endDate: new Date(item.endDate),
        }));
        
        dispatch({ type: 'UPDATE_ITEM', payload: { id: 'temp', updates: { startDate: new Date() } } });
        // Clear the temporary update and set the actual items
        dispatch({ type: 'CLEAR_CART' });
        itemsWithDates.forEach((item: CartItem) => {
          dispatch({ type: 'ADD_ITEM', payload: item });
        });
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error);
        localStorage.removeItem('rentalCart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (state.items.length > 0) {
      localStorage.setItem('rentalCart', JSON.stringify(state));
    } else {
      localStorage.removeItem('rentalCart');
    }
  }, [state.items]);

  // Calculate totals whenever items change
  useEffect(() => {
    dispatch({ type: 'CALCULATE_TOTALS' });
  }, [state.items]);

  // Add item to cart
  const addItem = (item: Omit<CartItem, 'id'>) => {
    const cartItem: CartItem = {
      ...item,
      id: `${item.productId}-${Date.now()}`,
      totalPrice: calculatePrice(item.unitPrice, item.rentalType, item.startDate, item.endDate),
    };
    dispatch({ type: 'ADD_ITEM', payload: cartItem });
  };

  // Remove item from cart
  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  // Update item in cart
  const updateItem = (id: string, updates: Partial<CartItem>) => {
    dispatch({ type: 'UPDATE_ITEM', payload: { id, updates } });
  };

  // Update item quantity
  const updateItemQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
    } else {
      dispatch({ type: 'UPDATE_ITEM_QUANTITY', payload: { id, quantity } });
    }
  };

  // Update item dates
  const updateItemDates = (id: string, startDate: Date, endDate: Date) => {
    dispatch({ type: 'UPDATE_ITEM_DATES', payload: { id, startDate, endDate } });
  };

  // Update item rental type
  const updateItemRentalType = (id: string, rentalType: CartItem['rentalType']) => {
    dispatch({ type: 'UPDATE_ITEM_RENTAL_TYPE', payload: { id, rentalType } });
  };

  // Clear cart
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  // Calculate totals
  const calculateTotals = () => {
    dispatch({ type: 'CALCULATE_TOTALS' });
  };

  const value: CartContextType = {
    ...state,
    addItem,
    removeItem,
    updateItem,
    updateItemQuantity,
    updateItemDates,
    updateItemRentalType,
    clearCart,
    calculateTotals,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Hook to use cart context
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 