"use client";

import { useEffect } from 'react';
import { useProducts } from '@/contexts/product-context';

/**
 * This component silently pre-loads products in the background
 * when the homepage is viewed, improving the UX when navigating to the gifts page
 */
export function ProductPreloader() {
  const { products, isLoading, refetchProducts } = useProducts();

  useEffect(() => {
    // If products are not already loaded, load them
    if (products.length === 0 && !isLoading) {
      refetchProducts();
    }
  }, [products.length, isLoading, refetchProducts]);

  // This component doesn't render anything
  return null;
} 