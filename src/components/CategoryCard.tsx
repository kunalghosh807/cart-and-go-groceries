
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

interface CategoryCardProps {
  id: string;
  name: string;
  image: string;
  productCount: number;
  subcategories?: string[];
}

const CategoryCard: React.FC<CategoryCardProps> = ({ id, name, image, productCount, subcategories }) => {
  return (
    <Link to={`/categories/${id}`}>
      <div className="text-center transition-transform duration-200 hover:scale-105 bg-white rounded-lg p-3 shadow-sm">
        <div className="bg-gray-100 rounded-lg p-3 mb-3">
          <img src={image} alt={name} className="w-full h-12 sm:h-16 object-cover rounded-md" />
        </div>
        <h3 className="text-sm font-semibold text-gray-800 mb-2">{name}</h3>
        {subcategories && (
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex flex-wrap justify-center gap-x-2">
              {subcategories.slice(0, 4).map((sub, index) => (
                <span key={index} className="whitespace-nowrap">
                  {sub}{index < 3 && index < subcategories.slice(0, 4).length - 1 ? ',' : ''}
                </span>
              ))}
            </div>
            {subcategories.length > 4 && (
              <div className="flex flex-wrap justify-center gap-x-2">
                {subcategories.slice(4).map((sub, index) => (
                  <span key={index} className="whitespace-nowrap">
                    {sub}{index < subcategories.slice(4).length - 1 ? ',' : ''}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export default CategoryCard;
