# Angular

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.1.

## Features implemented

- Lazy-loaded Auth and Dashboard routes
- Core ApiService and AuthService with token storage
- AuthGuard for protecting Dashboard
- Environment files with API base: http://localhost:3001
- Pages: Login, OTP, Forgot Password, Reset Password
- Violet Dreams theme with header and logout

## Development server

Start the server:

```bash
ng serve
```

Navigate to `http://localhost:3000/` (port is configured in angular.json). The app will live-reload on changes.

Back-end API base is set via `src/environments/environment.ts` and defaults to `http://localhost:3001`.

- Ensure the backend CORS allows origin http://localhost:3000 and accepts standard JSON headers.
- OTP flow:
  1) POST /auth/login with email/password. If response contains `{ requiresOtp: true, otpToken: "<token>" }`, the app stores otpToken and routes to /auth/otp.
  2) POST /auth/verify-otp with `{ email, otp, otpToken }` (otpToken is auto-supplied from storage). On success `{ token }` is stored and you are routed to /dashboard.

## Build

```bash
ng build
```

Artifacts in `dist/angular`.
