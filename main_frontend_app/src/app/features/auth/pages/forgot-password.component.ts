import { AfterViewInit, Component, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { AuthService, ForgotPayload } from '../../../core/services/auth.service';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="auth-wrap" role="region" aria-labelledby="forgot-heading">
    <div class="card" role="form" aria-describedby="forgot-help">
      <h1 id="forgot-heading" class="h2">Forgot password</h1>
      <p id="forgot-help" class="subtle">Enter your email to receive reset instructions</p>

      <form (ngSubmit)="submit(form)" #form="ngForm" class="form" novalidate>
        <div class="field">
          <label for="forgot-email">Email</label>
          <input
            id="forgot-email"
            class="input"
            name="email"
            [(ngModel)]="model.email"
            #emailModel="ngModel"
            type="email"
            required
            placeholder="you@example.com"
            aria-required="true"
            [attr.aria-invalid]="emailModel.invalid && (emailModel.touched || form.submitted) ? 'true' : 'false'"
          />
          <small class="alert alert-error" *ngIf="emailModel.invalid && (emailModel.touched || form.submitted)" role="alert" aria-live="polite">
            Please enter a valid email address.
          </small>
        </div>

        <button
          class="btn btn-primary"
          type="submit"
          [disabled]="form.invalid || pending"
          [attr.aria-disabled]="(form.invalid || pending) ? 'true' : null"
          [attr.aria-busy]="pending ? 'true' : null"
        >
          {{ pending ? 'Sending…' : 'Send link' }}
        </button>
      </form>

      <p class="alert alert-success" *ngIf="message" role="status" aria-live="polite">{{ message }}</p>
      <p class="alert alert-error" *ngIf="error" role="alert" aria-live="assertive">{{ error }}</p>
    </div>
  </div>
  `,
  styles: [`
  :host{display:block}
  .auth-wrap{display:grid; place-items:center; min-height:calc(100dvh - 56px); padding:1rem;}
  .card{ width:100%; max-width:420px; }
  `]
})
export class ForgotPasswordComponent implements AfterViewInit {
  private auth = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  model: ForgotPayload = { email: '' };
  message = '';
  error = '';
  pending = false;

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      (globalThis as any).document?.getElementById?.('forgot-heading')?.focus?.();
    }
  }

  // PUBLIC_INTERFACE
  submit(form: NgForm) {
    /** Initiates forgot password process and shows feedback message. */
    this.message = '';
    this.error = '';
    if (form.invalid) {
      if (isPlatformBrowser(this.platformId)) {
        const el = (globalThis as any).document?.getElementById?.('forgot-email') as HTMLElement | null;
        el?.focus?.();
      }
      return;
    }
    this.pending = true;
    this.auth.forgotPassword(this.model).subscribe({
      next: (res) => { this.pending = false; this.message = res.message || 'Check your email for the reset link.'; },
      error: (e) => { this.pending = false; this.error = e?.error?.message || 'Request failed'; }
    });
  }
}
