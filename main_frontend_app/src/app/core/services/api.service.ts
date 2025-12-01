import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * PUBLIC_INTERFACE
 * ApiService wraps HttpClient and centralizes base URL and error handling.
 * Base URL remains configurable for future live backend re-integration.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  // PUBLIC_INTERFACE
  getBaseUrl(): string {
    /** Returns the currently resolved API base URL. */
    return this.baseUrl;
  }

  // PUBLIC_INTERFACE
  get<T>(path: string, options: { headers?: HttpHeaders } = {}): Observable<T> {
    /** Performs GET request against backend API with base url applied. */
    const url = `${this.baseUrl}${path}`;
    return this.http.get<T>(url, options).pipe(catchError((e) => this.handleError(e, 'GET', url)));
    }

  // PUBLIC_INTERFACE
  post<T>(path: string, body: unknown, options: { headers?: HttpHeaders } = {}): Observable<T> {
    /** Performs POST request against backend API with base url applied. */
    const url = `${this.baseUrl}${path}`;
    return this.http.post<T>(url, body, options).pipe(catchError((e) => this.handleError(e, 'POST', url)));
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
    console.error('[ApiService] API Error:', {
      method,
      url,
      status: error.status,
      statusText: error.statusText,
      message: this.describeError(error),
      errorBody: error?.error,
    });
    return throwError(() => error);
  }
}
