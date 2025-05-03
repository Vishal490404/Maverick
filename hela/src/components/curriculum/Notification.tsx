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
  const [progress, setProgress] = useState<number>(100);
  
  // Format the message - sometimes backend errors come as objects or complex strings
  const formatErrorMessage = (msg: string | null): string => {
    if (!msg) return '';
    
    try {
      // Check if message is a JSON string
      if (msg.startsWith('{') && msg.endsWith('}')) {
        const parsed = JSON.parse(msg);
        if (parsed.message) return parsed.message;
        if (parsed.error) return parsed.error;
        if (typeof parsed === 'object') {
          return Object.values(parsed).join(', ');
        }
      }
      
      // Return plain message
      return msg;
    } catch (e) {
      // If parsing fails, return original message
      return msg;
    }
  };
  
  const formattedMessage = formatErrorMessage(message);
  
  useEffect(() => {
    if (message) {
      setIsVisible(true);
      setProgress(100);
      
      const decrementInterval = 20; // Update every 20ms
      const decrementAmount = (decrementInterval / autoCloseDelay) * 100;
      
      const progressTimer = setInterval(() => {
        setProgress(prev => Math.max(prev - decrementAmount, 0));
      }, decrementInterval);
      
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);
      
      return () => {
        clearTimeout(timer);
        clearInterval(progressTimer);
      };
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
  
  const getNotificationStyles = () => {
    if (type === 'success') {
      return {
        container: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-green-100/50',
        icon: 'bg-green-100 text-green-600',
        text: 'text-green-800',
        progressBar: 'bg-green-500'
      };
    } else {
      return {
        container: 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300 shadow-red-100/50',
        icon: 'bg-red-100 text-red-600',
        text: 'text-red-800',
        progressBar: 'bg-red-500'
      };
    }
  };
  
  const styles = getNotificationStyles();
  
  return (
    <div 
      className={`fixed top-5 right-5 z-50 transform transition-all duration-300 max-w-md ${
        isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-5 opacity-0 scale-95'
      }`}
      role="alert"
    >
      <div className={`${styles.container} border px-4 py-4 rounded-xl shadow-lg relative overflow-hidden`}>
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-full ${styles.icon} p-2 mr-4`}>
            {type === 'success' ? (
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="flex-grow">
            <h3 className={`font-medium ${styles.text}`}>
              {type === 'success' ? 'Success!' : 'Error'}
            </h3>
            <p className={`text-sm ${styles.text} opacity-90 mt-1 pr-6`}>{formattedMessage}</p>
          </div>
          <div className="ml-2">
            <button
              onClick={handleClose}
              className={`rounded-full p-1.5 ${type === 'success' ? 'hover:bg-green-100' : 'hover:bg-red-100'} transition-colors`}
            >
              <span className="sr-only">Dismiss</span>
              <svg className={`h-4 w-4 ${styles.text}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
          <div 
            className={`h-full ${styles.progressBar} transition-all ease-linear duration-100`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Notification;