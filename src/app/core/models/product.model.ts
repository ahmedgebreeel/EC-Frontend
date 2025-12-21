export interface BreadcrumbLink {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  thumbnailUrl: string;
  brandedName: string;
  price: number;
  categoryId: number;
  categoryBreadcrumbLinks: BreadcrumbLink[];
}

export interface ProductsResponse {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: Product[];
}

export interface ProductQueryParams {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  categoryId?: number;
  brandsIds?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'featured' | 'priceAsc' | 'priceDesc' | 'newest';
}
