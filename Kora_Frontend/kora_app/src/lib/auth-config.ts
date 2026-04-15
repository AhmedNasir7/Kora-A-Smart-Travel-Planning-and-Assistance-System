export const authConfig = {
  labels: {
    email: 'Email address',
    password: 'Password',
    fullName: 'Full Name',
    username: 'Username',
    confirmPassword: 'Confirm Password',
    rememberMe: 'Remember me',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    createAccount: 'Create Account',
  },
  placeholders: {
    email: 'you@example.com',
    password: '••••••••',
    fullName: 'John Doe',
    username: 'john_doe',
  },
  links: {
    forgotPassword: 'Forgot password?',
    createAccount: "Don't have an account? Create one",
    signIn: 'Already have an account? Sign In',
    google: 'Continue with Google',
  },
  messages: {
    signInSuccess: 'Welcome back! Redirecting...',
    signUpSuccess: 'Account created successfully! Redirecting...',
    signInError: 'Invalid email or password',
    signUpError: 'Failed to create account',
    networkError: 'Network error. Please try again.',
  },
  features: [
    {
      title: 'Smart Trip Planning',
      description: 'Organize all your travel details effortlessly',
    },
    {
      title: 'Packing Lists',
      description: 'Never forget what matters most',
    },
    {
      title: 'Document Vault',
      description: 'Passports, visas — safely stored',
    },
  ],
  stats: [
    { value: '50k+', label: 'Travelers' },
    { value: '200k', label: 'Trips planned' },
    { value: '4.6★', label: 'App rating' },
    { value: '98%', label: 'Satisfied' },
  ],
};
