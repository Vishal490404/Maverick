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
      <div className="mb-6 p-5 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100 rounded-xl shadow-sm">
        <div className="flex items-center">
          <div className="flex-shrink-0 rounded-full bg-amber-100 p-3 mr-4">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-amber-800 mb-1">No {label.toLowerCase().replace('select ', '')} available</h3>
            <p className="text-sm text-amber-700">
              You need to create a {label.toLowerCase().replace('select ', '')} before you can continue.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Convert the parent options to the format expected by the Select component
  const selectOptions = options.map(option => ({
    value: option.id,
    label: option.name
  }));
  
  const placeholderText = `-- Select ${label.replace('Select ', '')} --`;
  
  return (
    <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center mb-4">
        <div className="bg-indigo-100 rounded-full p-2 mr-3">
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 className="font-medium text-gray-800">{label}</h3>
      </div>
      
      <Select
        id={`parentSelector-${label}`}
        options={selectOptions}
        value={value}
        onChange={onChange}
        placeholder={placeholderText}
        className="rounded-lg border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
      />
      
      {!value && (
        <div className="mt-3 flex items-center text-gray-500 text-sm">
          <svg className="mr-2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Please select a {label.toLowerCase().replace('select ', '')} to view or create items
        </div>
      )}
    </div>
  );
};

export default ParentSelector;