//Angular Imports
import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
//Libraries
import { Observable, tap } from 'rxjs';
//Environment
import { environment } from '../../../environments/environment';
//Models
import { CartResponse, CartItemDto, UpdateCartItemDto } from '../models';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly baseUrl: string = `${environment.url}/api/Cart`;
  //Angular
  private http = inject(HttpClient);

  //State
  cartItems = signal<CartItemDto[]>([]);
  private cartCount = signal(0);
  private broadcastChannel = new BroadcastChannel('cart_sync');

  constructor() {
    this.broadcastChannel.onmessage = (event) => {
      if (event.data && event.data.type === 'UPDATE') {
        this.updateLocalState(event.data.items);
      }
    };
  }

  setCartCount(count: number): void {
    this.cartCount.set(count);
  }

  getCartCount(): number {
    return this.cartCount();
  }

  clearLocalCart(): void {
    this.cartItems.set([]);
    this.setCartCount(0);
  }

  private updateLocalState(items: CartItemDto[]): void {
    this.cartItems.set(items);
    this.setCartCount(items.length);
  }

  getUserCart(): Observable<CartResponse> {
    return this.http.get<CartResponse>(this.baseUrl).pipe(
      tap((cart) => {
        if (cart && cart.items) {
          this.updateLocalState(cart.items);
        }
      })
    );
  }

  updateCart(items: UpdateCartItemDto[]): Observable<CartResponse> {
    return this.http.post<CartResponse>(this.baseUrl, { items }).pipe(
      tap((res) => {
        if (res && res.items) {
          this.updateLocalState(res.items);
          this.broadcastChannel.postMessage({ type: 'UPDATE', items: res.items });
        }
      })
    );
  }

  clearCart(): Observable<CartResponse> {
    return this.http.delete<CartResponse>(this.baseUrl).pipe(
      tap(() => {
        this.updateLocalState([]);
        this.broadcastChannel.postMessage({ type: 'UPDATE', items: [] });
      })
    );
  }

  addToCart(productId: number, quantity: number = 1): Observable<CartResponse> {
    const currentItems = [...this.cartItems()];
    const existingItem = currentItems.find((i) => i.productId === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      currentItems.push({ productId, quantity } as CartItemDto);
    }

    return this.updateCart(currentItems.map(i => ({ productId: i.productId, quantity: i.quantity })));
  }

  decreaseFromCart(productId: number): Observable<CartResponse> {
    const currentItems = [...this.cartItems()];
    const existingItem = currentItems.find((i) => i.productId === productId);

    if (existingItem) {
      if (existingItem.quantity > 1) {
        existingItem.quantity -= 1;
        return this.updateCart(currentItems.map(i => ({ productId: i.productId, quantity: i.quantity })));
      } else {
        return this.removeFromCart(productId);
      }
    }

    return this.updateCart(currentItems.map(i => ({ productId: i.productId, quantity: i.quantity })));
  }

  removeFromCart(productId: number): Observable<CartResponse> {
    const currentItems = this.cartItems().filter((i) => i.productId !== productId);
    return this.updateCart(currentItems.map(i => ({ productId: i.productId, quantity: i.quantity })));
  }
}
