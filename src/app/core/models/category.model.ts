export interface AdminCategorySummaryDto {
    id: number;
    name: string;
    description?: string;
    parentCategoryName: string;
    created: string;
    updated: string;
    pathFromRoot: string;
}

export interface CategoryDetailsResponse {
    id: number;
    name: string;
    description?: string;
    parentId?: number;
    subcategoriesNames: string[];
    pathFromRoot: string;
    created: string;
    updated: string;
}

export interface CreateCategoryRequest {
    name: string;
    description?: string;
    parentId?: number;
}

export interface UpdateCategoryRequest {
    name: string;
    description?: string;
    parentId?: number;
}

export interface CategorySummaryDto {
    id: number;
    name: string;
    description?: string;
    parentId?: number;
    subcategories: CategorySummaryDto[];
}

export interface AdminCategoryQueryParams {
    search?: string;
    pageIndex?: number;
    pageSize?: number;
}
