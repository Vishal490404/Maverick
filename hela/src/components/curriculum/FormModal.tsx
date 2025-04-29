import React from 'react';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="form-modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {isEditing ? 'Edit' : 'Create'} {entityName}
              </h3>
              <button 
                onClick={onClose}
                className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <form onSubmit={onSubmit}>
            <div className="bg-white px-6 py-5">
              {error && (
                <div className="mb-5 rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-5">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={onChange}
                      className="block w-full py-3 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md placeholder-gray-400"
                      placeholder={`Enter ${entityName.toLowerCase()} name`}
                      required
                    />
                  </div>
                </div>
                
                {/* Description toggle checkbox */}
                <div className="flex items-center">
                  <input
                    id="showDescription"
                    name="showDescription"
                    type="checkbox"
                    checked={formData.showDescription}
                    onChange={onChange}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="showDescription" className="ml-2 block text-sm font-medium text-gray-700">
                    Add Description
                  </label>
                </div>
                
                {/* Show description field only if checkbox is checked */}
                {formData.showDescription && (
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={onChange}
                        rows={3}
                        className="shadow-sm py-3 px-4 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md placeholder-gray-400"
                        placeholder={`Enter a detailed description for this ${entityName.toLowerCase()}`}
                      />
                    </div>
                  </div>
                )}
                
                {/* Color picker for tags */}
                {showColorPicker && (
                  <div className="space-y-3 pt-2 border border-gray-200 rounded-md p-4 bg-gray-50">
                    <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                      Tag Color
                    </label>
                    
                    {/* Enhanced color picker */}
                    <div className="flex space-x-3 items-center">
                      <div className="relative">
                        <input
                          type="color"
                          id="color"
                          name="color"
                          value={formData.color}
                          onChange={onChange}
                          className="h-20 w-20 cursor-pointer border-0"
                          aria-label="Color picker"
                        />
                      </div>
                      <div className="flex-1">
                        <label htmlFor="colorHex" className="block text-xs text-gray-500 mb-1">
                          Hex value
                        </label>
                        <input
                          type="text"
                          id="colorHex"
                          name="color"
                          value={formData.color}
                          onChange={onChange}
                          pattern="^#[0-9A-Fa-f]{6}$"
                          className="w-full py-3 px-4 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="#3498db"
                          aria-label="Color hex code"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Select a color for this tag. This color will be used to visually identify the tag throughout the application.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors duration-150"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEditing ? 'Update' : 'Create'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-150"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormModal;