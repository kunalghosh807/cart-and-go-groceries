
import React from 'react';
import { Link } from 'react-router-dom';

interface CategoryCircleProps {
  id: string;
  name: string;
  icon: string;
  productCount?: number;
}

const CategoryCircle: React.FC<CategoryCircleProps> = ({ id, name, icon }) => {
  return (
    <Link to={`/categories/${id}`} className="flex flex-col items-center">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center overflow-hidden mb-1">
        <img src={icon} alt={name} className="w-14 h-14 object-contain" />
      </div>
      <p className="text-xs text-center font-medium mt-1 max-w-[80px]">{name}</p>
    </Link>
  );
};

export default CategoryCircle;
