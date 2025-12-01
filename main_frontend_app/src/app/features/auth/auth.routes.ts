import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login.component';
import { OtpComponent } from './pages/otp.component';
import { ForgotPasswordComponent } from './pages/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password.component';

/**
 * PUBLIC_INTERFACE
 * AUTH_ROUTES provides lazy-loaded routes for authentication.
 */
export const AUTH_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent, title: 'Login' },
  { path: 'otp', component: OtpComponent, title: 'Verify OTP' },
  { path: 'forgot-password', component: ForgotPasswordComponent, title: 'Forgot Password' },
  { path: 'reset-password', component: ResetPasswordComponent, title: 'Reset Password' },
];
