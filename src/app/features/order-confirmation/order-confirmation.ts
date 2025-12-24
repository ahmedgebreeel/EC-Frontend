import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from "@angular/router";
import { OrderConfirmationResponse } from '../../core/models';

@Component({
  selector: 'app-order-confirmation',
  imports: [RouterLink, CommonModule],
  templateUrl: './order-confirmation.html',
  styleUrl: './order-confirmation.css',
})
export class OrderConfirmation implements OnInit {
  private router = inject(Router);
  order: OrderConfirmationResponse | null = null;

  ngOnInit() {
    this.order = history.state?.order || null;
  }
}
