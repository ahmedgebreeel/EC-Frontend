import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { AuthService } from '../../core/services';

@Component({
    selector: 'app-account',
    imports: [RouterLink],
    templateUrl: './account.html',
    styleUrl: './account.css',
})
export class Account {
    constructor(
        private readonly authService: AuthService
    ) { }

    logout() {
        this.authService.logout();
    }
}
