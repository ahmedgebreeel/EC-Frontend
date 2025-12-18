import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services';
import { isTokenExpired } from '../../utils/checkToken';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

// Shared state across all interceptor invocations
let isRefreshing = false;
let refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);
  req = req.clone({ withCredentials: true });

  // Skip auth for these endpoints
  if (req.url.includes('refresh-token') || req.url.includes('login') || req.url.includes('register')) {
    return next(req);
  }

  const token = localStorage.getItem('accessToken');
  if (!token) {
    return next(req);
  }

  // Token is still valid - attach it and proceed
  if (!isTokenExpired(token)) {
    return next(addTokenToRequest(req, token));
  }

  // Token is expired - handle refresh with concurrency prevention
  if (!isRefreshing) {
    // First request to detect expired token - trigger refresh
    isRefreshing = true;
    refreshTokenSubject.next(null); // Reset the subject

    return authService.refreshToken().pipe(
      switchMap((res) => {
        isRefreshing = false;
        authService.setAuthState(res);
        refreshTokenSubject.next(res.accessToken); // Notify all waiting requests
        return next(addTokenToRequest(req, res.accessToken));
      }),
      catchError((err) => {
        isRefreshing = false;
        refreshTokenSubject.next(null);
        authService.clearAuthState();

        // Notify user and redirect to login
        toastr.warning('Your session has expired. Please log in again.');
        router.navigate(['/login']);

        return throwError(() => err);
      })
    );
  } else {
    // Refresh already in progress - wait for it to complete
    return refreshTokenSubject.pipe(
      filter((token): token is string => token !== null), // Wait until we have a token
      take(1), // Only take one value
      switchMap((token) => next(addTokenToRequest(req, token)))
    );
  }
};

// Helper function to add token to request
function addTokenToRequest(req: Parameters<HttpInterceptorFn>[0], token: string) {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

