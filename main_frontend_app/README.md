# Angular

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.1.

## Backend removed — in-browser mock enabled

The previous Express-based backend has been removed. The app now runs entirely in the browser by using a MockAuthService that simulates the following endpoints:

- POST /auth/login
- POST /auth/verify-otp
- POST /auth/forgot-password
- POST /auth/reset-password

Seed credentials:
- Email: `demo@example.com`
- Password: `Password123`

Login flow:
1) Login with the seed credentials.
2) You'll be prompted for a 6-digit OTP. The mock prints the OTP to the browser console for convenience.
3) On OTP verification, a fake JWT is stored in localStorage and you are redirected to the dashboard.

Forgot/Reset flow:
- Forgot generates a reset token and logs it to the console.
- Reset accepts the token via query param `?token=...` and updates the in-memory password.

## Toggle between mock and live backend (future)

- The app defaults to mock mode (no backend required).
- To enable a live backend later:
  1. Provide a real backend implementing the endpoints listed above.
  2. Set a global before app load to disable mock mode:
     ```html
     <script>
       window.NG_APP_USE_MOCK_API = false;
       window.NG_APP_API_BASE = 'https://your-backend.example.com';
     </script>
     ```
  3. The app will then use the real HTTP-backed AuthService.

Environment base URL (for future live use) is read from `src/environments/environment.ts` and can be overridden at runtime via `window.NG_APP_API_BASE`, `window.NG_APP_API_BASE_URL`, or `window.NG_APP_BACKEND_URL`.

## Features implemented

- Lazy-loaded Auth and Dashboard routes
- MockAuthService with token storage and OTP simulation
- AuthGuard for protecting Dashboard
- Pages: Login, OTP, Forgot Password, Reset Password
- Violet Dreams theme with header and logout
- Accessibility enhancements (skip link, roles, aria, focus management)

## Development server

Start the server:

```bash
ng serve
```

Navigate to `http://localhost:3000/` (port is configured in angular.json). The app will live-reload on changes.

## Build

```bash
ng build
```

Artifacts in `dist/angular`.
