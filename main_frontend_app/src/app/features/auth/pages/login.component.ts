import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, LoginPayload } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="auth-wrap">
    <div class="card">
      <h2>Welcome back</h2>
      <p class="sub">Sign in to continue</p>

      <form (ngSubmit)="submit()" #form="ngForm">
        <label>Email</label>
        <input name="email" [(ngModel)]="model.email" type="email" required placeholder="you@example.com"/>

        <label>Password</label>
        <input name="password" [(ngModel)]="model.password" type="password" required placeholder="••••••••"/>

        <button class="primary" [disabled]="form.invalid">Login</button>
      </form>

      <div class="links">
        <a routerLink="/auth/forgot-password">Forgot password?</a>
      </div>

      <p class="error" *ngIf="error">{{ error }}</p>
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
  .card{
    width:100%; max-width:420px; background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:1.25rem 1.25rem 1rem;
    box-shadow: 0 10px 30px rgba(17,24,39,0.06);
  }
  h2{margin:0; color:#111827}
  .sub{color:#6b7280; margin:.25rem 0 1rem}
  form{display:grid; gap:.6rem}
  label{font-size:.85rem; color:#374151}
  input{
    padding:.6rem .7rem; border:1px solid #e5e7eb; border-radius:8px; outline:none;
  }
  input:focus{border-color:#7C3AED; box-shadow:0 0 0 3px rgba(124,58,237,.15)}
  .primary{
    margin-top:.25rem;
    background:#7C3AED; color:#fff; border:none; border-radius:8px; padding:.6rem .8rem; cursor:pointer;
  }
  .primary:disabled{opacity:.6; cursor:not-allowed}
  .links{margin-top:.75rem; display:flex; justify-content:flex-end}
  .links a{color:#7C3AED; text-decoration:none}
  .error{margin-top:.75rem; color:#EF4444}
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  model: LoginPayload = { email: '', password: '' };
  error = '';

  // PUBLIC_INTERFACE
  submit() {
    /** Submits credentials to backend and handles OTP requirement. */
    this.error = '';
    this.auth.login(this.model).subscribe({
      next: (res) => {
        if (res.requiresOtp) {
          this.router.navigate(['/auth/otp'], { queryParams: { email: this.model.email } });
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (e) => this.error = e?.error?.message || 'Login failed'
    });
  }
}
