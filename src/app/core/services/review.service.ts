import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AddReviewRequest, ReviewProductSummaryDto, ReviewSummaryDto, UpdateReviewRequest } from '../models/review.model';

@Injectable({
    providedIn: 'root'
})
export class ReviewService {
    private http = inject(HttpClient);
    private readonly baseUrl = `${environment.url}/api/Reviews`;

    getProductReviews(productId: number): Observable<ReviewProductSummaryDto[]> {
        return this.http.get<ReviewProductSummaryDto[]>(`${this.baseUrl}/${productId}`);
    }

    addReview(productId: number, request: AddReviewRequest): Observable<ReviewProductSummaryDto> {
        return this.http.post<ReviewProductSummaryDto>(`${this.baseUrl}/${productId}`, request);
    }

    getUserReviews(rating?: string): Observable<ReviewSummaryDto[]> {
        let params = new HttpParams();
        if (rating && rating !== 'all') {
            params = params.set('rating', rating);
        }
        return this.http.get<ReviewSummaryDto[]>(this.baseUrl, { params });
    }

    updateReview(reviewId: number, request: UpdateReviewRequest): Observable<ReviewSummaryDto> {
        return this.http.put<ReviewSummaryDto>(`${this.baseUrl}/${reviewId}`, request);
    }

    deleteReview(reviewId: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${reviewId}`);
    }

    markReviewHelpful(reviewId: number): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/${reviewId}/helpful`, {});
    }
}
