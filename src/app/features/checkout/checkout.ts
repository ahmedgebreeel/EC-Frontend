import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AddressService } from '../../core/services/address.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { PaymentService } from '../../core/services/payment.service';

export enum ShippingMethod {
  Standard = 0,
  Express = 1
}

export enum PaymentMethod {
  CreditCard = 0,
  CashOnDelivery = 1
}

@Component({
  selector: 'app-checkout',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private addressService = inject(AddressService);
  private authService = inject(AuthService);
  private paymentService = inject(PaymentService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  // State signals
  cartItems = signal<any[]>([]);
  cartTotal = signal<number>(0);
  addresses = signal<any[]>([]);
  selectedAddressId = signal<number | null>(null);
  selectedShippingMethod = signal<ShippingMethod>(ShippingMethod.Standard);
  selectedPaymentMethod = signal<PaymentMethod>(PaymentMethod.CashOnDelivery);
  isLoading = signal<boolean>(true);
  isSubmitting = signal<boolean>(false);
  termsAccepted = signal<boolean>(false);

  //stripe payment
  isProcessingPayment = signal<boolean>(false);
  paymentError = signal<string>('');
  userEmail = signal<string>('');

  // New Address signals
  showNewAddressForm = signal<boolean>(false);
  newAddress = signal<{
    street: string,
    city: string,
    state: string,
    zipCode: string,
    country: string
  }>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Egypt'
  });

  // Credit Card signals
  cardNumber = signal('');
  cardExpiry = signal('');
  cardCvv = signal('');
  cardName = signal('');

  // Validation signals
  cardErrors = signal<{ number?: string, expiry?: string, cvv?: string, name?: string }>({});

  // Enums for template
  ShippingMethod = ShippingMethod;
  PaymentMethod = PaymentMethod;

  // Computed values
  shippingFees = computed(() => {
    return this.selectedShippingMethod() === ShippingMethod.Express ? 250 : 150;
  });

  subtotal = computed(() => this.cartTotal());

  taxes = computed(() => {
    return Math.round(this.subtotal() * 0.14 * 100) / 100;
  });

  totalAmount = computed(() => {
    return this.subtotal() + this.shippingFees() + this.taxes();
  });

  itemCount = computed(() => this.cartItems().length);

  ngOnInit() {
    this.loadCartAndAddresses();
  }

  loadCartAndAddresses() {
    this.isLoading.set(true);

    // Load cart
    this.cartService.getUserCart().subscribe({
      next: (res) => {
        this.cartItems.set(res.items || []);
        this.cartTotal.set(res.cartTotal || 0);
        this.cartService.setCartCount(res.items?.length || 0);
      },
      error: (err) => {
        console.error('Error loading cart:', err);
        this.toastr.error('Failed to load cart');
      }
    });

    // Load user's addresses (pass userId to filter for current user)
    const currentUserId = this.authService.user()?.id;
    this.userEmail.set(this.authService.user()?.email || '');
    this.addressService.getUserAddresses(currentUserId).subscribe({
      next: (res) => {
        console.log('Addresses loaded:', res);
        this.addresses.set(res || []);

        // Only select first address if we're not showing the new address form
        if (!this.showNewAddressForm() && res && res.length > 0) {
          this.selectedAddressId.set(res[0].id);
        } else if (res.length === 0) {
          // If no addresses, show form automatically
          this.showNewAddressForm.set(true);
        }

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading addresses:', err);
        const errorMessage = err.error?.message || err.error || err.message || 'Failed to load addresses';
        this.toastr.error(errorMessage);
        this.isLoading.set(false);
      }
    });
  }

  selectAddress(addressId: number) {
    this.selectedAddressId.set(addressId);
    this.showNewAddressForm.set(false);
  }

  toggleNewAddressForm() {
    this.showNewAddressForm.set(true);
    this.selectedAddressId.set(null);
  }

  cancelNewAddress() {
    this.showNewAddressForm.set(false);
    if (this.addresses().length > 0) {
      this.selectedAddressId.set(this.addresses()[0].id);
    }
  }

  saveNewAddress() {
    const address = this.newAddress();

    // Basic validation
    if (!address.street || !address.city || !address.state || !address.zipCode) {
      this.toastr.warning('Please fill in all required address fields');
      return;
    }

    this.isSubmitting.set(true);

    // Map to backend expected format
    const addressPayload = {
      // firstName: address.firstName,
      // lastName: address.lastName,
      street: address.street,
      city: address.city,
      state: address.state, // governorate
      zipCode: address.zipCode,
      country: address.country
    };

    this.addressService.addAddress(addressPayload).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.toastr.success('Address saved successfully');

        // Reload addresses to get the new one with ID
        this.loadCartAndAddresses();

        // Reset form
        this.newAddress.set({
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'Egypt'
        });

        // Switch back to list view
        this.showNewAddressForm.set(false);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('Error saving address:', err);
        this.toastr.error(err.error?.message || 'Failed to save address');
      }
    });
  }

  updateAddressField(field: string, value: string) {
    this.newAddress.update((current: any) => ({
      ...current,
      [field]: value
    }));
  }

  selectShippingMethod(method: ShippingMethod) {
    this.selectedShippingMethod.set(method);
  }

  selectPaymentMethod(method: PaymentMethod) {
    this.selectedPaymentMethod.set(method);
  }

  // Credit Card Validation Helpers
  validateCard(): boolean {
    const errors: { number?: string, expiry?: string, cvv?: string, name?: string } = {};
    let isValid = true;

    // Card Number (Luhn algorithm simplified check for length and digits)
    const num = this.cardNumber().replace(/\s/g, '');
    if (!/^\d{16}$/.test(num)) {
      errors.number = 'Card number must be 16 digits';
      isValid = false;
    }

    // Expiry Date (MM/YY)
    const expiry = this.cardExpiry();
    if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(expiry)) {
      errors.expiry = 'Invalid expiry date (MM/YY)';
      isValid = false;
    } else {
      // Check if expired
      const [month, year] = expiry.split('/').map(val => parseInt(val, 10));
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;

      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        errors.expiry = 'Card has expired';
        isValid = false;
      }
    }

    // CVV
    if (!/^\d{3,4}$/.test(this.cardCvv())) {
      errors.cvv = 'CVV must be 3 or 4 digits';
      isValid = false;
    }

    // Name
    if (!this.cardName().trim()) {
      errors.name = 'Cardholder name is required';
      isValid = false;
    }

    this.cardErrors.set(errors);
    return isValid;
  }

   procceedToPayment(): void {
    if (!this.userEmail()) {
      this.paymentError.set('Please login to proceed with payment.');
      return;
    }
    this.isProcessingPayment.set(true);
    this.paymentError.set(''); 

    const paymentRequest = {
      amount:this.cartTotal() , // Convert to cents
      quantity: this.itemCount(),
      userEmail: this.userEmail(),
      orderId: 0// Placeholder, backend can assign order ID
    };
    this.paymentService.createPaymentSession(paymentRequest).subscribe({
      next: (response) => {
        console.log('Payment session created:', response.sessionId);

        this.paymentService.redirectToCheckout(response.sessionUrl);
      },
      error: (error) => {
        this.isProcessingPayment.set(false);
        this.paymentError.set(
          error?.error?.message || 'An error occurred while creating payment session.'
        );
        console.error('Payment session creation error:', error);
      },
    });
  }

  canPlaceOrder(): boolean {
    return (
      this.selectedAddressId() !== null &&
      this.cartItems().length > 0 &&
      this.termsAccepted() &&
      !this.isSubmitting()
    );
  }

  placeOrder() {
    if (!this.canPlaceOrder()) {
      if (!this.selectedAddressId()) {
        this.toastr.warning('Please select a shipping address');
        return;
      }
      if (!this.termsAccepted()) {
        this.toastr.warning('Please accept the terms and conditions');
        return;
      }
      return;
    }

    // Validate Credit Card if selected
    if (this.selectedPaymentMethod() === PaymentMethod.CreditCard) {
      this.procceedToPayment();
    }

    this.isSubmitting.set(true);

    const checkoutDto = {
      shippingAddressId: this.selectedAddressId(),
      shippingMethod: this.selectedShippingMethod(),
      paymentMethod: this.selectedPaymentMethod()
    };

    this.orderService.AddOrder(checkoutDto).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.cartService.setCartCount(0);
        this.toastr.success('Order placed successfully!');
        this.router.navigate(['/orderconfirmation']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('Checkout error:', err);
        this.toastr.error(err.error?.message || 'Failed to place order. Please try again.');
        // If payment failed (e.g. backend validation?), we might want to clear loading state
      }
    });
  }
}
