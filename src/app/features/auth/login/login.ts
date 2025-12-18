import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'
import { Router, RouterLink } from "@angular/router";
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services';
import { RoleType } from '../../../core/Types/roleType';

@Component({
  selector: 'app-login',
  imports: [FormsModule, NgClass, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  showPassword = false;
  rememberMe = false;
  email = '';
  password = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly toastr: ToastrService
  ) { }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  login(): void {
    if (!this.email || !this.password) {
      return;
    }

    this.authService.login(this.email, this.password, this.rememberMe).subscribe({
      next: (res) => {
        this.authService.setAuthState(res);
        this.toastr.success('Login successful!');

        const isAdminOrSeller = res.user.roles.includes(RoleType.Admin) || res.user.roles.includes(RoleType.Seller);
        this.router.navigate([isAdminOrSeller ? '/admin' : '/home']);
      }
    });
  }
}
