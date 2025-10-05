import React, { useState, useRef, DragEvent } from 'react';
import { UploadIcon } from './icons/Icons';

interface FileUploadProps {
  onUpload: (file: File, targetRole: string) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload, isLoading }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [targetRole, setTargetRole] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onUpload(selectedFile, targetRole);
    }
  };
  
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-brand-surface border-2 border-dashed border-brand-muted rounded-lg p-6 text-center transition-all duration-300 ease-in-out"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".csv,.json,application/json,text/csv"
      />
      <div className="flex flex-col items-center">
        <UploadIcon className="w-12 h-12 text-brand-secondary mb-4" />
        {selectedFile ? (
          <>
            <p className="font-semibold">{selectedFile.name}</p>
            <p className="text-sm text-brand-text-secondary">({(selectedFile.size / 1024).toFixed(2)} KB)</p>
          </>
        ) : (
          <>
            <p className="font-semibold">
              <span className="text-brand-secondary cursor-pointer hover:underline" onClick={triggerFileSelect}>Click to upload</span> or drag and drop
            </p>
            <p className="text-sm text-brand-text-secondary">CSV or JSON files</p>
          </>
        )}
        <div className="mt-4 w-full max-w-sm">
            <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="Enter Target Role (e.g., Senior Python Developer)"
                className="w-full px-4 py-2 bg-brand-background border border-brand-muted rounded-md focus:ring-2 focus:ring-brand-secondary focus:outline-none text-center"
            />
        </div>
        <button
          onClick={handleSubmit}
          disabled={!selectedFile || isLoading}
          className="mt-6 px-6 py-2 bg-brand-primary text-white rounded-md font-semibold hover:bg-blue-800 disabled:bg-brand-muted disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Processing...' : 'Upload & Rank'}
        </button>
      </div>
    </div>
  );
};

export default FileUpload;