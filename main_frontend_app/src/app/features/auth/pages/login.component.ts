import { AfterViewInit, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, LoginPayload } from '../../../core/services/auth.service';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="auth-wrap" role="region" aria-labelledby="login-heading">
    <div class="card" role="form" aria-describedby="login-help">
      <h1 id="login-heading" class="h2">Welcome back</h1>
      <p id="login-help" class="subtle">Sign in to continue</p>

      <form (ngSubmit)="submit(form)" #form="ngForm" class="form" novalidate>
        <div class="field">
          <label for="email">Email</label>
          <input
            id="email"
            class="input"
            name="email"
            [(ngModel)]="model.email"
            #emailModel="ngModel"
            type="email"
            required
            autocomplete="username"
            placeholder="you@example.com"
            aria-required="true"
            [attr.aria-invalid]="emailModel.invalid && (emailModel.touched || form.submitted) ? 'true' : 'false'"
            [attr.aria-describedby]="emailErrorId"
          />
          <small
            class="alert alert-error"
            *ngIf="emailModel.invalid && (emailModel.touched || form.submitted)"
            [id]="emailErrorId"
            role="alert"
            aria-live="polite"
          >
            Please enter a valid email address.
          </small>
        </div>

        <div class="field">
          <label for="password">Password</label>
          <input
            id="password"
            class="input"
            name="password"
            [(ngModel)]="model.password"
            #passwordModel="ngModel"
            type="password"
            required
            autocomplete="current-password"
            placeholder="••••••••"
            aria-required="true"
            [attr.aria-invalid]="passwordModel.invalid && (passwordModel.touched || form.submitted) ? 'true' : 'false'"
            [attr.aria-describedby]="passwordErrorId"
          />
          <small
            class="alert alert-error"
            *ngIf="passwordModel.invalid && (passwordModel.touched || form.submitted)"
            [id]="passwordErrorId"
            role="alert"
            aria-live="polite"
          >
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
          {{ pending ? 'Signing in…' : 'Login' }}
        </button>
      </form>

      <div class="links" aria-label="Helpful links">
        <a class="link" routerLink="/auth/forgot-password">Forgot password?</a>
      </div>

      <p
        class="alert alert-error"
        *ngIf="error"
        role="alert"
        aria-live="polite"
      >
        {{ error }}
      </p>
    </div>
  </div>
  `,
  styles: [`
  :host{display:block}
  .auth-wrap{
    display:grid; place-items:center; min-height:calc(100dvh - 56px);
    padding:1rem;
    background: radial-gradient(1200px 600px at 0% -10%, rgba(124,58,237,.12), transparent 60%),
                radial-gradient(1200px 600px at 100% 110%, rgba(13,148,136,.12), transparent 60%);
  }
  .card{ width:100%; max-width:420px; }
  .links{margin-top:.75rem; display:flex; justify-content:flex-end}
  `]
})
export class LoginComponent implements AfterViewInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  model: LoginPayload = { email: '', password: '' };
  error = '';
  pending = false;

  emailErrorId = 'email-error';
  passwordErrorId = 'password-error';

  @ViewChild('form') formRef?: NgForm;
  @ViewChild('emailModel') emailModelRef?: NgModel;
  @ViewChild('passwordModel') passwordModelRef?: NgModel;

  ngAfterViewInit(): void {
    // Focus heading when view is ready (main region is already focused via app component)
    if (isPlatformBrowser(this.platformId)) {
      const heading = (globalThis as any).document?.getElementById?.('login-heading');
      heading?.focus?.();
    }
  }

  // PUBLIC_INTERFACE
  submit(form: NgForm) {
    /** Submits credentials to backend and handles OTP requirement. Also focuses first invalid field on error. */
    this.error = '';
    if (form.invalid) {
      this.focusFirstInvalid(form);
      return;
    }

    this.pending = true;
    this.auth.login(this.model).subscribe({
      next: (res) => {
        this.pending = false;
        if (res?.requiresOtp) {
          this.router.navigate(['/auth/otp'], { queryParams: { email: this.model.email } });
        } else if (res?.token) {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (e) => {
        this.pending = false;
        this.error = e?.error?.message || 'Login failed';
      }
    });
  }

  private focusFirstInvalid(form: NgForm) {
    const controls = Object.values(form.controls);
    for (const c of controls) {
      if (c.invalid) {
        const el = (c as any).valueAccessor?._elementRef?.nativeElement as HTMLElement | undefined;
        if (el?.focus) { el.focus(); }
        break;
      }
    }
  }
}
