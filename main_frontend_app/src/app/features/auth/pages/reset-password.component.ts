import { AfterViewInit, Component, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, ResetPayload } from '../../../core/services/auth.service';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="auth-wrap" role="region" aria-labelledby="reset-heading">
    <div class="card" role="form" aria-describedby="reset-help">
      <h1 id="reset-heading" class="h2">Reset password</h1>
      <p id="reset-help" class="subtle">Enter your new password</p>

      <form (ngSubmit)="submit(form)" #form="ngForm" class="form" novalidate>
        <div class="field">
          <label for="new-password">New password</label>
          <input
            id="new-password"
            class="input"
            name="password"
            [(ngModel)]="password"
            #passwordModel="ngModel"
            type="password"
            required
            placeholder="••••••••"
            aria-required="true"
            [attr.aria-invalid]="passwordModel.invalid && (passwordModel.touched || form.submitted) ? 'true' : 'false'"
          />
          <small class="alert alert-error" *ngIf="passwordModel.invalid && (passwordModel.touched || form.submitted)" role="alert" aria-live="polite">
            Password is required.
          </small>
        </div>

        <button
          class="btn btn-primary"
          type="submit"
          [disabled]="form.invalid || pending"
          [attr.aria-disabled]="(form.invalid || pending) ? 'true' : null"
          [attr.aria-busy]="pending ? 'true' : null"
        >
          {{ pending ? 'Resetting…' : 'Reset password' }}
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
export class ResetPasswordComponent implements AfterViewInit {
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  token = this.route.snapshot.queryParamMap.get('token') || '';
  password = '';
  message = '';
  error = '';
  pending = false;

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      (globalThis as any).document?.getElementById?.('reset-heading')?.focus?.();
    }
  }

  // PUBLIC_INTERFACE
  submit(form: NgForm) {
    /** Submits new password with token to backend and routes to login on success. */
    this.message = '';
    this.error = '';
    if (form.invalid) {
      if (isPlatformBrowser(this.platformId)) {
        const el = (globalThis as any).document?.getElementById?.('new-password') as HTMLElement | null;
        el?.focus?.();
      }
      return;
    }
    const payload: ResetPayload = { token: this.token, password: this.password };
    this.pending = true;
    this.auth.resetPassword(payload).subscribe({
      next: (res) => {
        this.pending = false;
        this.message = res.message || 'Password reset successfully';
        (globalThis as any).setTimeout(() => this.router.navigate(['/auth/login']), 900);
      },
      error: (e) => { this.pending = false; this.error = e?.error?.message || 'Reset failed'; }
    });
  }
}
