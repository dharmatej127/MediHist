import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, User, Heart } from 'lucide-react';
import Card from '../components/Card';
import './Login.css';

const PortalSelection = () => {
  const navigate = useNavigate();

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
        <Card className="login-card animate-fade-in" style={{ maxWidth: '500px' }}>
          <h2 className="text-center" style={{ marginBottom: 'var(--spacing-2)' }}>
            Welcome to MediHist
          </h2>
          <p className="text-center text-muted" style={{ marginBottom: 'var(--spacing-6)' }}>
            Select your portal to log in or register
          </p>

          <div 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 'var(--spacing-4)' 
            }}
          >
            {/* Patient Card */}
            <div 
              onClick={() => navigate('/login/patient')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-4)',
                padding: 'var(--spacing-5)',
                borderRadius: '12px',
                border: '2px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: '#f8fafc',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-color)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(37,99,235,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div 
                style={{
                  padding: '12px',
                  background: '#eff6ff',
                  borderRadius: '10px',
                  color: 'var(--primary-color)'
                }}
              >
                <User size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                  Patient Portal
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  View your diagnoses, medications, allergies, and lab/medical reports.
                </p>
              </div>
            </div>

            {/* Doctor Card */}
            <div 
              onClick={() => navigate('/login/doctor')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-4)',
                padding: 'var(--spacing-5)',
                borderRadius: '12px',
                border: '2px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: '#f8fafc',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#10b981';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(16,185,129,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div 
                style={{
                  padding: '12px',
                  background: '#ecfdf5',
                  borderRadius: '10px',
                  color: '#10b981'
                }}
              >
                <Heart size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                  Doctor & Hospital Portal
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  Access doctor workspace, edit diagnoses, medications, and upload reports.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PortalSelection;
