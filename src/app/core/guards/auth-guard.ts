//Angular Imports
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
//Libraries
import { ToastrService } from 'ngx-toastr';
//Services
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  //Angular
  const router = inject(Router);
  //Libraries
  const toastr = inject(ToastrService);
  //Services
  const authService = inject(AuthService);

  if (authService.user()) {
    return true;
  }

  toastr.info('Please login first');
  router.navigate(['/login']);
  return false;
};
