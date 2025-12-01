import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, ForgotPayload } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="auth-wrap">
    <div class="card">
      <h2>Forgot password</h2>
      <p class="sub">Enter your email to receive reset instructions</p>

      <form (ngSubmit)="submit()" #form="ngForm">
        <label>Email</label>
        <input name="email" [(ngModel)]="model.email" type="email" required placeholder="you@example.com"/>
        <button class="primary" [disabled]="form.invalid">Send link</button>
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
export class ForgotPasswordComponent {
  private auth = inject(AuthService);

  model: ForgotPayload = { email: '' };
  message = '';
  error = '';

  // PUBLIC_INTERFACE
  submit() {
    /** Initiates forgot password process and shows feedback message. */
    this.message = '';
    this.error = '';
    this.auth.forgotPassword(this.model).subscribe({
      next: (res) => this.message = res.message || 'Check your email for the reset link.',
      error: (e) => this.error = e?.error?.message || 'Request failed'
    });
  }
}
