# Kokoro Tasks - Superadmin Auth

## HOTFIX: Superadmin Auth System

**Scope**: Implement superadmin authentication with env-based access control

### Requirements
- `.env` var: `SUPER_ADMINS=gparrar@skywalking.dev`
- Supabase Auth integration
- Middleware: bypass tenant check if superadmin
- Session management
- API routes for auth (login/logout/check)

### Implementation

**1. Environment Config**
- Add `SUPER_ADMINS` to `.env.local`
- Helper function to check if email is superadmin

**2. Auth Routes**
Create:
- `app/api/auth/login/route.ts` - Supabase email/password login
- `app/api/auth/logout/route.ts` - Clear session
- `app/api/auth/session/route.ts` - Check current session

**3. Middleware Update**
- Check Supabase session
- If user email in SUPER_ADMINS → allow all dashboard access
- Otherwise → existing tenant validation

**4. Session Utils**
- Server-side session validation
- Client-side session hooks

### Dependencies
None - independent backend task

### Estimate
2.5h

### Testing
- Verify login with `gparrar@skywalking.dev`
- Confirm dashboard access without tenant restriction
- Test non-superadmin blocked correctly
