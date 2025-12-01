import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of, throwError, delay } from 'rxjs';
import {
  AuthService,
  AuthResponse,
  ForgotPayload,
  LoginPayload,
  ResetPayload,
} from './auth.service';

/**
 * PUBLIC_INTERFACE
 * MockAuthService simulates authentication flows entirely in-browser with an in-memory store.
 * It is designed to be a drop-in replacement for the real HTTP-backed AuthService methods by
 * returning the same Observable shapes and side effects (token storage, otp token).
 *
 * Seed user:
 *   email: demo@example.com
 *   password: Password123
 *
 * Behavior:
 * - login: validates credentials; on success, returns { requiresOtp: true, otpToken }
 * - verify-otp: validates OTP and otpToken and returns { token } (fake JWT)
 * - forgot-password: returns { message } and stores a reset token in memory
 * - reset-password: validates token and updates in-memory password
 */
@Injectable()
export class MockAuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly OTP_TOKEN_KEY = 'otp_token';
  private platformId = inject(PLATFORM_ID);

  // in-memory store for demo user and tokens (also mirrored to localStorage in browser)
  private user = { email: 'demo@example.com', password: 'Password123' };
  private currentOtp: string | null = null;
  private currentOtpToken: string | null = null;
  private resetTokenByEmail: Map<string, string> = new Map();

  private memoryToken: string | null = null;

  private _isAuthed = signal<boolean>(this.getToken() !== null);

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private randomOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private randomToken(prefix = 'tok'): string {
    const n = cryptoRandomString(24);
    return `${prefix}_${n}`;
  }

  // PUBLIC_INTERFACE
  login(payload: LoginPayload): Observable<AuthResponse> {
    /**
     * Simulates login: validates email/password against the demo user.
     * On success returns an OTP requirement and sets an otpToken in storage.
     */
    const { email, password } = payload || ({} as LoginPayload);
    if (email !== this.user.email || password !== this.user.password) {
      return delayError(500, { status: 401, error: { message: 'Invalid credentials' } });
    }

    // generate otp + otpToken
    this.currentOtp = this.randomOtp();
    this.currentOtpToken = this.randomToken('otp');
    // store otpToken like real service would
    this.setOtpToken(this.currentOtpToken);

    // For demo/dev, log the OTP to console
    console.info('[MockAuthService] OTP for', email, 'is', this.currentOtp);

    const res: AuthResponse = { requiresOtp: true, otpToken: this.currentOtpToken };
    return of(res).pipe(delay(500));
  }

  // PUBLIC_INTERFACE
  verifyOtp(payload: { email: string; otp: string }): Observable<AuthResponse> {
    /**
     * Simulates OTP verification using the stored otpToken.
     */
    const otpToken = this.getOtpToken();
    if (!otpToken || otpToken !== this.currentOtpToken) {
      return delayError(400, { status: 400, error: { message: 'Missing or invalid OTP token' } });
    }
    if (!payload?.otp || payload.otp !== this.currentOtp) {
      return delayError(401, { status: 401, error: { message: 'Invalid OTP' } });
    }

    // success -> issue fake JWT
    const fakeJwt = this.randomToken('jwt');
    this.setToken(fakeJwt);
    // clear otp state
    this.currentOtp = null;
    this.currentOtpToken = null;
    this.clearOtpToken();

    return of({ token: fakeJwt }).pipe(delay(500));
  }

  // PUBLIC_INTERFACE
  forgotPassword(payload: ForgotPayload) {
    /**
     * Simulates forgot-password by creating a reset token for the email.
     * Always returns success message to avoid user enumeration.
     */
    const email = payload?.email || '';
    const token = this.randomToken('reset');
    this.resetTokenByEmail.set(email, token);
    console.info('[MockAuthService] Reset token for', email, 'is', token);
    return of({ message: 'If the email exists, a reset token has been generated.' }).pipe(delay(500));
  }

  // PUBLIC_INTERFACE
  resetPassword(payload: ResetPayload) {
    /**
     * Simulates reset-password by validating the token and updating the in-memory password.
     */
    const { token, password } = payload || ({} as ResetPayload);
    let matchedEmail: string | null = null;
    for (const [email, t] of this.resetTokenByEmail.entries()) {
      if (t === token) {
        matchedEmail = email;
        break;
      }
    }
    if (!matchedEmail) {
      return delayError(400, { status: 400, error: { message: 'Invalid or expired token' } });
    }
    // if the email is our demo user, update the password
    if (matchedEmail === this.user.email) {
      this.user.password = password;
    }
    // clear token after use
    this.resetTokenByEmail.delete(matchedEmail);
    return of({ message: 'Password has been reset successfully' }).pipe(delay(500));
  }

  // PUBLIC_INTERFACE
  logout(): void {
    /** Clears stored auth tokens and marks user as logged out. */
    if (this.isBrowser()) {
      (globalThis as any).localStorage?.removeItem(this.TOKEN_KEY);
      (globalThis as any).localStorage?.removeItem(this.OTP_TOKEN_KEY);
    } else {
      this.memoryToken = null;
    }
    this._isAuthed.set(false);
  }

  // PUBLIC_INTERFACE
  isAuthenticated(): boolean {
    /** Returns whether a token is present. */
    return this._isAuthed();
  }

  // PUBLIC_INTERFACE
  getToken(): string | null {
    /** Retrieves the stored auth token. */
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
        // ignore
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
        // ignore
      }
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
    return null;
  }

  private clearOtpToken() {
    if (this.isBrowser()) {
      try {
        (globalThis as any).localStorage?.removeItem(this.OTP_TOKEN_KEY);
      } catch {
        // ignore
      }
    }
  }
}

/**
 * Small helper to simulate delayed errors in Observables with http-like shape.
 */
function delayError<T = any>(ms: number, httpErrorShape: any): Observable<T> {
  return new Observable<T>((subscriber) => {
    const g: any = globalThis as any;
    const id = g.setTimeout(() => subscriber.error(httpErrorShape), ms);
    return () => {
      g.clearTimeout(id);
    };
  });
}

/**
 * Generates a URL-safe pseudo-random string.
 * Falls back if crypto is unavailable.
 */
function cryptoRandomString(len = 16): string {
  try {
    const g: any = globalThis as any;
    if (g.crypto && g.crypto.getRandomValues) {
      const arr = new Uint8Array(len);
      g.crypto.getRandomValues(arr);
      return Array.from(arr)
        .map((b) => (b % 36).toString(36))
        .join('');
    }
  } catch {
    // ignore
  }
  // fallback: Math.random
  return Array.from({ length: len })
    .map(() => Math.floor(Math.random() * 36).toString(36))
    .join('');
}
