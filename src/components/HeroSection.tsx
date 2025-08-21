
import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { ChevronRight } from 'lucide-react';
import banner1 from '@/assets/banner-1.jpg';
import banner2 from '@/assets/banner-2.jpg';
import banner3 from '@/assets/banner-3.jpg';
import banner4 from '@/assets/banner-4.jpg';
import Autoplay from 'embla-carousel-autoplay';

const banners = [
  {
    image: banner1,
    title: "Fresh Fruits & Vegetables",
    subtitle: "Farm-fresh produce delivered to your door"
  },
  {
    image: banner2,
    title: "Artisan Bakery",
    subtitle: "Freshly baked breads and pastries daily"
  },
  {
    image: banner3,
    title: "Premium Dairy & Meat",
    subtitle: "Quality proteins and dairy products"
  },
  {
    image: banner4,
    title: "Organic & Healthy",
    subtitle: "Natural products for a healthier lifestyle"
  }
];

const HeroSection = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const autoplayPlugin = useCallback(() => 
    Autoplay({ 
      delay: 4000,
      stopOnInteraction: false,
      rootNode: (emblaRoot) => emblaRoot.parentElement,
    }), []
  );

  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const scrollTo = useCallback((index: number) => {
    api?.scrollTo(index);
  }, [api]);

  return (
    <div className="relative h-80 rounded-lg overflow-hidden mb-8">
      <Carousel 
        setApi={setApi}
        className="w-full h-full"
        plugins={[autoplayPlugin()]}
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent className="h-full">
          {banners.map((banner, index) => (
            <CarouselItem key={index} className="h-full">
              <div className="relative h-full">
                {/* Background Image with Ken Burns Effect */}
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-[ken-burns_20s_ease-in-out_infinite]"
                  style={{
                    backgroundImage: `url(${banner.image})`,
                    transform: 'scale(1.1)',
                  }}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                
                {/* Content with Slide Animation */}
                <div className="relative h-full flex items-center justify-start px-4 sm:px-6 lg:px-8">
                  <div className="max-w-2xl text-left text-white animate-slide-in-left">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight animate-fade-in-up">
                      Welcome to <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent animate-pulse">Shopzo</span>
                    </h1>
                    <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-primary-foreground animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                      {banner.title}
                    </h2>
                    <p className="text-lg text-gray-200 mb-6 max-w-xl animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                      {banner.subtitle}
                    </p>
                    <Button 
                      size="lg" 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in-up group"
                      style={{ animationDelay: '0.6s' }}
                    >
                      Shop Now
                      <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-110 ${
                index === current 
                  ? 'bg-primary scale-125 shadow-lg' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
};

export default HeroSection;
