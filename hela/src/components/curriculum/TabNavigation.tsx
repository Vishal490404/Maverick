import React from 'react';

interface TabProps {
  activeTab: 'standards' | 'subjects' | 'chapters' | 'topics' | 'questionTypes' | 'tags';
  onTabChange: (tab: 'standards' | 'subjects' | 'chapters' | 'topics' | 'questionTypes' | 'tags') => void;
}

const tabs = [
  { 
    key: 'standards', 
    label: 'Standards',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
    )
  },
  { 
    key: 'subjects', 
    label: 'Subjects',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
      </svg>
    )
  },
  { 
    key: 'chapters', 
    label: 'Chapters',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
      </svg>
    )
  },
  { 
    key: 'topics', 
    label: 'Topics',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path>
      </svg>
    )
  },
  { 
    key: 'questionTypes', 
    label: 'Question Types',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    )
  },
  { 
    key: 'tags', 
    label: 'Tags',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
      </svg>
    )
  }
];

const TabNavigation: React.FC<TabProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex space-x-4 overflow-x-auto" aria-label="Tabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key as typeof activeTab)}
            className={`
              group relative py-4 px-4 flex items-center whitespace-nowrap transition-all duration-200
              text-sm font-medium ${activeTab === tab.key 
                ? 'text-indigo-600' 
                : 'text-gray-500 hover:text-gray-700'
              }
            `}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500"></span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default TabNavigation;