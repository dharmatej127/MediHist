import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  LogOut, User, Activity, FileText, Pill, AlertCircle,
  Plus, Trash2, X, FlaskConical, Heart, Search, ArrowLeft,
  Edit2, Eye, UploadCloud, File
} from 'lucide-react';
import './Dashboard.css';

const API = 'http://localhost:5005/api/patient';

const Modal = ({ title, onClose, children }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-box" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h3>{title}</h3>
        <button className="modal-close" onClick={onClose}><X size={18} /></button>
      </div>
      <div className="modal-body">{children}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [modal, setModal] = useState(null); // 'diagnosis' | 'medication' | 'allergy' | 'lab' | 'vitals' | 'register_patient' | 'medicalreport'
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  
  // Doctor/Hospital specific states
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'patient'
  });
  const [registerError, setRegisterError] = useState('');

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const canEditItem = (item) => {
    if (user.role === 'admin') return true;
    if (user.role === 'doctor') {
      if (!item.createdById) return true;
      return item.createdById === user._id;
    }
    return false;
  };

  useEffect(() => { fetchRecord(); }, []);

  const fetchRecord = async () => {
    try {
      if (user.role === 'doctor') {
        const res = await axios.get(API, { headers });
        setPatients(res.data);
      } else {
        const res = await axios.get(`${API}/me`, { headers });
        setRecord(res.data);
      }
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
    } finally { setLoading(false); }
  };

  const selectPatient = async (patientId) => {
    setLoading(true);
    setSelectedPatientId(patientId);
    setActiveTab('overview');
    try {
      const res = await axios.get(`${API}/patient/${patientId}`, { headers });
      setRecord(res.data);
    } catch (err) {
      showToast('Failed to load patient records.');
    } finally {
      setLoading(false);
    }
  };

  const getPatientDisplayId = (id) => {
    if (!id) return '';
    return `PAT-${id.substring(id.length - 6).toUpperCase()}`;
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const openModal = (type, item = null) => { 
    if (item) {
      // If the date field is populated, let's format it for input type="date" (YYYY-MM-DD)
      const formattedItem = { ...item };
      for (const key in formattedItem) {
        if (typeof formattedItem[key] === 'string' && formattedItem[key].match(/^\d{4}-\d{2}-\d{2}T/)) {
          formattedItem[key] = formattedItem[key].split('T')[0];
        }
      }
      setForm(formattedItem);
    } else {
      setForm({});
    }
    setEditItem(item); 
    setRegisterForm({ email: '', password: '', firstName: '', lastName: '', role: 'patient' });
    setRegisterError('');
    setModal(type); 
  };
  
  const closeModal = () => { 
    setModal(null); 
    setForm({}); 
    setEditItem(null);
    setRegisterError(''); 
  };

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({
          ...form,
          fileUrl: reader.result,
          fileName: file.name,
          fileType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async () => {
    setSaving(true);
    try {
      let res;
      if (editItem) {
        const endpoints = {
          diagnosis: `${API}/patient/${selectedPatientId}/diagnosis/${editItem._id}`,
          medication: `${API}/patient/${selectedPatientId}/medication/${editItem._id}`,
          allergy: `${API}/patient/${selectedPatientId}/allergy/${editItem._id}`,
          lab: `${API}/patient/${selectedPatientId}/labresult/${editItem._id}`,
          medicalreport: `${API}/patient/${selectedPatientId}/medicalreport/${editItem._id}`,
        };
        res = await axios.put(endpoints[modal], form, { headers });
        showToast('Record updated successfully!');
      } else {
        const endpoints = {
          diagnosis: `${API}/patient/${selectedPatientId}/diagnosis`,
          medication: `${API}/patient/${selectedPatientId}/medication`,
          allergy: `${API}/patient/${selectedPatientId}/allergy`,
          lab: `${API}/patient/${selectedPatientId}/labresult`,
          medicalreport: `${API}/patient/${selectedPatientId}/medicalreport`,
        };
        res = await axios.post(endpoints[modal], form, { headers });
        showToast('Record added successfully!');
      }
      setRecord(res.data);
      closeModal();
    } catch (err) {
      showToast('Failed to save. Please try again.');
    } finally { setSaving(false); }
  };

  const handleSaveVitals = async () => {
    setSaving(true);
    try {
      const res = await axios.put(`${API}/patient/${selectedPatientId}/vitals`, form, { headers });
      setRecord(res.data);
      showToast('Vitals updated!');
      closeModal();
    } catch (err) {
      showToast('Failed to update vitals.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Are you sure you want to remove this record?')) return;
    try {
      const endpoints = {
        diagnosis: `${API}/patient/${selectedPatientId}/diagnosis/${id}`,
        medication: `${API}/patient/${selectedPatientId}/medication/${id}`,
        allergy: `${API}/patient/${selectedPatientId}/allergy/${id}`,
        lab: `${API}/patient/${selectedPatientId}/labresult/${id}`,
        medicalreport: `${API}/patient/${selectedPatientId}/medicalreport/${id}`,
      };
      const res = await axios.delete(endpoints[type], { headers });
      setRecord(res.data);
      showToast('Record removed.');
    } catch (err) {
      showToast('Failed to delete.');
    }
  };

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    setSaving(true);
    setRegisterError('');
    try {
      await axios.post('http://localhost:5005/api/auth/register', registerForm);
      showToast('Patient registered successfully!');
      // Refresh patient directory list
      const fetchList = await axios.get(API, { headers });
      setPatients(fetchList.data);
      closeModal();
    } catch (err) {
      setRegisterError(err.response?.data?.message || 'Failed to register patient.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="dash-loading"><Activity size={32} className="spin" /><p>Loading health records…</p></div>;

  const tabs = [
    { key: 'overview', label: 'Overview', icon: <Activity size={18} /> },
    { key: 'diagnoses', label: 'Diagnoses', icon: <FileText size={18} /> },
    { key: 'medications', label: 'Medications', icon: <Pill size={18} /> },
    { key: 'allergies', label: 'Allergies', icon: <AlertCircle size={18} /> },
    { key: 'labs', label: 'Lab Results', icon: <FlaskConical size={18} /> },
    { key: 'medicalreports', label: 'Medical Reports', icon: <File size={18} /> },
  ];

  // Filter patients by search query
  const filteredPatients = patients.filter(p => {
    const fullName = `${p.user?.profile?.firstName || ''} ${p.user?.profile?.lastName || ''}`.toLowerCase();
    const email = (p.user?.email || '').toLowerCase();
    const displayId = getPatientDisplayId(p.user?._id).toLowerCase();
    const q = searchQuery.toLowerCase();
    return fullName.includes(q) || email.includes(q) || displayId.includes(q);
  });

  return (
    <div className="app-layout">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-icon"><Heart size={20} color="#fff" /></div>
          <span className="logo-text">MediHist</span>
        </div>
        <nav className="sidebar-nav">
          {user.role === 'doctor' && (
            <button 
              className={`nav-item ${!selectedPatientId ? 'active' : ''}`} 
              onClick={() => {
                setSelectedPatientId(null);
                setRecord(null);
                fetchRecord();
              }}
            >
              <User size={18} /><span>Patient Directory</span>
            </button>
          )}
          
          {(user.role !== 'doctor' || selectedPatientId) && tabs.map(t => (
            <button key={t.key} className={`nav-item ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
              {t.icon}<span>{t.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <LogOut size={18} /><span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {user.role === 'doctor' && selectedPatientId && (
              <button 
                className="btn-outline-sm" 
                onClick={() => {
                  setSelectedPatientId(null);
                  setRecord(null);
                  fetchRecord(); // refresh patient list
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}
              >
                <ArrowLeft size={14} /> Back to Directory
              </button>
            )}
            <h2 className="topbar-title">
              {user.role === 'doctor' && !selectedPatientId 
                ? 'Patient Directory' 
                : tabs.find(t => t.key === activeTab)?.label}
            </h2>
          </div>
          <div className="user-info">
            <div className="avatar"><User size={18} /></div>
            <div>
              <div className="user-name">{user.profile?.firstName} {user.profile?.lastName}</div>
              <div className="user-role">{user.role || 'Patient'}</div>
            </div>
          </div>
        </header>

        <div className="page-content animate-fade-in">
          {user.role === 'doctor' && !selectedPatientId ? (
            /* ── DOCTOR DIRECTORY VIEW ── */
            <div className="directory-container">
              <div className="directory-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h3>Active Patients</h3>
                  <p className="text-muted" style={{ fontSize: '13px', marginTop: '4px' }}>Search and manage electronic health records of registered patients.</p>
                </div>
                <button className="btn-primary" onClick={() => openModal('register_patient')}>
                  <Plus size={16} /> Register New Patient
                </button>
              </div>

              <div className="search-bar-container" style={{ position: 'relative', marginBottom: '24px' }}>
                <Search size={18} className="search-icon" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  placeholder="Search patients by name, email, or Patient ID..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="search-input"
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 42px',
                    borderRadius: '10px',
                    border: '1.5px solid #e2e8f0',
                    fontSize: '14px',
                    background: '#fff',
                    outline: 'none',
                    transition: 'border-color 0.15s'
                  }}
                />
              </div>

              {filteredPatients.length > 0 ? (
                <div className="patient-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                  {filteredPatients.map(p => (
                    <div 
                      key={p.user?._id} 
                      className="patient-card" 
                      onClick={() => selectPatient(p.user?._id)}
                      style={{
                        background: '#fff',
                        borderRadius: '14px',
                        padding: '20px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)';
                      }}
                    >
                      <div>
                        <div className="patient-card-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                          <div className="patient-avatar" style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: '#eff6ff',
                            color: '#2563eb',
                            fontSize: '16px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {p.user?.profile?.firstName?.[0] || 'P'}
                          </div>
                          <div>
                            <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>
                              {p.user?.profile?.firstName} {p.user?.profile?.lastName}
                            </h4>
                            <span className="badge badge-warning" style={{ display: 'inline-block', marginTop: '4px', fontSize: '10px' }}>
                              {getPatientDisplayId(p.user?._id)}
                            </span>
                          </div>
                        </div>
                        <div className="patient-card-details" style={{ fontSize: '13px', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
                          <p><strong>Email:</strong> {p.user?.email}</p>
                          <p><strong>Blood Type:</strong> {p.bloodType || '—'}</p>
                          <p><strong>Medications:</strong> {p.medications?.length || 0}</p>
                          <p><strong>Active Diagnoses:</strong> {p.diagnoses?.filter(d => d.status === 'Active').length || 0}</p>
                        </div>
                      </div>
                      <button className="btn-outline-sm" style={{ width: '100%', padding: '8px 12px', textAlign: 'center', fontSize: '12px', fontWeight: '500' }}>
                        View Medical Records →
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-directory" style={{ padding: '60px', textAlign: 'center', background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
                  <p style={{ fontSize: '15px', fontStyle: 'italic' }}>No patients found matching your search.</p>
                </div>
              )}
            </div>
          ) : (
            /* ── PATIENT DETAIL TABS (VIEWABLE BY PATIENT OR DOCTOR) ── */
            <>
              {/* ── OVERVIEW TAB ── */}
              {activeTab === 'overview' && (
                <>
                  <div className="welcome-banner">
                    <div>
                      <h3>
                        {user.role === 'doctor' 
                          ? `Viewing Patient: ${record?.user?.profile?.firstName || ''} ${record?.user?.profile?.lastName || ''}` 
                          : `Welcome back, ${user.profile?.firstName}! 👋`}
                      </h3>
                      <p>
                        {user.role === 'doctor' 
                          ? `Patient ID: ${getPatientDisplayId(record?.user?._id)} · Email: ${record?.user?.email || ''}` 
                          : `Patient ID: ${getPatientDisplayId(user._id)} · Here's a summary of your health records.`}
                      </p>
                    </div>
                    {user.role === 'doctor' && (
                      <button className="btn-primary" onClick={() => openModal('vitals')} style={{ background: '#fff', color: '#2563eb' }}>
                        <Plus size={16} /> Update Vitals
                      </button>
                    )}
                  </div>

                  <div className="stats-grid">
                    <div className="stat-card blue">
                      <div className="stat-label">Blood Type</div>
                      <div className="stat-value">{record?.bloodType || '—'}</div>
                    </div>
                    <div className="stat-card purple">
                      <div className="stat-label">Height</div>
                      <div className="stat-value">{record?.height ? `${record.height} cm` : '—'}</div>
                    </div>
                    <div className="stat-card green">
                      <div className="stat-label">Weight</div>
                      <div className="stat-value">{record?.weight ? `${record.weight} kg` : '—'}</div>
                    </div>
                    <div className="stat-card orange">
                      <div className="stat-label">Active Diagnoses</div>
                      <div className="stat-value">{record?.diagnoses?.filter(d => d.status === 'Active').length || 0}</div>
                    </div>
                    <div className="stat-card red">
                      <div className="stat-label">Medications</div>
                      <div className="stat-value">{record?.medications?.length || 0}</div>
                    </div>
                    <div className="stat-card teal">
                      <div className="stat-label">Allergies</div>
                      <div className="stat-value">{record?.allergies?.length || 0}</div>
                    </div>
                  </div>

                  <div className="overview-grid">
                    <div className="section-card">
                      <div className="section-head">
                        <h4>Recent Diagnoses</h4>
                        <button className="btn-outline-sm" onClick={() => setActiveTab('diagnoses')}>View All</button>
                      </div>
                      {record?.diagnoses?.length ? record.diagnoses.slice(0, 3).map((d, i) => (
                        <div key={i} className="list-row">
                          <div>
                            <strong>{d.condition}</strong>
                            <span className="sub">{d.dateDiagnosed ? new Date(d.dateDiagnosed).toLocaleDateString() : ''}</span>
                          </div>
                          <span className={`badge ${d.status === 'Active' ? 'badge-warning' : 'badge-success'}`}>{d.status}</span>
                        </div>
                      )) : <div className="empty">No diagnoses recorded.</div>}
                    </div>
                    <div className="section-card">
                      <div className="section-head">
                        <h4>Current Medications</h4>
                        <button className="btn-outline-sm" onClick={() => setActiveTab('medications')}>View All</button>
                      </div>
                      {record?.medications?.length ? record.medications.slice(0, 3).map((m, i) => (
                        <div key={i} className="list-row">
                          <div>
                            <strong>{m.name}</strong>
                            <span className="sub">{m.dosage} · {m.frequency}</span>
                          </div>
                        </div>
                      )) : <div className="empty">No medications recorded.</div>}
                    </div>
                  </div>
                </>
              )}

              {/* ── DIAGNOSES TAB ── */}
              {activeTab === 'diagnoses' && (
                <div className="section-card full">
                  <div className="section-head">
                    <h4>All Diagnoses</h4>
                    {user.role === 'doctor' && (
                      <button className="btn-primary" onClick={() => openModal('diagnosis')}>
                        <Plus size={16} /> Add Diagnosis
                      </button>
                    )}
                  </div>
                  {record?.diagnoses?.length ? record.diagnoses.map((d) => (
                    <div key={d._id} className="list-row">
                      <div>
                        <strong>{d.condition}</strong>
                        <span className="sub">
                          {d.dateDiagnosed ? new Date(d.dateDiagnosed).toLocaleDateString() : ''} {d.notes && `· ${d.notes}`}
                          {d.createdByDoctorName && (
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                              Created by: {d.createdByDoctorName} {d.createdBySpecialization ? `(${d.createdBySpecialization})` : ''} — {new Date(d.createdAt).toLocaleString()}
                              {d.updatedAt && d.updatedAt !== d.createdAt && ` | Modified: ${new Date(d.updatedAt).toLocaleString()}`}
                            </div>
                          )}
                        </span>
                      </div>
                      <div className="row-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span className={`badge ${d.status === 'Active' ? 'badge-warning' : 'badge-success'}`}>{d.status}</span>
                        {canEditItem(d) && (
                          <>
                            <button className="icon-btn blue" onClick={() => openModal('diagnosis', d)}><Edit2 size={15} /></button>
                            <button className="icon-btn red" onClick={() => handleDelete('diagnosis', d._id)}><Trash2 size={15} /></button>
                          </>
                        )}
                      </div>
                    </div>
                  )) : <div className="empty">No diagnoses yet.</div>}
                </div>
              )}

              {/* ── MEDICATIONS TAB ── */}
              {activeTab === 'medications' && (
                <div className="section-card full">
                  <div className="section-head">
                    <h4>Current Medications</h4>
                    {user.role === 'doctor' && (
                      <button className="btn-primary" onClick={() => openModal('medication')}>
                        <Plus size={16} /> Add Medication
                      </button>
                    )}
                  </div>
                  {record?.medications?.length ? record.medications.map((m) => (
                    <div key={m._id} className="list-row">
                      <div>
                        <strong>{m.name}</strong>
                        <span className="sub">
                          {m.dosage} · {m.frequency} {m.prescribedBy && `· Prescribed by: Dr. ${m.prescribedBy}`}
                          {m.createdByDoctorName && (
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                              Created by: {m.createdByDoctorName} {m.createdBySpecialization ? `(${m.createdBySpecialization})` : ''} — {new Date(m.createdAt).toLocaleString()}
                              {m.updatedAt && m.updatedAt !== m.createdAt && ` | Modified: ${new Date(m.updatedAt).toLocaleString()}`}
                            </div>
                          )}
                        </span>
                      </div>
                      <div className="row-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {canEditItem(m) && (
                          <>
                            <button className="icon-btn blue" onClick={() => openModal('medication', m)}><Edit2 size={15} /></button>
                            <button className="icon-btn red" onClick={() => handleDelete('medication', m._id)}><Trash2 size={15} /></button>
                          </>
                        )}
                      </div>
                    </div>
                  )) : <div className="empty">No medications yet.</div>}
                </div>
              )}

              {/* ── ALLERGIES TAB ── */}
              {activeTab === 'allergies' && (
                <div className="section-card full">
                  <div className="section-head">
                    <h4>Allergies</h4>
                    {user.role === 'doctor' && (
                      <button className="btn-primary" onClick={() => openModal('allergy')}>
                        <Plus size={16} /> Add Allergy
                      </button>
                    )}
                  </div>
                  {record?.allergies?.length ? record.allergies.map((a) => (
                    <div key={a._id} className="list-row">
                      <div>
                        <strong>{a.allergen}</strong>
                        <span className="sub">
                          {a.reaction}
                          {a.createdByDoctorName && (
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                              Created by: {a.createdByDoctorName} {a.createdBySpecialization ? `(${a.createdBySpecialization})` : ''} — {new Date(a.createdAt).toLocaleString()}
                              {a.updatedAt && a.updatedAt !== a.createdAt && ` | Modified: ${new Date(a.updatedAt).toLocaleString()}`}
                            </div>
                          )}
                        </span>
                      </div>
                      <div className="row-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span className={`badge ${a.severity === 'Severe' ? 'badge-error' : a.severity === 'Moderate' ? 'badge-warning' : 'badge-success'}`}>{a.severity}</span>
                        {canEditItem(a) && (
                          <>
                            <button className="icon-btn blue" onClick={() => openModal('allergy', a)}><Edit2 size={15} /></button>
                            <button className="icon-btn red" onClick={() => handleDelete('allergy', a._id)}><Trash2 size={15} /></button>
                          </>
                        )}
                      </div>
                    </div>
                  )) : <div className="empty">No allergies recorded.</div>}
                </div>
              )}

              {/* ── LABS TAB ── */}
              {activeTab === 'labs' && (
                <div className="section-card full">
                  <div className="section-head">
                    <h4>Lab Results</h4>
                    {user.role === 'doctor' && (
                      <button className="btn-primary" onClick={() => openModal('lab')}>
                        <Plus size={16} /> Add Lab Result
                      </button>
                    )}
                  </div>
                  {record?.labResults?.length ? record.labResults.map((l) => (
                    <div key={l._id} className="list-row">
                      <div>
                        <strong>{l.testName}</strong>
                        <span className="sub">
                          {l.result} {l.referenceRange && `(Ref: ${l.referenceRange})`} {l.date ? `· Date: ${new Date(l.date).toLocaleDateString()}` : ''}
                          {l.createdByDoctorName && (
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                              Created by: {l.createdByDoctorName} {l.createdBySpecialization ? `(${l.createdBySpecialization})` : ''} — {new Date(l.createdAt).toLocaleString()}
                              {l.updatedAt && l.updatedAt !== l.createdAt && ` | Modified: ${new Date(l.updatedAt).toLocaleString()}`}
                            </div>
                          )}
                        </span>
                      </div>
                      <div className="row-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span className={`badge ${l.status === 'Critical' ? 'badge-error' : l.status === 'Abnormal' ? 'badge-warning' : 'badge-success'}`}>{l.status}</span>
                        {canEditItem(l) && (
                          <>
                            <button className="icon-btn blue" onClick={() => openModal('lab', l)}><Edit2 size={15} /></button>
                            <button className="icon-btn red" onClick={() => handleDelete('lab', l._id)}><Trash2 size={15} /></button>
                          </>
                        )}
                      </div>
                    </div>
                  )) : <div className="empty">No lab results yet.</div>}
                </div>
              )}

              {/* ── MEDICAL REPORTS TAB ── */}
              {activeTab === 'medicalreports' && (
                <div className="section-card full">
                  <div className="section-head">
                    <h4>Medical Reports & Prescription Files</h4>
                    {user.role === 'doctor' && (
                      <button className="btn-primary" onClick={() => openModal('medicalreport')}>
                        <Plus size={16} /> Add Medical Report
                      </button>
                    )}
                  </div>
                  {record?.medicalReports?.length ? record.medicalReports.map((r) => (
                    <div key={r._id} className="list-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '8px', background: '#eff6ff', borderRadius: '8px', color: '#2563eb' }}>
                          <File size={20} />
                        </div>
                        <div>
                          <strong>{r.title}</strong>
                          <span className="sub">
                            {r.date ? new Date(r.date).toLocaleDateString() : ''}
                            {r.notes && ` · Notes: ${r.notes}`}
                            {r.fileName && ` · File: ${r.fileName}`}
                            {r.createdByDoctorName && (
                              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                                Created by: {r.createdByDoctorName} {r.createdBySpecialization ? `(${r.createdBySpecialization})` : ''} — {new Date(r.createdAt).toLocaleString()}
                                {r.updatedAt && r.updatedAt !== r.createdAt && ` | Modified: ${new Date(r.updatedAt).toLocaleString()}`}
                              </div>
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="row-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button className="icon-btn blue" title="Preview File" onClick={() => setPreviewFile(r)}>
                          <Eye size={15} />
                        </button>
                        {canEditItem(r) && (
                          <>
                            <button className="icon-btn blue" title="Edit Report" onClick={() => openModal('medicalreport', r)}>
                              <Edit2 size={15} />
                            </button>
                            <button className="icon-btn red" title="Delete Report" onClick={() => handleDelete('medicalreport', r._id)}>
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )) : <div className="empty">No medical reports recorded.</div>}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ── MODALS ── */}
      {modal === 'vitals' && (
        <Modal title="Update Vitals" onClose={closeModal}>
          <label>Blood Type</label>
          <select name="bloodType" onChange={handleFormChange} defaultValue={record?.bloodType || ''}>
            <option value="">Select...</option>
            {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b}>{b}</option>)}
          </select>
          <label>Height (cm)</label>
          <input type="number" name="height" placeholder="e.g. 175" defaultValue={record?.height || ''} onChange={handleFormChange} />
          <label>Weight (kg)</label>
          <input type="number" name="weight" placeholder="e.g. 70" defaultValue={record?.weight || ''} onChange={handleFormChange} />
          <label>Date of Birth</label>
          <input type="date" name="dateOfBirth" defaultValue={record?.dateOfBirth ? record.dateOfBirth.split('T')[0] : ''} onChange={handleFormChange} />
          <button className="btn-primary full-width" onClick={handleSaveVitals} disabled={saving}>{saving ? 'Saving…' : 'Save Vitals'}</button>
        </Modal>
      )}

      {modal === 'diagnosis' && (
        <Modal title={editItem ? "Edit Diagnosis" : "Add Diagnosis"} onClose={closeModal}>
          <label>Condition <span className="req">*</span></label>
          <input name="condition" placeholder="e.g. Hypertension" value={form.condition || ''} onChange={handleFormChange} />
          <label>Date Diagnosed</label>
          <input type="date" name="dateDiagnosed" value={form.dateDiagnosed || ''} onChange={handleFormChange} />
          <label>Status</label>
          <select name="status" value={form.status || 'Active'} onChange={handleFormChange}>
            <option value="Active">Active</option>
            <option value="Resolved">Resolved</option>
          </select>
          <label>Notes</label>
          <textarea name="notes" placeholder="Additional notes..." value={form.notes || ''} onChange={handleFormChange} />
          <button className="btn-primary full-width" onClick={handleAdd} disabled={saving || !form.condition}>{saving ? 'Saving…' : (editItem ? 'Update Diagnosis' : 'Add Diagnosis')}</button>
        </Modal>
      )}

      {modal === 'medication' && (
        <Modal title={editItem ? "Edit Medication" : "Add Medication"} onClose={closeModal}>
          <label>Medication Name <span className="req">*</span></label>
          <input name="name" placeholder="e.g. Metformin" value={form.name || ''} onChange={handleFormChange} />
          <label>Dosage</label>
          <input name="dosage" placeholder="e.g. 500mg" value={form.dosage || ''} onChange={handleFormChange} />
          <label>Frequency</label>
          <input name="frequency" placeholder="e.g. Twice daily" value={form.frequency || ''} onChange={handleFormChange} />
          <label>Prescribed By</label>
          <input name="prescribedBy" placeholder="Doctor's name" value={form.prescribedBy || ''} onChange={handleFormChange} />
          <label>Start Date</label>
          <input type="date" name="startDate" value={form.startDate || ''} onChange={handleFormChange} />
          <button className="btn-primary full-width" onClick={handleAdd} disabled={saving || !form.name}>{saving ? 'Saving…' : (editItem ? 'Update Medication' : 'Add Medication')}</button>
        </Modal>
      )}

      {modal === 'allergy' && (
        <Modal title={editItem ? "Edit Allergy" : "Add Allergy"} onClose={closeModal}>
          <label>Allergen <span className="req">*</span></label>
          <input name="allergen" placeholder="e.g. Penicillin" value={form.allergen || ''} onChange={handleFormChange} />
          <label>Reaction</label>
          <input name="reaction" placeholder="e.g. Hives, Anaphylaxis" value={form.reaction || ''} onChange={handleFormChange} />
          <label>Severity</label>
          <select name="severity" value={form.severity || 'Mild'} onChange={handleFormChange}>
            <option value="Mild">Mild</option>
            <option value="Moderate">Moderate</option>
            <option value="Severe">Severe</option>
          </select>
          <button className="btn-primary full-width" onClick={handleAdd} disabled={saving || !form.allergen}>{saving ? 'Saving…' : (editItem ? 'Update Allergy' : 'Add Allergy')}</button>
        </Modal>
      )}

      {modal === 'lab' && (
        <Modal title={editItem ? "Edit Lab Result" : "Add Lab Result"} onClose={closeModal}>
          <label>Test Name <span className="req">*</span></label>
          <input name="testName" placeholder="e.g. Blood Glucose" value={form.testName || ''} onChange={handleFormChange} />
          <label>Result</label>
          <input name="result" placeholder="e.g. 110 mg/dL" value={form.result || ''} onChange={handleFormChange} />
          <label>Reference Range</label>
          <input name="referenceRange" placeholder="e.g. 70-99 mg/dL" value={form.referenceRange || ''} onChange={handleFormChange} />
          <label>Status</label>
          <select name="status" value={form.status || 'Normal'} onChange={handleFormChange}>
            <option value="Normal">Normal</option>
            <option value="Abnormal">Abnormal</option>
            <option value="Critical">Critical</option>
          </select>
          <label>Date</label>
          <input type="date" name="date" value={form.date || ''} onChange={handleFormChange} />
          <button className="btn-primary full-width" onClick={handleAdd} disabled={saving || !form.testName}>{saving ? 'Saving…' : (editItem ? 'Update Lab Result' : 'Add Lab Result')}</button>
        </Modal>
      )}

      {modal === 'medicalreport' && (
        <Modal title={editItem ? "Edit Medical Report" : "Add Medical Report"} onClose={closeModal}>
          <label>Report Title <span className="req">*</span></label>
          <input name="title" placeholder="e.g. Head CT Scan Report" value={form.title || ''} onChange={handleFormChange} />
          <label>Date</label>
          <input type="date" name="date" value={form.date || ''} onChange={handleFormChange} />
          <label>Notes</label>
          <textarea name="notes" placeholder="Additional notes..." value={form.notes || ''} onChange={handleFormChange} />
          <label>Attachment (Image/PDF) <span className="req">{editItem ? '' : '*'}</span></label>
          <div className="file-upload-zone" style={{ border: '2px dashed #cbd5e1', padding: '16px', borderRadius: '8px', textAlign: 'center', background: '#f8fafc', cursor: 'pointer', position: 'relative' }}>
            <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
            <UploadCloud size={32} style={{ color: '#94a3b8', marginBottom: '8px', display: 'inline-block' }} />
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
              {form.fileName ? `Selected: ${form.fileName}` : "Click or drag file to upload (Max 5MB)"}
            </p>
          </div>
          {form.fileUrl && (
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
              <File size={14} /> <span>File attached successfully</span>
            </div>
          )}
          <button className="btn-primary full-width" style={{ marginTop: '16px' }} onClick={handleAdd} disabled={saving || !form.title || (!editItem && !form.fileUrl)}>
            {saving ? 'Saving…' : (editItem ? 'Update Report' : 'Add Report')}
          </button>
        </Modal>
      )}

      {modal === 'register_patient' && (
        <Modal title="Register New Patient" onClose={closeModal}>
          {registerError && <div className="alert-error" style={{ marginBottom: '12px', padding: '10px', background: '#fee2e2', color: '#dc2626', borderRadius: '6px', fontSize: '13px' }}>{registerError}</div>}
          <form onSubmit={handleRegisterPatient} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>First Name <span className="req">*</span></label>
                <input 
                  name="firstName" 
                  placeholder="John" 
                  value={registerForm.firstName}
                  onChange={e => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                  required 
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Last Name <span className="req">*</span></label>
                <input 
                  name="lastName" 
                  placeholder="Doe" 
                  value={registerForm.lastName}
                  onChange={e => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                  required 
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Email Address <span className="req">*</span></label>
              <input 
                type="email" 
                name="email" 
                placeholder="patient@example.com" 
                value={registerForm.email}
                onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                required 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Password <span className="req">*</span></label>
              <input 
                type="password" 
                name="password" 
                placeholder="••••••••" 
                value={registerForm.password}
                onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                required 
              />
            </div>
            <button type="submit" className="btn-primary full-width" disabled={saving} style={{ marginTop: '12px', width: '100%', padding: '12px', borderRadius: '8px' }}>
              {saving ? 'Creating Patient…' : 'Register Patient'}
            </button>
          </form>
        </Modal>
      )}

      {/* ── File Preview Lightbox Modal ── */}
      {previewFile && (
        <div className="modal-overlay" onClick={() => setPreviewFile(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
            <div className="modal-header">
              <h3>{previewFile.title || 'Report File Preview'}</h3>
              <button className="modal-close" onClick={() => setPreviewFile(null)}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', background: '#f8fafc', padding: '16px' }}>
              {previewFile.fileType?.includes('pdf') || previewFile.fileName?.endsWith('.pdf') ? (
                <iframe src={previewFile.fileUrl} width="100%" height="600px" title={previewFile.fileName} style={{ border: 'none', borderRadius: '8px' }} />
              ) : (
                <img src={previewFile.fileUrl} alt={previewFile.fileName} style={{ maxWidth: '100%', maxHeight: '75vh', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
};

export default Dashboard;
