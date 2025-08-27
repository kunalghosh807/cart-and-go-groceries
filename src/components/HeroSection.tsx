
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
      <div className="relative h-80 rounded-lg overflow-hidden mb-8 bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading banners...</div>
      </div>
    );
  }

  // Show empty state when no banners
  if (banners.length === 0) {
    return (
      <div className="relative h-80 rounded-lg overflow-hidden mb-8 bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-center text-gray-600">
          <h2 className="text-2xl font-semibold mb-2">No Active Banners</h2>
          <p className="text-gray-500">Please add some banners to display here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-80 rounded-lg overflow-hidden mb-8">
      <Carousel 
        setApi={setApi}
        className="w-full h-full"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent className="h-full">
          {banners.map((banner, index) => (
            <CarouselItem key={index} className="h-full">
              <div className="relative h-full">
                {/* Background Media with Ken Burns Effect */}
                {banner.video_url ? (
                  <video
                    className="absolute inset-0 w-full h-full object-cover animate-[ken-burns_20s_ease-in-out_infinite]"
                    style={{ transform: 'scale(1.1)' }}
                    autoPlay
                    muted
                    loop
                    playsInline
                  >
                    <source src={banner.video_url} type="video/mp4" />
                  </video>
                ) : (
                  <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-[ken-burns_20s_ease-in-out_infinite]"
                    style={{
                      backgroundImage: `url(${banner.image_url})`,
                      transform: 'scale(1.1)',
                    }}
                  />
                )}
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                
                {/* Content with Slide Animation */}
                <div className="relative h-full flex items-center justify-start px-4 sm:px-6 lg:px-8">
                  <div className="max-w-2xl text-left text-white animate-slide-in-left">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight animate-fade-in-up">
                      Welcome to <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent animate-pulse">Busskit</span>
                    </h1>
                    <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-primary-foreground animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                      {banner.title}
                    </h2>
                    <p className="text-lg text-gray-200 mb-6 max-w-xl animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                      {banner.description}
                    </p>
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
