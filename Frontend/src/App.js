import React, { lazy, Suspense } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import RequireAuth from './components/RequireAuth';
import Missing from './components/Missing';
import RegisterPage from './pages/RegisterPage';

const Main = lazy(() => import('./pages/Main'));

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public routes */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<RegisterPage />} />
        
        {/* Protected routes */}

          <Route path="main" element={
              <Main />
          } >
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Missing />} />
      </Route>
    </Routes>
  );
}

export default App;
