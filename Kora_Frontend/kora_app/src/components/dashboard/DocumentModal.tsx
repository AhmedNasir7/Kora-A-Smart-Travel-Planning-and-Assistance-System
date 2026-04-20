'use client';

import { useState } from 'react';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DocumentFormData) => Promise<void>;
  isLoading?: boolean;
  initialData?: DocumentFormData;
}

export interface DocumentFormData {
  documentType: string;
  fileUrl?: string;
  fileName?: string;
}

const DOCUMENT_TYPES = [
  { value: 'Passport', emoji: '🛂', description: 'Passport or ID' },
  { value: 'Visa', emoji: '📋', description: 'Visa or travel permit' },
  { value: 'Ticket', emoji: '🎫', description: 'Flight or transport ticket' },
  { value: 'Booking', emoji: '🏨', description: 'Hotel or accommodation' },
  { value: 'Insurance', emoji: '🛡️', description: 'Travel insurance' },
  { value: 'Certificate', emoji: '📄', description: 'Vaccination or health cert' },
  { value: 'License', emoji: '🚗', description: 'Driver license' },
  { value: 'Other', emoji: '📑', description: 'Other document' },
];

export function DocumentModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData,
}: DocumentModalProps) {
  const [formData, setFormData] = useState<DocumentFormData>(
    initialData || {
      documentType: 'Passport',
      fileUrl: '',
      fileName: '',
    }
  );
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size must be less than 10MB');
      return;
    }

    // Validate file type (allow common document formats)
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setError('File type not supported. Please upload PDF, JPG, PNG, or Word documents');
      return;
    }

    setError(null);
    // Store file name
    setFormData({
      ...formData,
      fileName: file.name,
      // In a real app, you'd upload the file to cloud storage and get a URL back
      // For now, we'll use a data URL
      fileUrl: URL.createObjectURL(file),
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.documentType.trim()) {
      setError('Document type is required');
      return;
    }

    if (!formData.fileUrl && !formData.fileName) {
      setError('Please upload a document');
      return;
    }

    try {
      await onSubmit(formData);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save document');
    }
  };

  const handleClose = () => {
    setFormData(
      initialData || {
        documentType: 'Passport',
        fileUrl: '',
        fileName: '',
      }
    );
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A1D26] border border-[#2A2D35] rounded-3xl p-8 max-w-4xl w-full pointer-events-auto shadow-2xl shadow-black/50">
        {/* Close Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={handleClose}
            className="text-[#A0A5B8] hover:text-white transition-colors duration-200 p-2 hover:bg-[#2A2D35] rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-500/15 border border-red-500/30 rounded-lg p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Document Type - Wider Grid */}
          <div>
            <label className="text-lg font-semibold text-white mb-3 block">
              Document Type
            </label>
            <div className="grid grid-cols-4 gap-3">
              {DOCUMENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, documentType: type.value })
                  }
                  className={`py-4 px-4 rounded-lg border transition-all duration-200 text-center ${
                    formData.documentType === type.value
                      ? 'bg-[#FF7B54]/20 border-[#FF7B54]'
                      : 'bg-[#2A2D35]/50 border-[#2A2D35] hover:border-[#FF7B54]/50'
                  }`}
                  title={type.description}
                >
                  <div className="text-3xl mb-2">{type.emoji}</div>
                  <div className="text-xs font-medium text-[#A0A5B8]">
                    {type.value}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* File Upload - Drag and Drop */}
          <div>
            <label className="text-lg font-semibold text-white mb-3 block">
              Upload Document
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleFileDrop}
              className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 text-center cursor-pointer ${
                isDragOver
                  ? 'border-[#FF7B54] bg-[#FF7B54]/10'
                  : 'border-[#2A2D35] bg-[#13151A]/50 hover:border-[#FF7B54]/50'
              }`}
            >
              <input
                type="file"
                onChange={handleFileInputChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-3">
                <div className="text-5xl">📄</div>
                {formData.fileName ? (
                  <>
                    <p className="text-base font-semibold text-[#FF7B54]">
                      {formData.fileName}
                    </p>
                    <p className="text-sm text-[#7A7E8C]">Click to change or drag new file</p>
                  </>
                ) : (
                  <>
                    <p className="text-base font-semibold text-white">
                      Drag and drop your document
                    </p>
                    <p className="text-sm text-[#7A7E8C]">or click to browse</p>
                    <p className="text-xs text-[#5D677D] mt-2">
                      Supports: PDF, JPG, PNG, Word (Max 10MB)
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 bg-[#2A2D35] hover:bg-[#3A3F4A] text-white font-bold rounded-full transition-all duration-200 disabled:opacity-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-linear-to-r from-[#FF7B54] to-[#FF9F6F] hover:from-[#FF9F6F] hover:to-[#FFA880] text-white font-bold rounded-full transition-all duration-200 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
