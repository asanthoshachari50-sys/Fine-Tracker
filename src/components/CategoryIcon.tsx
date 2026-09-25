import React from 'react';
import {
  Home,
  ShoppingBag,
  Car,
  Zap,
  Utensils,
  Activity,
  Package,
  Film,
  Landmark,
  MoreHorizontal,
  CreditCard,
  Briefcase,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface CategoryIconProps {
  iconName: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ iconName, className = 'w-5 h-5' }) => {
  switch (iconName?.toLowerCase()) {
    case 'home':
      return <Home className={className} />;
    case 'shoppingbag':
    case 'groceries':
      return <ShoppingBag className={className} />;
    case 'car':
    case 'transport':
      return <Car className={className} />;
    case 'zap':
    case 'utilities':
      return <Zap className={className} />;
    case 'utensils':
    case 'dining':
      return <Utensils className={className} />;
    case 'activity':
    case 'health':
      return <Activity className={className} />;
    case 'package':
    case 'shopping':
      return <Package className={className} />;
    case 'film':
    case 'entertainment':
      return <Film className={className} />;
    case 'landmark':
    case 'emi_debt':
      return <Landmark className={className} />;
    case 'creditcard':
      return <CreditCard className={className} />;
    case 'briefcase':
      return <Briefcase className={className} />;
    case 'graduationcap':
      return <GraduationCap className={className} />;
    default:
      return <MoreHorizontal className={className} />;
  }
};
