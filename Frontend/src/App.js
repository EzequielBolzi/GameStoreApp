import React, { lazy, Suspense, useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import RequireAuth from './components/RequireAuth';
import Missing from './components/Missing';
import RegisterPage from './pages/RegisterPage';

const UpdateProfileCompany = lazy(() => import('./pages/companyDashboard/UpdateProfileCompany'));
const Main = lazy(() => import('./pages/Main'));
const RegisterGame = lazy(() => import('./pages/companyDashboard/RegisterGame'));

export const AppContext = React.createContext();

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasRedirected, setHasRedirected] = useState(false);
  const [library, setLibrary] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    if (!hasRedirected && location.pathname === '/') {
      navigate('/register');
      setHasRedirected(true);  
    }
  }, [hasRedirected, navigate, location.pathname]);

  const contextValue = {
    library,
    setLibrary,
    cart,
    setCart
  };

  return (
    <AppContext.Provider value={contextValue}>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Rutas públicas */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<RegisterPage />} />
          
          {/* Rutas protegidas */}
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
              </Suspense>
            } />   
          </Route>

          {/* Ruta de captura */}
          <Route path="*" element={<Missing />} />
        </Route>
      </Routes>
    </AppContext.Provider>
  );
}

export default App;