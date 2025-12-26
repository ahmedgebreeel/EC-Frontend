//Angular Imports
import { inject } from "@angular/core";
//Libraries
import { firstValueFrom } from "rxjs";
//Services
import { AuthService, CartService } from "../services";

export async function authInitializer() {
  //Services
  const authService = inject(AuthService);
  const cartService = inject(CartService);

  try {
    const res = await firstValueFrom(authService.refreshToken());
    if (res) {
      authService.setAuthState(res);
      cartService.getUserCart().subscribe();
    }
  } catch {
    authService.clearAuthState();
  }
}
