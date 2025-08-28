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
  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, subcategories(id, name)')
    .order('name');
    
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Categories and Subcategories in Database:');
    categories.forEach(cat => {
      console.log(`\n${cat.name}:`);
      if (cat.subcategories && cat.subcategories.length > 0) {
        cat.subcategories.forEach(sub => console.log(`  - ${sub.name}`));
      } else {
        console.log('  (no subcategories)');
      }
    });
  }
})();