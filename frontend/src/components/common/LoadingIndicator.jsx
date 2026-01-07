export default function LoadingIndicator({ text = 'Đang tải', className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 p-8 text-center ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      <div className="text-sm font-medium text-gray-600">{text}</div>
    </div>
  );
}
