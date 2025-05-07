
import React from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { 
  groceriesCategories, 
  beautyCategories, 
  householdCategories, 
  shopByStoreCategories 
} from '@/data/mockData';
import CategoryCircle from '@/components/CategoryCircle';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-grocery-primary">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <img src="/logo.png" alt="Fresh" className="h-6" />
            <Button variant="ghost" className="text-white p-1">
              <span className="sr-only">Close</span>
              ✕
            </Button>
          </div>
          <div className="relative mt-4 mb-4">
            <div className="flex items-center bg-white rounded-md overflow-hidden">
              <Search className="h-4 w-4 text-gray-400 ml-3" />
              <input 
                type="text" 
                placeholder="Search atta, ghee, tea, shampoo..." 
                className="w-full p-3 focus:outline-none text-sm" 
              />
            </div>
          </div>
        </div>
      </header>
      <main className="flex-grow bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Groceries & Food Section */}
          <section className="px-4 pt-6 pb-2">
            <h2 className="text-xl font-bold mb-4">Groceries & food</h2>
            <div className="grid grid-cols-4 gap-x-2 gap-y-4">
              {groceriesCategories.map((category) => (
                <CategoryCircle 
                  key={category.id}
                  id={category.id}
                  name={category.name}
                  icon={category.icon}
                />
              ))}
            </div>
          </section>

          {/* Beauty & Personal Care Section */}
          <section className="px-4 pt-6 pb-2">
            <h2 className="text-xl font-bold mb-4">Beauty & personal care</h2>
            <div className="grid grid-cols-4 gap-x-2 gap-y-4">
              {beautyCategories.map((category) => (
                <CategoryCircle 
                  key={category.id}
                  id={category.id}
                  name={category.name}
                  icon={category.icon}
                />
              ))}
            </div>
          </section>

          {/* Household Essentials Section */}
          <section className="px-4 pt-6 pb-2">
            <h2 className="text-xl font-bold mb-4">Household essentials</h2>
            <div className="grid grid-cols-4 gap-x-2 gap-y-4">
              {householdCategories.map((category) => (
                <CategoryCircle 
                  key={category.id}
                  id={category.id}
                  name={category.name}
                  icon={category.icon}
                />
              ))}
            </div>
          </section>

          {/* Shop by Store Section */}
          <section className="px-4 pt-6 pb-8 bg-green-50 my-4">
            <h2 className="text-xl font-bold mb-4">Shop by store</h2>
            <div className="grid grid-cols-4 gap-x-2 gap-y-4">
              {shopByStoreCategories.map((category) => (
                <CategoryCircle 
                  key={category.id}
                  id={category.id}
                  name={category.name}
                  icon={category.icon}
                />
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
