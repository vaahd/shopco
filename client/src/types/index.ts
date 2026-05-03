export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
  description: string;
  sizes: string[];
  colors: string[];
  colorImages: Record<string, string>;
  isNew?: boolean;
  discount?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
  backendId?: number;
}

export type Category = string;
