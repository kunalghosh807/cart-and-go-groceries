const { createClient } = require('@supabase/supabase-js');

// Load environment variables manually
const fs = require('fs');
const envContent = fs.readFileSync('.env', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabase = createClient(envVars.SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  console.log('Fixing database...');
  
  // Remove test categories
  console.log('Removing test categories...');
  const { error: deleteError } = await supabase
    .from('categories')
    .delete()
    .in('name', ['Dipa', 'Kunal', 'Ritun']);
  
  if (deleteError) {
    console.error('Error deleting test categories:', deleteError);
  } else {
    console.log('Test categories removed successfully');
  }
  
  // Fix Beauty & Personal Care category name
  console.log('Fixing Beauty & Personal Care category name...');
  const { error: updateError } = await supabase
    .from('categories')
    .update({ name: 'Beauty & Personal Care' })
    .eq('name', 'Beauty & Personal C');
  
  if (updateError) {
    console.error('Error updating category name:', updateError);
  } else {
    console.log('Category name fixed successfully');
  }
  
  // Get category IDs
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name');
  
  const categoryMap = {};
  categories.forEach(cat => {
    categoryMap[cat.name] = cat.id;
  });
  
  // Add missing subcategories
  const missingSubcategories = [
    // Grocerry & Kitchen
    { name: 'Dry Fruits & Cereals', category: 'Grocerry & Kitchen' },
    { name: 'Chicken, Meat & Fish', category: 'Grocerry & Kitchen' },
    { name: 'Kitchenware & Appliances', category: 'Grocerry & Kitchen' },
    
    // Snacks & Drinks
    { name: 'Sweets & Chocolates', category: 'Snacks & Drinks' },
    { name: 'Drinks & Juices', category: 'Snacks & Drinks' },
    { name: 'Tea, Coffee & Milk Drinks', category: 'Snacks & Drinks' },
    { name: 'Instant Food', category: 'Snacks & Drinks' },
    { name: 'Sauces & Spreads', category: 'Snacks & Drinks' },
    { name: 'Paan Corner', category: 'Snacks & Drinks' },
    { name: 'Cakes', category: 'Snacks & Drinks' },
    
    // Beauty & Personal Care
    { name: 'Hair', category: 'Beauty & Personal Care' },
    { name: 'Skin & Face', category: 'Beauty & Personal Care' },
    { name: 'Beauty & Cosmetics', category: 'Beauty & Personal Care' },
    { name: 'Feminine Hygiene', category: 'Beauty & Personal Care' },
    { name: 'Baby Care', category: 'Beauty & Personal Care' },
    { name: 'Health & Pharma', category: 'Beauty & Personal Care' },
    { name: 'Sexual Wellness', category: 'Beauty & Personal Care' }
  ];
  
  console.log('Adding missing subcategories...');
  for (const sub of missingSubcategories) {
    const categoryId = categoryMap[sub.category];
    if (categoryId) {
      // Check if subcategory already exists
      const { data: existing } = await supabase
        .from('subcategories')
        .select('id')
        .eq('name', sub.name)
        .eq('category_id', categoryId)
        .single();
      
      if (!existing) {
        const { error } = await supabase
          .from('subcategories')
          .insert({ name: sub.name, category_id: categoryId });
        
        if (error) {
          console.error(`Error adding ${sub.name}:`, error);
        } else {
          console.log(`Added: ${sub.name}`);
        }
      } else {
        console.log(`Already exists: ${sub.name}`);
      }
    }
  }
  
  // Update existing subcategory names to match mock data
  console.log('Updating subcategory names...');
  const nameUpdates = [
    { old: 'Tea, Coffee & Health Drinks', new: 'Tea, Coffee & Milk Drinks' },
    { old: 'Chocolates & Candies', new: 'Sweets & Chocolates' },
    { old: 'Cold Drinks & Juices', new: 'Drinks & Juices' }
  ];
  
  for (const update of nameUpdates) {
    const { error } = await supabase
      .from('subcategories')
      .update({ name: update.new })
      .eq('name', update.old);
    
    if (error) {
      console.error(`Error updating ${update.old}:`, error);
    } else {
      console.log(`Updated: ${update.old} -> ${update.new}`);
    }
  }
  
  console.log('Database fix completed!');
})();