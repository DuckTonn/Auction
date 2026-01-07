import { forwardRef } from 'react';

/**
 * @param {string} variant - Loại button: 'primary' | 'secondary' | 'danger' | 'outline' | 'success' | 'ghost'
 * @param {string} size - Kích thước: 'xs' | 'sm' | 'md' | 'lg'
 * @param {boolean} fullWidth - Button chiếm full width
 * @param {boolean} disabled - Trạng thái disabled
 * @param {boolean} loading - Hiển thị loading spinner
 * @param {ReactNode} children - Nội dung button
 * @param {string} className - Custom classes bổ sung
 * @param {function} onClick - Handler khi click
 */
const Button = forwardRef(({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  children,
  className = '',
  onClick,
  type = 'button',
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] disabled:transform-none';

  const sizeStyles = {
    xs: 'px-3 py-1.5 text-xs gap-1.5',
    sm: 'px-4 py-2 text-sm gap-2',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5'
  };

  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm hover:shadow-md',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 shadow-sm',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm',
    outline: 'border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-300',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-300',
    black: 'bg-black text-white hover:bg-gray-800 focus:ring-gray-500 shadow-sm'
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  const loadingStyle = loading ? 'cursor-wait' : 'cursor-pointer';

  const combinedClassName = `
    ${baseStyles}
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${widthStyle}
    ${loadingStyle}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      ref={ref}
      type={type}
      className={combinedClassName}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
