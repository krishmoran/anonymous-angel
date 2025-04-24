import Link from 'next/link';
import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white py-12 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center">
              <Heart className="w-6 h-6 text-pink-500 mr-2" />
              <span className="text-xl font-bold text-gray-900">Anonymous Angel</span>
            </div>
            <p className="text-gray-500 mt-2">Spreading joy, one surprise gift at a time.</p>
          </div>
          
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8 text-center md:text-left">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-500 hover:text-pink-500">Home</Link></li>
                <li><Link href="/gifts" className="text-gray-500 hover:text-pink-500">Send a Gift</Link></li>
                <li><Link href="/orders" className="text-gray-500 hover:text-pink-500">Track Orders</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Support</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-500 hover:text-pink-500">FAQ</Link></li>
                <li><Link href="#" className="text-gray-500 hover:text-pink-500">Contact Us</Link></li>
                <li><Link href="#" className="text-gray-500 hover:text-pink-500">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-100 mt-8 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Anonymous Angel. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}