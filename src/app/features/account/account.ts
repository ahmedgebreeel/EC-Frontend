import { Component, OnInit, signal} from '@angular/core';
import { RouterLink } from "@angular/router";
import { AuthService } from '../../core/services';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-account',
    imports: [RouterLink],
    templateUrl: './account.html',
    styleUrl: './account.css',
})
export class Account implements OnInit {
    user = signal<any>(null);
    constructor(
        private readonly authService: AuthService,
        private readonly toastr: ToastrService
    ){}

    ngOnInit() {
        this.user.set(this.authService.user());
    }

    logout() {
        this.authService.logout().subscribe({
            next: (res) => {
                console.log(res);
                localStorage.clear();
                this.authService.user.set(null);
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