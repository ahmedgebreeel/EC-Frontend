import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services';
import { RoleType } from '../../../core/types/role.type';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  showUserDropdown = false;
  RoleType = RoleType;

  constructor(
    public readonly cartService: CartService,
    public readonly authService: AuthService
  ) { }

  toggleUserDropdown(): void {
    this.showUserDropdown = !this.showUserDropdown;
  }

  logout(): void {
    this.authService.logout();
  }
}
