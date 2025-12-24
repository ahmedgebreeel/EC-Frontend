import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly baseUrl: string = `${environment.url}/api/Orders`;
  private http = inject(HttpClient);

  getUserOrders():Observable<any>{
    return this.http.get(this.baseUrl);
  }
  AddOrder(order:any):Observable<any>{
    return this.http.post(`${this.baseUrl}/checkout`,order);
  }

  //For Admin
  getAllAdminOrders(pageIndex: number = 1, pageSize: number = 10):Observable<any> {
    return this.http.get(`${this.baseUrl}/admin?pageIndex=${pageIndex}&pageSize=${pageSize}`);
  }
  getOrderById(id:string):Observable<any>{
    return this.http.get(`${this.baseUrl}/admin/${id}`);
  }
  UpdateOrder(id:string,order:any):Observable<any>{
    return this.http.put(`${this.baseUrl}/admin/${id}`,order);
  }
  DeleteOrder(id:string):Observable<any>{
    return this.http.delete(`${this.baseUrl}/admin/${id}`);
  }
}
