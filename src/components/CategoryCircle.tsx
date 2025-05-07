
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface CategoryCircleProps {
  id: string;
  name: string;
  icon: string;
  productCount?: number;
}

const CategoryCircle: React.FC<CategoryCircleProps> = ({ id, name, icon }) => {
  return (
    <Link to={`/categories/${id}`} className="flex flex-col items-center">
      <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center overflow-hidden mb-1 border border-gray-100 shadow-sm">
        <Avatar className="w-full h-full">
          <AvatarImage
            src={icon}
            alt={name}
            className="object-cover"
          />
          <AvatarFallback className="text-xs font-medium">{name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>
      <p className="text-xs text-center font-medium mt-1 max-w-[80px]">{name}</p>
    </Link>
  );
};

export default CategoryCircle;
