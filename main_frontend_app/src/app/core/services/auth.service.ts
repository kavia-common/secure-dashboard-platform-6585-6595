import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';

/**
 * Typings for auth-related payloads and responses.
 */
export interface LoginPayload { email: string; password: string; }
export interface OtpPayload { email: string; otp: string; otpToken: string; }
export interface ForgotPayload { email: string; }
export interface ResetPayload { token: string; password: string; }
export interface AuthResponse { token?: string; requiresOtp?: boolean; otpToken?: string; }

/**
 * PUBLIC_INTERFACE
 * AuthService manages authentication flows and token storage.
 * Uses SSR-safe guards when accessing browser storage.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly OTP_TOKEN_KEY = 'otp_token';
  private platformId = inject(PLATFORM_ID);
  // Fallback in-memory tokens for SSR to avoid ReferenceError
  private memoryToken: string | null = null;
  private memoryOtpToken: string | null = null;

  private _isAuthed = signal<boolean>(this.getToken() !== null);

  constructor(private api: ApiService) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // PUBLIC_INTERFACE
  login(payload: LoginPayload): Observable<AuthResponse> {
    /**
     * Calls login endpoint. If backend indicates OTP is required, stores otpToken.
     * If a JWT token is returned directly, store it and mark authenticated.
     */
    return this.api.post<AuthResponse>('/auth/login', payload).pipe(
      tap(res => {
        if (res?.requiresOtp && res?.otpToken) {
          this.setOtpToken(res.otpToken);
        }
        if (res?.token) {
          this.setToken(res.token);
        }
      })
    );
  }

  // PUBLIC_INTERFACE
  verifyOtp(payload: { email: string; otp: string }): Observable<AuthResponse> {
    /**
     * Verifies OTP with backend. Uses stored otpToken from login step.
     * On success, stores JWT token.
     */
    const otpToken = this.getOtpToken();
    const body: OtpPayload = { email: payload.email, otp: payload.otp, otpToken: otpToken || '' };
    return this.api.post<AuthResponse>('/auth/verify-otp', body).pipe(
      tap(res => {
        if (res?.token) {
          this.setToken(res.token);
          // clear otp token once fully authenticated
          this.clearOtpToken();
        }
      })
    );
  }

  // PUBLIC_INTERFACE
  forgotPassword(payload: ForgotPayload) {
    /** Triggers forgot-password flow. */
    return this.api.post<{ message: string }>('/auth/forgot-password', payload);
  }

  // PUBLIC_INTERFACE
  resetPassword(payload: ResetPayload) {
    /** Completes reset password flow. */
    return this.api.post<{ message: string }>('/auth/reset-password', payload);
  }

  // PUBLIC_INTERFACE
  logout(): void {
    /** Clears auth and OTP tokens and marks user as logged-out. */
    if (this.isBrowser()) {
      (globalThis as any).localStorage?.removeItem(this.TOKEN_KEY);
      (globalThis as any).localStorage?.removeItem(this.OTP_TOKEN_KEY);
    } else {
      this.memoryToken = null;
      this.memoryOtpToken = null;
    }
    this._isAuthed.set(false);
  }

  // PUBLIC_INTERFACE
  isAuthenticated(): boolean {
    /** Returns if an auth token is present. */
    return this._isAuthed();
  }

  // PUBLIC_INTERFACE
  getToken(): string | null {
    /** Retrieves the stored auth token. SSR-safe. */
    if (this.isBrowser()) {
      try {
        return (globalThis as any).localStorage?.getItem(this.TOKEN_KEY) ?? null;
      } catch {
        return null;
      }
    }
    return this.memoryToken;
  }

  private setToken(token: string) {
    if (this.isBrowser()) {
      try {
        (globalThis as any).localStorage?.setItem(this.TOKEN_KEY, token);
      } catch {
        // ignore storage errors (private mode, quota, etc.)
      }
    } else {
      this.memoryToken = token;
    }
    this._isAuthed.set(true);
  }

  private setOtpToken(token: string) {
    if (this.isBrowser()) {
      try {
        (globalThis as any).localStorage?.setItem(this.OTP_TOKEN_KEY, token);
      } catch {
        // ignore storage errors
      }
    } else {
      this.memoryOtpToken = token;
    }
  }

  private getOtpToken(): string | null {
    if (this.isBrowser()) {
      try {
        return (globalThis as any).localStorage?.getItem(this.OTP_TOKEN_KEY) ?? null;
      } catch {
        return null;
      }
    }
    return this.memoryOtpToken;
  }

  private clearOtpToken() {
    if (this.isBrowser()) {
      try {
        (globalThis as any).localStorage?.removeItem(this.OTP_TOKEN_KEY);
      } catch {
        // ignore storage errors
      }
    } else {
      this.memoryOtpToken = null;
    }
  }
}
