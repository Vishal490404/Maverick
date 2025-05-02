import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import PaperCreation from './pages/PaperCreation';
import CurriculumManager from './pages/CurriculumManager';
import CreateQuestion from './pages/CreateQuestion';
import QuestionBanks from './pages/QuestionBank';
import ManualQuestionForm from './pages/ManualQuestionForm';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AddQuestionBank  from './pages/AddQuestionBank';

// Added placeholder components for coming soon pages
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="p-8">
    <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-gray-600">This feature is coming soon. We're working hard to bring you this functionality.</p>
        
        <div className="mt-6 flex justify-center">
          <div className="h-32 w-32 bg-indigo-100 rounded-full flex items-center justify-center">
            <svg className="h-16 w-16 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const QuestionBanksPage = () => <PlaceholderPage title="Question Banks" />;
const AllPapersPage = () => <PlaceholderPage title="All Papers" />;
const SettingsPage = () => <PlaceholderPage title="Settings" />;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/signin" element={<SignIn />} />

            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin-only routes */}
            <Route 
              path="/signup" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <SignUp />
                </ProtectedRoute>
              } 
            />

            {/* Question routes */}
            <Route 
              path="/question-banks/create" 
              element={
                <ProtectedRoute>
                  <CreateQuestion />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/questions/create/manual" 
              element={
                <ProtectedRoute>
                  <ManualQuestionForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/question-banks" 
              element={
                <ProtectedRoute>
                  <QuestionBanks />
                </ProtectedRoute>
              } 
            />
            
            {/* Paper routes */}
            <Route 
              path="/create" 
              element={
                <ProtectedRoute>
                  <PaperCreation />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/papers" 
              element={
                <ProtectedRoute>
                  <AllPapersPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Curriculum route */}
            <Route 
              path="/curriculum" 
              element={
                <ProtectedRoute>
                  <CurriculumManager />
                </ProtectedRoute>
              } 
            />
    
            {/* Settings */}
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } 
            />
            {/* Add Question Bank */}
            <Route 
              path="/question-banks/add" 
              element={
                <ProtectedRoute>
                  <AddQuestionBank />
                </ProtectedRoute>
              }
            />
            {/* Catch all route for 404s */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
