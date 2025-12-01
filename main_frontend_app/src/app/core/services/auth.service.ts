import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';

/**
 * Typings for auth-related payloads and responses.
 */
export interface LoginPayload { email: string; password: string; }
export interface OtpPayload { email: string; otp: string; }
export interface ForgotPayload { email: string; }
export interface ResetPayload { token: string; password: string; }
export interface AuthResponse { token: string; requiresOtp?: boolean; }

/**
 * PUBLIC_INTERFACE
 * AuthService manages authentication flows and token storage.
 * Uses SSR-safe guards when accessing browser storage.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private platformId = inject(PLATFORM_ID);
  // Fallback in-memory token for SSR to avoid ReferenceError
  private memoryToken: string | null = null;

  private _isAuthed = signal<boolean>(this.getToken() !== null);

  constructor(private api: ApiService) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // PUBLIC_INTERFACE
  login(payload: LoginPayload): Observable<AuthResponse> {
    /** Calls login endpoint and stores token if returned. */
    return this.api.post<AuthResponse>('/auth/login', payload).pipe(
      tap(res => {
        if (res.token) {
          this.setToken(res.token);
        }
      })
    );
  }

  // PUBLIC_INTERFACE
  verifyOtp(payload: OtpPayload): Observable<AuthResponse> {
    /** Verifies OTP and stores token if provided by backend. */
    return this.api.post<AuthResponse>('/auth/otp', payload).pipe(
      tap(res => {
        if (res.token) {
          this.setToken(res.token);
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
    /** Clears auth token and marks user as logged-out. */
    if (this.isBrowser()) {
      (globalThis as any).localStorage?.removeItem(this.TOKEN_KEY);
    } else {
      this.memoryToken = null;
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
}
