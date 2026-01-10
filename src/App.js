import React, { useState, useCallback, useRef, useEffect } from 'react';
import './App.css';

// API URL from environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// ============================================
// Icons (inline SVGs for minimalism)
// ============================================
const Icons = {
  Calendar: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Upload: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  Check: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  User: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Clock: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  MapPin: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Download: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  ArrowRight: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  AlertCircle: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Loader: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spin">
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
    </svg>
  ),
  Plus: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Trash: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  ExternalLink: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
};

const GoogleIcon = () => (
  <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// ============================================
// Constants
// ============================================
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Days Multi-Select Component
const DaysMultiSelect = ({ selectedDays, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const toggleDay = (day) => {
    const newSelected = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day].sort((a, b) => DAYS_OF_WEEK.indexOf(a) - DAYS_OF_WEEK.indexOf(b));
    onChange(newSelected);
  };

  const displayText = selectedDays.length > 0 
    ? selectedDays.join(', ') 
    : 'Select days...';

  return (
    <div className="days-multiselect" ref={containerRef}>
      <button
        type="button"
        className="days-multiselect-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedDays.length === 0 ? 'placeholder' : ''}>
          {displayText}
        </span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
          <path d={isOpen ? "M3 9 L6 6 L9 9" : "M3 3 L6 6 L9 3"} />
        </svg>
      </button>
      {isOpen && (
        <div className="days-multiselect-dropdown">
          {DAYS_OF_WEEK.map(day => (
            <label key={day} className="days-multiselect-option">
              <input
                type="checkbox"
                checked={selectedDays.includes(day)}
                onChange={() => toggleDay(day)}
              />
              <span>{day}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// Utilities (removed - now handled by backend)
// ============================================

// ============================================
// Main Application
// ============================================
export default function App() {
  // Flow state
  const [step, setStep] = useState(1); // 1: Connect, 2: Upload, 3: Review, 4: Success
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
  // Data state
  const [courses, setCourses] = useState([]);
  const [originalCourses, setOriginalCourses] = useState([]);
  
  // Result state
  const [addResult, setAddResult] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [addingToCalendar, setAddingToCalendar] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef(null);

  // Handle OAuth callback from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get('auth');
    const emailParam = params.get('email');
    
    if (authStatus === 'success' && emailParam) {
      setUserEmail(emailParam);
      setIsCalendarConnected(true);
      setStep(2); // Go to upload step after successful auth
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (authStatus === 'error') {
      const message = params.get('message');
      setError(`Failed to connect Google Calendar: ${message}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Check calendar connection status when email changes
  const checkCalendarConnection = useCallback(async (email) => {
    if (!email) return;
    
    try {
      const response = await fetch(`${API_URL}/api/auth/status?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      setIsCalendarConnected(data.connected && data.hasValidToken);
    } catch (err) {
      console.error('Failed to check calendar connection:', err);
      setIsCalendarConnected(false);
    }
  }, []);

  useEffect(() => {
    if (userEmail) {
      checkCalendarConnection(userEmail);
    }
  }, [userEmail, checkCalendarConnection]);

  // Connect to Google Calendar via OAuth
  const handleConnect = useCallback(async () => {
    if (!userEmail || !userEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/google?email=${encodeURIComponent(userEmail)}`);
      const data = await response.json();
      
      if (data.authUrl) {
        // Redirect to Google OAuth
        window.location.href = data.authUrl;
      } else {
        setError('Failed to initiate Google Calendar connection');
        setLoading(false);
      }
    } catch (err) {
      console.error('Failed to connect calendar:', err);
      setError('Failed to connect to server. Please try again.');
      setLoading(false);
    }
  }, [userEmail]);

  const handleDisconnect = useCallback(async () => {
    try {
      await fetch(`${API_URL}/api/auth/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });
    } catch (err) {
      console.error('Failed to disconnect:', err);
    }
    setIsCalendarConnected(false);
    setUserEmail('');
    setStep(1);
  }, [userEmail]);

  // File upload handling with real OCR
  const processFile = useCallback(async (file) => {
    if (!file) return;
    
    setLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`${API_URL}/api/extract-table`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.courses && data.courses.length > 0) {
        // Normalize courses via backend API
        const normalizeResponse = await fetch(`${API_URL}/api/courses/normalize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courses: data.courses })
        });
        
        const normalizeData = await normalizeResponse.json();
        if (normalizeData.success && normalizeData.courses) {
          setCourses(normalizeData.courses);
          setOriginalCourses(normalizeData.courses);
          setStep(3);
        } else {
          setError('Failed to normalize courses. Please try again.');
        }
      } else {
        setError('No courses found in the image. Please try again with a clearer screenshot.');
      }
    } catch (err) {
      console.error('Failed to extract courses:', err);
      setError('Failed to process image. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Course editing
  const handleCourseChange = (idx, field, value) => {
    setCourses(prev => prev.map((c, i) => 
      i === idx ? { ...c, [field]: value } : c
    ));
  };

  // Add a new course
  const handleAddCourse = () => {
    const newCourse = {
      courseNo: '',
      courseTitle: '',
      location: '',
      instructor: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      days: [],
      times: '',
      notes: ''
    };
    setCourses(prev => [...prev, newCourse]);
    setOriginalCourses(prev => [...prev, null]); // null for new courses (no original to compare)
  };

  // Remove a course
  const handleRemoveCourse = (idx) => {
    setCourses(prev => prev.filter((_, i) => i !== idx));
    setOriginalCourses(prev => prev.filter((_, i) => i !== idx));
  };

  // Add events to Google Calendar via API
  const handleAddToCalendar = async () => {
    if (!isCalendarConnected) {
      setError('Please connect your Google Calendar first');
          return;
        }
        
    setAddingToCalendar(true);
    setError('');
    setAddResult(null);

    try {
      // Send courses directly to backend (backend handles normalization)
      const response = await fetch(`${API_URL}/api/calendar/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          courses: courses
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create calendar events');
      }
      
      setAddResult(result);
      setStep(4);
      
    } catch (err) {
      console.error('Failed to add events to calendar:', err);
      setError(err.message || 'Failed to add events to Google Calendar. Please try again.');
    } finally {
      setAddingToCalendar(false);
    }
  };

  // Calculate progress
  const progress = ((step - 1) / 3) * 100;

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-content">
          <div className="nav-brand">
            <div className="nav-logo">H</div>
            <span className="nav-title">Haas Calendar</span>
          </div>
          <div className="nav-status">
            <span className={`status-dot ${isCalendarConnected ? 'connected' : ''}`} />
            {isCalendarConnected ? userEmail : 'Not connected'}
          </div>
        </div>
      </nav>

      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <main className="main">
        <div className={`container ${step === 3 ? 'wide' : ''}`}>
          {/* Step Indicator */}
          <div className="steps">
            {[
              { num: 1, label: 'Connect' },
              { num: 2, label: 'Upload' },
              { num: 3, label: 'Review' },
              { num: 4, label: 'Done' },
            ].map((s) => (
              <div
                key={s.num}
                className={`step ${step === s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`}
                onClick={() => step > s.num && setStep(s.num)}
              >
                <div className="step-number">
                  {step > s.num ? <Icons.Check /> : s.num}
                </div>
                <span className="step-label">{s.label}</span>
              </div>
            ))}
      </div>

          {/* Step 1: Connect Calendar */}
          {step === 1 && (
            <div className="animate-in">
              <div className="page-header">
                <h1 className="page-title">Connect Your Calendar</h1>
                <p className="page-subtitle">
                  Link your Google Calendar to automatically sync your class schedule
                </p>
              </div>

              <div className="card card-highlight connection-card">
                <div className={`connection-icon ${isCalendarConnected ? 'connected' : ''}`}>
                  <Icons.Calendar />
                </div>
                <h2 className="connection-title">Google Calendar</h2>
                <p className="connection-text">
                  {isCalendarConnected 
                    ? <>Connected as <span className="connection-email">{userEmail}</span></>
                    : 'Enter your Berkeley email to get started'
                  }
                </p>

                {!isCalendarConnected && (
                  <>
                    <div className="input-group">
          <input
            type="email"
                        className="input centered"
                        placeholder="your.email@berkeley.edu"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
          />
        </div>

              <button 
                      className="btn btn-google btn-lg"
                      onClick={handleConnect}
                      disabled={loading}
                    >
                      {loading ? (
                        <Icons.Loader />
                      ) : (
                        <>
                          <GoogleIcon />
                          Connect Google Calendar
                        </>
                      )}
                    </button>
                  </>
                )}

                {isCalendarConnected && (
                  <button 
                    className="btn btn-secondary"
                    onClick={handleDisconnect}
              >
                Disconnect
              </button>
                )}
            </div>

              {error && (
                <div className="error-message">
                  <Icons.AlertCircle />
                  {error}
            </div>
          )}

              {isCalendarConnected && (
                <div className="action-bar">
                  <button className="btn btn-primary btn-lg" onClick={() => setStep(2)}>
                    Continue
                    <Icons.ArrowRight />
                  </button>
        </div>
              )}

      </div>
          )}

          {/* Step 2: Upload Schedule */}
          {step === 2 && !isCalendarConnected && (
            <div className="animate-in">
              <div className="card" style={{ textAlign: 'center', padding: 'var(--space-3xl)' }}>
                <div className="upload-icon" style={{ marginBottom: 'var(--space-lg)', color: 'var(--accent-gold)' }}>
                  <Icons.AlertCircle />
                </div>
                <h2 className="page-title">Calendar Connection Required</h2>
                <p className="page-subtitle" style={{ marginBottom: 'var(--space-xl)' }}>
                  Please connect your Google Calendar before uploading your schedule.
                </p>
                <button 
                  className="btn btn-gold btn-lg"
                  onClick={() => setStep(1)}
                >
                  <Icons.Calendar />
                  Connect Google Calendar
                </button>
              </div>
            </div>
          )}

          {step === 2 && isCalendarConnected && (
            <div className="animate-in">
              <div className="page-header">
                <h1 className="page-title">Upload Your Final Schedule</h1>
                <p className="page-subtitle">
                  Upload a screenshot of your final schedule from{' '}
                  <a 
                    href="https://olr.haas.berkeley.edu/Student/MySchedule" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="link"
                  >
                    OLR My Schedule
                  </a>
                  {' '}or your{' '}
                  <a 
                    href="https://olr.haas.berkeley.edu/Bidding/Bidding?intProcessID=895" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="link"
                  >
                    Successful Bid and History
                  </a>
                  . Make sure you have successfully enrolled in all courses before uploading.
                </p>
      </div>

              <div
                className={`upload-zone ${isDragging ? 'dragging' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                
                {loading ? (
        <div className="loading">
                    <div className="spinner" />
                    <p className="loading-text">Extracting courses...</p>
        </div>
                ) : (
                  <>
                    <div className="upload-icon">
                      <Icons.Upload />
                    </div>
                    <h3 className="upload-title">Drop your final schedule screenshot here</h3>
                    <p className="upload-text">or click to browse files</p>
                    <p className="upload-hint">Upload your completed enrollment schedule (PNG, JPG up to 10MB)</p>
                  </>
                )}
    </div>

              {error && (
                <div className="error-message">
                  <Icons.AlertCircle />
                  {error}
      </div>
              )}

              <div className="example-section">
                <p className="example-label">Example Screenshot</p>
                <img 
                  src="/images/schedule_example.png" 
                  alt="Example OLR schedule" 
                  className="example-image"
                />
      </div>

              <div className="action-bar">
                <button className="btn btn-secondary" onClick={() => setStep(1)}>
                  <Icons.ArrowLeft />
                  Back
                </button>
    </div>
            </div>
          )}

          {/* Step 3: Review Courses */}
          {step === 3 && (
            <div className="animate-in">
              <div className="page-header">
                <h1 className="page-title">Review Your Courses</h1>
                <p className="page-subtitle">
                  Click on any field to edit. Changes are highlighted in yellow.
                </p>
      </div>

              <div className="courses-grid">
                {courses.map((course, idx) => {
                  const originalCourse = originalCourses[idx] || null;
                  const isEdited = originalCourse && (
                    course.courseNo !== originalCourse?.courseNo ||
                    course.courseTitle !== originalCourse?.courseTitle ||
                    course.location !== originalCourse?.location ||
                    course.instructor !== originalCourse?.instructor ||
                    course.startDate !== originalCourse?.startDate ||
                    course.endDate !== originalCourse?.endDate ||
                    course.startTime !== originalCourse?.startTime ||
                    course.endTime !== originalCourse?.endTime ||
                    JSON.stringify(course.days) !== JSON.stringify(originalCourse?.days)
                  );

                  return (
                    <div key={idx} className={`course-card ${isEdited ? 'course-card-edited' : ''}`}>
                      <div className="course-card-header">
                        <div className="course-card-title-group">
                          <input
                            className={`course-card-code ${course.courseNo !== originalCourse?.courseNo ? 'edited' : ''}`}
                            value={course.courseNo || ''}
                            onChange={(e) => handleCourseChange(idx, 'courseNo', e.target.value)}
                            placeholder="MBA201A.1"
                          />
                          <input
                            className={`course-card-title ${course.courseTitle !== originalCourse?.courseTitle ? 'edited' : ''}`}
                            value={course.courseTitle || ''}
                            onChange={(e) => handleCourseChange(idx, 'courseTitle', e.target.value)}
                            placeholder="Course Title"
                          />
                        </div>
                        <button
                          className="btn-icon btn-icon-danger"
                          onClick={() => handleRemoveCourse(idx)}
                          title="Remove course"
                          aria-label="Remove course"
                        >
                          <Icons.Trash />
                        </button>
                      </div>

                      <div className="course-card-body">
                        <div className="course-card-row">
                          <div className="course-card-field">
                            <label className="course-card-label">
                              <Icons.MapPin />
                              Location
                            </label>
                            <input
                              className={`course-card-input ${course.location !== originalCourse?.location ? 'edited' : ''}`}
                              value={course.location || ''}
                              onChange={(e) => handleCourseChange(idx, 'location', e.target.value)}
                              placeholder="Room TBD"
                            />
                          </div>
                          <div className="course-card-field">
                            <label className="course-card-label">
                              <Icons.User />
                              Instructor
                            </label>
                            <input
                              className={`course-card-input ${course.instructor !== originalCourse?.instructor ? 'edited' : ''}`}
                              value={course.instructor || ''}
                              onChange={(e) => handleCourseChange(idx, 'instructor', e.target.value)}
                              placeholder="Instructor Name"
                            />
                          </div>
                        </div>

                        <div className="course-card-row">
                          <div className="course-card-field">
                            <label className="course-card-label">
                              <Icons.Clock />
                              Time
                            </label>
                            <div className="course-card-time-group">
                              <input
                                className={`course-card-input course-card-input-time ${course.startTime !== originalCourse?.startTime ? 'edited' : ''}`}
                                value={course.startTime || ''}
                                onChange={(e) => handleCourseChange(idx, 'startTime', e.target.value)}
                                placeholder="9:00 AM"
                              />
                              <span className="course-card-time-separator">→</span>
                              <input
                                className={`course-card-input course-card-input-time ${course.endTime !== originalCourse?.endTime ? 'edited' : ''}`}
                                value={course.endTime || ''}
                                onChange={(e) => handleCourseChange(idx, 'endTime', e.target.value)}
                                placeholder="10:30 AM"
                              />
                            </div>
                          </div>
                          <div className="course-card-field">
                            <label className="course-card-label">
                              <Icons.Calendar />
                              Days
                            </label>
                            <DaysMultiSelect
                              selectedDays={Array.isArray(course.days) ? course.days : (course.days ? [course.days] : [])}
                              onChange={(selectedDays) => handleCourseChange(idx, 'days', selectedDays)}
                            />
                          </div>
                        </div>

                        <div className="course-card-row">
                          <div className="course-card-field">
                            <label className="course-card-label">
                              <Icons.Calendar />
                              Start Date
                            </label>
                            <input
                              type="date"
                              className={`course-card-input course-card-input-date ${course.startDate !== originalCourse?.startDate ? 'edited' : ''}`}
                              value={course.startDate || ''}
                              onChange={(e) => handleCourseChange(idx, 'startDate', e.target.value)}
                            />
                          </div>
                          <div className="course-card-field">
                            <label className="course-card-label">
                              <Icons.Calendar />
                              End Date
                            </label>
                            <input
                              type="date"
                              className={`course-card-input course-card-input-date ${course.endDate !== originalCourse?.endDate ? 'edited' : ''}`}
                              value={course.endDate || ''}
                              onChange={(e) => handleCourseChange(idx, 'endDate', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 'var(--space-xl)', textAlign: 'center' }}>
                <button
                  className="btn btn-secondary"
                  onClick={handleAddCourse}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-sm)' }}
                >
                  <Icons.Plus />
                  Add Course
                </button>
              </div>

              {error && (
                <div className="error-message">
                  <Icons.AlertCircle />
                  {error}
                </div>
              )}

              <div className="action-bar">
                <button className="btn btn-secondary" onClick={() => setStep(2)}>
                  <Icons.ArrowLeft />
                  Back
                </button>
                <button 
                  className="btn btn-gold btn-lg" 
                  onClick={handleAddToCalendar}
                  disabled={addingToCalendar || courses.length === 0}
                >
                  {addingToCalendar ? (
                    <>
                      <Icons.Loader />
                      Adding Events...
                    </>
                  ) : (
                    <>
                      <Icons.Calendar />
                      Add to Calendar
                    </>
                  )}
                </button>
                </div>

        </div>
      )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="animate-in">
              <div className="card success-card">
                <div className="success-icon">
                  <Icons.Check />
        </div>
                <h2 className="success-title">
                  Thank you for adding your calendar!
                </h2>
                <p className="success-text">
                  {addResult?.totalCreated 
                    ? `Successfully added ${addResult.totalCreated} events to your Google Calendar.`
                    : `Your calendar events have been created.`
                  }
                </p>
                {addResult?.totalFailed > 0 && (
                  <p className="success-warning">
                    Note: {addResult.totalFailed} events could not be added
                  </p>
                )}
                {addResult?.calendarUrl && addResult?.totalCreated > 0 && (
                  <div className="success-action">
                    <a
                      href={addResult.calendarUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-lg"
                    >
                      <Icons.Calendar />
                      View Calendar
                      <Icons.ExternalLink />
                    </a>
                  </div>
                )}
      </div>
        </div>
          )}
      </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        Made for Berkeley Haas students
      </footer>
    </div>
  );
}
