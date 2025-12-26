import { AdminProductSummaryDto } from "./product.model";

export interface AdminBrandSummaryDto {
    id: number;
    name: string;
    description?: string;
    productsCount: number;
    created: string;
    updated: string;
}

export interface BrandDetailsResponse {
    id: number;
    name: string;
    description?: string;
    products: AdminProductSummaryDto[];
    created: string;
    updated: string;
}

export interface CreateBrandRequest {
    name: string;
    description?: string;
}

export interface UpdateBrandRequest {
    name?: string;
    description?: string;
}

export interface BrandSummaryDto {
    id: number;
    name: string;
    productsCount: number;
}

export interface AdminBandQueryParams {
    search?: string;
    pageIndex?: number;
    pageSize?: number;
}