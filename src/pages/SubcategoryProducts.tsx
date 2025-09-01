import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';
import { useSubcategories } from '@/hooks/useSubcategories';

const SubcategoryProducts = () => {
  const { categoryId, subcategoryId } = useParams();
  const navigate = useNavigate();
  const { getProductsBySubcategory } = useProducts();
  const { subcategories, loading: subcategoriesLoading } = useSubcategories();
  const [subcategoryName, setSubcategoryName] = useState<string>('');
  const [categoryName, setCategoryName] = useState<string>('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubcategoryAndProducts = async () => {
      if (!subcategoryId) {
        setLoading(false);
        return;
      }

      // Wait for subcategories to load before proceeding
      if (subcategoriesLoading) {
        console.log('⏳ Waiting for subcategories to load...');
        return;
      }

      setLoading(true);
      
      // Find the subcategory by ID in our subcategories list
      console.log('🔍 Looking for subcategory with ID:', subcategoryId);
      console.log('🔍 Available subcategories:', subcategories.map(s => ({ id: s.id, name: s.name })));
      const subcategory = subcategories.find(sub => sub.id === subcategoryId);
      
      if (subcategory) {
        console.log('✅ Found subcategory:', subcategory.name, 'ID:', subcategory.id);
        setSubcategoryName(subcategory.name);
        setCategoryName(subcategory.categories?.name || '');
        
        // Use the new getProductsBySubcategory function with subcategory_id
        const subcategoryProducts = await getProductsBySubcategory(subcategory.id);
        console.log('📦 Loaded products for subcategory:', subcategoryProducts.length);
        console.log('📦 Products data:', subcategoryProducts);
        setProducts(subcategoryProducts);
      } else {
        console.log('❌ Subcategory not found by ID, trying fallback method');
        // Fallback: try to find subcategory by converting slug to name
        const convertedName = subcategoryId.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        
        console.log('🔄 Trying to find subcategory by name:', convertedName);
        const foundSubcategory = subcategories.find(sub => 
          sub.name.toLowerCase() === convertedName.toLowerCase()
        );
        
        if (foundSubcategory) {
          console.log('✅ Found subcategory by name:', foundSubcategory.name, 'ID:', foundSubcategory.id);
          setSubcategoryName(foundSubcategory.name);
          setCategoryName(foundSubcategory.categories?.name || '');
          const subcategoryProducts = await getProductsBySubcategory(foundSubcategory.id);
          console.log('📦 Loaded products for subcategory:', subcategoryProducts.length);
          setProducts(subcategoryProducts);
        } else {
          console.log('❌ Subcategory not found by name either');
          setSubcategoryName(convertedName);
          setProducts([]);
        }
      }
      
      setLoading(false);
    };

    loadSubcategoryAndProducts();
  }, [subcategoryId, subcategories, subcategoriesLoading, getProductsBySubcategory]);
  
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