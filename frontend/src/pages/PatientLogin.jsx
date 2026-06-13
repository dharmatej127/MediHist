import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Activity, ArrowLeft } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import './Login.css';

const PatientLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
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
      const endpoint = isLogin ? '/api/auth/login/patient' : '/api/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5005';
      const res = await axios.post(`${API_BASE}${endpoint}`, payload);
      
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
          <button 
            type="button" 
            onClick={() => navigate('/login')}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '0',
              marginBottom: 'var(--spacing-4)'
            }}
          >
            <ArrowLeft size={14} /> Back to selections
          </button>
          
          <h2 className="text-center" style={{ marginBottom: 'var(--spacing-1)' }}>
            {isLogin ? 'Patient Login' : 'Patient Registration'}
          </h2>
          <p className="text-center text-muted" style={{ marginBottom: 'var(--spacing-5)', fontSize: '13px' }}>
            {isLogin ? 'Enter email & password to access your health record' : 'Create an account to track your health records'}
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
                <Input
                  label="Contact Phone (Optional)"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
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

export default PatientLogin;
