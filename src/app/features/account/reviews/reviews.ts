import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewService } from '../../../core/services';
import { ApiError } from '../../../core/models';
import { ReviewSummaryDto } from '../../../core/models/review.model';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, timer } from 'rxjs';

@Component({
    selector: 'app-account-reviews',
    imports: [CommonModule],
    templateUrl: './reviews.html',
    styleUrl: './reviews.css',
})
export class AccountReviews implements OnInit {
    reviewService = inject(ReviewService);

    reviews = signal<ReviewSummaryDto[]>([]);
    reviewsLoading = signal(true);
    selectedFilter = signal<string>('all');
    filterLabel = signal('All Reviews');

    ngOnInit(): void {
        this.loadReviews();
    }

    loadReviews(): void {
        this.reviewsLoading.set(true);
        forkJoin([
            this.reviewService.getUserReviews(this.selectedFilter()),
            timer(500) // Minimum loading time
        ]).subscribe({
            next: ([res]) => {
                this.reviews.set(res);
                this.reviewsLoading.set(false);
            },
            error: () => {
                this.reviewsLoading.set(false);
            }
        });
    }

    setFilter(rating: string, label: string): void {
        this.selectedFilter.set(rating);
        this.filterLabel.set(label);
        this.loadReviews();
    }

    // Edit Review State
    editingReviewId = signal<number | null>(null);
    editRating = signal(0);
    editComment = signal('');
    editHoverRating = signal(0);
    savingReview = signal(false);

    private toastr = inject(ToastrService);

    startEdit(review: ReviewSummaryDto): void {
        this.editingReviewId.set(review.id);
        this.editRating.set(review.rating);
        this.editComment.set(review.comment || '');
        this.editHoverRating.set(0);
    }

    cancelEdit(): void {
        this.editingReviewId.set(null);
        this.editRating.set(0);
        this.editComment.set('');
        this.editHoverRating.set(0);
        this.savingReview.set(false);
    }

    setEditRating(rating: number): void {
        this.editRating.set(rating);
    }

    saveEdit(): void {
        const reviewId = this.editingReviewId();
        if (!reviewId || this.editRating() === 0 || this.savingReview()) return;

        this.savingReview.set(true);
        const request = {
            rating: this.editRating(),
            comment: this.editComment() || undefined
        };

        this.reviewService.updateReview(reviewId, request).subscribe({
            next: (updatedReview) => {
                this.savingReview.set(false);
                this.cancelEdit();
                this.toastr.success('Review updated successfully');

                if (this.selectedFilter() !== 'all') {
                    this.setFilter('all', 'All Reviews');
                } else {
                    this.reviews.update(reviews =>
                        reviews.map(r => r.id === reviewId ? updatedReview : r)
                    );
                }
            },
            error: (err) => {
                this.savingReview.set(false);
                // delegated to global error interceptor
            }
        });
    }

    // Delete Review
    deletingReviewId = signal<number | null>(null);

    deleteReview(reviewId: number): void {
        if (this.deletingReviewId()) return;

        this.deletingReviewId.set(reviewId);
        this.reviewService.deleteReview(reviewId).subscribe({
            next: () => {
                this.reviews.update(reviews => reviews.filter(r => r.id !== reviewId));
                this.deletingReviewId.set(null);
                this.toastr.success('Review deleted successfully');
            },
            error: (err) => {
                this.deletingReviewId.set(null);
                // delegated to global error interceptor
            }
        });
    }
}

