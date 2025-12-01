import { Component, ElementRef, OnDestroy, OnInit, ViewChild, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { filter, Subscription } from 'rxjs';
import { PLATFORM_ID } from '@angular/core';
import { ApiService } from './core/services/api.service';

/**
 * Root component rendering the header and the routed views.
 * Includes "Violet Dreams" theme accents and a logout button.
 * Manages focus to main content on route changes for accessibility.
 * Displays a small diagnostics badge with the current API base URL.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Secure Dashboard';
  private auth = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private api = inject(ApiService);

  isLoggedIn = computed(() => this.auth.isAuthenticated());
  private sub?: Subscription;

  @ViewChild('mainEl') mainEl?: ElementRef<HTMLElement>;

  get apiBase(): string {
    return this.api.getBaseUrl();
  }

  ngOnInit(): void {
    // Move focus to main region after each navigation
    this.sub = this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      if (isPlatformBrowser(this.platformId)) {
        const el = (globalThis as any).document?.getElementById?.('main-content') as HTMLElement | null;
        el?.focus?.();
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  // PUBLIC_INTERFACE
  logout(): void {
    /** Logs out the user and navigates to login page. */
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}
