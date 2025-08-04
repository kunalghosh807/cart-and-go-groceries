
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="relative h-80 rounded-lg overflow-hidden mb-8">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1500375592092-40eb2168fd21?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')`
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40" />
      
      <div className="relative h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Fresh Groceries, <span className="text-yellow-300">Delivered Fast</span>
          </h1>
          <p className="text-lg text-gray-200 mb-6 max-w-2xl mx-auto">
            Shop from thousands of items and get your groceries delivered to your doorstep in as little as 2 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-grocery-primary hover:bg-grocery-dark text-white px-6 py-3">
              Shop Now
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900 px-6 py-3">
              View Deals
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
