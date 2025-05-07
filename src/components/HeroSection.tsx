
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="relative bg-grocery-light py-12 md:py-16 px-4 sm:px-6 lg:px-8 rounded-lg overflow-hidden mb-10">
      {/* Decorative elements */}
      <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/4">
        <svg width="300" height="300" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="text-grocery-primary opacity-10">
          <path fill="currentColor" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.3,-1.0C86.5,14.4,80.5,28.7,72.5,42.3C64.4,55.9,54.4,68.8,41.6,77.6C28.7,86.4,14.4,91.2,-0.9,92.8C-16.2,94.4,-32.4,92.9,-47.8,86.5C-63.3,80.1,-78,68.8,-85.2,54.1C-92.4,39.3,-92,21.2,-88.4,5.2C-84.8,-10.8,-77.9,-21.6,-70.3,-32.4C-62.7,-43.2,-54.4,-54,-43.5,-62.3C-32.6,-70.6,-19.1,-76.3,-3.2,-71.7C12.7,-67.1,30.5,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
        </svg>
      </div>
      
      <div className="relative max-w-3xl mx-auto text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
          Fresh Groceries, <span className="text-grocery-primary">Delivered Fast</span>
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Shop from thousands of items and get your groceries delivered to your doorstep in as little as 2 hours.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button className="bg-grocery-primary hover:bg-grocery-dark text-white px-6 py-6 text-lg">
            Shop Now
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
          <Button variant="outline" className="border-grocery-primary text-grocery-primary hover:bg-grocery-light px-6 py-6 text-lg">
            View Deals
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
