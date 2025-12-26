//Angular Imports
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
//Libraries
import { Observable } from 'rxjs';
//Environment
import { environment } from '../../../environments/environment';
//Models
import { CheckoutPreviewResponse, CheckoutRequest, OrderConfirmationResponse } from '../models';

@Injectable({
    providedIn: 'root'
})
export class CheckoutService {
    private readonly baseUrl: string = `${environment.url}/api/Checkout`;
    //Angular
    private http = inject(HttpClient);

    getCheckoutPreview(shippingMethod: string): Observable<CheckoutPreviewResponse> {
        return this.http.get<CheckoutPreviewResponse>(`${this.baseUrl}/preview`, {
            params: { shippingMethod }
        });
    }

    placeOrder(request: CheckoutRequest): Observable<OrderConfirmationResponse> {
        return this.http.post<OrderConfirmationResponse>(`${this.baseUrl}`, request);
    }
}
