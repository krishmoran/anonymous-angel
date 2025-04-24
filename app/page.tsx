import { HeroSection } from '@/components/hero-section';
import { Features } from '@/components/features';
import { HowItWorks } from '@/components/how-it-works';
import { OrderTracker } from '@/components/order-tracker';
import { SimpleFooter } from '@/components/simple-footer';
import { ProductPreloader } from '@/components/product-preloader';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-rose-50">
      <ProductPreloader />
      <HeroSection />
      <Features />
      <HowItWorks />
      <section id="track-order" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Track Your Order</h2>
          <OrderTracker />
        </div>
      </section>
      <SimpleFooter />
    </main>
  );
}