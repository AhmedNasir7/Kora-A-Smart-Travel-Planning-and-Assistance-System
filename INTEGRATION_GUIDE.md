# Kora - Frontend & Backend Integration Guide

## Quick Start

### Backend Setup

1. **Navigate to backend**
   ```bash
   cd kora_backend
   ```

2. **Configure environment**
   - Edit `.env` file with your Supabase credentials:
   ```
   PORT=3000
   NODE_ENV=development
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. **Install and run**
   ```bash
   npm install  # (if not already done)
   npm run start:dev
   ```
   Backend runs on `http://localhost:3000`

### Frontend Setup

1. **Navigate to frontend**
   ```bash
   cd Kora_Frontend/kora_app
   ```

2. **Configure environment**
   - `.env.local` is pre-configured to point to `http://localhost:3000`
   - If you need to change API URL:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

3. **Install and run**
   ```bash
   npm install
   npm run dev
   ```
   Frontend runs on `http://localhost:3000` (Next.js default is 3000, may use 3001 if 3000 is taken)

## API Endpoints

### Authentication

#### Sign Up
- **POST** `/auth/signup`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "fullName": "John Doe"
  }
  ```
- **Response:**
  ```json
  {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "user_metadata": {
        "full_name": "John Doe"
      }
    },
    "message": "Account created successfully"
  }
  ```

#### Sign In
- **POST** `/auth/login`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "user": { ... },
    "session": {
      "access_token": "jwt-token",
      "refresh_token": "refresh-token"
    },
    "message": "Login successful"
  }
  ```

#### Landing Page Info
- **GET** `/landing`
- **Response:** App features and metadata

#### Health Check
- **GET** `/health`
- **Response:** Server status

## Frontend Integration

### File Structure
```
src/
├── lib/
│   ├── api.ts              # API service for backend calls
│   └── validations/auth.ts # Form validation schemas
├── hooks/
│   └── useAuth.ts          # Auth hook for managing auth state
├── stores/
│   └── authStore.ts        # Zustand auth store
├── components/auth/
│   ├── SignInForm.tsx      # Sign in form (connected to API)
│   └── SignUpForm.tsx      # Sign up form (connected to API)
```

### Key Features Implemented

1. **API Service** (`lib/api.ts`)
   - Centralized API calls
   - Error handling
   - Token management

2. **Auth Hook** (`hooks/useAuth.ts`)
   - Sign up, sign in, sign out logic
   - Token storage in localStorage
   - Redirects to dashboard on success
   - Error handling with user feedback

3. **Form Validation**
   - Email validation
   - Password (6+ characters)
   - Full name (2+ characters)
   - Real-time error messages with Zod

4. **Token Management**
   - Access token stored in localStorage
   - Refresh token stored in localStorage
   - Auto-redirects authenticated users to dashboard

## Testing the Integration

### Test Sign Up
1. Go to `http://localhost:3001` (or wherever frontend is running)
2. Click "Create Account"
3. Fill in:
   - Full Name: "John Doe"
   - Email: "john@example.com"
   - Password: "password123"
4. Click "Sign Up"
5. Should redirect to `/dashboard`

### Test Sign In
1. Go to `http://localhost:3001/signin`
2. Fill in:
   - Email: "john@example.com"
   - Password: "password123"
3. Click "Sign In"
4. Should redirect to `/dashboard`

### Error Handling
- Invalid email format: Error displayed below form
- Email already registered: Error message from backend
- Wrong password: "Invalid email or password"
- Network error: "Failed to sign in. Please try again."

## Validation Requirements

### Backend (NestJS)
- Email: Valid email format
- Password: Minimum 6 characters
- FullName: Required

### Frontend (Zod)
- Email: Valid email format (required)
- Password: Minimum 6 characters (required)
- FullName: 2+ characters (required)

## Environment Variables

### Backend (.env)
```
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-key
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## CORS Configuration
- Frontend on `localhost:3001` ✓
- Frontend on `localhost:5173` ✓
- Add more URLs as needed in `src/main.ts` if using different ports

## Troubleshooting

### "Failed to sign up - Email already registered"
- This email is already in Supabase
- Use a different email address
- Or check Supabase dashboard to delete the user

### "Cannot reach API"
- Ensure backend is running: `npm run start:dev` in kora_backend/
- Check backend is on `http://localhost:3000`
- Update `.env.local` if using different port

### "Invalid email or password"
- Wrong email or password combination
- User doesn't exist in Supabase

### Frontend doesn't connect to backend
- Check `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:3000`
- Check browser console for exact error
- Ensure CORS is enabled on backend

## Next Steps

1. ✅ Sign up functionality working
2. ✅ Sign in functionality working
3. ✅ Landing page endpoint ready
4. ⏳ Create dashboard page for authenticated users
5. ⏳ Add password reset functionality
6. ⏳ Add Google OAuth integration
7. ⏳ Add profile management

---

**Last Updated:** 2026-04-13
