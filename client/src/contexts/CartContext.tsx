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
  invoiceStatus: string; // Add invoice status field
}

interface CartState {
  items: CartItem[];
  totalAmount: number;
  securityDeposit: number;
  grandTotal: number;
}

interface CartContextType extends CartState {
  addRentalItem: (item: Omit<CartItem, 'id'>) => void;
  removeRentalItem: (id: string) => void;
  updateRentalItem: (id: string, updates: Partial<CartItem>) => void;
  updateRentalItemQuantity: (id: string, quantity: number) => void;
  updateRentalItemDates: (id: string, startDate: Date, endDate: Date) => void;
  updateRentalItemRentalType: (id: string, rentalType: CartItem['rentalType']) => void;
  clearRentalCart: () => void;
  calculateRentalTotals: () => void;
  // Backward compatibility methods
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
  console.log('CartContext: Reducer called with action:', action.type, 'payload:', 'payload' in action ? action.payload : 'none');
  
  switch (action.type) {
    case 'ADD_ITEM': {
      console.log('CartContext: Processing ADD_ITEM, current items:', state.items);
      const existingItemIndex = state.items.findIndex(
        item => item.productId === action.payload.productId && 
                item.rentalType === action.payload.rentalType &&
                item.startDate.getTime() === action.payload.startDate.getTime() &&
                item.endDate.getTime() === action.payload.endDate.getTime()
      );

      let newItems;
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        console.log('CartContext: Updating existing item at index:', existingItemIndex);
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        // Add new item
        console.log('CartContext: Adding new item to cart');
        newItems = [...state.items, action.payload];
      }

      console.log('CartContext: New items array:', newItems);
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
    console.log('CartContext: Loading cart from localStorage...');
    const savedCart = localStorage.getItem('rentalManagementCart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        console.log('CartContext: Found saved cart:', parsedCart);
        // Convert date strings back to Date objects
        const itemsWithDates = parsedCart.items.map((item: any) => ({
          ...item,
          startDate: new Date(item.startDate),
          endDate: new Date(item.endDate),
        }));
        
        console.log('CartContext: Items with dates:', itemsWithDates);
        // Set the items directly
        itemsWithDates.forEach((item: CartItem) => {
          dispatch({ type: 'ADD_ITEM', payload: item });
        });
        console.log('CartContext: Cart items loaded successfully');
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error);
        localStorage.removeItem('rentalManagementCart');
      }
    } else {
      console.log('CartContext: No saved cart found in localStorage');
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    console.log('CartContext: Saving cart to localStorage, items count:', state.items.length);
    if (state.items.length > 0) {
      localStorage.setItem('rentalManagementCart', JSON.stringify(state));
      console.log('CartContext: Cart saved to localStorage');
    } else {
      localStorage.removeItem('rentalManagementCart');
      console.log('CartContext: Cart removed from localStorage');
    }
  }, [state.items]);

  // Calculate totals whenever items change
  useEffect(() => {
    dispatch({ type: 'CALCULATE_TOTALS' });
  }, [state.items]);

  // Add rental item to cart
  const addRentalItem = (item: Omit<CartItem, 'id'>) => {
    console.log('CartContext: Adding rental item to cart:', item);
    const cartItem: CartItem = {
      ...item,
      id: `${item.productId}-${Date.now()}`,
      totalPrice: calculatePrice(item.unitPrice, item.rentalType, item.startDate, item.endDate),
      invoiceStatus: item.invoiceStatus || 'NOTHING_TO_INVOICE', // Set default invoice status
    };
    console.log('CartContext: Created cart item:', cartItem);
    dispatch({ type: 'ADD_ITEM', payload: cartItem });
    console.log('CartContext: Dispatched ADD_ITEM action');
  };

  // Remove rental item from cart
  const removeRentalItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  // Update rental item in cart
  const updateRentalItem = (id: string, updates: Partial<CartItem>) => {
    dispatch({ type: 'UPDATE_ITEM', payload: { id, updates } });
  };

  // Update rental item quantity
  const updateRentalItemQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeRentalItem(id);
    } else {
      dispatch({ type: 'UPDATE_ITEM_QUANTITY', payload: { id, quantity } });
    }
  };

  // Update rental item dates
  const updateRentalItemDates = (id: string, startDate: Date, endDate: Date) => {
    dispatch({ type: 'UPDATE_ITEM_DATES', payload: { id, startDate, endDate } });
  };

  // Update rental item rental type
  const updateRentalItemRentalType = (id: string, rentalType: CartItem['rentalType']) => {
    dispatch({ type: 'UPDATE_ITEM_RENTAL_TYPE', payload: { id, rentalType } });
  };

  // Clear rental cart
  const clearRentalCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  // Calculate rental totals
  const calculateRentalTotals = () => {
    dispatch({ type: 'CALCULATE_TOTALS' });
  };

  const value: CartContextType = {
    ...state,
    addRentalItem: addRentalItem,
    removeRentalItem: removeRentalItem,
    updateRentalItem: updateRentalItem,
    updateRentalItemQuantity: updateRentalItemQuantity,
    updateRentalItemDates: updateRentalItemDates,
    updateRentalItemRentalType: updateRentalItemRentalType,
    clearRentalCart: clearRentalCart,
    calculateRentalTotals: calculateRentalTotals,
    // Keep backward compatibility
    addItem: addRentalItem,
    removeItem: removeRentalItem,
    updateItem: updateRentalItem,
    updateItemQuantity: updateRentalItemQuantity,
    updateItemDates: updateRentalItemDates,
    updateItemRentalType: updateRentalItemRentalType,
    clearCart: clearRentalCart,
    calculateTotals: calculateRentalTotals,
  };

  console.log('CartContext: Provider value:', value);
  console.log('CartContext: Current state:', state);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Hook to use cart context
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  console.log('useCart hook called, context:', context);
  if (context === undefined) {
    console.error('useCart must be used within a CartProvider');
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 