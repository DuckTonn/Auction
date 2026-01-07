// === COLORS ===
export const COLORS = {
  // Primary
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
  },
  
  // Secondary (Gray)
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Success
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    600: '#16a34a',
    700: '#15803d',
  },
  
  // Danger
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    600: '#dc2626',
    700: '#b91c1c',
  },
  
  // Warning
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    600: '#d97706',
    700: '#b45309',
  },
};

// === SPACING ===
export const SPACING = {
  // Button padding
  button: {
    xs: 'px-3 py-1.5',
    sm: 'px-4 py-2',
    md: 'px-5 py-2.5',
    lg: 'px-6 py-3',
    xl: 'px-8 py-4',
  },
  
  // Container padding
  container: {
    sm: 'px-4 py-4',
    md: 'px-6 py-6',
    lg: 'px-8 py-8',
  },
  
  // Card padding
  card: {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  },
  
  // Gap between elements
  gap: {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  },
};

// === BORDER RADIUS ===
export const RADIUS = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

// === SHADOWS ===
export const SHADOWS = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  inner: 'shadow-inner',
};

// === TYPOGRAPHY ===
export const TYPOGRAPHY = {
  // Font sizes
  size: {
    xs: 'text-xs',      // 12px
    sm: 'text-sm',      // 14px
    base: 'text-base',  // 16px
    lg: 'text-lg',      // 18px
    xl: 'text-xl',      // 20px
    '2xl': 'text-2xl',  // 24px
    '3xl': 'text-3xl',  // 30px
    '4xl': 'text-4xl',  // 36px
  },
  
  // Font weights
  weight: {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  },
  
  // Headings presets
  heading: {
    h1: 'text-3xl font-bold text-gray-900',
    h2: 'text-2xl font-bold text-gray-800',
    h3: 'text-xl font-bold text-gray-800',
    h4: 'text-lg font-semibold text-gray-800',
  },
};

// === TRANSITIONS ===
export const TRANSITIONS = {
  fast: 'transition-all duration-150',
  normal: 'transition-all duration-200',
  slow: 'transition-all duration-300',
  colors: 'transition-colors duration-200',
  transform: 'transition-transform duration-200',
};

// === ANIMATIONS ===
export const ANIMATIONS = {
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
  ping: 'animate-ping',
  scaleOnHover: 'hover:scale-105',
  scaleOnActive: 'active:scale-95',
};

// === Z-INDEX LAYERS ===
export const Z_INDEX = {
  dropdown: 'z-10',
  sticky: 'z-20',
  fixed: 'z-30',
  modalBackdrop: 'z-40',
  modal: 'z-50',
  popover: 'z-60',
  tooltip: 'z-70',
};

// === BREAKPOINTS ===
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export default {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
  TRANSITIONS,
  ANIMATIONS,
  Z_INDEX,
  BREAKPOINTS,
};
