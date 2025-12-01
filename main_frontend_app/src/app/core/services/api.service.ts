import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * PUBLIC_INTERFACE
 * ApiService wraps HttpClient and centralizes base URL and error handling.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  // PUBLIC_INTERFACE
  get<T>(path: string, options: { headers?: HttpHeaders } = {}): Observable<T> {
    /** Performs GET request against backend API with base url applied. */
    return this.http.get<T>(`${this.baseUrl}${path}`, options).pipe(catchError(this.handleError));
  }

  // PUBLIC_INTERFACE
  post<T>(path: string, body: unknown, options: { headers?: HttpHeaders } = {}): Observable<T> {
    /** Performs POST request against backend API with base url applied. */
    return this.http.post<T>(`${this.baseUrl}${path}`, body, options).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    return throwError(() => error);
  }
}
