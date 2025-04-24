import Link from 'next/link';
import { Heart } from 'lucide-react';

export function SimpleFooter() {
  return (
    <footer className="bg-white py-8 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center">
          <div className="mb-4 text-center">
            <div className="flex items-center justify-center">
              <Heart className="w-5 h-5 text-pink-500 mr-2" />
              <span className="text-lg font-bold text-gray-900">Anonymous Angel</span>
            </div>
            <p className="text-gray-500 mt-2 text-sm">Spreading joy, one surprise gift at a time.</p>
          </div>
          
          <div className="flex space-x-6 mb-4">
            <Link href="/" className="text-gray-500 hover:text-pink-500 text-sm">Home</Link>
            <Link href="/gifts" className="text-gray-500 hover:text-pink-500 text-sm">Send a Gift</Link>
            <Link href="/orders" className="text-gray-500 hover:text-pink-500 text-sm">Track Orders</Link>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-gray-400 text-xs">
            © {new Date().getFullYear()} Anonymous Angel. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 