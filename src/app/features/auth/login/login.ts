import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  passwordFieldType: string = 'password';
   isActive: boolean = false; 
   password: string = '';
   loading: boolean = false;
   
  togglePassword() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
    this.isActive = !this.isActive;
  }
  onlogin() {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
            alert('Login successful!');
    }, 3000);
  }
}
