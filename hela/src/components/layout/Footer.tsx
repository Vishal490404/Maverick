import { useNavigate, useLocation } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Handle hash links properly - similar to Header component
  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    
    // If we're already on homepage, just scroll
    if (location.pathname === '/') {
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
        // Update URL without causing page reload
        window.history.pushState(null, '', `/#${targetId}`);
      } else {
        // If no specific element (for home), scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        window.history.pushState(null, '', '/');
      }
    } else {
      // If we're on another page, navigate to homepage with hash
      if (targetId === 'home') {
        navigate('/');
      } else {
        navigate(`/#${targetId}`);
      }
    }
  };

  return (
    <footer className="bg-white">
      <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
            <a 
              href="/" 
              onClick={(e) => handleNavigation(e, 'home')}
              className="flex items-center"
            >
              <svg className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 6.25278V19.2528M12 6.25278C10.8321 5.47686 9.24649 5 7.5 5C5.75351 5 4.16789 5.47686 3 6.25278V19.2528C4.16789 18.4769 5.75351 18 7.5 18C9.24649 18 10.8321 18.4769 12 19.2528M12 6.25278C13.1679 5.47686 14.7535 5 16.5 5C18.2465 5 19.8321 5.47686 21 6.25278V19.2528C19.8321 18.4769 18.2465 18 16.5 18C14.7535 18 13.1679 18.4769 12 19.2528" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="ml-2 text-lg sm:text-xl font-bold text-gray-900">ExamCraft</span>
            </a>
            <p className="mt-2 text-xs sm:text-sm text-gray-500">
              Making assessment creation simple for educators
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 sm:gap-8">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-500 tracking-wider uppercase">
                Navigation
              </h3>
              <ul className="mt-3 sm:mt-4 space-y-2">
                <li>
                  <a 
                    href="/" 
                    onClick={(e) => handleNavigation(e, 'home')}
                    className="text-xs sm:text-sm text-gray-500 hover:text-gray-900 hover:underline transition-colors"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a 
                    href="/#features" 
                    onClick={(e) => handleNavigation(e, 'features')}
                    className="text-xs sm:text-sm text-gray-500 hover:text-gray-900 hover:underline transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  {/* We'll implement About page later */}
                  <span className="text-xs sm:text-sm text-gray-400 cursor-not-allowed">
                    About
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-500 tracking-wider uppercase">
                Support
              </h3>
              <ul className="mt-3 sm:mt-4 space-y-2">
                <li>
                  {/* These could be implemented later */}
                  <span className="text-xs sm:text-sm text-gray-400 cursor-not-allowed">
                    Contact
                  </span>
                </li>
                <li>
                  <span className="text-xs sm:text-sm text-gray-400 cursor-not-allowed">
                    Documentation
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 sm:mt-10 border-t border-gray-200 pt-6 sm:pt-8 md:flex md:items-center md:justify-between">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} ExamCraft - Engineering Project
          </p>
          <div className="mt-3 md:mt-0">
            <p className="text-xs text-gray-400">
              All rights reserved
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;