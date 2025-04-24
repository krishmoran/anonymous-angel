"use client";

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Gift, Heart, Sparkles, PackageSearch } from 'lucide-react';

export function HeroSection() {
  const router = useRouter();

  const scrollToHowItWorks = () => {
    const element = document.getElementById('how-it-works');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTrackOrder = () => {
    const element = document.getElementById('track-order');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Top-right button */}
      <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-20">
        <Button 
          variant="outline" 
          className="gap-2 bg-white bg-opacity-90 backdrop-blur-sm shadow-sm"
          onClick={scrollToTrackOrder}
        >
          <PackageSearch className="w-4 h-4" />
          Track Order
        </Button>
      </div>

      {/* Background elements */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-32 -right-24 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-24 left-32 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="container px-4 mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-pink-100 text-pink-800 mb-5">
            <Sparkles className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Surprise someone special</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
            Send Anonymous Gifts with <span className="text-pink-600">Heart</span> ❤️
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Make someone's day with a surprise gift they'll love — all while staying completely anonymous. It takes just 60 seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg gap-2"
              onClick={() => router.push('/gifts')}
            >
              <Gift className="w-5 h-5" />
              Start Gifting
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-pink-200 text-gray-700 hover:bg-pink-50 gap-2"
              onClick={scrollToHowItWorks}
            >
              <Heart className="w-5 h-5" />
              How It Works
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}