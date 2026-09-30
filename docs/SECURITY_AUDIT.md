# Jennie Web App - Security Hardening & Audit Report

## Security Assessment Summary
This audit documents the sanitization and vulnerability mitigation performed to ensure the Jennie Web App operates securely in production and across open-source code repositories.

## Remediated Vulnerabilities

### 1. Hardcoded Secret Extraction (CWE-798)
- **Status**: Remediated
- **Finding**: Base64-encoded default Firebase configuration strings were present in `src/config/firebase.js`.
- **Mitigation**: Removed hardcoded fallback keys entirely. The app now strictly binds to environment variables (`VITE_FIREBASE_*`). If variables are absent, graceful degradation prevents unauthenticated data exposure.

### 2. Backend Hostname & Direct API Exposure (CWE-200)
- **Status**: Remediated
- **Finding**: Direct Railway backend production endpoints were referenced directly in frontend source files.
- **Mitigation**: Standardized all client-side network calls in `src/services/api.js` and `src/services/authApi.js` to route via relative path `/api` or configurable reverse proxy environment parameters (`VITE_API_URL`).

### 3. Repository Secrets & Environment Isolation (CWE-200)
- **Status**: Remediated
- **Finding**: Potential risk of committing local `.env` files containing development API keys.
- **Mitigation**: Added `.env`, `.env.local`, `.env.*.local`, and build output directories to `.gitignore`. Maintained a sanitized template `.env.example` containing empty dummy variable schemas.

### 4. Rate Limiting on User-Generated Content (CWE-400)
- **Status**: Remediated
- **Finding**: Public feedback forms could be vulnerable to automated spamming or Denial-of-Service attacks.
- **Mitigation**: Integrated a sliding-window rate limiter in `src/services/feedbackService.js` enforcing a hard maximum of 5 requests per rolling 60-minute window per client.

### 5. Input Validation & File Upload Sanitation (CWE-434)
- **Status**: Remediated
- **Finding**: Screenshot uploads could exhaust browser memory or database payload limits.
- **Mitigation**: Enforced a strict 5MB payload limit on screenshots and validated MIME types (`image/*`).
