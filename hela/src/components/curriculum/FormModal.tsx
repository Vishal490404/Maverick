import React, { useEffect, useRef } from 'react';

interface FormData {
  name: string;
  description: string;
  color: string;
  showDescription: boolean;
}

interface FormModalProps {
  isOpen: boolean;
  isEditing: boolean;
  formData: FormData;
  entityName: string;
  isLoading: boolean;
  error: string | null;
  showColorPicker: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  isEditing,
  formData,
  entityName,
  isLoading,
  error,
  showColorPicker,
  onClose,
  onSubmit,
  onChange
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/20 backdrop-blur-sm">
      <div ref={modalRef} className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {isEditing ? 'Edit' : 'Create'} {entityName}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            &times;
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 text-sm p-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onChange}
              required
              className="w-full px-3 py-2 border rounded shadow-sm focus:ring focus:ring-indigo-200"
              placeholder={`Enter ${entityName.toLowerCase()} name`}
            />
          </div>

          <div>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="showDescription"
                checked={formData.showDescription}
                onChange={onChange}
                className="mr-2"
              />
              <span className="text-sm font-medium">Add Description</span>
            </label>
            {formData.showDescription && (
              <textarea
                name="description"
                value={formData.description}
                onChange={onChange}
                rows={3}
                className="mt-2 w-full px-3 py-2 border rounded shadow-sm focus:ring focus:ring-indigo-200"
                placeholder={`Enter description for this ${entityName.toLowerCase()}`}
              />
            )}
          </div>

          {showColorPicker && (
            <div>
              <label className="block text-sm font-medium mb-1">Tag Color</label>
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={onChange}
                className="w-16 h-10 p-0 border-0 cursor-pointer"
              />
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300"
            >
              {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormModal;
