import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Activity, ArrowLeft } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import './Login.css';

const DoctorLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    doctorId: '',
    firstName: '',
    lastName: '',
    specialization: '',
    hospitalName: '',
    phone: '',
    password: '',
    role: 'doctor'
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
      const endpoint = isLogin ? '/api/auth/login/doctor' : '/api/auth/register';
      const payload = isLogin 
        ? { 
            doctorId: formData.doctorId, 
            specialization: formData.specialization, 
            hospitalName: formData.hospitalName, 
            password: formData.password 
          }
        : formData;

      const res = await axios.post(`https://medihist-b2rw.onrender.com${endpoint}`, payload);
      
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
      <div className="login-left" style={{ background: 'linear-gradient(135deg, #10b981 0%, #064e3b 100%)' }}>
        <div className="login-logo animate-fade-in">
          <Activity size={48} color="#10b981" />
          <h1 style={{ color: '#fff' }}>MediHist</h1>
        </div>
        <p className="login-tagline animate-fade-in">Provider Workspace - Manage Electronic Health Records efficiently and securely.</p>
        <div className="login-illustration animate-fade-in">
          <div className="glass-card" style={{ background: 'rgba(255, 255, 255, 0.08)' }}>
            <h3>EMR Editor</h3>
            <p>Modify vitals, diagnoses, medications, allergies and lab data with audit logs.</p>
          </div>
          <div className="glass-card" style={{ background: 'rgba(255, 255, 255, 0.08)', animationDelay: '0.2s' }}>
            <h3>Medical Reports</h3>
            <p>Upload scans, prescription images, or PDF reports directly to the patient timeline.</p>
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
            {isLogin ? 'Doctor Login' : 'Doctor Registration'}
          </h2>
          <p className="text-center text-muted" style={{ marginBottom: 'var(--spacing-5)', fontSize: '13px' }}>
            {isLogin ? 'Enter your credentials to enter the workspace' : 'Register to begin managing patient electronic health records'}
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
              label="Doctor ID"
              name="doctorId"
              placeholder="e.g. DOC-56321"
              value={formData.doctorId}
              onChange={handleChange}
              required
            />

            <Input
              label="Medical Specialisation"
              name="specialization"
              placeholder="e.g. Cardiology"
              value={formData.specialization}
              onChange={handleChange}
              required
            />

            <Input
              label="Hospital Name"
              name="hospitalName"
              placeholder="e.g. General Hospital"
              value={formData.hospitalName}
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
              <Button type="submit" fullWidth disabled={loading} style={{ background: '#10b981', borderColor: '#10b981' }}>
                {loading ? 'Processing...' : (isLogin ? 'Sign In as Doctor' : 'Register as Doctor')}
              </Button>
            </div>
          </form>

          <div className="login-toggle text-center">
            <p className="text-muted">
              {isLogin ? "Don't have a doctor account? " : "Already have a doctor account? "}
              <button 
                type="button" 
                className="toggle-btn"
                style={{ color: '#10b981' }}
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

export default DoctorLogin;
