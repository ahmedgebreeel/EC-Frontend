import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);

  if (authService.user()) {
    console.log(authService.user());

    return true;
  }

  toastr.info('Please login first');
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};
