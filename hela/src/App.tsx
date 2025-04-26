import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import PaperCreation from './pages/PaperCreation';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

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
              path="/questions/create" 
              element={
                <ProtectedRoute>
                  <div className="p-8">Question Creation Page - Coming soon</div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/question-banks" 
              element={
                <ProtectedRoute>
                  <div className="p-8">Question Banks - Coming soon</div>
                </ProtectedRoute>
              } 
            />
            
            {/* Paper routes */}
            <Route 
              path="/papers/create" 
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
                  <div className="p-8">All Papers - Coming soon</div>
                </ProtectedRoute>
              } 
            />
            
    
            {/* Settings */}
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <div className="p-8">Settings - Coming soon</div>
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
