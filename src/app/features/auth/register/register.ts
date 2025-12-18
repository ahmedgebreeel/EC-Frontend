import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from "@angular/router";
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  imports: [RouterLink, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  showPassword = false;

  constructor(
    private readonly authService: AuthService,
    private readonly toastr: ToastrService,
    private readonly router: Router
  ) { }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  register(form: NgForm): void {
    if (form.invalid) {
      return;
    }

    const { firstName, lastName, email, phone, password } = form.value;
    const userName = email.split('@')[0];

    this.authService.register(firstName, lastName, userName, email, phone, password).subscribe({
      next: () => {
        this.toastr.success('Registration successful! Please login.');
        this.router.navigate(['/login']);
      }
    });
  }
}

