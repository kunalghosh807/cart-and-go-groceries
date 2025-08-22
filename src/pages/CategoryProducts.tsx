import React from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

const CategoryProducts = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { products: allProducts, loading } = useProducts();
  const [categoryName, setCategoryName] = useState<string>('');
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const loadCategoryAndProducts = async () => {
      if (!categoryId) return;

      // Convert categoryId slug to category name first
      const convertedName = categoryId.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      
      // Handle special cases for category name conversion
      let categoryNameToQuery = convertedName;
      if (categoryId === 'vegetables-fruits') {
        categoryNameToQuery = 'Vegetables & Fruits';
      }
      
      // Try to find the category in the database by name
      const { data: dbCategories } = await supabase
        .from('categories')
        .select('*')
        .eq('name', categoryNameToQuery);

      if (dbCategories && dbCategories.length > 0) {
        // Found in database - use the actual category name
        const category = dbCategories[0];
        setCategoryName(category.name);
        // Filter products by this exact category name
        const categoryProducts = allProducts.filter(p => 
          p.category.toLowerCase() === category.name.toLowerCase()
        );
        setProducts(categoryProducts);
      } else {
        // Fallback to mock data conversion for existing routes
        setCategoryName(convertedName);
        
        // Try multiple variations to match products
        const possibleNames = [
          convertedName,
          convertedName.replace('&', 'and'),
          convertedName.split(' ')[0], // First word only
          convertedName.split(' ').slice(0, 2).join(' ') // First two words
        ];
        
        // First try to match by category
        let categoryProducts = allProducts.filter(p => 
          possibleNames.some(name => 
            p.category.toLowerCase().includes(name.toLowerCase()) ||
            name.toLowerCase().includes(p.category.toLowerCase())
          )
        );
        
        // If no products found by category, try to match by subcategory
        if (categoryProducts.length === 0) {
          categoryProducts = allProducts.filter(p => 
            p.subcategory && // Only include products that actually have a subcategory
            possibleNames.some(name => 
              p.subcategory?.toLowerCase().includes(name.toLowerCase()) ||
              name.toLowerCase().includes(p.subcategory?.toLowerCase() || '')
            )
          );
        }
        
        setProducts(categoryProducts);
      }
    };

    loadCategoryAndProducts();
  }, [categoryId, allProducts]);
  
  if (!categoryId) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Category not found</h1>
            <Button onClick={() => navigate(-1)} className="mt-4">
              Back to Home
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
          <h1 className="text-3xl font-bold text-foreground mb-4">{categoryName}</h1>
          <p className="text-muted-foreground">{products.length} products available</p>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Loading products...</p>
          </div>
        ) : products.length > 0 ? (
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