//Angular Imports
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
//Libraries
import { Observable } from 'rxjs';
//Environment
import { environment } from '../../../environments/environment';
//Models
import { CategorySummaryDto } from '../models';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly baseUrl: string = `${environment.url}/api/Categories`;
  //Angular
  private readonly http = inject(HttpClient);

  getAllStoreCategories(): Observable<CategorySummaryDto[]> {
    return this.http.get<CategorySummaryDto[]>(this.baseUrl);
  }
}
