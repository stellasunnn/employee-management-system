import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { store } from './store/store';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import VisaStatus from './pages/VisaStatus';
import HiringManagement from './pages/HiringManagement';
import { useEffect } from 'react';
import { loadUser } from './store/slices/authSlice';
import Navbar from './components/Navbar';
import { RootState } from './store/store';
import { Toaster } from 'react-hot-toast';

const AppContent = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    // Load user on app initialization if token exists
    const token = localStorage.getItem('token');
    if (token) {
      store.dispatch(loadUser());
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <Router>
      <Toaster position="top-right" />
      {user && <Navbar onLogout={handleLogout} />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/visa" element={<VisaStatus />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/hiring-management" element={user?.isAdmin ? <HiringManagement /> : <Navigate to="/" replace />} />
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
