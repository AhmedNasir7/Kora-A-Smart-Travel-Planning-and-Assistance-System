// Color palette - HSL values for design system
export const colorPalette = {
  // Base colors (HSL format)
  background: 'hsl(220, 20%, 7%)',        // Deep charcoal
  foreground: 'hsl(40, 20%, 95%)',        // Warm white
  card: 'hsl(220, 18%, 10%)',             // Card backgrounds
  'card-foreground': 'hsl(40, 20%, 95%)', // Card text
  
  // Primary accent (Coral-orange)
  primary: 'hsl(12, 80%, 65%)',           // Main accent
  'primary-foreground': 'hsl(220, 20%, 7%)',
  
  // Secondary
  secondary: 'hsl(220, 15%, 15%)',        // Subtle containers
  'secondary-foreground': 'hsl(40, 15%, 80%)',
  
  // Muted
  muted: 'hsl(220, 15%, 13%)',            // Muted backgrounds
  'muted-foreground': 'hsl(220, 10%, 50%)',
  
  // Accent (same as primary)
  accent: 'hsl(12, 80%, 65%)',
  'accent-foreground': 'hsl(220, 20%, 7%)',
  
  // Status colors
  destructive: 'hsl(0, 72%, 51%)',        // Error/delete (red)
  'destructive-foreground': 'hsl(40, 20%, 95%)',
  
  // Borders and inputs
  border: 'hsl(220, 15%, 16%)',
  input: 'hsl(220, 15%, 16%)',
  ring: 'hsl(12, 80%, 65%)',              // Focus rings
  
  // Kora-specific
  'kora-glow': 'hsl(12, 80%, 65%)',       // Glow effects
  'kora-surface': 'hsl(220, 16%, 12%)',   // Elevated surfaces
  'kora-surface-hover': 'hsl(220, 16%, 15%)',
  'kora-text-dim': 'hsl(220, 10%, 40%)',  // Dimmed text
  'kora-success': 'hsl(160, 60%, 45%)',   // Teal-green
  'kora-warning': 'hsl(38, 92%, 60%)',    // Amber
};

// Legacy hex values for backward compatibility
export const authColors = {
  // Dark backgrounds
  bgDark: '#0f1323',
  bgDarker: '#0a0e18',
  bgCard: '#131a28',
  bgCardHover: '#1a2035',

  // Primary colors (Coral-orange: hsl(12, 80%, 65%))
  primary: '#ff6b35',
  primaryHover: '#ff5722',
  primaryLight: '#ff8a5b',

  // Text colors
  textPrimary: '#f5f3eb',
  textSecondary: '#c8c5b9',
  textMuted: '#8a8680',

  // Input/Border colors
  borderInput: '#1d2230',
  borderFocus: '#ff6b35',
  borderError: '#ef4444',

  // Status colors
  success: '#2dd4a4',
  error: '#ef4444',
  warning: '#fbbf24',
  info: '#3b82f6',

  // Social
  google: '#f5f3eb',
  googleBg: '#1d2531',
};

export const authShadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  primary: '0 0 20px rgba(255, 107, 53, 0.3)',
};
