import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context';
import './AuthCallback.css';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const authError = searchParams.get('error');

      if (authError) {
        setError('Authentication failed. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (token) {
        try {
          await loginWithToken(token);
          navigate('/dashboard');
        } catch (err) {
          console.error('Login error:', err);
          setError('Failed to complete login. Please try again.');
          setTimeout(() => navigate('/login'), 3000);
        }
      } else {
        setError('No authentication token received.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, loginWithToken, navigate]);

  return (
    <div className="auth-callback">
      <div className="auth-callback-container">
        {error ? (
          <>
            <div className="auth-callback-error">❌</div>
            <h2>Authentication Error</h2>
            <p>{error}</p>
            <p className="auth-callback-redirect">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="auth-callback-spinner"></div>
            <h2>Signing you in...</h2>
            <p>Please wait while we complete your authentication.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
