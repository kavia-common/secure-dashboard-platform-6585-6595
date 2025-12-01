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

## Build

```bash
ng build
```

Artifacts in `dist/angular`.

