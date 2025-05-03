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
      <div className="text-center py-20 px-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-indigo-50 mb-6">
          <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 className="text-xl font-medium text-gray-700 mb-2">Selection Required</h3>
        <p className="text-gray-500 max-w-sm mx-auto mb-8">
          Please select a parent item from the dropdown above to view or create {entityName.toLowerCase()}.
        </p>
        
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin h-12 w-12 rounded-full border-4 border-gray-200 border-t-indigo-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading {entityName.toLowerCase()}...</p>
      </div>
    );
  }
  
  if (items.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
        <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-indigo-50 mb-6">
          <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
        </div>
        <h3 className="text-xl font-medium text-gray-700 mb-2">No {entityName.toLowerCase()} found</h3>
        <p className="text-gray-500 max-w-sm mx-auto mb-8">
          Create your first {entityName.toLowerCase()} to get started organizing your curriculum
        </p>
        <button 
          onClick={onAddClick}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add {entityName}
        </button>
      </div>
    );
  }
  
  return (
    <div>
      {hierarchyInfo && (
        <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-100 rounded-xl flex items-center shadow-sm">
          <div className="rounded-full bg-indigo-100 p-3 mr-4">
            <svg className="w-5 h-5 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-indigo-900 leading-tight">
              {hierarchyInfo.type}: <span className="font-semibold">{hierarchyInfo.name}</span>
            </p>
            <p className="text-xs text-indigo-700 mt-1">
              Viewing {items.length} {entityName.toLowerCase()}{items.length !== 1 ? 's' : ''} within this {hierarchyInfo.type.toLowerCase()}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((item) => {
          const itemName = item.name || (item as Record<string, any>).title || '';
          const isTag = activeTab === 'tags';
          const tagColor = isTag ? item.color : undefined;
          
          return (
            <div 
              key={item.id} 
              className={`bg-white border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
                isTag ? 'border-t-[6px] rounded-t-lg' : 'rounded-xl'
              }`}
              style={isTag ? { borderTopColor: tagColor } : {}}
            >
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-900 flex items-center truncate max-w-[75%]">
                    {isTag && tagColor && (
                      <span 
                        className="w-3 h-3 rounded-full mr-2 flex-shrink-0" 
                        style={{ backgroundColor: tagColor }}
                      ></span>
                    )}
                    <span className="truncate">{itemName}</span>
                  </h3>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => onEditClick(item)}
                      className="text-gray-500 hover:text-indigo-600 p-1.5 rounded-full hover:bg-indigo-50 transition-colors"
                      title="Edit"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => onDeleteClick(item)}
                      className="text-gray-500 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors"
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
              </div>
              
              {(isTag && item.usage_count !== undefined) || (!item.description && !isTag) ? (
                <div className={`px-5 py-3 mt-1 border-t ${isTag ? 'bg-gray-50' : 'bg-gray-50'}`}>
                  {isTag && item.usage_count !== undefined ? (
                    <div className="text-xs flex items-center font-medium text-gray-600">
                      <svg className="mr-1.5 h-3 w-3 text-gray-500" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5zm2 6a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" fillRule="evenodd"></path>
                      </svg>
                      Used in {item.usage_count} question{item.usage_count !== 1 ? 's' : ''}
                    </div>
                  ) : (
                    <div className="text-xs flex items-center font-medium text-gray-600">
                      <svg className="mr-1.5 h-3 w-3 text-gray-500" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2m-6 0h8m-8 0V5m6 0v2M5 7H3h18h-2M8 7v13a2 2 0 002 2h4a2 2 0 002-2V7"></path>
                      </svg>
                      Created with no description
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {items.length > 0 && (
        <div className="mt-8 flex justify-center">
          <button 
            onClick={onAddClick}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Another {entityName}
          </button>
        </div>
      )}
    </div>
  );
};

export default ItemCardGrid;