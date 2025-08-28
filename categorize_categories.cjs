const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Load environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function categorizeCategories() {
  try {
    console.log('Starting category categorization process...');
    
    // Get all categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');
    
    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      return;
    }
    
    console.log(`Found ${categories.length} categories to analyze`);
    
    // Get all products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, category, subcategory, is_featured, is_deal');
    
    if (productsError) {
      console.error('Error fetching products:', productsError);
      return;
    }
    
    // Get all subcategories
    const { data: subcategories, error: subcategoriesError } = await supabase
      .from('subcategories')
      .select('id, category_id');
    
    if (subcategoriesError) {
      console.error('Error fetching subcategories:', subcategoriesError);
      return;
    }
    
    console.log(`Found ${products.length} products and ${subcategories.length} subcategories`);
    
    // Analyze each category
    for (const category of categories) {
      let categoryType = 'empty_category'; // Default
      
      // Check if category has subcategories
      const hasSubcategories = subcategories.some(sub => sub.category_id === category.id);
      
      if (hasSubcategories) {
        categoryType = 'subcategory_category';
        console.log(`${category.name}: Has subcategories -> subcategory_category`);
      } else {
        // Check if category has direct products
        const directProducts = products.filter(product => {
          // Check for products that belong to this category but have no subcategory
          return product.category === category.name && 
                 (product.subcategory === null || 
                  product.subcategory === '' || 
                  product.subcategory === undefined);
        });
        
        // Also check for special categories that display products via flags
        const isFeaturedCategory = category.name === 'Featured Products';
        const isDealsCategory = category.name === "Today's Deals";
        
        if (directProducts.length > 0 || isFeaturedCategory || isDealsCategory) {
          categoryType = 'productcard_category';
          console.log(`${category.name}: Has ${directProducts.length} direct products or is special category -> productcard_category`);
        } else {
          console.log(`${category.name}: Empty -> empty_category`);
        }
      }
      
      // Update category in database
      const { error: updateError } = await supabase
        .from('categories')
        .update({ category_type: categoryType })
        .eq('id', category.id);
      
      if (updateError) {
        console.error(`Error updating category ${category.name}:`, updateError);
      } else {
        console.log(`✓ Updated ${category.name} -> ${categoryType}`);
      }
    }
    
    console.log('\nCategorization complete! Summary:');
    
    // Get final counts
    const { data: finalCategories, error: finalError } = await supabase
      .from('categories')
      .select('category_type');
    
    if (!finalError && finalCategories) {
      const counts = finalCategories.reduce((acc, cat) => {
        acc[cat.category_type] = (acc[cat.category_type] || 0) + 1;
        return acc;
      }, {});
      
      console.log('- Empty categories:', counts.empty_category || 0);
      console.log('- Product card categories:', counts.productcard_category || 0);
      console.log('- Subcategory categories:', counts.subcategory_category || 0);
    }
    
  } catch (error) {
    console.error('Error in categorization process:', error);
  }
}

categorizeCategories();