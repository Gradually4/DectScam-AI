import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ScamDetector from './pages/ScamDetector';
import URLScanner from './pages/URLScanner';
import ScreenshotScanner from './pages/ScreenshotScanner';
import ScamReports from './pages/ScamReports';
import AdminDashboard from './pages/admin/Dashboard';
import CreateArticle from './pages/admin/CreateArticle';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import ChatAssistant from './pages/ChatAssistant';
import Education from './pages/Education';
import ArticleDetail from './pages/ArticleDetail';
import ProtectedRoute from './components/ProtectedRoute';
import InvestmentScanner from './components/InvestmentScanner';


export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/create-article"
            element={
              <ProtectedRoute>
                <CreateArticle />
              </ProtectedRoute>
            }
          />

          {/* Protected Dashboard & Detection Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scam-detector"
            element={
              <ProtectedRoute>
                <ScamDetector />
              </ProtectedRoute>
            }
          />
          <Route
            path="/url-scanner"
            element={
              <ProtectedRoute>
                <URLScanner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investment-forensics"
            element={
              <ProtectedRoute>
                <InvestmentScanner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/screenshot-scanner"
            element={
              <ProtectedRoute>
                <ScreenshotScanner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scam-reports"
            element={
              <ProtectedRoute>
                <ScamReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat-assistant"
            element={
              <ProtectedRoute>
                <ChatAssistant />
              </ProtectedRoute>
            }
          />
          <Route
            path="/education"
            element={
              <ProtectedRoute>
                <Education />
              </ProtectedRoute>
            }
          />
          <Route
            path="/education/:slug"
            element={
              <ProtectedRoute>
                <ArticleDetail />
              </ProtectedRoute>
            }
          />

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
