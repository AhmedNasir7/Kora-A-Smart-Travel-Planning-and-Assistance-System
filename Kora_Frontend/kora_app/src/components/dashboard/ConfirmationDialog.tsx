'use client';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error('Confirmation action failed:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A1D26] border border-[#2A2D35] rounded-3xl p-8 max-w-sm w-full pointer-events-auto shadow-2xl shadow-black/50">
        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-3">{title}</h2>

        {/* Message */}
        <p className="text-[#A0A5B8] mb-8 leading-relaxed">{message}</p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-6 py-3.5 bg-[#2A2D35] hover:bg-[#3A3F4A] text-white font-bold rounded-full transition-all duration-200 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex-1 px-6 py-3.5 text-white font-bold rounded-full transition-all duration-200 disabled:opacity-50 ${
              isDangerous
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-linear-to-r from-[#FF7B54] to-[#FF9F6F] hover:from-[#FF9F6F] hover:to-[#FFA880]'
            }`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
