export type ProductCategory = 'Makeup' | 'Skincare' | 'Haircare' | 'Tools';

export interface Product {
  id: number;
  name: string;
  category: ProductCategory;
  image: string;
  description: string;
  affiliateLink: string;
  price?: string;
  /** Percentage off (shown as −N% when set). */
  discount?: number;
  mrp?: string;
  weight?: string;
  featured?: boolean;
}
