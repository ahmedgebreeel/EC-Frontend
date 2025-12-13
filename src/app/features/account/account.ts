import { Component} from '@angular/core';
import { RouterLink } from "@angular/router";
import { AuthService } from '../../core/services';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-account',
    imports: [RouterLink],
    templateUrl: './account.html',
    styleUrl: './account.css',
})
export class Account {
    constructor(
        private readonly authService: AuthService,
        private readonly toastr: ToastrService
    ){}

    logout() {
        this.authService.logout().subscribe({
            next: (res) => {
                console.log(res);
                this.toastr.success('Logout successful!');
                // window.location.reload()
            },
            error: (err) => {
                console.log(err);
                this.toastr.error(err.error);
            }
        });
    }
    
}