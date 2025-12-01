import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard.component';
import { authGuard } from '../../core/guards/auth.guard';

/**
 * PUBLIC_INTERFACE
 * DASHBOARD_ROUTES configures lazy-loaded dashboard with guard.
 */
export const DASHBOARD_ROUTES: Routes = [
  { path: '', component: DashboardComponent, canActivate: [authGuard], title: 'Dashboard' }
];
