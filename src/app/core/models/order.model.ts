import { OrderAddress } from "./address.model";

export interface AdminOrderSummaryDto {
    id: number;
    userName: string;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    totalAmount: number;
    itemsCount: number;
    created: string;
}

export interface OrderDetailsResponse {
    id: number;
    userName: string;
    userId: string;
    totalAmount: number;
    created: string;
    updated: string;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    shippingAddress: OrderAddress;
    items: OrderItemDto[];
}

export interface UpdateOrderRequest {
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    shippingAddressId?: number;
}

export interface OrderSummaryDto {
    id: number;
    created: string;
    updated: string;
    items: OrderItemDto[];
    itemsCount: number;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    subtotal: number;
    shippingFees: number;
    taxes: number;
    totalAmount: number;
    shippingMethod: string;
    paymentMethod: string;
    shippingAddress: OrderAddress;
    orderTrackingMilestone: OrderTrackingMilestoneDto[];
}

export interface OrderItemDto {
    productId: number;
    productName: string;
    productThumbnailUrl: string;
    productPrice: number;
    quantity: number;
    total: number;
}

export interface OrderTrackingMilestoneDto {
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    timestamp: string;
}