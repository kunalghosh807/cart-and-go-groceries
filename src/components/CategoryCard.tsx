
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
      <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
        <div className="relative aspect-square">
          <img src={image} alt={name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        </div>
        <CardContent className="p-2 text-center">
          <h3 className="font-medium text-xs sm:text-sm leading-tight">{name}</h3>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CategoryCard;
