import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalPapers: 0
  });

  // In a real app, this would fetch data from your backend
  useEffect(() => {
    const fetchStats = () => {
      setTimeout(() => {
        setStats({
          totalQuestions: 243,
          totalPapers: 15
        });
      }, 500);
    };

    fetchStats();
  }, []);

  return (
    <div className="p-3 sm:p-6 md:p-8">
      {/* Dashboard header with responsive text sizes */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          Welcome back, {user?.full_name}. Here's an overview of your activity.
        </p>
      </div>

      {/* Stats cards - responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 mb-4 sm:mb-6">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="px-3 py-4 sm:px-4 sm:py-5">
            <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Questions</dt>
            <dd className="mt-1 text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">{stats.totalQuestions}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="px-3 py-4 sm:px-4 sm:py-5">
            <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Question Papers</dt>
            <dd className="mt-1 text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">{stats.totalPapers}</dd>
          </div>
        </div>
      </div>

      {/* Quick Actions section - more responsive for mobile */}
      <div className="bg-white shadow-sm rounded-lg p-3 sm:p-5 md:p-6 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Link 
            to="/questions/create"
            className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
          >
            <div className="font-medium text-sm sm:text-base text-indigo-600">Create Question</div>
            <div className="mt-1 text-xs sm:text-sm text-gray-500">Add new questions to your bank</div>
          </Link>
          <Link
            to="/papers/create"
            className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
          >
            <div className="font-medium text-sm sm:text-base text-indigo-600">Generate Paper</div>
            <div className="mt-1 text-xs sm:text-sm text-gray-500">Create a new question paper</div>
          </Link>
          <Link
            to="/question-banks"
            className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
          >
            <div className="font-medium text-sm sm:text-base text-indigo-600">Manage Question Banks</div>
            <div className="mt-1 text-xs sm:text-sm text-gray-500">Organize your collection</div>
          </Link>
        </div>
      </div>

      {/* Recent Papers table - better mobile handling */}
      <div className="bg-white shadow-sm rounded-lg p-3 sm:p-5 md:p-6">
        <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Recent Papers</h2>
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">Final Exam - Physics</td>
                <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">Apr 20, 2025</td>
                <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Complete
                  </span>
                </td>
                <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                  <button className="text-indigo-600 hover:text-indigo-900">View</button>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">Mid-term - Mathematics</td>
                <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">Apr 15, 2025</td>
                <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Complete
                  </span>
                </td>
                <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                  <button className="text-indigo-600 hover:text-indigo-900">View</button>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">Quiz - Chemistry</td>
                <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">Apr 10, 2025</td>
                <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Draft
                  </span>
                </td>
                <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                  <button className="text-indigo-600 hover:text-indigo-900">Edit</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;