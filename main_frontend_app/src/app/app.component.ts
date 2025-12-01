import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';

/**
 * Root component rendering the header and the routed views.
 * Includes "Violet Dreams" theme accents and a logout button.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Secure Dashboard';
  private auth = inject(AuthService);
  private router = inject(Router);

  isLoggedIn = computed(() => this.auth.isAuthenticated());

  // PUBLIC_INTERFACE
  logout(): void {
    /** Logs out the user and navigates to login page. */
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}
