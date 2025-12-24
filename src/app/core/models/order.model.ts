
export interface OrderItem {
    productId: number;
    productName: string;
    productThumbnailUrl: string;
    productPrice: number;
    quantity: number;
    total:number;
}

export interface OrderAddress {
    id: number;
    fullName: string;
    mobileNumber: string;
    label: string;
    street: string;
    building: string;
    city: string;
    district: string;
    governorate: string;
    country: string;
    zipCode: string;
    hints: string;
}
