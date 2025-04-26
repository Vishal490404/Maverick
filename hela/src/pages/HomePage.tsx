import { useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import HeroSection from '../components/ui/HeroSection';
import FeaturesSection from '../components/ui/FeaturesSection';
import CallToAction from '../components/ui/CallToAction';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const location = useLocation();
  const featuresRef = useRef<HTMLDivElement>(null);
  const homeRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useAuth();
  
  // Get showWelcome state from URL search params (set during login redirect)
  const searchParams = new URLSearchParams(location.search);
  const showWelcome = searchParams.get('welcome') === 'true';

  useEffect(() => {
    // Check if there's a hash in the URL and scroll to the corresponding section
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  return (
    <div className="bg-gray-50 min-h-screen">
      {isAuthenticated && user && showWelcome && (
        <div className="bg-indigo-600 text-white py-3 px-6 transition-opacity duration-500">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <p className="text-sm md:text-base font-medium">
                  Welcome back, <span className="font-bold">{user.full_name}</span>!
                </p>
                {user.is_superuser && (
                  <span className="bg-indigo-800 text-xs px-2 py-1 rounded-full">Admin</span>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <Link 
                  to="/dashboard"
                  className="text-sm bg-white text-indigo-600 px-4 py-1.5 rounded-md font-medium hover:bg-indigo-50 transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={homeRef} id="home">
        <HeroSection />
      </div>
      
      <div ref={featuresRef} id="features">
        <FeaturesSection />
      </div>
      
      <CallToAction />
    </div>
  );
};

export default HomePage;