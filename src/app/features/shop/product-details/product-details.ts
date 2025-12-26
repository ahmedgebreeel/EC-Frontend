//Angular Imports
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
//Libraries
import { ToastrService } from 'ngx-toastr';
//Services
import { AuthService, CartService, ProductService } from '../../../core/services';
//Models
import { ProductDetailsResponse } from '../../../core/models';

@Component({
  selector: 'app-product-details',
  imports: [RouterLink, CommonModule],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails {
  //Angular
  activeRoute = inject(ActivatedRoute);
  router = inject(Router);
  //Libraries
  toastr = inject(ToastrService);
  //Services
  productService = inject(ProductService);
  cartService = inject(CartService);
  authService = inject(AuthService);

  //Product State
  productData = signal<ProductDetailsResponse | null>(null);
  productId: number;

  //Image Gallery State
  mainImage = signal<any>({});
  activeImage = signal(0);

  //Size Selection State
  sizes = signal([
    { name: 'XS', available: false },
    { name: 'S', available: true },
    { name: 'M', available: true },
    { name: 'L', available: true },
    { name: 'XL', available: false },
  ]);
  selectedSize = signal<string | null>(null);

  //Quantity State
  quantity: number = 1;
  maxStock: number = 0;
  isShaking = signal(false);

  // ==================== Constructor ====================

  constructor() {
    const idParam = this.activeRoute.snapshot.paramMap.get('id');
    this.productId = idParam ? parseInt(idParam, 10) : 0;

    this.productService.getProductById(this.productId).subscribe((res: ProductDetailsResponse) => {
      this.productData.set(res);
      this.maxStock = res.stockQuantity;

      if (res.images && res.images.length > 0) {
        const mainImg = res.images.find(img => img.isMain) || res.images[0];
        this.mainImage.set(mainImg);
        this.activeImage.set(res.images.indexOf(mainImg));
      }
    });
  }

  // ==================== Image Gallery ====================

  selectImage(index: number) {
    const product = this.productData();
    if (product && product.images) {
      this.mainImage.set(product.images[index]);
      this.activeImage.set(index);
    }
  }

  prevImage() {
    const product = this.productData();
    if (product && product.images) {
      const index =
        this.activeImage() > 0 ? this.activeImage() - 1 : product.images.length - 1;
      this.selectImage(index);
    }
  }

  nextImage() {
    const product = this.productData();
    if (product && product.images) {
      const index =
        this.activeImage() < product.images.length - 1 ? this.activeImage() + 1 : 0;
      this.selectImage(index);
    }
  }

  // ==================== Size Selection ====================

  selectSize(size: string) {
    this.selectedSize.set(size);
  }

  // ==================== Quantity ====================

  increaseQty(): void {
    if (this.quantity < this.maxStock) {
      this.quantity++;
    } else {
      this.triggerShake();
    }
  }

  decreaseQty(): void {
    if (this.quantity > 1) {
      this.quantity--;
    } else {
      this.triggerShake();
    }
  }

  triggerShake(): void {
    this.isShaking.set(true);
    setTimeout(() => this.isShaking.set(false), 400);
  }

  // ==================== Cart ====================

  addToCart(): void {
    if (!this.authService.user()) {
      this.toastr.info('Please login first');
      return;
    }

    const product = this.productData();
    if (product) {
      this.cartService.addToCart(product.id, this.quantity).subscribe({
        next: () => {
          this.toastr.success('Product added to cart');
        },
        error: (err) => {
          this.toastr.error(err.error);
        }
      });
    }
  }
}
