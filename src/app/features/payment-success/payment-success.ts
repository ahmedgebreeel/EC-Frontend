import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PaymentService } from '../../core/services/payment.service';

@Component({
  selector: 'app-payment-success',
  imports: [RouterLink],
  templateUrl: './payment-success.html',
  styleUrl: './payment-success.css',
})
export class PaymentSuccess implements OnInit {
  sessionId: string = '';
  paymentDetails: any = null;
  isLoading = signal(true);
  errorMessage = '';

  constructor(
    private route:ActivatedRoute,
    private paymentService:PaymentService,
  ){}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params=>{
      this.sessionId = params['sessionId'];
      console.log('Session ID from URL:', this.sessionId);
      if(this.sessionId){
        this.verifyPayment();

      }
      else{
        this.errorMessage = 'No session ID found in the URL.';
        this.isLoading.set(false);
      }

  });  }

  verifyPayment():void{
    this.paymentService.verifsSession(this.sessionId).subscribe({
      next:(details)=>{
        this.paymentDetails = details;
        this.isLoading.set(false);
        // redirect to order confirmation after verification
        // this.router.navigate(['/orderconfirmation']);
        console.log('Payment details:',details);
      },
      error:(error)=>{
        console.error('Payment verification error:', error);
        this.errorMessage = error?.error?.message || 'An error occurred while verifying payment.';
        this.isLoading.set(false);
      }
    });
  }


}
