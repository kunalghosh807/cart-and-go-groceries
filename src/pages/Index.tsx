
import React from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import ProductCard from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { featuredProducts, dealProducts, categories } from '@/data/mockData';
import { useCart } from '@/hooks/useCart';

const Index = () => {
  const { addToCart } = useCart();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
          {/* Hero Section */}
          <HeroSection />
          
          {/* Categories Section */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Categories</h2>
              <Button variant="link" className="text-grocery-primary">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <CategoryCard 
                  key={category.id}
                  id={category.id}
                  name={category.name} 
                  image={category.image} 
                  productCount={category.productCount} 
                />
              ))}
            </div>
          </section>
          
          {/* Featured Products */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Featured Products</h2>
              <Button variant="link" className="text-grocery-primary">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
              {featuredProducts.map((product) => (
                <div key={product.id} className="flex-none">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>
          
          {/* Deal Banner */}
          <section className="mb-12">
            <div className="bg-gradient-to-r from-grocery-primary to-grocery-secondary rounded-lg overflow-hidden">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 flex flex-col md:flex-row items-center justify-between">
                <div className="text-white mb-6 md:mb-0 text-center md:text-left">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">Experience Cart & Go</h2>
                  <p className="text-white/90 text-lg mb-4">Your one-stop solution for all grocery needs</p>
                </div>
                <div className="relative w-full md:w-1/2 h-48 md:h-64">
                  <img 
                    src="https://images.unsplash.com/photo-1506617564039-2f3b650b7010?q=80&w=500&auto=format&fit=crop" 
                    alt="Weekend deals" 
                    className="w-full h-full object-cover rounded-lg shadow-lg"
                  />
                  <div className="absolute top-0 right-0 bg-grocery-accent text-white font-bold py-2 px-4 rounded-bl-lg">
                    CART & GO
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Deal Products */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Today's Deals</h2>
              <Button variant="link" className="text-grocery-primary">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
              {dealProducts.map((product) => (
                <div key={product.id} className="flex-none">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>
          
          {/* Features Section */}
          <section className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center p-6 bg-grocery-light rounded-lg">
                <div className="w-16 h-16 flex items-center justify-center bg-grocery-primary/10 text-grocery-primary rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Fresh Quality</h3>
                <p className="text-gray-600">We source the freshest produce and ingredients for your family.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-grocery-light rounded-lg">
                <div className="w-16 h-16 flex items-center justify-center bg-grocery-primary/10 text-grocery-primary rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
                <p className="text-gray-600">Order before noon for same-day delivery to your doorstep.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-grocery-light rounded-lg">
                <div className="w-16 h-16 flex items-center justify-center bg-grocery-primary/10 text-grocery-primary rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure Checkout</h3>
                <p className="text-gray-600">Your payment details are always protected with our secure checkout.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
