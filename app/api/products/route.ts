import { NextResponse } from 'next/server';

// Cache configuration - revalidate every 15 minutes (900 seconds)
export const revalidate = 14400;

// Define product interface for search results
interface SearchProduct {
  product_id: string;
  price: number; // Price in cents
  title?: string;
  image?: string;
  [key: string]: any;
}

// A helper function to convert price from cents to dollars
const convertPriceFromCents = (cents: number): number => {
  return cents / 100;
};

// Helper to extract a valid description
const extractDescription = (data: any): string => {
  // Try different possible description fields
  const possibleFields = ['product_description', 'description', 'details'];
  
  for (const field of possibleFields) {
    if (data[field] && typeof data[field] === 'string' && data[field].trim().length > 0) {
      // Use the first valid description field we find
      const description = data[field].trim();
      // Truncate and add ellipsis if too long
      return description.length > 120 ? description.slice(0, 120) + '...' : description;
    }
  }
  
  // Try using feature bullets if no description is found
  if (data.feature_bullets && Array.isArray(data.feature_bullets) && data.feature_bullets.length > 0) {
    const bullets = data.feature_bullets.slice(0, 2).join('. ');
    return bullets.length > 120 ? bullets.slice(0, 120) + '...' : bullets;
  }
  
  // Fall back to title if it exists
  if (data.title) {
    return `${data.title} - quality product from ${data.brand || 'a trusted brand'}`;
  }
  
  // Last resort
  return "Quality product with great features.";
};

export async function GET() {
  try {
    // Get API key from environment variables
    const apiKey = process.env.ZINC_API_KEY;
    if (!apiKey) {
      console.error('ZINC_API_KEY is not set');
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Headers for Zinc API requests
    const headers = {
      'Authorization': `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`,
      'Content-Type': 'application/json'
    };

    // List of search terms and retailers to fetch various gift products
    const searchQueries = [
      { query: 'desk organizer cute', retailer: 'amazon' },
      { query: 'self care gift set', retailer: 'amazon' },
      { query: 'coffee mug unique', retailer: 'amazon' },
      { query: 'small plant pot', retailer: 'amazon' },
      { query: 'book stand wooden', retailer: 'amazon' },
      { query: 'scented candles gift', retailer: 'amazon' }
    ];

    // Array to store all fetched products
    let allProducts = [];
    
    // Perform product searches with each query
    for (const { query, retailer } of searchQueries) {
      const searchUrl = `https://api.zinc.io/v1/search?query=${encodeURIComponent(query)}&retailer=${retailer}&page=1`;
      
      console.log(`Searching for products with query: ${query}`);
      const searchResponse = await fetch(searchUrl, { headers });
      
      if (!searchResponse.ok) {
        console.error(`Error searching for ${query}:`, searchResponse.statusText);
        continue;
      }
      
      const searchData = await searchResponse.json();

      // Log a sample of the search results for debugging
      if (searchData.results && searchData.results.length > 0) {
        console.log(`Sample product data for query "${query}":`, {
          product_id: searchData.results[0].product_id,
          price: searchData.results[0].price
        });
      }
      
      // Filter products with price under $20 and pick the first one
      const affordableProducts = searchData.results
        .filter((product: SearchProduct) => {
          // Price is in cents, so 2000 = $20.00
          if (typeof product.price !== 'number') return false;
          return product.price > 0 && product.price < 2000;
        })
        .slice(0, 1);
      
      if (affordableProducts.length === 0) {
        console.log(`No affordable products found for query: ${query}`);
        continue;
      }
      
      // Get detailed product information for each affordable product
      for (const product of affordableProducts) {
        const productId = product.product_id;
        const detailsUrl = `https://api.zinc.io/v1/products/${productId}?retailer=${retailer}`;
        
        console.log(`Fetching details for product: ${productId}`);
        const detailsResponse = await fetch(detailsUrl, { headers });
        
        if (!detailsResponse.ok) {
          console.error(`Error fetching details for ${productId}:`, detailsResponse.statusText);
          continue;
        }
        
        const detailsData = await detailsResponse.json();
        
        // Log the fields that might contain description data
        console.log(`Product ${productId} description fields:`, {
          has_product_description: !!detailsData.product_description,
          has_description: !!detailsData.description,
          has_feature_bullets: !!detailsData.feature_bullets,
          has_product_details: !!detailsData.product_details
        });
        
        // Skip products with no price
        if (typeof detailsData.price !== 'number') {
          console.log(`No valid price found for product ${productId}, skipping`);
          continue;
        }
        
        // Convert price from cents to dollars
        const priceDollars = convertPriceFromCents(detailsData.price);
        
        // Extract a proper description
        const description = extractDescription(detailsData);

        // Calculate max price buffer based on price tiers
        const calculateMaxPrice = (basePrice: number): number => {
          if (basePrice <= 10) {
            // For items under $10, add 100% buffer and $7
            return basePrice * 2.0 + 7;
          } else if (basePrice <= 15) {
            // For items $10-15, add 90% buffer
            return basePrice * 1.9;  
          } else {
            // For items $15-20, add 80% buffer
            return basePrice * 1.8;
          }
        };

        const maxPrice = calculateMaxPrice(priceDollars);
        
        // Add product to our collection with formatted data
        allProducts.push({
          id: detailsData.product_id,
          name: detailsData.title,
          image: detailsData.main_image || detailsData.images?.[0] || "https://via.placeholder.com/400x300?text=No+Image+Available",
          description: description,
          price: priceDollars,
          max_price: maxPrice,
          retailer: retailer
        });
        
        console.log(`Successfully added product ${productId} with price $${priceDollars}`);
      }
      
      // If we have 6 products already, stop searching
      if (allProducts.length >= 6) {
        allProducts = allProducts.slice(0, 6);
        break;
      }
    }
    
    // If we couldn't fetch any products, return an error
    if (allProducts.length === 0) {
      console.error('Failed to fetch any products from Zinc API');
      return NextResponse.json(
        { success: false, message: 'No products available' },
        { status: 500 }
      );
    }
    
    // Return the collected products
    return NextResponse.json({
      success: true,
      products: allProducts
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch products'
      },
      { status: 500 }
    );
  }
} 