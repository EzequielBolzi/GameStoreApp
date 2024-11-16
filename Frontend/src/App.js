import React, { lazy, Suspense, useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import RequireAuth from './components/RequireAuth';
import Missing from './components/Missing';
import RegisterPage from './pages/RegisterPage';
import useAuth from './hooks/useAuth';

const UpdateProfileCompany = lazy(() => import('./pages/companyDashboard/UpdateProfileCompany'));
const UpdateProfileUser = lazy(() => import('./pages/userDashboard/UpdateProfileUser'));
const Main = lazy(() => import('./pages/Main'));

export const AppContext = React.createContext();

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasRedirected, setHasRedirected] = useState(false);
  const [library, setLibrary] = useState([]);
  const [cart, setCart] = useState([]);
  const { auth } = useAuth();

  useEffect(() => {
    if (!hasRedirected && location.pathname === '/') {
      navigate('/register');
      setHasRedirected(true);
    }
  }, [hasRedirected, navigate, location.pathname, auth]);

  const contextValue = {
    library,
    setLibrary,
    cart,
    setCart
  };

  return (
    <AppContext.Provider value={contextValue}>
      <Routes>
        {/* Public routes */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<RegisterPage />} />
        
        {/* Protected routes */}
        <Route element={<RequireAuth allowedRoles={['user', 'company']} />}>
          <Route path="main" element={
            <Suspense fallback={<div>Loading...</div>}>
              <Main />
            </Suspense>
          } />
          <Route path="/profile/update/company" element={
            <Suspense fallback={<div>Loading...</div>}>
              <UpdateProfileCompany />
            </Suspense>
          } />   
          <Route path="/profile/update/user" element={
            <Suspense fallback={<div>Loading...</div>}>
              <UpdateProfileUser/>
            </Suspense>
          } /> 
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Missing />} />
      </Routes>
    </AppContext.Provider>
  );
}

export default App;
