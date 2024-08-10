import React from 'react';
import './App.css'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginRegister from './pages/LoginRegister';
import Home from './pages/Home';
import CompanyDetail from './pages/CompanyDetail';
import Review from './pages/Review';
import Header from './components/Header';
import UserProfile from './pages/UserProfile';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
};
function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<LoginRegister />} />
        <Route path="/home" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/companies/:id" element={
          <ProtectedRoute>
            <CompanyDetail />
          </ProtectedRoute>
        } />
        <Route path="/companies/:id/review" element={
          <ProtectedRoute>
            <Review />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;