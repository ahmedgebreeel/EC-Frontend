import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const checkoutGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);

    // Check if navigation came with valid state (from cart)
    const navigation = router.getCurrentNavigation();
    const fromCart = navigation?.extras?.state?.['fromCart'] === true;

    if (fromCart) {
        return true;
    }

    router.navigate(['/cart']);
    return false;
};
