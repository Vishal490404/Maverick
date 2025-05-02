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
  
  // Check if the current path is a dashboard path
  const isDashboardPath = location.pathname.startsWith('/dashboard') || 
                          location.pathname.startsWith('/questions') ||
                          location.pathname.startsWith('/question-banks') ||
                          location.pathname.startsWith('/papers') ||
                          location.pathname.startsWith('/settings') ||
                          location.pathname.startsWith('/curriculum') ||
                          location.pathname.startsWith('/create') ||  // Added create path for PaperCreation
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
  
  // Dashboard layout with fixed sidebar and scrollable main content
  if (isDashboardPath) {
    return (
      <div className="flex flex-col md:flex-row h-screen overflow-hidden">
        {/* Mobile menu toggle button - fixed positioning */}
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
        
        {/* Fixed sidebar with no scroll */}
        <div className={`${isMobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 md:opacity-100'} md:translate-x-0 fixed md:sticky top-0 left-0 z-20 transition-all duration-300 ease-in-out h-screen overflow-hidden flex-shrink-0`}>
          <Sidebar />
        </div>
        
        {/* Overlay for mobile when sidebar is open */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-50 z-10 md:hidden transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        
        {/* Scrollable main content */}
        <main className="flex-grow bg-gray-50 h-screen overflow-y-auto pt-16 md:pt-0 w-full">
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