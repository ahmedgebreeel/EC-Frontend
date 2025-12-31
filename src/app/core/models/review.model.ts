export interface ReviewSummaryDto {
    id: number;
    productThumbnailUrl: string;
    productName: string;
    rating: number;
    created: string;
    updated?: string;
    comment?: string;
    helpfulCount: number;

}

export interface ReviewProductSummaryDto {
    id: number;
    userAvatarUrl?: string;
    userName: string;
    rating: number;
    created: string;
    updated?: string;
    comment?: string;
    helpfulCount: number;

}

export interface AddReviewRequest {
    rating: number;
    comment?: string;
}

export interface UpdateReviewRequest {
    rating: number;
    comment?: string;
}
