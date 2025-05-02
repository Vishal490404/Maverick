import React from 'react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  itemName: string;
  entityName: string;
  usageCount?: number;
  isTag: boolean;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  itemName,
  entityName,
  usageCount = 0,
  isTag,
  isLoading,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const hasUsages = isTag && usageCount > 0;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-700 bg-opacity-75 backdrop-blur-sm" 
          aria-hidden="true"
          onClick={onCancel}
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        {/* Modal panel */}
        <div className="relative inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-2xl shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
                  <svg className="w-6 h-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Delete {entityName}
                </h3>
              </div>
              <button 
                onClick={onCancel}
                className="flex items-center justify-center w-8 h-8 text-gray-400 transition-colors rounded-full hover:bg-gray-100 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {hasUsages ? (
              <div className="space-y-4">
                <div className="flex p-4 border border-yellow-200 rounded-xl bg-gradient-to-r from-yellow-50 to-amber-50">
                  <div className="mr-4 text-amber-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-800">Warning: This tag is currently in use</h4>
                    <p className="mt-1 text-sm text-amber-700">
                      This tag is used in <span className="font-semibold">{usageCount}</span> question{usageCount !== 1 ? 's' : ''}. Deleting it may affect existing questions.
                    </p>
                  </div>
                </div>
                <div className="p-4 border border-red-100 rounded-xl bg-gradient-to-r from-red-50 to-rose-50">
                  <p className="text-red-700">
                    Are you sure you want to delete <span className="font-semibold">"{itemName}"</span>?
                  </p>
                  <p className="mt-2 text-sm text-red-600">
                    This action cannot be undone. This will permanently remove this {entityName.toLowerCase()} from your curriculum.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 border border-red-100 rounded-xl bg-gradient-to-r from-red-50 to-rose-50">
                <p className="text-red-700 font-medium">
                  Are you sure you want to delete <span className="font-semibold">"{itemName}"</span>?
                </p>
                <p className="mt-2 text-sm text-red-600">
                  This action cannot be undone. This will permanently remove this {entityName.toLowerCase()} from your curriculum.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse px-6 py-4 space-y-3 space-y-reverse border-t border-gray-200 sm:flex-row sm:space-y-0 sm:space-x-3 sm:justify-end bg-gray-50">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 mr-2 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </>
              ) : (
                <>
                  Delete {entityName}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;