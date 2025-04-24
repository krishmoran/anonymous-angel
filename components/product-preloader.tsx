"use client";

import { useEffect } from 'react';

/**
 * This component pre-loads products in the background
 */
export function ProductPreloader() {
  useEffect(() => {
    // Preload products by making a background request
    const preloadProducts = async () => {
      try {
        await fetch('/api/products');
      } catch (err) {
        // Silently fail
      }
    };
    
    preloadProducts();
  }, []);

  // This component doesn't render anything
  return null;
} 