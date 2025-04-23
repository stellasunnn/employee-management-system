import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import { useEffect } from 'react';
import { loadUser } from './store/slices/authSlice';


const App = () => {
  useEffect(() => {
    // Load user on app initialization if token exists
    const token = localStorage.getItem('token');
    if (token) {
      store.dispatch(loadUser());
    }
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register/:token" element={<Register />} />
          <Route path="/" element={<Home />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          
          <Route path="/onboarding" element={<Onboarding />}></Route>
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;
