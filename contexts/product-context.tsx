"use client";

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { Product } from '@/lib/types';

interface ProductContextType {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  refetchProducts: () => Promise<void>;
  isFirstLoad: boolean; // Track if this is the initial load
}

// Create a storage key for caching
const PRODUCT_CACHE_KEY = 'anonymous-angel-products';
const CACHE_EXPIRY_TIME = 1000 * 60 * 15; // 15 minutes in milliseconds

// Sample fallback products in case API fails
const sampleProducts: Product[] = [
  {
    id: "1",
    name: "Succulent Planter Set",
    description: "This cute succulent planter set includes 3 small ceramic pots with bamboo trays, perfect for desk or windowsill decoration.",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&h=600",
    price: 19.99,
    product_id: "B07BLLHX72",
    retailer: "amazon",
    max_price: 24.99
  },
  {
    id: "2",
    name: "Gourmet Tea Sampler",
    description: "A set of 6 premium loose leaf teas, including Earl Grey, Jasmine Green, Chamomile, and more in elegant tins.",
    image: "https://images.unsplash.com/photo-1564890369878-4be5a6074578?auto=format&fit=crop&w=800&h=600",
    price: 18.50,
    product_id: "B078964WZ9",
    retailer: "amazon",
    max_price: 23.50
  },
  {
    id: "3",
    name: "Scented Soy Candle Set",
    description: "Hand-poured soy wax candles in three calming scents: Lavender, Vanilla, and Sea Breeze. Made with natural essential oils.",
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&h=600",
    price: 16.95,
    product_id: "B07ZF9RGJB",
    retailer: "amazon",
    max_price: 21.95
  },
  {
    id: "4",
    name: "Desk Organizer Set",
    description: "Stylish desk organizer with pen holder, sticky note compartment, and phone stand. Made from sustainable bamboo.",
    image: "https://images.unsplash.com/photo-1583667355900-eb2e4b4a00c5?auto=format&fit=crop&w=800&h=600",
    price: 14.99,
    product_id: "B08DKR23XS",
    retailer: "amazon",
    max_price: 19.99
  },
  {
    id: "5",
    name: "Self-Care Journal",
    description: "A guided journal with prompts for gratitude, mindfulness, and self-reflection. Includes inspirational quotes and exercises.",
    image: "https://images.unsplash.com/photo-1531346680769-a1d79b57de5c?auto=format&fit=crop&w=800&h=600",
    price: 12.95,
    product_id: "B08JV76YZ4",
    retailer: "amazon",
    max_price: 17.95
  },
  {
    id: "6",
    name: "Herbal Bath Salts",
    description: "Relaxing bath salt collection with dried flowers and essential oils for a spa-like experience at home.",
    image: "https://images.unsplash.com/photo-1600428863532-73e525d37cdf?auto=format&fit=crop&w=800&h=600",
    price: 15.75,
    product_id: "B0756W6S4K",
    retailer: "amazon",
    max_price: 20.75
  }
];

interface CachedProducts {
  products: Product[];
  timestamp: number;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Try to load cached products from localStorage
  useEffect(() => {
    const loadCachedProducts = () => {
      if (typeof window === 'undefined') return;
      
      try {
        const cachedData = localStorage.getItem(PRODUCT_CACHE_KEY);
        
        if (cachedData) {
          const { products: cachedProducts, timestamp }: CachedProducts = JSON.parse(cachedData);
          
          // Check if cache is still valid (less than expiry time)
          if (Date.now() - timestamp < CACHE_EXPIRY_TIME && cachedProducts.length > 0) {
            console.log('Using cached products data');
            setProducts(cachedProducts);
            setIsLoading(false);
            setIsFirstLoad(false);
            return true;
          }
        }
      } catch (err) {
        console.error('Error loading cached products:', err);
      }
      
      return false;
    };
    
    // If we successfully loaded cached products, don't fetch again
    if (!loadCachedProducts()) {
      fetchProducts();
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    if (isLoading && !isFirstLoad) return; // Prevent multiple simultaneous fetches
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching products from API');
      const response = await fetch('/api/products');
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      
      if (!data.success || !data.products?.length) {
        throw new Error(data.message || 'No products available');
      }
      
      // Transform API products to match our Product type
      const formattedProducts: Product[] = data.products.map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        image: product.image,
        price: product.price,
        product_id: product.id,  // Using id as product_id for Zinc API
        retailer: product.retailer || 'amazon',
        max_price: product.max_price
      }));
      
      // Save products to state
      setProducts(formattedProducts);
      
      // Cache products in localStorage with timestamp
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          PRODUCT_CACHE_KEY,
          JSON.stringify({
            products: formattedProducts,
            timestamp: Date.now()
          })
        );
      }
      
    } catch (err) {
      console.error('Error fetching products:', err);
      
      // Set error message
      setError(err instanceof Error ? err.message : 'Failed to load products');
      
      // Fall back to sample products if API fails
      setProducts(sampleProducts);
    } finally {
      setIsLoading(false);
      setIsFirstLoad(false);
    }
  }, [isLoading, isFirstLoad]);

  return (
    <ProductContext.Provider 
      value={{ 
        products, 
        isLoading, 
        error, 
        refetchProducts: fetchProducts,
        isFirstLoad 
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
} 