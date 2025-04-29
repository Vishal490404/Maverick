import React, { useEffect, useState } from 'react';

interface NotificationProps {
  type: 'success' | 'error' | null;
  message: string | null;
  onClose?: () => void;
  autoCloseDelay?: number;
}

const Notification: React.FC<NotificationProps> = ({
  type,
  message,
  onClose,
  autoCloseDelay = 5000 // Auto close after 5 seconds by default
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  
  useEffect(() => {
    if (message) {
      setIsVisible(true);
      
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [message, autoCloseDelay]);
  
  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      setTimeout(() => {
        onClose();
      }, 300); // Delay for animation to complete
    }
  };
  
  if (!message || !type) return null;
  
  const bgColor = type === 'success' ? 'bg-green-50' : 'bg-red-50';
  const borderColor = type === 'success' ? 'border-green-400' : 'border-red-400';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const iconColor = type === 'success' ? 'text-green-400' : 'text-red-400';
  
  return (
    <div 
      className={`fixed top-5 right-5 z-50 transform transition-all duration-300 max-w-sm ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0'
      }`}
      role="alert"
    >
      <div className={`${bgColor} border ${borderColor} px-4 py-3 rounded-md shadow-lg`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {type === 'success' ? (
              <svg className={`h-5 w-5 ${iconColor}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className={`h-5 w-5 ${iconColor}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="ml-3">
            <p className={`text-sm font-medium ${textColor}`}>{message}</p>
          </div>
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={handleClose}
                className={`inline-flex rounded-md p-1.5 ${iconColor} hover:bg-${type === 'success' ? 'green' : 'red'}-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${type === 'success' ? 'green' : 'red'}-500`}
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification;