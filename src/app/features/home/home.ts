import { AfterViewInit, Component } from '@angular/core';
import { RouterLink } from "@angular/router";

declare const AOS: any;

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements AfterViewInit {
  ngAfterViewInit(): void {
    // Refresh AOS to detect already-visible elements after navigation
    if (typeof AOS !== 'undefined') {
      setTimeout(() => AOS.refresh(), 100);
    }
  }
}
