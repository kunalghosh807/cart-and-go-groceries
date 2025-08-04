
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
            Welcome to <span className="text-yellow-300">Cart & Go</span>
          </h1>
          <p className="text-lg text-gray-200 mb-6 max-w-2xl mx-auto">
            Your trusted grocery partner - Fresh products, fast delivery, unbeatable convenience
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
