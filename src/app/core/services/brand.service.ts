//Angular Imports
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
//Libraries
import { Observable } from 'rxjs';
//Environment
import { environment } from '../../../environments/environment';
//Models
import { BrandSummaryDto } from '../models';

@Injectable({
    providedIn: 'root',
})
export class BrandService {
    private readonly baseUrl: string = `${environment.url}/api/brands`;
    //Angular
    private readonly http = inject(HttpClient);

    getAllStoreBrands(): Observable<BrandSummaryDto[]> {
        return this.http.get<BrandSummaryDto[]>(this.baseUrl);
    }
}
