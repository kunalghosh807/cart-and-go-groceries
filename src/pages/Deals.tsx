import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { dealProducts } from '@/data/mockData';

const Deals = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Special Deals</h1>
          <p className="text-muted-foreground">Great savings on your favorite products</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {dealProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
        
        {dealProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No deals available at the moment.</p>
            <p className="text-muted-foreground">Check back soon for exciting offers!</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Deals;