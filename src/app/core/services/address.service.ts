import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AddressService {
    private readonly baseUrl: string = `${environment.url}/api/Address`;
    private http = inject(HttpClient);

    getUserAddresses(userId?: string): Observable<any> {
        const url = userId ? `${this.baseUrl}?userId=${userId}` : this.baseUrl;
        return this.http.get(url);
    }

    getAddressById(id: number): Observable<any> {
        return this.http.get(`${this.baseUrl}/${id}`);
    }

    addAddress(address: any): Observable<any> {
        return this.http.post(this.baseUrl, address);
    }

    updateAddress(id: number, address: any): Observable<any> {
        return this.http.put(`${this.baseUrl}/${id}`, address);
    }

    deleteAddress(id: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/${id}`);
    }
}
