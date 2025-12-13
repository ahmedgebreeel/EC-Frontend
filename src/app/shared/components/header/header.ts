import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services';
import { RoleType } from '../../../core/Types/roleType';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
showUserDropdown: boolean = false;
RoleType = RoleType;
constructor(
  public readonly cartService: CartService, 
  public readonly authService: AuthService
) {}
  toggleUserDropdown() {
    this.showUserDropdown = !this.showUserDropdown;
  }
}
