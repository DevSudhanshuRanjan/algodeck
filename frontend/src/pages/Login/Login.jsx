import { useNavigate } from 'react-router-dom';
import { FileText, Target, BarChart3, Code2 } from 'lucide-react';
import { Button, Card } from '../../components/common';
import './Login.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Login = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${API_URL}/auth/google`;
  };

  const features = [
    {
      icon: FileText,
      title: 'Notes Management',
      description: 'Organize algorithm notes with folders, tags, and rich text editing',
    },
    {
      icon: Target,
      title: 'Questions Library',
      description: 'Save DSA problems from any platform with difficulty tags and links',
    },
    {
      icon: BarChart3,
      title: 'Track Progress',
      description: 'Monitor your coding journey with completion stats and activity tracking',
    },
  ];

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Hero Section */}
        <div className="login-hero animate-fade-in">
          <div className="login-logo">
            <div className="login-logo-icon">
              <Code2 size={32} />
            </div>
            <span className="login-logo-text">AlgoDeck</span>
          </div>
          
          <h1 className="login-title">
            Organize Your Coding Journey
          </h1>
          
          <p className="login-subtitle">
            Track DSA questions and notes in one place. Your personal organizer for algorithm mastery.
          </p>

          {/* Google Sign In Button */}
          <Button 
            onClick={handleGoogleLogin}
            size="lg"
            className="login-google-btn"
            icon={
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            }
          >
            Sign in with Google
          </Button>
        </div>

        {/* Features Section */}
        <div className="login-features">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="login-feature-card animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
              hover
            >
              <div className="login-feature-icon">
                <feature.icon size={28} />
              </div>
              <h3 className="login-feature-title">{feature.title}</h3>
              <p className="login-feature-description">{feature.description}</p>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <footer className="login-footer">
          <p>© 2025 AlgoDeck. Built for developers, by developers.</p>
        </footer>
      </div>
    </div>
  );
};

export default Login;
