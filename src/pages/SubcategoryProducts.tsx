import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';

const SubcategoryProducts = () => {
  const { categoryId, subcategoryId } = useParams();
  const navigate = useNavigate();
  const { products: allProducts, loading } = useProducts();
  const [subcategoryName, setSubcategoryName] = useState<string>('');
  const [categoryName, setCategoryName] = useState<string>('');
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const loadSubcategoryAndProducts = async () => {
      if (!subcategoryId) return;

      // Try to find the subcategory in the database
      const { data: dbSubcategories } = await supabase
        .from('subcategories')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .eq('id', subcategoryId);

      if (dbSubcategories && dbSubcategories.length > 0) {
        const subcategory = dbSubcategories[0];
        setSubcategoryName(subcategory.name);
        setCategoryName(subcategory.categories?.name || '');
        
        // Filter products by this exact subcategory name
        const subcategoryProducts = allProducts.filter(p => 
          p.subcategory?.toLowerCase() === subcategory.name.toLowerCase()
        );
        setProducts(subcategoryProducts);
      } else {
        // Fallback to converted name
        const convertedName = subcategoryId.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        setSubcategoryName(convertedName);
        
        const subcategoryProducts = allProducts.filter(p => 
          p.subcategory?.toLowerCase() === convertedName.toLowerCase()
        );
        setProducts(subcategoryProducts);
      }
    };

    loadSubcategoryAndProducts();
  }, [subcategoryId, allProducts]);
  
  if (!subcategoryId) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Subcategory not found</h1>
            <Button onClick={() => navigate(-1)} className="mt-4">
              Back
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
          <div className="text-sm text-muted-foreground mb-2">
            {categoryName && `${categoryName} > `}
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">{subcategoryName}</h1>
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
            <p className="text-muted-foreground">Products for this subcategory will be available soon.</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default SubcategoryProducts;