import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
  <section class="dash-wrap container" role="region" aria-labelledby="dashboard-heading">
    <div class="surface-accent" style="padding:1.2rem 1rem; margin-bottom:1rem;">
      <h1 id="dashboard-heading" class="h1">Dashboard</h1>
      <p class="subtle">Welcome to your secure workspace.</p>
    </div>

    <div class="grid">
      <div class="card" role="article" aria-labelledby="session-card">
        <h2 id="session-card" class="h2" style="margin-bottom:.5rem;">Session</h2>
        <p>Status: <strong>{{ auth.isAuthenticated() ? 'Authenticated' : 'Guest' }}</strong></p>
      </div>
      <div class="card" role="article" aria-labelledby="getting-started-card">
        <h2 id="getting-started-card" class="h2" style="margin-bottom:.5rem;">Getting started</h2>
        <ul>
          <li>Use the header to logout</li>
          <li>Navigate via auth routes for flows</li>
        </ul>
      </div>
    </div>
  </section>
  `,
  styles: [`
  :host{display:block}
  .dash-wrap{margin:0 auto;}
  .grid{
    display:grid; grid-template-columns: repeat(auto-fit, minmax(260px,1fr)); gap: 1rem;
  }
  ul{margin:0 0 0 1rem}
  `]
})
export class DashboardComponent {
  auth = inject(AuthService);
}
