import { AfterViewInit, Component, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PLATFORM_ID } from '@angular/core';

/**
 * OTP verification component.
 * Includes a mock-mode banner that displays the current OTP when MockAuthService is active.
 */
@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="auth-wrap" role="region" aria-labelledby="otp-heading">
    <div class="card" role="form" aria-describedby="otp-help">
      <h1 id="otp-heading" class="h2">Two-factor verification</h1>
      <p id="otp-help" class="subtle">Enter the 6-digit code sent to {{email}}</p>

      <!-- Mock-mode OTP helper (non-production) -->
      <section
        *ngIf="showMockOtp"
        class="alert alert-success"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        id="mock-otp-banner"
        style="margin-bottom:.5rem"
      >
        <strong>Mock Mode:</strong>
        <span>Your OTP is <code>{{ currentOtp || '—' }}</code></span>
      </section>

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
export class OtpComponent implements AfterViewInit, OnDestroy {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);

  email = this.route.snapshot.queryParamMap.get('email') || '';
  otp = '';
  error = '';
  pending = false;

  // SSR-safe flags/state for mock OTP banner
  showMockOtp = false;
  currentOtp: string | null = null;

  // handle to our polling timer in browser only
  private pollTimer: any = null;

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      (globalThis as any).document?.getElementById?.('otp-heading')?.focus?.();
      this.initMockOtpBannerIfNeeded();
    }
  }

  ngOnDestroy(): void {
    if (this.pollTimer) {
      try { (globalThis as any).clearInterval?.(this.pollTimer); } catch { /* noop */ }
      this.pollTimer = null;
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

  /**
   * Initializes mock OTP banner only when running in browser and MockAuthService is active.
   * Uses a shallow duck-typing check for getCurrentOtp().
   */
  private initMockOtpBannerIfNeeded(): void {
    try {
      const g: any = globalThis as any;
      // Determine if MockAuthService is in use via ENV initializer logs or property duck-typing.
      // We prefer duck-typing to avoid importing the mock class here.
      const maybeMock = this.auth as any;
      const isMock =
        typeof maybeMock?.login === 'function' &&
        typeof maybeMock?.verifyOtp === 'function' &&
        // MockAuthService implements a non-standard helper we'll read if present:
        // We'll read current OTP via a safe accessor this.getOtpFromMock().
        (typeof maybeMock?.['__isMockAuth'] === 'boolean' || typeof maybeMock?.getCurrentOtp === 'function' || typeof maybeMock?.['currentOtp'] !== 'undefined');

      if (!isMock) {
        this.showMockOtp = false;
        return;
      }

      this.showMockOtp = true;
      this.updateCurrentOtpFromMock();

      // Poll periodically to reflect newly generated OTPs after re-login attempts
      // Keep interval modest for performance; announce changes via aria-live.
      this.pollTimer = g.setInterval?.(() => this.updateCurrentOtpFromMock(), 1000);
    } catch {
      this.showMockOtp = false;
    }
  }

  /**
   * Reads the OTP value from the mock auth service using a safe accessor if present.
   */
  private updateCurrentOtpFromMock(): void {
    try {
      const anyAuth = this.auth as any;
      let value: string | null = null;

      if (typeof anyAuth.getCurrentOtp === 'function') {
        value = anyAuth.getCurrentOtp();
      } else if (typeof anyAuth.readCurrentOtp === 'function') {
        value = anyAuth.readCurrentOtp();
      } else if (typeof anyAuth['currentOtp'] !== 'undefined') {
        value = anyAuth['currentOtp'] ?? null;
      }

      // normalize to 6-digit string or null
      if (typeof value === 'string' && /^\d{6}$/.test(value)) {
        this.currentOtp = value;
      } else {
        this.currentOtp = null;
      }
    } catch {
      this.currentOtp = null;
    }
  }
}
