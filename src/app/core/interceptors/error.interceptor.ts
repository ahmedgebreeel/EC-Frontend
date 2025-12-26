//Angular Imports
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
//Libraries
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
//Models
import { ApiError } from '../models';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  //Libraries
  const toastr = inject(ToastrService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const errorMessage = getErrorMessage(error);

      const isRefreshToken = req.url.includes('refresh-token');
      const isRegisterValidation = req.url.includes('auth/register') &&
        (error.status === 400 || error.status === 409);
      const isLoginError = req.url.includes('auth/login') && error.status === 401;

      if (!isRefreshToken && !isRegisterValidation && !isLoginError) {
        toastr.error(errorMessage);
      }
      return throwError(() => error);
    })
  );
};

function getErrorMessage(error: HttpErrorResponse): string {
  const apiError = error.error as ApiError;

  if (apiError?.message) {
    return apiError.message;
  }

  if (apiError?.detail) {
    return apiError.detail;
  }

  if (error.status === 0) {
    return 'Unable to connect to server. Please check your internet connection.';
  }

  return 'An unexpected error occurred. Please try again.';
}
