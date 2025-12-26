//Angular Imports
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
//Libraries
import { Observable } from 'rxjs';
//Environment
import { environment } from '../../../environments/environment';
//Models
import { PagedResponse, ProductQueryParams, ProductSummaryDto, ProductDetailsResponse } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly baseUrl: string = `${environment.url}/api/Products`;
  //Angular
  private readonly http = inject(HttpClient);

  getAllProducts(filters?: ProductQueryParams): Observable<PagedResponse<ProductSummaryDto>> {
    let params = new HttpParams();

    if (filters) {
      if (filters.pageIndex) {
        params = params.append('PageIndex', filters.pageIndex.toString());
      }
      if (filters.pageSize) {
        params = params.append('PageSize', filters.pageSize.toString());
      }
      if (filters.categoryId) {
        params = params.append('CategoryId', filters.categoryId.toString());
      }
      if (filters.brandsIds?.length) {
        params = params.append('BrandsIds', filters.brandsIds.join(','));
      }
      if (filters.search) {
        params = params.append('Search', filters.search);
      }
      if (filters.minPrice !== undefined && filters.minPrice > 0) {
        params = params.append('MinPrice', filters.minPrice.toString());
      }
      if (filters.maxPrice !== undefined && filters.maxPrice < 5000) {
        params = params.append('MaxPrice', filters.maxPrice.toString());
      }
      if (filters.sort) {
        params = params.append('Sort', filters.sort);
      }
    }

    return this.http.get<PagedResponse<ProductSummaryDto>>(this.baseUrl, { params });
  }

  getProductById(id: number): Observable<ProductDetailsResponse> {
    return this.http.get<ProductDetailsResponse>(`${this.baseUrl}/${id}`);
  }
}
