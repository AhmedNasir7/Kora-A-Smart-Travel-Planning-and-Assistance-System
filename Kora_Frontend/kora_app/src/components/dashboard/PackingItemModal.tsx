'use client';

import { useState } from 'react';

interface PackingItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PackingItemFormData) => Promise<void>;
  isLoading?: boolean;
  initialData?: PackingItemFormData;
  isEditMode?: boolean;
}

export interface PackingItemFormData {
  itemName: string;
  category: string;
  quantity: number;
  isPacked?: boolean;
  notes?: string;
}

const PACKING_CATEGORIES = [
  { name: 'Clothing', emoji: '👕', items: ['Shirts', 'Pants', 'Dresses', 'Underwear', 'Socks', 'Jackets'] },
  { name: 'Documents', emoji: '📄', items: ['Passport', 'Tickets', 'Hotel Bookings', 'Insurance'] },
  { name: 'Electronics', emoji: '📱', items: ['Phone', 'Charger', 'Laptop', 'Headphones', 'Power Bank'] },
  { name: 'Toiletries', emoji: '🧴', items: ['Toothbrush', 'Shampoo', 'Sunscreen', 'Deodorant'] },
  { name: 'Medications', emoji: '💊', items: ['Painkillers', 'Allergy Meds', 'Prescriptions'] },
  { name: 'Accessories', emoji: '👜', items: ['Watch', 'Glasses', 'Jewelry', 'Bag', 'Hat'] },
  { name: 'Shoes', emoji: '👟', items: ['Sneakers', 'Formal Shoes', 'Sandals', 'Boots'] },
  { name: 'Other', emoji: '📦', items: ['Snacks', 'Books', 'Camera', 'Travel Pillow'] },
];

export function PackingItemModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData,
  isEditMode = false,
}: PackingItemModalProps) {
  const [formData, setFormData] = useState<PackingItemFormData>(
    initialData || {
      itemName: '',
      category: 'Clothing',
      quantity: 1,
      isPacked: false,
      notes: '',
    }
  );
  const [error, setError] = useState<string | null>(null);

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
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save item');
    }
  };

  const handleClose = () => {
    setFormData(
      initialData || {
        itemName: '',
        category: 'Clothing',
        quantity: 1,
        isPacked: false,
        notes: '',
      }
    );
    setError(null);
    onClose();
  };

  const currentCategory = PACKING_CATEGORIES.find((c) => c.name === formData.category);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A1D26] border border-[#2A2D35] rounded-3xl p-8 max-w-md w-full pointer-events-auto shadow-2xl shadow-black/50 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {isEditMode ? 'Edit Item' : 'Add Packing Item'}
          </h2>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category */}
          <div>
            <label className="text-sm font-semibold text-white mb-2 block">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-[#13151A] border border-[#2A2D35] rounded-lg text-white focus:border-[#FF7B54] focus:outline-none transition-all duration-200"
            >
              {PACKING_CATEGORIES.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.emoji} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Item Name */}
          <div>
            <label className="text-sm font-semibold text-white mb-2 block">
              Item Name *
            </label>
            <input
              type="text"
              value={formData.itemName}
              onChange={(e) =>
                setFormData({ ...formData, itemName: e.target.value })
              }
              placeholder="e.g., T-shirts"
              list="items"
              className="w-full px-4 py-2.5 bg-[#13151A] border border-[#2A2D35] rounded-lg text-white placeholder-[#5D677D] focus:border-[#FF7B54] focus:outline-none transition-all duration-200"
            />
            {/* Datalist for quick suggestions */}
            <datalist id="items">
              {currentCategory?.items.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </div>

          {/* Quantity */}
          <div>
            <label className="text-sm font-semibold text-white mb-2 block">
              Quantity *
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    quantity: Math.max(1, formData.quantity - 1),
                  })
                }
                className="px-3 py-2 bg-[#2A2D35] hover:bg-[#3A3F4A] text-white rounded-lg transition-all"
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
                className="flex-1 px-4 py-2.5 bg-[#13151A] border border-[#2A2D35] rounded-lg text-white text-center focus:border-[#FF7B54] focus:outline-none"
              />
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    quantity: formData.quantity + 1,
                  })
                }
                className="px-3 py-2 bg-[#2A2D35] hover:bg-[#3A3F4A] text-white rounded-lg transition-all"
              >
                +
              </button>
            </div>
          </div>

          {/* Packed Status */}
          <div className="flex items-center gap-3 p-3 bg-[#2A2D35]/50 rounded-lg">
            <input
              type="checkbox"
              id="isPacked"
              checked={formData.isPacked || false}
              onChange={(e) =>
                setFormData({ ...formData, isPacked: e.target.checked })
              }
              className="w-4 h-4 rounded cursor-pointer accent-[#FF7B54]"
            />
            <label htmlFor="isPacked" className="text-sm font-medium text-[#A0A5B8] cursor-pointer flex-1">
              Mark as packed
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-semibold text-white mb-2 block">
              Notes (optional)
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value || undefined })
              }
              placeholder="Additional details about this item"
              rows={2}
              className="w-full px-4 py-2.5 bg-[#13151A] border border-[#2A2D35] rounded-lg text-white placeholder-[#5D677D] focus:border-[#FF7B54] focus:outline-none transition-all duration-200 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3.5 bg-[#2A2D35] hover:bg-[#3A3F4A] text-white font-bold rounded-full transition-all duration-200 disabled:opacity-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3.5 bg-linear-to-r from-[#FF7B54] to-[#FF9F6F] hover:from-[#FF9F6F] hover:to-[#FFA880] text-white font-bold rounded-full transition-all duration-200 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : isEditMode ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
