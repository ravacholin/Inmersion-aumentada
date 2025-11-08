
import React, { useState, useCallback } from 'react';
import { UploadIcon } from './Icons';

interface ImageUploaderProps {
  onAnalyze: (file: File) => void;
  isLoading: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onAnalyze, isLoading }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onAnalyze(file);
    }
  }, [onAnalyze]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center">
      <form id="form-file-upload" onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()} className="w-full">
        <input ref={inputRef} type="file" id="input-file-upload" accept="image/*" multiple={false} onChange={handleChange} className="hidden" />
        <label
          id="label-file-upload"
          htmlFor="input-file-upload"
          className={`w-full h-48 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 ${dragActive ? 'border-cyan-400 bg-gray-700' : 'border-gray-600 hover:border-cyan-500 hover:bg-gray-700/50'}`}
        >
          <div className="text-center">
            <UploadIcon className="w-10 h-10 mx-auto text-gray-500 mb-2" />
            <p className="font-semibold text-gray-300">
              <span className="text-cyan-400">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, or WEBP</p>
          </div>
        </label>
        {dragActive && <div className="absolute w-full h-full top-0 left-0" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div>}
      </form>
    </div>
  );
};

export default ImageUploader;
