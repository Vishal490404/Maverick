import React, { useState, useRef, useEffect } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  id?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

const Select: React.FC<SelectProps> = ({
  id,
  options,
  value,
  onChange,
  placeholder = "Select an option",
  label,
  className = "",
  disabled = false,
  required = false,
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : options.length - 1));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex(prev => (prev < options.length - 1 ? prev + 1 : 0));
      } else if (e.key === "Enter" && isOpen) {
        e.preventDefault();
        if (options[highlightedIndex]) {
          onChange(options[highlightedIndex].value);
          setIsOpen(false);
        }
      }
    };
    
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, highlightedIndex, options, onChange]);

  // Reset highlighted index when opening dropdown
  useEffect(() => {
    if (isOpen) {
      const selectedIndex = options.findIndex(option => option.value === value);
      setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
  }, [isOpen, options, value]);

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div 
        ref={containerRef} 
        className="relative"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-owns={isOpen ? `${id}-options` : undefined}
      >
        <div
          onClick={() => !disabled && setIsOpen(prev => !prev)}
          className={`
            flex items-center justify-between w-full px-4 py-2.5 text-base 
            border rounded-md shadow-sm cursor-pointer focus:outline-none 
            transition-colors duration-200
            ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white hover:border-indigo-300'} 
            ${error ? 'border-red-300' : isOpen ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-300'}
          `}
          role="combobox"
          aria-controls={isOpen ? `${id}-options` : undefined}
          aria-activedescendant={isOpen && options[highlightedIndex] ? `${id}-option-${options[highlightedIndex].value}` : undefined}
          tabIndex={disabled ? -1 : 0}
          id={id}
        >
          <span className={`block truncate ${!selectedOption && 'text-gray-400'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className="flex items-center ml-2 pointer-events-none">
            <svg 
              className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'transform rotate-180 text-indigo-500' : 'text-gray-400'}`} 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                clipRule="evenodd" 
              />
            </svg>
          </span>
        </div>
        
        {isOpen && (
          <ul
            className="absolute z-10 mt-1 w-full py-1 bg-white rounded-md shadow-lg max-h-60 overflow-y-auto text-base ring-1 ring-black ring-opacity-5 focus:outline-none"
            role="listbox"
            id={`${id}-options`}
            style={{ scrollbarWidth: 'thin' }}
          >
            {options.map((option, index) => (
              <li
                key={option.value}
                className={`
                  py-2 px-4 cursor-pointer select-none relative
                  ${index === highlightedIndex ? 'bg-indigo-50 text-indigo-700' : 'text-gray-900'}
                  ${option.value === value ? 'bg-indigo-50 font-medium text-indigo-700' : 'hover:bg-gray-50'}
                `}
                role="option"
                aria-selected={option.value === value}
                id={`${id}-option-${option.value}`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <span className="block truncate">
                  {option.label}
                </span>
                {option.value === value && (
                  <span className="absolute inset-y-0 right-4 flex items-center">
                    <svg className="h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Select;