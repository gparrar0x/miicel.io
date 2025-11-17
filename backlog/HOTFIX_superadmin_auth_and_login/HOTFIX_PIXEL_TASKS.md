# Pixel Tasks - Login Page

## HOTFIX: Login Page Implementation

**Scope**: Build login page at `/login`

### Requirements
- Simple email/password form
- Supabase auth integration
- Redirect to dashboard after login
- Error states
- Loading states
- Minimal design (quick implementation)

### Implementation

**File**: `app/login/page.tsx`
- Email + password inputs
- Submit → call `/api/auth/login`
- Success → redirect to `/dashboard` or previous page
- Error → display message
- Loading → disable form

**UI Elements**:
- Centered card layout
- Email input (type="email")
- Password input (type="password")
- Submit button
- Error message display
- Link to forgot password (future)

### Test IDs
- `login-form`
- `login-email-input`
- `login-password-input`
- `login-submit-button`
- `login-error-message`
- `login-loading-state`

### Dependencies
- Kokoro auth API routes ready

### Estimate
1.5h

### Testing
- Login flow works
- Errors display correctly
- Redirect after successful login
- Loading state shows during request
