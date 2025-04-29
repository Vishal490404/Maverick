import React from 'react';

interface CurriculumItem {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  color?: string;
  usage_count?: number;
}

interface HierarchyInfo {
  type: string;
  name: string;
}

interface ItemCardGridProps {
  items: CurriculumItem[];
  entityName: string;
  isLoading: boolean;
  hierarchyInfo: HierarchyInfo | null;
  parentSelectionRequired: boolean;
  hasParentSelected: boolean;
  onAddClick: () => void;
  onEditClick: (item: CurriculumItem) => void;
  onDeleteClick: (item: CurriculumItem) => void;
  activeTab: string;
}

const ItemCardGrid: React.FC<ItemCardGridProps> = ({
  items,
  entityName,
  isLoading,
  hierarchyInfo,
  parentSelectionRequired,
  hasParentSelected,
  onAddClick,
  onEditClick,
  onDeleteClick,
  activeTab
}) => {
  if (parentSelectionRequired && !hasParentSelected) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
        <div className="inline-block p-3 rounded-full bg-gray-100 text-gray-400 mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <p className="text-gray-600 font-medium mb-1">Selection Required</p>
        <p className="text-sm text-gray-500">
          Please select a parent item to continue
        </p>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block animate-spin h-10 w-10 rounded-full border-4 border-gray-200 border-t-indigo-600 mb-4"></div>
        <p className="text-gray-600">Loading {entityName.toLowerCase()}...</p>
      </div>
    );
  }
  
  if (items.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-dashed border-gray-300">
        <div className="inline-block p-3 rounded-full bg-gray-50 text-gray-400 mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
        </div>
        <p className="text-gray-700 font-medium mb-2">No {entityName.toLowerCase()} found</p>
        <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
          Create your first {entityName.toLowerCase()} to get started
        </p>
      </div>
    );
  }
  
  return (
    <div>
      {hierarchyInfo && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-md flex items-center shadow-sm">
          <div className="rounded-full bg-blue-100 p-2 mr-3">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-800 leading-tight">
              {hierarchyInfo.type}: {hierarchyInfo.name}
            </p>
            <p className="text-xs text-blue-600 mt-0.5">
              Viewing {entityName.toLowerCase()} within this {hierarchyInfo.type.toLowerCase()}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          const itemName = item.name || (item as Record<string, any>).title || '';
          const isTag = activeTab === 'tags';
          const tagColor = isTag ? item.color : undefined;
          
          return (
            <div 
              key={item.id} 
              className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-all p-5 relative group ${
                isTag ? 'border-l-[6px]' : ''
              }`}
              style={isTag ? { borderLeftColor: tagColor } : {}}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-900 flex items-center truncate max-w-[70%]">
                  {isTag && tagColor && (
                    <span 
                      className="w-3 h-3 rounded-full mr-2 flex-shrink-0" 
                      style={{ backgroundColor: tagColor }}
                    ></span>
                  )}
                  <span className="truncate">{itemName}</span>
                </h3>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEditClick(item)}
                    className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition-colors"
                    title="Edit"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => onDeleteClick(item)}
                    className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
              
              {item.description && (
                <p className="text-sm text-gray-500 mt-3 line-clamp-2">{item.description}</p>
              )}
              
              {isTag && item.usage_count !== undefined && (
                <div className="mt-3 text-xs inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-gray-600">
                  <svg className="mr-1.5 h-2.5 w-2.5" fill="currentColor" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3" />
                  </svg>
                  Used in {item.usage_count} question{item.usage_count !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ItemCardGrid;