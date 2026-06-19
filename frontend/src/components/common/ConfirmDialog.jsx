export default function ConfirmDialog({ message, onYes, onNo }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 fade-in">
      <div className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all">
        {/* Message Content */}
        <div className="mb-8 text-center">
          <h3 className="text-lg font-bold text-gray-900">
            Xác nhận
          </h3>
          <p className="mt-2 text-gray-500">
            {message}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-3">
          {/* Nút Có - Primary */}
          <button
            onClick={onYes}
            className="
              cursor-pointer
              rounded-lg bg-blue-600 px-6 py-2.5
              text-sm font-semibold text-white shadow-sm
              transition-all duration-200
              hover:bg-blue-500 hover:shadow-md hover:-translate-y-0.5
              active:bg-blue-700 active:translate-y-0
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            "
          >
            Có
          </button>

          {/* Nút Không - Secondary (Outline Style) */}
          <button
            onClick={onNo}
            className="
              cursor-pointer
              rounded-lg border border-gray-300 bg-white px-6 py-2.5
              text-sm font-semibold text-gray-700 shadow-sm
              transition-all duration-200
              hover:bg-gray-50 hover:text-gray-900
              active:bg-gray-100
              focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2
            "
          >
            Không
          </button>
        </div>
      </div>
    </div>
  );
}