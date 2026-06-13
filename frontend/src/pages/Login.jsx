import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Activity } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import './Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'patient'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      const res = await axios.post(`http://localhost:5005${endpoint}`, payload);
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-logo animate-fade-in">
          <Activity size={48} color="var(--primary-color)" />
          <h1>MediHist</h1>
        </div>
        <p className="login-tagline animate-fade-in">Your secure, comprehensive Electronic Health Record platform.</p>
        <div className="login-illustration animate-fade-in">
          <div className="glass-card">
            <h3>Secure Access</h3>
            <p>Your data is protected with industry-standard encryption.</p>
          </div>
          <div className="glass-card" style={{ animationDelay: '0.2s' }}>
            <h3>Universal Sharing</h3>
            <p>Instantly share records across providers and systems.</p>
          </div>
        </div>
      </div>
      <div className="login-right">
        <Card className="login-card animate-fade-in">
          <h2 className="text-center" style={{ marginBottom: 'var(--spacing-2)' }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-center text-muted" style={{ marginBottom: 'var(--spacing-5)' }}>
            {isLogin ? 'Enter your credentials to access your records' : 'Register to start managing your health data'}
          </p>

          {error && <div className="alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div className="flex gap-4">
                  <Input
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required={!isLogin}
                  />
                  <Input
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required={!isLogin}
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 'var(--spacing-4)' }}>
                  <label className="input-label" htmlFor="role">Role <span className="required">*</span></label>
                  <select
                    id="role"
                    name="role"
                    className="input-field"
                    value={formData.role}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#1e293b',
                      background: '#f8fafc',
                      outline: 'none',
                      transition: 'border-color 0.15s'
                    }}
                    required
                  >
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor / Hospital Manager</option>
                  </select>
                </div>
              </>
            )}
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            
            <div style={{ marginTop: 'var(--spacing-5)' }}>
              <Button type="submit" fullWidth disabled={loading}>
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Register')}
              </Button>
            </div>
          </form>

          <div className="login-toggle text-center">
            <p className="text-muted">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button" 
                className="toggle-btn"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
