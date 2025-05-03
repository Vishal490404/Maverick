import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Define types for navigation items
interface NavItem {
  id: string;
  label: string;
  path: string;
  isActive: boolean;
}

const Header = () => {
  // State management
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  
  // Hooks
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  
  // Navigation data
  const navItems: NavItem[] = [
    { 
      id: 'home', 
      label: 'Home', 
      path: '/#home',
      isActive: location.pathname === '/' && activeSection === 'home'
    },
    { 
      id: 'features', 
      label: 'Features', 
      path: '/#features',
      isActive: location.pathname === '/' && activeSection === 'features'
    },
    { 
      id: 'about', 
      label: 'About', 
      path: '#',
      isActive: false
    }
  ];
  
  // Logout handling with feedback
  const handleLogout = () => {
    setIsProfileOpen(false);
    setShowLogoutSuccess(true);
    
    setTimeout(() => {
      logout();
      navigate('/');
      setTimeout(() => setShowLogoutSuccess(false), 3000);
    }, 1000);
  };
  
  // Handle outside clicks to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  // Reset dropdown when auth changes or route changes
  useEffect(() => {
    setIsProfileOpen(false);
  }, [isAuthenticated, location.pathname]);
  
  // Navigation helper for section links
  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    
    if (location.pathname === '/') {
      // On homepage, scroll to section
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', `/#${targetId}`);
        setActiveSection(targetId);
      }
    } else {
      // On other pages, navigate to homepage with hash
      navigate(`/#${targetId}`);
    }
  };
  
  // Get link class for navigation items
  const getLinkClass = (item: NavItem, isMobile = false) => {
    if (isMobile) {
      return `${item.isActive ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`;
    }
    
    if (item.id === 'about') {
      return 'border-transparent text-gray-400 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium';
    }
    
    return `${item.isActive ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`;
  };
  
  return (
    <nav className="bg-white shadow-sm">
      {/* Logout Success Message */}
      {showLogoutSuccess && (
        <div className="bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                You have been successfully signed out.
              </p>
            </div>
            <button 
              onClick={() => setShowLogoutSuccess(false)}
              className="ml-auto pl-3 text-green-500 hover:text-green-700 focus:outline-none"
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and desktop navigation */}
          <div className="flex items-center flex-1">
            {/* Logo - adjusted for mobile */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <svg className="h-8 w-8 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 6.25278V19.2528M12 6.25278C10.8321 5.47686 9.24649 5 7.5 5C5.75351 5 4.16789 5.47686 3 6.25278V19.2528C4.16789 18.4769 5.75351 18 7.5 18C9.24649 18 10.8321 18.4769 12 19.2528M12 6.25278C13.1679 5.47686 14.7535 5 16.5 5C18.2465 5 19.8321 5.47686 21 6.25278V19.2528C19.8321 18.4769 18.2465 18 16.5 18C14.7535 18 13.1679 18.4769 12 19.2528" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="ml-2 text-xl font-bold text-gray-900 truncate max-w-[140px] sm:max-w-none">ExamCraft</span>
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => 
                item.id === 'about' ? (
                  <span key={item.id} className={getLinkClass(item)}>
                    {item.label}
                  </span>
                ) : (
                  <a 
                    key={item.id}
                    href={item.path}
                    onClick={(e) => handleNavigation(e, item.id)}
                    className={getLinkClass(item)}
                  >
                    {item.label}
                  </a>
                )
              )}

              {isAuthenticated && (
                <Link 
                  to="/dashboard"
                  className="inline-flex items-center px-4 py-1.5 border-b-2 text-sm font-medium  rounded-t-md hover:bg-indigo-100 transition-colors duration-200 border-indigo-500"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </Link>
              )}
            </div>
          </div>
          
          {/* User menu (desktop) */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isAuthenticated && (
              <div className="relative ml-3" ref={profileDropdownRef}>
                <button 
                  onMouseEnter={() => setIsProfileOpen(true)}
                  className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="font-medium text-indigo-800">
                      {user?.full_name?.charAt(0) || user?.username?.charAt(0) || '?'}
                    </span>
                  </div>
                </button>
                {isProfileOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <div className="block px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                      <p className="font-medium">Welcome,</p>
                      <p className="truncate">{user?.full_name || user?.username}</p>
                    </div>
                    
                    <Link 
                      to="/dashboard" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Dashboard
                    </Link>
                    
                    <Link 
                      to="#" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Settings
                    </Link>
                    
                    <button
                      onClick={handleLogout} 
                      className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
            {!isAuthenticated && (
              <Link to="/signin" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md text-sm font-medium shadow-sm hover:shadow transition-all">
                Sign In
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          {navItems.map((item) => 
            item.id === 'about' ? (
              <span 
                key={item.id}
                className="border-transparent text-gray-400 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
              >
                {item.label}
              </span>
            ) : (
              <a
                key={item.id}
                href={item.path}
                onClick={(e) => {
                  handleNavigation(e, item.id);
                  setIsMenuOpen(false);
                }}
                className={getLinkClass(item, true)}
              >
                {item.label}
              </a>
            )
          )}
          
          {isAuthenticated && (
            <Link 
              to="/dashboard"
              className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 border-indigo-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
          )}
        </div>
        
        {/* Mobile menu authenticated user section */}
        {isAuthenticated ? (
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="font-medium text-indigo-800">
                    {user?.full_name?.charAt(0) || user?.username?.charAt(0) || '?'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{user?.full_name}</div>
                <div className="text-sm font-medium text-gray-500">{user?.email}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link to="#" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left block px-4 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center justify-center px-4 py-3">
              <Link 
                to="/signin" 
                className="block px-5 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 shadow-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;