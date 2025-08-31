
import React from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import ProductCard from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useSubcategories } from '@/hooks/useSubcategories';

// Component for displaying product card sections
const ProductCardSection = ({ section, getProductsByCategory }) => {
  const [categoryProducts, setCategoryProducts] = React.useState([]);
  const [categoryLoading, setCategoryLoading] = React.useState(true);
  
  React.useEffect(() => {
    const loadCategoryProducts = async () => {
      setCategoryLoading(true);
      const products = await getProductsByCategory(section.dbCategory.id);
      setCategoryProducts(products);
      setCategoryLoading(false);
    };
    loadCategoryProducts();
  }, [section.dbCategory.id, getProductsByCategory]);
  
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{section.name}</h2>
        <Button variant="link" className="text-grocery-primary">
          View All <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {categoryLoading ? (
          <div className="text-muted-foreground">Loading products...</div>
        ) : categoryProducts.length > 0 ? (
          categoryProducts.map((product) => (
            <div key={product.id} className="flex-none">
              <ProductCard product={product} />
            </div>
          ))
        ) : (
          <div className="text-muted-foreground">No products available</div>
        )}
      </div>
    </section>
  );
};

const Index = () => {
  const { loading, getProductsByCategory } = useProducts();
  const { categories: dbCategories, loading: categoriesLoading } = useCategories();
  const { subcategories, loading: subcategoriesLoading } = useSubcategories();

  // Get sorted database categories for ordering sections
  const sortedDbCategories = [...dbCategories].sort((a, b) => {
    if (a.order_number && b.order_number) {
      return a.order_number - b.order_number;
    }
    // Fallback to creation date or name
    if (a.created_at && b.created_at) {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    return a.name.localeCompare(b.name);
  });

  // Create section order based on database categories
  const getSectionOrder = () => {
    const sections = [];
    
    sortedDbCategories.forEach((category) => {
      // Handle each category based on its category_type
      if (category.category_type === 'productcard_category') {
        // Categories that display products directly
        sections.push({ type: 'productcard', name: category.name, dbCategory: category });
      } else if (category.category_type === 'subcategory_category') {
        // Categories that display subcategories
        sections.push({ type: 'category', name: category.name, dbCategory: category });
      } else {
        // Empty categories or fallback
        sections.push({ type: 'custom', name: category.name, dbCategory: category });
      }
    });
    
    return sections;
  };

  const sectionOrder = getSectionOrder();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
          {/* Hero Section */}
          <HeroSection />
          
          {/* Sections based on database category order */}
          {categoriesLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading categories...</p>
            </div>
          ) : (
            sectionOrder.map((section, index) => {
              if (section.type === 'category') {
                // Main category sections with subcategories from database
                const categorySubcategories = subcategories.filter(subcat => 
                  subcat.category_id === section.dbCategory.id
                );
                
                return (
                  <section key={`category-${section.dbCategory.id}`} className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold">{section.name}</h2>
                      <Button variant="link" className="text-grocery-primary">
                        View All <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {subcategoriesLoading ? (
                        <div className="col-span-4 text-center py-4 text-muted-foreground">
                          Loading subcategories...
                        </div>
                      ) : categorySubcategories.length > 0 ? (
                        categorySubcategories.slice(0, 8).map((subcat) => (
                          <CategoryCard 
                            key={subcat.id}
                            id={subcat.id}
                            name={subcat.name} 
                            image={subcat.image || '/placeholder.svg'} 
                            productCount={0} 
                          />
                        ))
                      ) : (
                        <div className="col-span-4 text-center py-4 text-muted-foreground">
                          No subcategories available for {section.name}
                        </div>
                      )}
                    </div>
                  </section>
                );
              }
              
              if (section.type === 'custom') {
                // Custom categories like "Kunal" - fetch and display subcategories
                const categorySubcategories = subcategories.filter(subcat => 
                  subcat.category_id === section.dbCategory.id
                );
                
                return (
                  <section key={`custom-${section.dbCategory.id}`} className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold">{section.name}</h2>
                      <Button variant="link" className="text-grocery-primary">
                        View All <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {subcategoriesLoading ? (
                        <div className="col-span-4 text-center py-4 text-muted-foreground">
                          Loading subcategories...
                        </div>
                      ) : categorySubcategories.length > 0 ? (
                        categorySubcategories.slice(0, 8).map((subcat) => (
                          <CategoryCard 
                            key={subcat.id}
                            id={subcat.id}
                            name={subcat.name} 
                            image={subcat.image || '/placeholder.svg'} 
                            productCount={0} 
                          />
                        ))
                      ) : (
                        <div className="col-span-4 text-center py-4 text-muted-foreground">
                          No subcategories available for {section.name}
                        </div>
                      )}
                    </div>
                  </section>
                );
              }
              

              
              if (section.type === 'productcard') {
                // Categories with direct products (like "Kunal")
                return (
                  <ProductCardSection 
                    key={`productcard-${section.dbCategory.id}`}
                    section={section}
                    getProductsByCategory={getProductsByCategory}
                  />
                );
              }
              
              return null;
            })
          )}
          

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
