import { Link } from 'react-router-dom';
import Button from './Button';

/**
 * @param {string} icon - Emoji hoặc icon hiển thị (default: 📭)
 * @param {string} title - Tiêu đề chính
 * @param {string} message - Mô tả chi tiết
 * @param {object} action - Action button: { label, to/onClick, variant }
 * @param {string} variant - Kiểu hiển thị: 'default' | 'bordered' | 'minimal'
 * @param {string} className - Custom classes
 */
export default function EmptyState({
  icon = '📭',
  title = '',
  message = 'Không có dữ liệu',
  action = null,
  variant = 'default',
  className = ''
}) {
  
  // Variant styles
  const variantStyles = {
    default: 'bg-white rounded-xl shadow-sm border border-gray-100',
    bordered: 'bg-white rounded-xl border-2 border-dashed border-gray-300',
    minimal: 'bg-transparent'
  };

  const containerClass = `
    text-center py-16 px-6
    ${variantStyles[variant]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={containerClass}>
      {/* Icon/Emoji */}
      {icon && (
        <div className="text-5xl md:text-6xl mb-4 animate-pulse">
          {icon}
        </div>
      )}

      {/* Title */}
      {title && (
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {title}
        </h3>
      )}

      {/* Message */}
      <p className="text-gray-500 text-base mb-6 max-w-md mx-auto">
        {message}
      </p>

      {/* Action Button */}
      {action && (
        <div className="flex justify-center">
          {action.to ? (
            <Link to={action.to} className="inline-flex">
              <Button
                variant={action.variant || 'secondary'}
                size="md"
                className="min-w-[160px]"
              >
                {action.label}
              </Button>
            </Link>
          ) : action.onClick ? (
            <Button
              onClick={action.onClick}
              variant={action.variant || 'secondary'}
              size="md"
              className="min-w-[160px]"
            >
              {action.label}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}
