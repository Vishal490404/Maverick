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

  const predefinedColors = [
    '#3498db', // blue
    '#2ecc71', // green
    '#e74c3c', // red
    '#f39c12', // orange
    '#9b59b6', // purple
    '#1abc9c', // teal
    '#34495e', // dark blue
    '#e67e22', // dark orange
  ];

  const handlePredefinedColorClick = (color: string) => {
    const event = {
      target: {
        name: 'color',
        value: color,
        type: 'color',
      },
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(event);
  };

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto" aria-labelledby="form-modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-700 bg-opacity-75 backdrop-blur-sm transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="relative inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-600"></div>
          
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 rounded-full bg-indigo-100 p-2">
                  {isEditing ? (
                    <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    </svg>
                  ) : (
                    <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                  )}
                </div>
                <h3 className="text-xl font-medium text-gray-900">
                  {isEditing ? 'Edit' : 'Create'} {entityName}
                </h3>
              </div>
              <button 
                onClick={onClose}
                className="flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <form onSubmit={onSubmit} className="overflow-hidden">
            <div className="bg-white px-6 py-5">
              {error && (
                <div className="mb-5 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-red-100 rounded-full p-2 mr-3">
                      <svg className="h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-red-800">Error</h4>
                      <p className="text-sm text-red-700 mt-0.5">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-6">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={onChange}
                      className="block w-full pl-10 py-3 px-4 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-lg"
                      placeholder={`Enter ${entityName.toLowerCase()} name`}
                      required
                    />
                  </div>
                </div>
                
                {/* Description toggle with improved UI */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-gray-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                      <label htmlFor="showDescription" className="font-medium text-gray-700">
                        Add Description
                      </label>
                    </div>
                    <div className="ml-4 flex items-center">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          const event = {
                            target: {
                              name: 'showDescription',
                              checked: !formData.showDescription,
                              type: 'checkbox',
                            },
                          } as React.ChangeEvent<HTMLInputElement>;
                          
                          onChange(event);
                        }}
                        className={`
                          relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                          ${formData.showDescription ? 'bg-indigo-600' : 'bg-gray-200'}
                        `}
                      >
                        <span className="sr-only">Add Description</span>
                        <span
                          className={`
                            pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200
                            ${formData.showDescription ? 'translate-x-5' : 'translate-x-0'}
                          `}
                        ></span>
                      </button>
                    </div>
                  </div>
                  
                  {formData.showDescription && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={onChange}
                        rows={3}
                        className="shadow-sm py-3 px-4 block w-full sm:text-sm border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder={`Enter a detailed description for this ${entityName.toLowerCase()}`}
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        A good description helps users understand what this {entityName.toLowerCase()} is for and how it should be used.
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Enhanced Color picker for tags */}
                {showColorPicker && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <svg className="h-5 w-5 text-gray-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                      <label htmlFor="color" className="font-medium text-gray-700">
                        Tag Color
                      </label>
                    </div>
                    
                    {/* Color selection with preview */}
                    <div className="flex items-center mb-4">
                      <div 
                        className="h-12 w-12 rounded-lg shadow-inner border border-gray-300 mr-4" 
                        style={{ backgroundColor: formData.color }}
                      ></div>
                      <div className="flex-1">
                        <input
                          type="text"
                          id="colorHex"
                          name="color"
                          value={formData.color}
                          onChange={onChange}
                          pattern="^#[0-9A-Fa-f]{6}$"
                          className="block w-full py-2 px-3 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="#3498db"
                        />
                      </div>
                      <div className="ml-3">
                        <input
                          type="color"
                          id="color"
                          name="color"
                          value={formData.color}
                          onChange={onChange}
                          className="h-9 w-9 cursor-pointer border-0 rounded p-0"
                          aria-label="Color picker"
                        />
                      </div>
                    </div>
                    
                    {/* Predefined colors palette */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-2">
                        Preset Colors
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {predefinedColors.map((color) => (
                          <button
                            key={color}
                            type="button"
                            className={`h-8 w-8 rounded-full focus:outline-none border-2 ${
                              color === formData.color ? 'ring-2 ring-offset-2 ring-gray-500' : 'hover:scale-110'
                            } transform transition-all`}
                            style={{ backgroundColor: color, borderColor: 'transparent' }}
                            onClick={() => handlePredefinedColorClick(color)}
                            aria-label={`Select color ${color}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-6 py-2.5 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex justify-center rounded-lg border border-transparent shadow-sm px-6 py-2.5 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors duration-150"
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormModal;