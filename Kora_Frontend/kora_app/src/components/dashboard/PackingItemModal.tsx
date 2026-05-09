'use client';

import { useState, useRef } from 'react';

interface PackingItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PackingItemFormData) => Promise<void>;
  isLoading?: boolean;
  initialData?: PackingItemFormData;
  isEditMode?: boolean;
  selectedCategory?: string;
}

export interface PackingItemFormData {
  itemName: string;
  category: string;
  quantity: number;
  isPacked?: boolean;
  notes?: string;
}

export function PackingItemModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData,
  isEditMode = false,
  selectedCategory = 'Clothing',
}: PackingItemModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<PackingItemFormData>(
    initialData || {
      itemName: '',
      category: selectedCategory,
      quantity: 1,
      isPacked: false,
      notes: '',
    }
  );
  const [error, setError] = useState<string | null>(null);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking directly on the backdrop (not on modal content)
    if (e.currentTarget === e.target) {
      handleClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.itemName.trim()) {
      setError('Item name is required');
      return;
    }

    if (formData.quantity < 1) {
      setError('Quantity must be at least 1');
      return;
    }

    try {
      await onSubmit(formData);
      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save item');
    }
  };

  const resetForm = () => {
    setFormData(
      initialData || {
        itemName: '',
        category: selectedCategory,
        quantity: 1,
        isPacked: false,
        notes: '',
      }
    );
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div ref={modalRef} className="bg-[#1A1D26] border border-[#2A2D35] rounded-3xl p-5 max-w-sm w-full shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">
            {isEditMode ? 'Edit Item' : 'Add Item'}
          </h2>
          <button
            onClick={handleClose}
            className="text-[#A0A5B8] hover:text-white transition-colors duration-200 p-1.5 hover:bg-[#2A2D35] rounded-lg shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-3 bg-red-500/15 border border-red-500/30 rounded-lg p-2.5">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Category Display - Fixed/Read-only */}
          <div>
            <label className="text-xs font-semibold text-[#A0A5B8] uppercase tracking-wide mb-1 block">
              Category
            </label>
            <div className="px-3.5 py-2 bg-[#0B1424]/70 border border-[#1D2C42] rounded-lg">
              <p className="text-white font-semibold text-sm">{formData.category}</p>
            </div>
          </div>

          {/* Item Name */}
          <div>
            <label className="text-xs font-semibold text-white mb-1 block">
              Item Name *
            </label>
            <input
              type="text"
              value={formData.itemName}
              onChange={(e) =>
                setFormData({ ...formData, itemName: e.target.value })
              }
              placeholder="e.g., T-shirts"
              className="w-full px-3 py-2 bg-[#13151A] border border-[#2A2D35] rounded-lg text-white placeholder-[#5D677D] focus:border-[#FF7B54] focus:outline-none transition-all duration-200 text-sm"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="text-xs font-semibold text-white mb-1 block">
              Quantity *
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    quantity: Math.max(1, formData.quantity - 1),
                  })
                }
                className="px-2 py-1 bg-[#2A2D35] hover:bg-[#3A3F4A] text-white rounded-lg transition-all text-sm font-medium"
              >
                −
              </button>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: parseInt(e.target.value) || 1,
                  })
                }
                className="flex-1 px-2.5 py-1 bg-[#13151A] border border-[#2A2D35] rounded-lg text-white text-center focus:border-[#FF7B54] focus:outline-none text-sm"
              />
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    quantity: formData.quantity + 1,
                  })
                }
                className="px-2 py-1 bg-[#2A2D35] hover:bg-[#3A3F4A] text-white rounded-lg transition-all text-sm font-medium"
              >
                +
              </button>
            </div>
          </div>

          {/* Packed Status */}
          <div className="flex items-center gap-2 p-2 bg-[#2A2D35]/50 rounded-lg">
            <input
              type="checkbox"
              id="isPacked"
              checked={formData.isPacked || false}
              onChange={(e) =>
                setFormData({ ...formData, isPacked: e.target.checked })
              }
              className="w-4 h-4 rounded cursor-pointer accent-[#FF7B54]"
            />
            <label htmlFor="isPacked" className="text-xs font-medium text-[#A0A5B8] cursor-pointer flex-1">
              Mark as packed
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-white mb-1 block">
              Notes (optional)
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value || undefined })
              }
              placeholder="Add details..."
              rows={1}
              className="w-full px-3 py-1.5 bg-[#13151A] border border-[#2A2D35] rounded-lg text-white placeholder-[#5D677D] focus:border-[#FF7B54] focus:outline-none transition-all duration-200 resize-none text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-[#2A2D35] hover:bg-[#3A3F4A] text-white font-semibold rounded-full transition-all duration-200 disabled:opacity-50 text-sm"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-[#FF7B54] to-[#FF9F6F] hover:from-[#FF9F6F] hover:to-[#FFA880] text-white font-semibold rounded-full transition-all duration-200 disabled:opacity-50 text-sm"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : isEditMode ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
