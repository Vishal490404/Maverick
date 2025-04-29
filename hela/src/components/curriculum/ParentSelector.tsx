import React from 'react';
import { Select } from '../../components/ui';

interface ParentOption {
  id: string;
  name: string;
}

interface ParentSelectorProps {
  label: string;
  options: ParentOption[];
  value: string;
  onChange: (value: string) => void;
  required: boolean;
}

const ParentSelector: React.FC<ParentSelectorProps> = ({
  label,
  options,
  value,
  onChange,
  required
}) => {
  if (!required) return null;
  
  if (options.length === 0) {
    return (
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-100 rounded-md shadow-sm">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <p className="text-sm text-yellow-800">
            No {label.toLowerCase().replace('select ', '')} available. Please create one first.
          </p>
        </div>
      </div>
    );
  }
  
  // Convert the parent options to the format expected by the Select component
  const selectOptions = options.map(option => ({
    value: option.id,
    label: option.name
  }));
  
  const placeholderText = `-- ${label.replace('Select ', '')} --`;
  
  return (
    <div className="mb-6">
      <Select
        id={`parentSelector-${label}`}
        label={label}
        options={selectOptions}
        value={value}
        onChange={onChange}
        placeholder={placeholderText}
        className={!value ? "pb-5" : ""}
      />
      
      {!value && (
        <p className="mt-1 text-xs text-gray-500 absolute">Please select a {label.toLowerCase().replace('select ', '')} to continue</p>
      )}
    </div>
  );
};

export default ParentSelector;