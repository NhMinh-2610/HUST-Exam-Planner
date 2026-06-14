import React, { useCallback, useState } from 'react';
import { UploadCloud, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import './UploadBox.css';

const UploadBox = ({ onUpload, isLoading, error }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  }, []);

  const handleChange = (e) => {
    e.preventDefault();
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
  };

  const processFiles = (files) => {
    const invalidFiles = files.filter(f => f.type !== "application/pdf");
    if (invalidFiles.length > 0) {
      alert("Chỉ chấp nhận file PDF.");
      return;
    }
    onUpload(files);
  };

  return (
    <div className="upload-container animate-fade-in">
      <div
        className={`upload-box ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          accept=".pdf"
          multiple
          onChange={handleChange}
          className="file-input"
        />
        <label htmlFor="file-upload" className="upload-label">
          {isLoading ? (
            <div className="upload-content loading">
              <Loader className="icon spin" />
              <p>Đang phân tích PDF...</p>
            </div>
          ) : (
            <div className="upload-content">
              <UploadCloud className="icon" />
              <p><strong>Bấm để tải lên</strong> hoặc kéo thả file PDF vào đây</p>
              <span>Hỗ trợ chọn nhiều file cùng lúc</span>
            </div>
          )}
        </label>
      </div>
      {error && (
        <div className="error-message">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  );
};

export default UploadBox;
