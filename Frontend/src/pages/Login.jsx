import { useRef, useState, useEffect } from 'react';
import './login.css';
import authApi from '../api/authApi';
import useAuth from '../hooks/useAuth';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/main";

  const userRef = useRef();
  const errRef = useRef();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);  // Track submission state

  useEffect(() => {
    userRef.current?.focus();
  }, []);

  useEffect(() => {
    setErrMsg('');
  }, [email, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Disable button on submit

    try {
      const response = await authApi.login(
        { email, password },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );
      const accessToken = response.token;
      const role = response.company ? 'company' : 'user';

      localStorage.setItem('token', JSON.stringify(accessToken));
      localStorage.setItem('role', role); 

      setAuth({ 
        email, 
        role, 
        accessToken 
      });

      setEmail('');
      setPassword('');
      navigate(from, { replace: true });
    } catch (err) {
      if (!err?.response) {
        setErrMsg('No Server Response');
      } else if (err.response?.status === 400) {
        setErrMsg('Missing Email or Password');
      } else if (err.response?.status === 401) {
        setErrMsg('Unauthorized');
      } else {
        setErrMsg('Login Failed');
      }
      errRef.current?.focus();
    } finally {
      setIsSubmitting(false);  // Re-enable the button after submission
    }
  };

  return (
    <section>
      
      <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">
        {errMsg}
      </p>
      <br></br>
      <br></br>

      <h1>Sign In</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email:</label>
        <input
          type="text"
          id="email"
          ref={userRef}
          autoComplete="off"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          required
        />

        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          required
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
      <br></br>
      <p>
        Need an Account?<br />
        <span className="line">
          <Link to="/register">Sign Up</Link> 
        </span>
      </p>
    </section>
  );
};

export default Login;
