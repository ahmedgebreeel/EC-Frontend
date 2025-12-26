//Angular Imports
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
//Libraries
import { Observable } from 'rxjs';
//Environment
import { environment } from '../../../environments/environment';
//Models
import { AddressSummaryDto, CreateAddressRequest } from '../models';

@Injectable({
    providedIn: 'root'
})
export class AddressService {
    private readonly baseUrl: string = `${environment.url}/api/Addresses`;
    //Angular
    private http = inject(HttpClient);

    getUserAddresses(): Observable<AddressSummaryDto[]> {
        return this.http.get<AddressSummaryDto[]>(this.baseUrl);
    }

    addAddress(address: CreateAddressRequest): Observable<AddressSummaryDto> {
        return this.http.post<AddressSummaryDto>(this.baseUrl, address);
    }
}
