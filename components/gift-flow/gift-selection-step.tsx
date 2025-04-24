"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useProducts } from '@/contexts/product-context';

interface GiftSelectionStepProps {
  onSelect: (product: Product) => void;
}

// Define our sample products type with max_price
interface SampleProduct extends Product {
  max_price: number;
}

export function GiftSelectionStep({ onSelect }: GiftSelectionStepProps) {
  const { products, isLoading, error, isFirstLoad, refetchProducts } = useProducts();
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const router = useRouter();

  // If this is the first load and there are no products yet, trigger a fetch
  useEffect(() => {
    if (isFirstLoad && products.length === 0) {
      refetchProducts();
    }
  }, [isFirstLoad, products.length, refetchProducts]);

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm"
          className="gap-1" 
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>
      
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Choose a Gift</h2>
          <p className="text-gray-500 mt-2">
            Select a thoughtful gift to send anonymously
          </p>
        </div>
        
        {error && !isLoading && (
          <div className="p-4 bg-red-50 text-red-600 rounded-md text-sm mb-4">
            {error} - Using sample products instead.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            // Loading skeletons
            Array(6).fill(0).map((_, index) => (
              <Card key={index} className="overflow-hidden h-full flex flex-col">
                <div className="relative pb-[56.25%] bg-gray-100">
                  <Skeleton className="absolute inset-0" />
                </div>
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="flex-grow">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
                <CardFooter className="pt-2">
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))
          ) : (
            products.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  className={cn(
                    "overflow-hidden cursor-pointer transition-all duration-300 h-full",
                    hoveredProduct === product.id ? "ring-2 ring-pink-500 shadow-lg" : "hover:shadow-md"
                  )}
                  onClick={() => onSelect(product)}
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <div className="relative w-full h-48 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle>{product.name}</CardTitle>
                    <CardDescription>${product.price.toFixed(2)}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-gray-600 text-sm">{product.description}</p>
                  </CardContent>
                  <CardFooter>
                    <p className="text-sm font-medium text-pink-600">Select this gift →</p>
                  </CardFooter>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Fallback sample products in case API fails
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