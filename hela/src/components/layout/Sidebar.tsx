import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  admin?: boolean;
}

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // Handle clicking outside of sidebar to collapse it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Collapse sidebar when clicking outside, but not during navigation
      if (sidebarRef.current && 
          !sidebarRef.current.contains(event.target as Node) && 
          !isCollapsed && 
          !localStorage.getItem('manualToggle')) {
        setIsCollapsed(true);
      }
      
      // Also handle profile menu closing
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCollapsed]);
  
  // Reset manualToggle on location change
  useEffect(() => {
    // Clear any existing manualToggle when location changes
    localStorage.removeItem('manualToggle');
  }, [location.pathname]);

  // Added to persist collapsed state in localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setIsCollapsed(savedState === 'true');
    }
  }, []);

  // Add keyboard shortcut (Ctrl+B) for toggling sidebar
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Check for Ctrl+B (or Cmd+B on Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault(); // Prevent browser default behavior
        toggleSidebar();
      }
    }
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isCollapsed]);

  // Toggle sidebar collapsed state and save to localStorage
  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
    // Set a flag to indicate manual toggle
    localStorage.setItem('manualToggle', 'true');
    // Clear the flag after 2 seconds to re-enable hover behavior
    setTimeout(() => {
      localStorage.removeItem('manualToggle');
    }, 2000);
  };

  // Handle profile menu mouse events
  const handleMouseEnter = () => {
    setShowProfileMenu(true);
  };

  const handleMouseLeave = () => {
    setShowProfileMenu(false);
  };

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    navigate('/');
  };

  // Handle sidebar expand/collapse on hover
  const handleSidebarMouseEnter = () => {
    // Only expand via hover if user hasn't manually toggled
    if (!localStorage.getItem('manualToggle')) {
      setIsCollapsed(false);
    }
  };

  const handleSidebarMouseLeave = () => {
    // Only collapse via hover if user hasn't manually toggled
    if (!localStorage.getItem('manualToggle')) {
      setIsCollapsed(true);
    }
  };
  
  const navigation: NavItem[] = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: 'Curriculum',
      path: '/curriculum',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      name: 'Question Banks',
      path: '/question-banks',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      name: 'Create Paper',
      path: '/create',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      name: 'All Papers',
      path: '/papers',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      name: 'Register Users',
      path: '/signup',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      admin: true
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ];

  // Improved path matching logic for active state detection
  const isPathActive = (path: string): boolean => {
    // Exact match
    if (location.pathname === path) return true;
    
    // Special handling for root paths and their sub-routes
    if (path !== '/') {
      // For index routes with potential sub-routes (e.g., /papers vs /papers/create)
      if (path.split('/').length === 2 && location.pathname.startsWith(path + '/')) {
        // Don't highlight parent for specific child routes that have their own nav items
        const childPaths = navigation
          .filter(item => item.path !== path && item.path.startsWith(path + '/'))
          .map(item => item.path);
          
        // If the current path matches a specific child route with its own nav item, 
        // don't highlight the parent
        if (childPaths.some(childPath => location.pathname === childPath)) {
          return false;
        }
        
        // Otherwise, highlight the parent for other sub-routes
        return true;
      }
    }
    
    return false;
  };

  // Added logic to show 'Create Question' in Question Bank
  useEffect(() => {
    const showCreateQuestion = () => {
      const createQuestionNavItem: NavItem = {
        name: 'Create Question',
        path: '/questions/create',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        )
      };

      // Add 'Create Question' to navigation temporarily
      navigation.push(createQuestionNavItem);

      // Remove it after a delay (e.g., 5 seconds)
      setTimeout(() => {
        const index = navigation.findIndex(item => item.name === 'Create Question');
        if (index !== -1) {
          navigation.splice(index, 1);
        }
      }, 5000);
    };

    // Call this function when navigating to Question Bank
    if (location.pathname === '/question-banks') {
      showCreateQuestion();
    }
  }, [location.pathname]);

  return (
    <div 
      ref={sidebarRef}
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col fixed md:static inset-y-0 left-0 z-40`}
      onMouseEnter={handleSidebarMouseEnter}
      onMouseLeave={handleSidebarMouseLeave}
    >
      {/* Logo and Brand - Add keyboard shortcut hint */}
      <div 
        className="h-16 flex items-center justify-between px-4 border-b border-gray-200 flex-shrink-0 relative cursor-pointer"
        onClick={toggleSidebar}
        title="Toggle sidebar (Ctrl+B)"
      >
        <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : ''}`}>
          <svg className="h-8 w-8 text-indigo-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 6.25278V19.2528M12 6.25278C10.8321 5.47686 9.24649 5 7.5 5C5.75351 5 4.16789 5.47686 3 6.25278V19.2528C4.16789 18.4769 5.75351 18 7.5 18C9.24649 18 10.8321 18.4769 12 19.2528M12 6.25278C13.1679 5.47686 14.7535 5 16.5 5C18.2465 5 19.8321 5.47686 21 6.25278V19.2528C19.8321 18.4769 18.2465 18 16.5 18C14.7535 18 13.1679 18.4769 12 19.2528" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {!isCollapsed && (
            <>
              <span className="ml-2 text-lg font-bold text-gray-900">ExamCraft</span>
            </>
          )}
        </div>
      </div>

      {/* Navigation Links - Fixed scrolling with improved CSS */}
      <nav className="px-2 py-4 flex-grow overflow-y-auto overflow-x-hidden">
        <div className="space-y-1">
          {navigation
            .filter(item => !item.admin || (item.admin && user?.is_superuser))
            .map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => {
                  // Set manualToggle flag temporarily
                  localStorage.setItem('manualToggle', 'true');
                  // Clear the flag after a short delay to re-enable hover behavior
                  setTimeout(() => {
                    localStorage.removeItem('manualToggle');
                  }, 1000);
                }}
                className={`${
                  isPathActive(item.path)
                    ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent hover:border-indigo-300'
                } ${
                  isCollapsed ? 'justify-center px-2' : 'justify-start px-3'
                } group flex items-center py-3 text-sm font-medium rounded-md transition-all duration-150 relative`}
              >
                <div className={`${isCollapsed ? '' : 'mr-3'} text-current transition-transform group-hover:scale-110`}>{item.icon}</div>
                {!isCollapsed && <span className="transition-colors truncate">{item.name}</span>}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 z-50 w-auto px-3 py-2 text-sm bg-indigo-600 rounded-md text-white opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap transform -translate-y-1/2 top-1/2">
                    {item.name}
                  </div>
                )}
              </Link>
            ))}
        </div>
      </nav>

      {/* User Profile Area */}
      <div 
        className={`border-t border-gray-200 bg-gray-50 ${isCollapsed ? 'p-2' : 'p-4'} mt-auto flex-shrink-0 relative`} 
        ref={profileMenuRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {isCollapsed ? (
          <div className="flex justify-center">
            <div 
              className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center relative cursor-pointer"
            >
              <span className="font-medium text-indigo-800">
                {user?.full_name?.charAt(0) || user?.username?.charAt(0) || '?'}
              </span>

              {showProfileMenu && (
                <div className="fixed left-20 top-auto z-50 w-56 bg-white rounded-md shadow-lg overflow-hidden">
                  <div className="p-3 border-b border-gray-100">
                    <p className="font-medium text-sm text-gray-900 truncate">{user?.full_name}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
                  </div>
                  <div 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center transition-colors cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div 
              className="flex items-center cursor-pointer"
            >
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <span className="font-medium text-indigo-800">
                  {user?.full_name?.charAt(0) || user?.username?.charAt(0) || '?'}
                </span>
              </div>
              <div className="ml-3 overflow-hidden">
                <div className="text-sm font-medium text-gray-900 truncate">{user?.full_name}</div>
                <div className="text-xs text-gray-500 truncate">{user?.email}</div>
              </div>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`ml-auto h-4 w-4 text-gray-400 transition-transform ${showProfileMenu ? 'transform rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            {showProfileMenu && (
              <div className="mt-3 bg-white rounded-md shadow-md overflow-hidden">
                <div 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Optional keyboard shortcut hint toast */}
      {!isCollapsed && (
        <div className="fixed bottom-4 right-4 bg-indigo-600 text-white px-4 py-3 rounded-md shadow-lg z-50 animate-fadeIn hidden">
          <p className="text-sm">Press <span className="font-bold">Ctrl+B</span> to toggle sidebar</p>
        </div>
      )}
    </div>
  );
};

export default Sidebar;