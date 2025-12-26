import { Component } from '@angular/core';

@Component({
    selector: 'app-account-orders',
    imports: [],
    templateUrl: './orders.html',
    styleUrl: './orders.css',
})
export class AccountOrders {
    currentSort = 'Date: Newest First';
    currentFilter = 'All Orders';

    setSort(option: string): void {
        this.currentSort = option;
    }

    setFilter(option: string): void {
        this.currentFilter = option;
    }
}
