import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

// Types
export interface FavoriteProduct {
  id: string;
  productId: string;
  name: string;
  description: string;
  image: string;
  basePrice: number;
  category: string;
  availability: boolean;
  minimumRentalDays: number;
  maximumRentalDays: number;
  addedAt: Date;
}

interface FavoritesState {
  items: FavoriteProduct[];
}

interface FavoritesContextType extends FavoritesState {
  addToFavorites: (product: Omit<FavoriteProduct, 'id' | 'addedAt'>) => void;
  removeFromFavorites: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => void;
  getFavoritesCount: () => number;
}

// Action types
type FavoritesAction =
  | { type: 'ADD_TO_FAVORITES'; payload: FavoriteProduct }
  | { type: 'REMOVE_FROM_FAVORITES'; payload: string }
  | { type: 'CLEAR_FAVORITES' }
  | { type: 'LOAD_FAVORITES'; payload: FavoriteProduct[] };

// Initial state
const initialState: FavoritesState = {
  items: [],
};

// Reducer
const favoritesReducer = (state: FavoritesState, action: FavoritesAction): FavoritesState => {
  switch (action.type) {
    case 'ADD_TO_FAVORITES':
      // Check if product is already in favorites
      if (state.items.some(item => item.productId === action.payload.productId)) {
        return state; // Already in favorites
      }
      return {
        ...state,
        items: [...state.items, action.payload],
      };

    case 'REMOVE_FROM_FAVORITES':
      return {
        ...state,
        items: state.items.filter(item => item.productId !== action.payload),
      };

    case 'CLEAR_FAVORITES':
      return {
        ...state,
        items: [],
      };

    case 'LOAD_FAVORITES':
      return {
        ...state,
        items: action.payload,
      };

    default:
      return state;
  }
};

// Context
const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// Provider
export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(favoritesReducer, initialState);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      try {
        const parsedFavorites = JSON.parse(savedFavorites);
        // Convert string dates back to Date objects
        const favoritesWithDates = parsedFavorites.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt),
        }));
        dispatch({ type: 'LOAD_FAVORITES', payload: favoritesWithDates });
      } catch (error) {
        console.error('Error loading favorites from localStorage:', error);
      }
    }
  }, []);

  // Save favorites to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(state.items));
  }, [state.items]);

  const addToFavorites = (product: Omit<FavoriteProduct, 'id' | 'addedAt'>) => {
    const favoriteProduct: FavoriteProduct = {
      ...product,
      id: `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      addedAt: new Date(),
    };
    dispatch({ type: 'ADD_TO_FAVORITES', payload: favoriteProduct });
  };

  const removeFromFavorites = (productId: string) => {
    dispatch({ type: 'REMOVE_FROM_FAVORITES', payload: productId });
  };

  const isFavorite = (productId: string): boolean => {
    return state.items.some(item => item.productId === productId);
  };

  const clearFavorites = () => {
    dispatch({ type: 'CLEAR_FAVORITES' });
  };

  const getFavoritesCount = (): number => {
    return state.items.length;
  };

  const value: FavoritesContextType = {
    ...state,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    clearFavorites,
    getFavoritesCount,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

// Hook
export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
