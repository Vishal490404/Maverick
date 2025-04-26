const CallToAction = () => {
  return (
    <div className="bg-indigo-700">
      <div className="max-w-2xl mx-auto text-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white sm:text-4xl">
          <span className="block">Ready to simplify your question paper creation?</span>
        </h2>
        <p className="mt-3 sm:mt-4 text-base sm:text-lg leading-6 text-indigo-100">
          Join educators who are saving time and creating better question papers with ExamCraft.
        </p>
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-3">
          <a 
            href="#" 
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 shadow-sm hover:shadow transition-all"
          >
            Create Your First Paper
          </a>
          <a 
            href="#" 
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-800 hover:bg-indigo-900 shadow-sm hover:shadow transition-all"
          >
            See Demo
          </a>
        </div>
      </div>
    </div>
  );
};

export default CallToAction;