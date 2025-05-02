const HeroSection = () => {
  return (
    <div className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-6 sm:pb-8 md:pb-16 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 px-4 sm:px-6 lg:px-0">
          <svg 
            className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2" 
            fill="currentColor" 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none"
          >
            <polygon points="50,0 100,0 50,100 0,100" />
          </svg>

          <main className="mt-6 sm:mt-10 mx-auto max-w-7xl px-0 sm:px-0 sm:mt-12 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-3xl tracking-tight font-extrabold text-gray-900 sm:text-4xl md:text-5xl">
                <span className="block xl:inline">Create perfect</span>
                <span className="block text-indigo-600 xl:inline"> question papers</span>
              </h1>
              <p className="mt-3 text-sm sm:text-base text-gray-500 sm:mt-5 sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                ExamCraft helps educators design professional question papers quickly and efficiently. Generate comprehensive papers with just a few clicks.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <a 
                    href="dashboard" 
                    className="w-full flex items-center justify-center px-6 sm:px-8 py-2 sm:py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 shadow-sm hover:shadow transition-all"
                  >
                    Create Now
                  </a>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      
      {/* Illustration area - made responsive for different screen sizes */}
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-blue-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md mx-auto">
          {/* Main exam paper */}
          <div className="relative w-full max-w-md mx-auto bg-white rounded-lg shadow-xl overflow-hidden transform transition-all hover:scale-[1.01]">
            {/* Header */}
            <div className="bg-indigo-600 p-3 sm:p-4">
              <div className="text-white font-bold text-center text-lg sm:text-xl">EXAMINATION PAPER</div>
              <div className="flex justify-between text-indigo-100 text-xs sm:text-sm mt-2">
                <div>Subject: Geography</div>
                <div>Time: 3 Hours</div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Section A */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 sm:mb-4 border-b pb-2">Section A: Multiple Choice</h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-start">
                    <span className="font-medium text-gray-700 mr-3">1.</span>
                    <div className="bg-gray-100 h-3 sm:h-4 rounded w-full"></div>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium text-gray-700 mr-3">2.</span>
                    <div className="bg-gray-100 h-3 sm:h-4 rounded w-full"></div>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium text-gray-700 mr-3">3.</span>
                    <div className="bg-gray-100 h-3 sm:h-4 rounded w-full"></div>
                  </div>
                </div>
              </div>
              
              {/* Section B - Hidden on small screens to save space */}
              <div className="hidden sm:block">
                <h3 className="font-semibold text-gray-800 mb-3 sm:mb-4 border-b pb-2">Section B: Short Answer</h3>
                <div className="flex items-start">
                  <span className="font-medium text-gray-700 mr-3">4.</span>
                  <div className="w-full">
                    <div className="bg-gray-100 h-3 sm:h-4 rounded w-full mb-2 sm:mb-3"></div>
                    <div className="border-2 border-dashed border-gray-200 h-12 sm:h-16 w-full rounded-md"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Pencil - Hidden on small screens, visible on medium+ */}
          <div className="hidden sm:block absolute bottom-0 right-0 transform rotate-45 origin-bottom-left">
            <div className="relative">
              {/* Pencil body */}
              <div className="h-24 sm:h-40 w-6 sm:w-10 bg-yellow-400 rounded-t-sm"></div>
              {/* Eraser */}
              <div className="h-3 sm:h-5 w-6 sm:w-10 bg-pink-300 rounded-t-sm"></div>
              {/* Pencil tip */}
              <div className="h-6 sm:h-10 w-6 sm:w-10 bg-black clip-triangle absolute -bottom-6 sm:-bottom-10"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;