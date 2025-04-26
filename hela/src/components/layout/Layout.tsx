import { ReactNode, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Check if the current path is a dashboard path - now includes signup page
  const isDashboardPath = location.pathname.startsWith('/dashboard') || 
                          location.pathname.startsWith('/questions') ||
                          location.pathname.startsWith('/question-banks') ||
                          location.pathname.startsWith('/papers') ||
                          location.pathname.startsWith('/settings') ||
                          location.pathname.startsWith('/signup'); // Added signup to dashboard layout
  
  // Don't show footer in dashboard layout
  const showFooter = !isDashboardPath;
  
  // Close mobile menu when navigating to a new page
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle body scroll lock when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);
  
  if (isDashboardPath) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Mobile menu toggle button */}
        <div className="block md:hidden fixed top-4 left-4 z-30">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="bg-white p-2 rounded-md shadow-lg border border-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label={isMobileMenuOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Sidebar */}
        <div className={`${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-20 transition-transform duration-300 ease-in-out h-screen`}>
          <Sidebar />
        </div>
        
        {/* Main content */}
        <main className="flex-grow bg-gray-50 min-h-screen pt-16 md:pt-0 w-full">
          {children}
        </main>
      </div>
    );
  }
  
  // Regular layout for non-dashboard pages
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow w-full">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;