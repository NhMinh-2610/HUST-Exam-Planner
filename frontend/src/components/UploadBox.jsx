import React, { useCallback, useState } from 'react';
import { UploadCloud, File, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import './UploadBox.css';

const UploadBox = ({ onUpload, isLoading, error }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file");
      return;
    }
    setSelectedFile(file);
    onUpload(file);
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
          onChange={handleChange} 
          className="file-input"
        />
        <label htmlFor="file-upload" className="upload-label">
          {isLoading ? (
            <div className="upload-content loading">
              <Loader className="icon spin" />
              <p>Đang phân tích PDF...</p>
            </div>
          ) : selectedFile && !error ? (
            <div className="upload-content success">
              <CheckCircle className="icon" />
              <p>{selectedFile.name}</p>
              <span className="change-file">Bấm để đổi file khác</span>
            </div>
          ) : (
            <div className="upload-content">
              <UploadCloud className="icon" />
              <p><strong>Bấm để tải lên</strong> hoặc kéo thả file PDF vào đây</p>
              <span>Chỉ hỗ trợ file lịch thi dạng PDF</span>
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
