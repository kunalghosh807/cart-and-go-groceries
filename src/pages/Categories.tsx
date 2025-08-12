import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CategoryCard from '@/components/CategoryCard';
import { useCategories } from '@/hooks/useCategories';

const Categories = () => {
  const { subcategories, loading } = useCategories();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">All Categories</h1>
          <p className="text-muted-foreground">Browse our wide selection of grocery categories</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            <div className="text-muted-foreground">Loading categories...</div>
          ) : (
            subcategories.map((subcategory) => (
              <CategoryCard
                key={subcategory.id}
                id={subcategory.name.toLowerCase().replace(/\s+/g, '-')}
                name={subcategory.name}
                image={subcategory.image || "https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=500&auto=format&fit=crop"}
                productCount={0}
              />
            ))
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Categories;