import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

export const orderConfirmationGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const toastr = inject(ToastrService);

    // Check if navigation came with order data (from checkout)
    const navigation = router.getCurrentNavigation();
    const order = navigation?.extras?.state?.['order'];

    if (order) {
        return true;
    }

    toastr.warning('No order found');
    router.navigate(['/home']);
    return false;
};
