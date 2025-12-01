import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

/**
 * PUBLIC_INTERFACE
 * ApiService wraps HttpClient and centralizes base URL and error handling.
 * The base URL is read from environment.apiBaseUrl (defaults to http://localhost:3001).
 * Adds diagnostics to help identify CORS, network, and base URL issues.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  constructor() {
    // Log the computed API base URL at startup
    try {
      const loc = (globalThis as any)?.location;
      console.info(
        '[ApiService] Computed apiBaseUrl:',
        this.baseUrl,
        'current origin:',
        loc ? `${loc.protocol}//${loc.host}` : '(no browser location)'
      );
    } catch {
      console.info('[ApiService] Computed apiBaseUrl:', this.baseUrl, '(no browser location)');
    }

    // Attempt a lightweight reachability check
    this.http
      .get(`${this.baseUrl}/health`, { observe: 'response' })
      .pipe(
        tap((res) => {
          const allowOrigin = res.headers.get('Access-Control-Allow-Origin');
          console.info('[ApiService] Health check OK', {
            url: `${this.baseUrl}/health`,
            status: res.status,
            allowOrigin,
          });
        }),
        catchError((err) => {
          console.error('[ApiService] Health check failed', {
            url: `${this.baseUrl}/health`,
            message: this.describeError(err),
            error: err,
          });
          // Do not break app on health failure; return empty observable
          return of(null as any);
        })
      )
      .subscribe();
  }

  // PUBLIC_INTERFACE
  getBaseUrl(): string {
    /** Returns the currently resolved API base URL (for diagnostics and display). */
    return this.baseUrl;
  }

  // PUBLIC_INTERFACE
  get<T>(path: string, options: { headers?: HttpHeaders } = {}): Observable<T> {
    /** Performs GET request against backend API with base url applied. */
    const url = `${this.baseUrl}${path}`;
    console.debug('[ApiService] GET', url);
    return this.http.get<T>(url, options).pipe(catchError((e) => this.handleError(e, 'GET', url)));
  }

  // PUBLIC_INTERFACE
  post<T>(path: string, body: unknown, options: { headers?: HttpHeaders } = {}): Observable<T> {
    /** Performs POST request against backend API with base url applied. */
    const url = `${this.baseUrl}${path}`;
    console.debug('[ApiService] POST', url, 'payload:', this.safeBodyPreview(body));
    return this.http.post<T>(url, body, { ...options, observe: 'response' as const }).pipe(
      tap((res) => {
        // Log response details for auth endpoints specifically
        if (path.startsWith('/auth/')) {
          console.info('[ApiService] Auth response', {
            path,
            status: res.status,
            headers: this.headersToObject(res.headers),
          });
        }
      }),
      // unwrap body while preserving error handling
      tap(() => {}),
      catchError((e) => this.handleError(e, 'POST', url))
    ) as unknown as Observable<T>;
  }

  private safeBodyPreview(body: unknown): unknown {
    try {
      if (body && typeof body === 'object') {
        const copy: any = { ...(body as any) };
        if (typeof copy.password === 'string') {
          copy.password = '***';
        }
        if (typeof copy.otp === 'string') {
          copy.otp = '***';
        }
        if (typeof copy.otpToken === 'string') {
          copy.otpToken = '***';
        }
        return copy;
      }
      return body;
    } catch {
      return '(unserializable body)';
    }
  }

  private headersToObject(headers: any): Record<string, string> {
    const out: Record<string, string> = {};
    try {
      headers?.keys?.().forEach((k: string) => (out[k] = headers.get(k)));
    } catch {
      // ignore
    }
    return out;
  }

  private describeError(error: any): string {
    if (error?.name === 'HttpErrorResponse') {
      const e = error as HttpErrorResponse;
      if (e.status === 0) {
        return 'Network error or CORS blocked (status 0)';
      }
      return `HTTP ${e.status} ${e.statusText || ''}`.trim();
    }
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  private handleError(error: HttpErrorResponse, method?: string, url?: string) {
    // Provide rich diagnostics for auth routes
    const isAuth = !!url && (url.includes('/auth/login') || url.includes('/auth/verify-otp'));
    const detail = {
      method,
      url,
      status: error.status,
      statusText: error.statusText,
      message: this.describeError(error),
      errorBody: error?.error,
      headers: (error as any)?.headers ? this.headersToObject((error as any).headers) : undefined,
    };

    if (isAuth) {
      console.error('[ApiService] Auth request failed', detail);
    } else {
      console.error('[ApiService] API Error:', detail);
    }
    return throwError(() => error);
  }
}
