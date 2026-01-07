import { useState } from 'react';

const FileUpload = ({ file, preview, onFileChange, onClear, label, accept = "image/*" }) => {
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileChange(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            onFileChange(selectedFile);
        }
    };

    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                {label}
            </label>
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                    dragActive 
                        ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
                        : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}
            >
                {!preview ? (
                    <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                            <svg
                                className="w-8 h-8 text-blue-600"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 48 48"
                                aria-hidden="true"
                            >
                                <path
                                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <div>
                            <label className="cursor-pointer group">
                                <span className="inline-block px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg">
                                    Chọn file ảnh
                                </span>
                                <input
                                    type="file"
                                    accept={accept}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                            </label>
                            <p className="mt-3 text-sm text-gray-500">
                                hoặc kéo thả ảnh vào đây
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                                PNG, JPG, GIF tối đa 10MB
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="relative group">
                        <img
                            src={preview}
                            alt="Preview"
                            className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg ring-2 ring-gray-200"
                        />
                        <button
                            type="button"
                            onClick={onClear}
                            className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-3 hover:bg-red-600 shadow-lg hover:shadow-xl cursor-pointer transition-all transform hover:scale-110"
                            title="Xóa ảnh"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 rounded-lg transition-all pointer-events-none"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileUpload;
