# Angular

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.1.

## Features implemented

- Lazy-loaded Auth and Dashboard routes
- Core ApiService and AuthService with token storage
- AuthGuard for protecting Dashboard
- Environment files with API base: http://localhost:3001
- Pages: Login, OTP, Forgot Password, Reset Password
- Violet Dreams theme with header and logout

## Accessibility and UX enhancements

- Skip link: a "Skip to main content" link is available as the first focusable element for keyboard users.
- Landmarks: header has role="banner", main has role="main" and is focusable (tabindex="-1") to receive focus on route changes.
- Forms:
  - All inputs have associated labels via for/id, proper aria-required and aria-invalid bindings.
  - Error, success messages use aria-live regions (role="alert" or role="status") to notify screen readers.
  - Submit buttons expose aria-busy and aria-disabled while API calls are in-flight.
  - On submit with validation errors the first invalid control receives focus.
- Keyboard navigation: logical tab order, Enter submits forms, Escape can be handled by the browser to clear fields.
- Focus visibility: strong high-contrast focus outline and offset across interactive controls.
- Reduced motion: honors prefers-reduced-motion by reducing transitions.
- Consistent theme utilities: shared .btn, .input, .card classes and color tokens ensure visual consistency.

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
