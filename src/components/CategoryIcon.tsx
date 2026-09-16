import React from 'react';
import * as Icons from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5', size = 20 }) => {
  // Map icon name to Lucide component safely
  const LucideIcon = (Icons as unknown as Record<string, React.ElementType>)[name] || Icons.CircleDollarSign;
  return <LucideIcon className={className} size={size} />;
};
