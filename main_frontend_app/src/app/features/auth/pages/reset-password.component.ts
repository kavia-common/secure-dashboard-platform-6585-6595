import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, ResetPayload } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="auth-wrap">
    <div class="card">
      <h2>Reset password</h2>
      <p class="sub">Enter your new password</p>

      <form (ngSubmit)="submit()" #form="ngForm">
        <label>New password</label>
        <input name="password" [(ngModel)]="password" type="password" required placeholder="••••••••"/>

        <button class="primary" [disabled]="form.invalid">Reset password</button>
      </form>

      <p class="success" *ngIf="message">{{ message }}</p>
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
  .success{margin-top:.75rem; color:#0D9488}
  .error{margin-top:.75rem; color:#EF4444}
  `]
})
export class ResetPasswordComponent {
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  private router = inject(Router);

  token = this.route.snapshot.queryParamMap.get('token') || '';
  password = '';
  message = '';
  error = '';

  // PUBLIC_INTERFACE
  submit() {
    /** Submits new password with token to backend and routes to login on success. */
    this.message = '';
    this.error = '';
    const payload: ResetPayload = { token: this.token, password: this.password };
    this.auth.resetPassword(payload).subscribe({
      next: (res) => {
        this.message = res.message || 'Password reset successfully';
        (globalThis as any).setTimeout(() => this.router.navigate(['/auth/login']), 900);
      },
      error: (e) => this.error = e?.error?.message || 'Reset failed'
    });
  }
}
