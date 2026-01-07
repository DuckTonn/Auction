import React from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css'

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }], // Tiêu đề
    ['bold', 'italic', 'underline', 'strike', 'blockquote'], // Định dạng văn bản
    [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
    ['link'],
    ['clean']
  ],
};

const TextEditor = ({ value, onChange, placeholder }) => {
  return (
    <div className="bg-white">
      <style>
        {`
          .ql-container {
            border-bottom-left-radius: 0.5rem;
            border-bottom-right-radius: 0.5rem;
            font-size: 1rem;
            min-height: 200px;
          }
          .ql-toolbar {
            border-top-left-radius: 0.5rem;
            border-top-right-radius: 0.5rem;
            background-color: #f9fafb;
          }
          .ql-editor {
            min-height: 200px;
          }
        `}
      </style>
      
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder || 'Nhập nội dung văn bản tại đây...'}
        className="h-full"
      />
    </div>
  );
};

export default TextEditor;