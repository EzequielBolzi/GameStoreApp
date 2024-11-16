import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthProvider';

function useAuth() {
  const { auth, setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const logout = () => {
    setAuth({});  
    localStorage.removeItem('token');  
    navigate('/login');  
  };

  return { auth, setAuth, logout };
}

export default useAuth;
