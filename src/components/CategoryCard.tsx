
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

interface CategoryCardProps {
  id: string;
  name: string;
  image: string;
  productCount: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ id, name, image, productCount }) => {
  return (
    <Link to={`/categories/${id}`}>
      <div className="text-center transition-transform duration-200 hover:scale-105">
        <div className="bg-gray-100 rounded-lg p-3 mb-2">
          <img src={image} alt={name} className="w-full h-12 sm:h-16 object-cover rounded-md" />
        </div>
        <h3 className="text-xs font-medium text-gray-800 leading-tight px-1">{name}</h3>
      </div>
    </Link>
  );
};

export default CategoryCard;
