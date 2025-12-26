import { OrderAddress } from "./address.model";
import { OrderItemDto } from "./order.model";

export interface CheckoutPreviewResponse {
    subtotal: number;
    shippingFees: number;
    taxes: number;
    total: number;
    estimatedDeliveryDateStart: string;
    estimatedDeliveryDateEnd: string;
    items: OrderItemDto[];
}

export interface CheckoutRequest {
    shippingAddressId: number;
    shippingMethod: 'standard' | 'express';
    paymentMethod: 'cashOnDelivery' | 'stripe' | 'paymob';

}

export interface OrderConfirmationResponse {
    id: number;
    created: string;
    subtotal: number;
    shippingFees: number;
    taxes: number;
    totalAmount: number;
    estimatedDeliveryDateStart: string;
    estimatedDeliveryDateEnd: string;
    shippingMethod: 'standard' | 'express';
    shippingAddress: OrderAddress;
    userEmail: string;
    paymentMethod: 'cashOnDelivery' | 'stripe' | 'paymob';
    itemsCount: number;
    items: OrderItemDto[];
}