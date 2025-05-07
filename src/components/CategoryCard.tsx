
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

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
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center overflow-hidden mb-1 border border-gray-100 shadow-sm">
          <Avatar className="w-full h-full">
            <AvatarImage
              src={image}
              alt={name}
              className="object-cover"
            />
            <AvatarFallback className="text-xs font-medium">{name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
        <p className="text-xs text-center font-medium mt-1">{name}</p>
      </div>
    </Link>
  );
};

export default CategoryCard;
