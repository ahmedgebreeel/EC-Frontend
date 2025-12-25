import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly baseUrl: string = `${environment.url}/api/Categories`;
  private http = inject(HttpClient);

  categories = signal<any[]>([]);


  getAllCategories():Observable<any> {
    return this.http.get(this.baseUrl);
  }
  getCategoryById(id:string):Observable<any>{
    return this.http.get(`${this.baseUrl}/${id}`);
  }
  AddCategory(category:any):Observable<any>{
   return this.http.post(this.baseUrl,category);
  }
  UpdateCategory(id:string,category:any):Observable<any>{
    return this.http.put(`${this.baseUrl}/${id}`,category);
  }
  DeleteCategory(id:string):Observable<any>{
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
