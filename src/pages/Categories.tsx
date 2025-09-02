import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CategoryCard from '@/components/CategoryCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { categories as mockCategories } from '@/data/mockData';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';

const Categories = () => {
  const { getProductsByCategory } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back to Home - Mobile View */}
        <div className="flex items-center gap-4 mb-6 md:hidden">
          <Link to="/">
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 text-grocery-primary hover:bg-grocery-primary/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">All Categories</h1>
          <p className="text-muted-foreground">Browse our wide selection of grocery categories</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categoriesLoading ? (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">Loading categories...</p>
            </div>
          ) : categories.length > 0 ? (
            categories.map((category) => (
              <CategoryCard 
                key={category.id}
                id={category.id}
                name={category.name} 
                image="/placeholder.svg"
                productCount={0}
              />
            ))
          ) : (
            mockCategories.map((category) => (
              <CategoryCard 
                key={category.id}
                id={category.id}
                name={category.name} 
                image={category.image} 
                productCount={category.productCount} 
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