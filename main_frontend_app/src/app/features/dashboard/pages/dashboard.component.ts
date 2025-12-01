import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
  <section class="dash-wrap">
    <div class="hero">
      <h1>Dashboard</h1>
      <p>Welcome to your secure workspace.</p>
    </div>

    <div class="grid">
      <div class="card">
        <h3>Session</h3>
        <p>Status: <strong>{{ auth.isAuthenticated() ? 'Authenticated' : 'Guest' }}</strong></p>
      </div>
      <div class="card">
        <h3>Getting started</h3>
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
  .dash-wrap{max-width:1100px; margin:0 auto;}
  .hero{
    background: linear-gradient(120deg, rgba(124,58,237,.12), rgba(13,148,136,.12));
    border: 1px solid #e5e7eb; border-radius: 12px;
    padding: 1.2rem 1rem; margin-bottom: 1rem;
  }
  .hero h1{margin:0; color:#111827}
  .hero p{margin:.25rem 0 0; color:#374151}
  .grid{
    display:grid; grid-template-columns: repeat(auto-fit, minmax(260px,1fr)); gap: 1rem;
  }
  .card{background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:1rem}
  h3{margin:0 0 .5rem 0}
  ul{margin:0 0 0 1rem}
  `]
})
export class DashboardComponent {
  auth = inject(AuthService);
}
