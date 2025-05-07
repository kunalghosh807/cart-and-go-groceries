
import React from 'react';
import { Link } from 'react-router-dom';

interface CategoryCardProps {
  id: string;
  name: string;
  image: string;
  productCount?: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ id, name, image, productCount }) => {
  return (
    <Link to={`/categories/${id}`} className="block">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center overflow-hidden mb-1">
          <img src={image} alt={name} className="w-14 h-14 object-contain" />
        </div>
        <p className="text-xs text-center font-medium mt-1">{name}</p>
      </div>
    </Link>
  );
};

export default CategoryCard;
