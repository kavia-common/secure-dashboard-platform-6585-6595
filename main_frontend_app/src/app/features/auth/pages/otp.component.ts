import { AfterViewInit, Component, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="auth-wrap" role="region" aria-labelledby="otp-heading">
    <div class="card" role="form" aria-describedby="otp-help">
      <h1 id="otp-heading" class="h2">Two-factor verification</h1>
      <p id="otp-help" class="subtle">Enter the 6-digit code sent to {{email}}</p>

      <form (ngSubmit)="submit(form)" #form="ngForm" class="form" novalidate>
        <div class="field">
          <label for="otp">OTP Code</label>
          <input
            id="otp"
            class="input"
            name="otp"
            [(ngModel)]="otp"
            #otpModel="ngModel"
            required
            maxlength="6"
            inputmode="numeric"
            pattern="\\d{6}"
            placeholder="123456"
            aria-required="true"
            [attr.aria-invalid]="otpModel.invalid && (otpModel.touched || form.submitted) ? 'true' : 'false'"
            aria-describedby="otp-hint"
          />
          <small id="otp-hint" class="subtle">6 digits</small>
          <small class="alert alert-error" *ngIf="otpModel.invalid && (otpModel.touched || form.submitted)" role="alert" aria-live="polite">
            Enter a 6-digit code.
          </small>
        </div>

        <button
          class="btn btn-primary"
          type="submit"
          [disabled]="form.invalid || pending"
          [attr.aria-disabled]="(form.invalid || pending) ? 'true' : null"
          [attr.aria-busy]="pending ? 'true' : null"
        >
          {{ pending ? 'Verifying…' : 'Verify' }}
        </button>
      </form>

      <p class="alert alert-error" *ngIf="error" role="alert" aria-live="polite">{{ error }}</p>
    </div>
  </div>
  `,
  styles: [`
    :host{display:block}
    .auth-wrap{display:grid; place-items:center; min-height:calc(100dvh - 56px); padding:1rem;}
    .card{ width:100%; max-width:420px; }
  `]
})
export class OtpComponent implements AfterViewInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);

  email = this.route.snapshot.queryParamMap.get('email') || '';
  otp = '';
  error = '';
  pending = false;

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      (globalThis as any).document?.getElementById?.('otp-heading')?.focus?.();
    }
  }

  // PUBLIC_INTERFACE
  submit(form: NgForm) {
    /** Submits OTP code to backend and navigates to dashboard on success. */
    this.error = '';
    if (form.invalid) {
      if (isPlatformBrowser(this.platformId)) {
        const el = (globalThis as any).document?.getElementById?.('otp') as HTMLElement | null;
        el?.focus?.();
      }
      return;
    }
    this.pending = true;
    console.info('[OTP] Verifying code for', this.email);
    this.auth.verifyOtp({ email: this.email, otp: this.otp }).subscribe({
      next: () => { this.pending = false; console.info('[OTP] Verification success'); this.router.navigate(['/dashboard']); },
      error: (e) => {
        this.pending = false;
        console.error('[OTP] Verification failed', {
          message: e?.message,
          status: e?.status,
          statusText: e?.statusText,
          error: e?.error
        });
        this.error = e?.error?.message || (e?.status === 0 ? 'Network error or CORS blocked' : 'OTP verification failed');
      }
    });
  }
}
