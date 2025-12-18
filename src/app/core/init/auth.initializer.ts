import { inject } from "@angular/core";
import { AuthService } from "../services";
import { firstValueFrom } from "rxjs";

export async function authInitializer() {
  const authService = inject(AuthService);

  try {
    const res = await firstValueFrom(authService.refreshToken());
    if (res) {
      authService.setAuthState(res);
    }
  } catch {
    // No valid refresh token - user will need to log in
    authService.clearAuthState();
  }
}

