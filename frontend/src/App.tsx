import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { store } from './store/store';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import VisaStatus from './pages/VisaStatus';
import HiringManagement from './pages/HiringManagement';
import HRVisaManagement from './pages/HRVisaManagement';
import { useEffect } from 'react';
import { loadUser } from './store/slices/authSlice';
import Navbar from './components/Navbar';
import { RootState } from './store/store';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';

const AppContent = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <Router>
      <Toaster position="top-right" />
      {user && <Navbar onLogout={handleLogout} />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/visa"
          element={
            <ProtectedRoute>
              <VisaStatus />
            </ProtectedRoute>
          }
        />
        <Route
          path="/visa-management"
          element={
            <ProtectedRoute>{user?.isAdmin ? <HRVisaManagement /> : <Navigate to="/" replace />}</ProtectedRoute>
          }
        />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hiring-management"
          element={
            <ProtectedRoute>{user?.isAdmin ? <HiringManagement /> : <Navigate to="/" replace />}</ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;
