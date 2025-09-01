import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

interface SubcategoryCardProps {
  id: string;
  categoryId: string;
  name: string;
  image: string;
  productCount: number;
}

const SubcategoryCard: React.FC<SubcategoryCardProps> = ({ id, categoryId, name, image, productCount }) => {
  return (
    <Link to={`/categories/${categoryId}/${id}`}>
      <div className="text-center transition-transform duration-200 hover:scale-105">
        <div className="bg-gray-100 rounded-lg p-1 sm:p-2 md:p-3 mb-1 sm:mb-2">
          <img src={image} alt={name} className="w-full h-8 sm:h-12 md:h-16 object-cover rounded-md" />
        </div>
        <h3 className="text-[10px] sm:text-xs font-medium text-gray-800 leading-tight px-0.5 sm:px-1">{name}</h3>
      </div>
    </Link>
  );
};

export default SubcategoryCard;