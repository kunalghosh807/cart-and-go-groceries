
import React, { useEffect, useState, useCallback } from 'react';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { supabase } from '@/integrations/supabase/client';
import banner1 from '@/assets/banner-1.jpg';
import banner2 from '@/assets/banner-2.jpg';
import banner3 from '@/assets/banner-3.jpg';
import banner4 from '@/assets/banner-4.jpg';

interface Banner {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  video_url: string | null;
  display_order: number;
  is_active: boolean;
}

// Fallback banners in case database is not available
const fallbackBanners = [
  {
    id: '1',
    image_url: banner1,
    title: "Fresh Fruits & Vegetables",
    description: "Farm-fresh produce delivered to your door",
    display_order: 1,
    is_active: true
  },
  {
    id: '2',
    image_url: banner2,
    title: "Artisan Bakery",
    description: "Freshly baked breads and pastries daily",
    display_order: 2,
    is_active: true
  },
  {
    id: '3',
    image_url: banner3,
    title: "Premium Dairy & Meat",
    description: "Quality proteins and dairy products",
    display_order: 3,
    is_active: true
  },
  {
    id: '4',
    image_url: banner4,
    title: "Organic & Healthy",
    description: "Natural products for a healthier lifestyle",
    display_order: 4,
    is_active: true
  }
];

const HeroSection = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // Load banners from database
  const loadBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error loading banners:', error);
        // Show empty state if database fails
        setBanners([]);
      } else if (data && data.length > 0) {
        setBanners(data);
      } else {
        // Show empty state if no active banners
        setBanners([]);
      }
    } catch (error) {
      console.error('Error loading banners:', error);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const scrollTo = useCallback((index: number) => {
    api?.scrollTo(index);
  }, [api]);

  // Show loading state
  if (loading) {
    return (
      <div className="relative">
        <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
          <div className="text-gray-500">Loading banners...</div>
        </div>
      </div>
    );
  }

  // Show empty state when no banners
  if (banners.length === 0) {
    return (
      <div className="relative">
        <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
          <div className="text-center text-gray-600">
            <h2 className="text-xl md:text-2xl font-semibold mb-2">No Active Banners</h2>
            <p className="text-gray-500 text-sm md:text-base">Please add some banners to display here.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mb-4">
      <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden m-0 p-0">
        <Carousel 
          setApi={setApi}
          className="w-full h-full m-0 p-0"
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent className="h-full ml-0 m-0 p-0" data-carousel-content style={{ height: '100%' }}>
            {banners.map((banner, index) => (
              <CarouselItem key={index} className="h-full basis-full min-w-0 pl-0 m-0 p-0" data-carousel-item style={{ height: '100%' }}>
                <div className="relative h-full m-0 p-0 border-0" style={{ margin: 0, padding: 0, border: 0 }}>
                  {/* Background Media */}
                  {banner.video_url ? (
                    <video
                      className="absolute inset-0 w-full h-full m-0 p-0 border-0"
                      autoPlay
                      muted
                      loop
                      playsInline
                      style={{
                        margin: 0,
                        padding: 0,
                        border: 0,
                        verticalAlign: 'top',
                        display: 'block',
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    >
                      <source src={banner.video_url} type="video/mp4" />
                    </video>
                  ) : (
                    <div 
                      className="absolute inset-0 w-full h-full m-0 p-0 border-0"
                      style={{
                        backgroundImage: `url(${banner.image_url || ''})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        margin: 0,
                        padding: 0,
                        border: 0,
                        width: '100%',
                        height: '100%'
                      }}
                    />
                  )}
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                  
                  {/* Content */}
                  <div className="relative h-full flex items-center justify-start px-4 sm:px-6 lg:px-8">
                    <div className="max-w-2xl text-left text-white animate-slide-in-left">
                      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4 leading-tight animate-fade-in-up">
                        Welcome to <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent animate-pulse">Busskit</span>
                      </h1>
                      <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold mb-1 md:mb-2 text-primary-foreground animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        {banner.title}
                      </h2>
                      <p className="text-sm sm:text-base md:text-lg text-gray-200 mb-3 md:mb-6 max-w-xl animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                        {banner.description}
                      </p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
      
      {/* Progress Dots - Positioned directly below banner with minimal spacing */}
      <div className="flex justify-center mt-1">
        <div className="flex space-x-1 md:space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 hover:scale-110 ${
                index === current 
                  ? 'bg-primary scale-125 shadow-lg' 
                  : 'bg-gray-400 hover:bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
