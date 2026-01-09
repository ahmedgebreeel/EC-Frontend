import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';

export interface PaymentRequest{
  // productName:string;
  amount:number;
  quantity:number;
  userEmail:string;
  // orderId:number;
}
export interface PaymentResponse{
  sessionId:string;
  sessionUrl:string;
}
@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private readonly baseUrl: string = `${environment.url}/api/Payment`; 

  constructor(private http:HttpClient) {}

  createPaymentSession(request:PaymentRequest):Observable<PaymentResponse>{
  return this.http.post<PaymentResponse>(`${this.baseUrl}/create-session`,request);
  }

  verifsSession(sessionId:string):Observable<any>{
    return this.http.get<any>(`${this.baseUrl}/verify-session/${sessionId}`);
  }

  redirectToCheckout(sessionUrl:string){
    window.location.href = sessionUrl;
  }

  
}
