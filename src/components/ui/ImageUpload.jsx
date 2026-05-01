'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, UploadCloud, User } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

const ImageUpload = ({ value, onChange, label, className }) => {
  const [preview, setPreview] = useState(value || '');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (value !== preview) {
      setPreview(value || '');
    }
  }, [value]);

  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create local preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Start upload
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');

        const data = await response.json();
        onChange(data.url);
      } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload image. Please try again.');
        setPreview(value || ''); // Revert preview on failure
      } finally {
        setUploading(false);
      }
    }
  };

  const removeImage = (e) => {
    e.stopPropagation();
    setPreview('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={twMerge("space-y-2", className)}>
      {label && (
        <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={twMerge(
          "relative group w-32 h-32 rounded-3xl border-2 border-dashed border-[var(--border)] bg-[var(--surface-hover)] flex flex-col items-center justify-center cursor-pointer transition-all hover:border-indigo-500/50 hover:bg-indigo-500/5 overflow-hidden",
          preview && "border-solid border-indigo-500/30"
        )}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-indigo-400">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest">Uploading...</span>
          </div>
        ) : preview ? (
          <>
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="text-white" size={24} />
            </div>
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600 shadow-lg"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-[var(--text-muted)] group-hover:text-indigo-400 transition-colors">
            <div className="p-3 bg-[var(--surface)] rounded-2xl border border-[var(--border)] group-hover:border-indigo-500/20 group-hover:shadow-lg transition-all">
              <UploadCloud size={24} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">Upload Photo</span>
          </div>
        )}
        
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileChange}
        />
      </div>
      <p className="text-[10px] text-[var(--text-muted)] ml-1">
        Supports JPG, PNG. Max 2MB.
      </p>
    </div>
  );
};

export default ImageUpload;
