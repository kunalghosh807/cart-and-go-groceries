import React from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { categories, categoryProducts } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';

const CategoryProducts = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  
  const category = categories.find(cat => cat.id === categoryId);
  const products = categoryProducts[categoryId as keyof typeof categoryProducts] || [];
  
  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Category not found</h1>
            <Button onClick={() => navigate(-1)} className="mt-4">
              Back to Categories
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">{category.name}</h1>
          <p className="text-muted-foreground">{category.productCount} products available</p>
        </div>
        
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-foreground mb-2">Coming Soon!</h2>
            <p className="text-muted-foreground">Products for this category will be available soon.</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default CategoryProducts;