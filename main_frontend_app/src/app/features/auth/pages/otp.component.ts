import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="auth-wrap">
    <div class="card">
      <h2>Two-factor verification</h2>
      <p class="sub">Enter the 6-digit code sent to {{email}}</p>

      <form (ngSubmit)="submit()" #form="ngForm">
        <label>OTP Code</label>
        <input name="otp" [(ngModel)]="otp" required maxlength="6" placeholder="123456"/>

        <button class="primary" [disabled]="form.invalid">Verify</button>
      </form>

      <p class="error" *ngIf="error">{{ error }}</p>
    </div>
  </div>
  `,
  styles: [`
    :host{display:block}
    .auth-wrap{display:grid; place-items:center; min-height:calc(100dvh - 56px); padding:1rem;}
    .card{width:100%; max-width:420px; background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:1.25rem;
      box-shadow: 0 10px 30px rgba(17,24,39,0.06);}
    h2{margin:0; color:#111827}
    .sub{color:#6b7280; margin:.25rem 0 1rem}
    form{display:grid; gap:.6rem}
    input{padding:.6rem .7rem; border:1px solid #e5e7eb; border-radius:8px}
    .primary{margin-top:.25rem; background:#7C3AED; color:#fff; border:none; border-radius:8px; padding:.6rem .8rem; cursor:pointer;}
    .error{margin-top:.75rem; color:#EF4444}
  `]
})
export class OtpComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = this.route.snapshot.queryParamMap.get('email') || '';
  otp = '';
  error = '';

  // PUBLIC_INTERFACE
  submit() {
    /** Submits OTP code to backend and navigates to dashboard on success. */
    this.error = '';
    this.auth.verifyOtp({ email: this.email, otp: this.otp }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (e) => this.error = e?.error?.message || 'OTP verification failed'
    });
  }
}
