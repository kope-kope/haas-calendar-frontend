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
// Mock Data for Demo Mode (11 courses for edge case testing)
// ============================================
const MOCK_COURSES = [
  { courseNo: 'MBA201A.1', courseTitle: 'Microeconomics', instructor: 'Prof. Smith', days: ['Monday', 'Wednesday'], times: '9:00 AM - 10:30 AM', startTime: '9:00 AM', endTime: '10:30 AM', location: 'Chou Hall C125', startDate: '2025-08-28', endDate: '2025-12-05', notes: '' },
  { courseNo: 'MBA202A.1', courseTitle: 'Leadership', instructor: 'Prof. Johnson', days: ['Tuesday', 'Thursday'], times: '11:00 AM - 12:30 PM', startTime: '11:00 AM', endTime: '12:30 PM', location: 'Chou Hall C220', startDate: '2025-08-28', endDate: '2025-12-05', notes: '' },
  { courseNo: 'MBA203A.1', courseTitle: 'Finance', instructor: 'Prof. Williams', days: ['Monday', 'Wednesday'], times: '2:00 PM - 3:30 PM', startTime: '2:00 PM', endTime: '3:30 PM', location: 'Chou Hall C320', startDate: '2025-08-28', endDate: '2025-12-05', notes: '' },
  { courseNo: 'MBA204A.1', courseTitle: 'Marketing Strategy', instructor: 'Prof. Davis', days: ['Monday', 'Wednesday', 'Friday'], times: '10:00 AM - 11:00 AM', startTime: '10:00 AM', endTime: '11:00 AM', location: 'Chou Hall C410', startDate: '2025-08-28', endDate: '2025-12-05', notes: '' },
  { courseNo: 'MBA205A.1', courseTitle: 'Operations Management', instructor: 'Prof. Brown', days: ['Tuesday', 'Thursday'], times: '1:00 PM - 2:30 PM', startTime: '1:00 PM', endTime: '2:30 PM', location: 'Chou Hall C510', startDate: '2025-08-28', endDate: '2025-12-05', notes: '' },
  { courseNo: 'MBA206A.1', courseTitle: 'Data Analytics', instructor: 'Prof. Miller', days: ['Monday', 'Wednesday'], times: '3:00 PM - 4:30 PM', startTime: '3:00 PM', endTime: '4:30 PM', location: 'Chou Hall C210', startDate: '2025-08-28', endDate: '2025-12-05', notes: '' },
  { courseNo: 'MBA207A.1', courseTitle: 'Strategic Management', instructor: 'Prof. Wilson', days: ['Tuesday', 'Thursday'], times: '9:30 AM - 11:00 AM', startTime: '9:30 AM', endTime: '11:00 AM', location: 'Chou Hall C330', startDate: '2025-08-28', endDate: '2025-12-05', notes: '' },
  { courseNo: 'MBA208A.1', courseTitle: 'Entrepreneurship', instructor: 'Prof. Moore', days: ['Friday'], times: '2:00 PM - 5:00 PM', startTime: '2:00 PM', endTime: '5:00 PM', location: 'Chou Hall C440', startDate: '2025-08-28', endDate: '2025-12-05', notes: '' },
  { courseNo: 'MBA209A.1', courseTitle: 'Organizational Behavior', instructor: 'Prof. Taylor', days: ['Monday', 'Wednesday'], times: '11:00 AM - 12:30 PM', startTime: '11:00 AM', endTime: '12:30 PM', location: 'Chou Hall C550', startDate: '2025-08-28', endDate: '2025-12-05', notes: '' },
  { courseNo: 'MBA210A.1', courseTitle: 'Business Ethics', instructor: 'Prof. Anderson', days: ['Thursday'], times: '4:00 PM - 6:00 PM', startTime: '4:00 PM', endTime: '6:00 PM', location: 'Chou Hall C120', startDate: '2025-08-28', endDate: '2025-12-05', notes: '' },
  { courseNo: 'MBA211A.1', courseTitle: 'Global Business', instructor: 'Prof. Thomas', days: ['Tuesday', 'Thursday'], times: '2:00 PM - 3:30 PM', startTime: '2:00 PM', endTime: '3:30 PM', location: 'Chou Hall C230', startDate: '2025-08-28', endDate: '2025-12-05', notes: '' },
];

// ============================================
// Utilities
// ============================================
const parseTime = (timeStr) => {
  if (!timeStr) return { hours: 9, minutes: 0 };
  try {
    const [time, period] = timeStr.split(' ');
    if (!time || !period) return { hours: 9, minutes: 0 };
    let [hours, minutes] = time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return { hours: 9, minutes: 0 };
    if (period === 'PM' && hours !== 12) hours += 12;
    else if (period === 'AM' && hours === 12) hours = 0;
    return { hours, minutes };
  } catch {
    return { hours: 9, minutes: 0 };
  }
};

// Parse times string into separate startTime and endTime
const parseTimesString = (timesStr) => {
  if (!timesStr) return { startTime: '9:00 AM', endTime: '10:00 AM' };
  const parts = timesStr.split(' - ').map(t => t.trim());
  return {
    startTime: parts[0] || '9:00 AM',
    endTime: parts[1] || '10:00 AM'
  };
};

// Normalize course data to ensure all required fields exist
const normalizeCourse = (course) => {
  const normalized = { ...course };
  
  // Parse times if not already split
  if (course.times && (!course.startTime || !course.endTime)) {
    const { startTime, endTime } = parseTimesString(course.times);
    normalized.startTime = startTime;
    normalized.endTime = endTime;
  }
  
  // Ensure all fields exist with defaults
  normalized.location = normalized.location || 'Room TBD';
  normalized.startDate = normalized.startDate || '2025-08-28';
  normalized.endDate = normalized.endDate || '2025-12-05';
  normalized.startTime = normalized.startTime || '9:00 AM';
  normalized.endTime = normalized.endTime || '10:00 AM';
  
  // Ensure days is always an array of full day names
  if (Array.isArray(normalized.days)) {
    // Filter to only valid full day names and sort by day of week order
    normalized.days = normalized.days
      .filter(day => DAYS_OF_WEEK.includes(day))
      .sort((a, b) => DAYS_OF_WEEK.indexOf(a) - DAYS_OF_WEEK.indexOf(b));
  } else if (normalized.days) {
    // Convert string to array if needed
    const dayStr = String(normalized.days).trim();
    if (DAYS_OF_WEEK.includes(dayStr)) {
      normalized.days = [dayStr];
    } else {
      // Try to parse comma-separated days
      const parsedDays = dayStr.split(',').map(d => d.trim()).filter(d => DAYS_OF_WEEK.includes(d));
      normalized.days = parsedDays.length > 0 ? parsedDays.sort((a, b) => DAYS_OF_WEEK.indexOf(a) - DAYS_OF_WEEK.indexOf(b)) : ['Monday'];
    }
  } else {
    normalized.days = ['Monday'];
  }
  
  return normalized;
};

const generateCalendarEvents = (courses) => {
  const events = [];
  courses.forEach(course => {
    const normalized = normalizeCourse(course);
    if (!normalized.days || normalized.days.length === 0) return;
    
    // Use startTime/endTime if available, otherwise parse from times
    const startTimeStr = normalized.startTime || (normalized.times ? parseTimesString(normalized.times).startTime : '9:00 AM');
    const endTimeStr = normalized.endTime || (normalized.times ? parseTimesString(normalized.times).endTime : '10:00 AM');
    
    const start = parseTime(startTimeStr);
    const end = parseTime(endTimeStr);
    
    const days = Array.isArray(normalized.days) ? normalized.days : [normalized.days];
    
    days.forEach(day => {
      events.push({
        id: `${normalized.courseNo}-${day}`,
        courseNo: normalized.courseNo,
        title: normalized.courseTitle,
        instructor: normalized.instructor,
        location: normalized.location || 'TBD',
        day,
        startTime: startTimeStr,
        endTime: endTimeStr,
        startDate: normalized.startDate,
        endDate: normalized.endDate,
        start,
        end,
      });
    });
  });
  return events;
};

const downloadICSFile = (events) => {
  const getDayAbbrev = (day) => {
    const map = { Sunday: 'SU', Monday: 'MO', Tuesday: 'TU', Wednesday: 'WE', Thursday: 'TH', Friday: 'FR', Saturday: 'SA' };
    return map[day] || 'MO';
  };

  const formatICSDate = (dateStr, hours, minutes) => {
    const date = new Date(dateStr);
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  let ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Haas Calendar//EN', 'CALSCALE:GREGORIAN'];
  
  events.forEach(event => {
    const dtstart = formatICSDate(event.startDate, event.start.hours, event.start.minutes);
    const dtend = formatICSDate(event.startDate, event.end.hours, event.end.minutes);
    const until = formatICSDate(event.endDate, 23, 59);
    
    ics.push(
      'BEGIN:VEVENT',
      `UID:${event.id}@haas.edu`,
      `SUMMARY:${event.courseNo} - ${event.title}`,
      `DESCRIPTION:Instructor: ${event.instructor}`,
      `LOCATION:${event.location}`,
      `DTSTART:${dtstart}`,
      `DTEND:${dtend}`,
      `RRULE:FREQ=WEEKLY;UNTIL=${until};BYDAY=${getDayAbbrev(event.day)}`,
      'END:VEVENT'
    );
  });
  
  ics.push('END:VCALENDAR');
  
  const blob = new Blob([ics.join('\r\n')], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'haas_schedule.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

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
  const [calendarEvents, setCalendarEvents] = useState([]);
  
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
        // Normalize all courses to ensure all required fields exist
        const normalizedCourses = data.courses.map(course => normalizeCourse(course));
        setCourses(normalizedCourses);
        setOriginalCourses(normalizedCourses);
        setStep(3);
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
      // Normalize all courses before sending to API
      const normalizedCourses = courses.map(course => normalizeCourse(course));
      
      const response = await fetch(`${API_URL}/api/calendar/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          courses: normalizedCourses
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create calendar events');
      }

      // Generate events for display
      const events = generateCalendarEvents(courses);
      setCalendarEvents(events);
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
                    : 'Enter your email to get started'
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

              {!isCalendarConnected && (
                <>
                  <div className="divider">or continue without connecting</div>
          <button 
                    className="btn btn-secondary btn-full"
                    onClick={() => {
                      setIsCalendarConnected(false);
                      setStep(2);
                    }}
                  >
                    Skip for now (Demo Mode)
          </button>
                </>
        )}
      </div>
          )}

          {/* Step 2: Upload Schedule */}
          {step === 2 && (
            <div className="animate-in">
              <div className="page-header">
                <h1 className="page-title">Upload Your Schedule</h1>
                <p className="page-subtitle">
                  Take a screenshot from{' '}
                  <a 
                    href="https://olr.haas.berkeley.edu/Student/MySchedule" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="link"
                  >
                    OLR
                  </a>
                  {' '}and upload it here
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
                    <h3 className="upload-title">Drop your screenshot here</h3>
                    <p className="upload-text">or click to browse files</p>
                    <p className="upload-hint">Supports PNG, JPG up to 10MB</p>
                  </>
                )}
    </div>

              <div className="divider">or try with sample data</div>
              
              <button 
                className="btn btn-secondary btn-full"
                onClick={() => {
                  const normalizedCourses = MOCK_COURSES.map(course => normalizeCourse(course));
                  setCourses(normalizedCourses);
                  setOriginalCourses(normalizedCourses);
                  setStep(3);
                }}
              >
                Load Demo Schedule
              </button>

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
                  Click on any field below to edit. Changes are highlighted in yellow.
                </p>
      </div>

              <div className="card course-table-card" style={{ paddingTop: 'var(--space-md)', overflowX: 'auto', overflowY: 'auto', maxHeight: '80vh' }}>
                <table className="course-table">
                  <thead>
                    <tr>
                      <th>Course No</th>
                      <th>Title</th>
                      <th>Location</th>
                      <th>Instructor</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                      <th>Days</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((course, idx) => {
                      const normalizedCourse = normalizeCourse(course);
                      const originalNormalized = originalCourses[idx] ? normalizeCourse(originalCourses[idx]) : null;
                      
                      return (
                        <tr key={idx}>
                          <td>
                            <input
                              className={`course-input ${normalizedCourse.courseNo !== originalNormalized?.courseNo ? 'edited' : ''}`}
                              value={normalizedCourse.courseNo || ''}
                              onChange={(e) => handleCourseChange(idx, 'courseNo', e.target.value)}
                              placeholder="MBA201A.1"
                            />
                          </td>
                          <td>
                            <input
                              className={`course-input ${normalizedCourse.courseTitle !== originalNormalized?.courseTitle ? 'edited' : ''}`}
                              value={normalizedCourse.courseTitle || ''}
                              onChange={(e) => handleCourseChange(idx, 'courseTitle', e.target.value)}
                              placeholder="Course Title"
                            />
                          </td>
                          <td>
                            <input
                              className={`course-input ${normalizedCourse.location !== originalNormalized?.location ? 'edited' : ''}`}
                              value={normalizedCourse.location || ''}
                              onChange={(e) => handleCourseChange(idx, 'location', e.target.value)}
                              placeholder="Room TBD"
                            />
                          </td>
                          <td>
                            <input
                              className={`course-input ${normalizedCourse.instructor !== originalNormalized?.instructor ? 'edited' : ''}`}
                              value={normalizedCourse.instructor || ''}
                              onChange={(e) => handleCourseChange(idx, 'instructor', e.target.value)}
                              placeholder="Instructor Name"
                            />
                          </td>
                          <td>
                            <input
                              type="date"
                              className={`course-input course-input-date ${normalizedCourse.startDate !== originalNormalized?.startDate ? 'edited' : ''}`}
                              value={normalizedCourse.startDate || ''}
                              onChange={(e) => handleCourseChange(idx, 'startDate', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="date"
                              className={`course-input course-input-date ${normalizedCourse.endDate !== originalNormalized?.endDate ? 'edited' : ''}`}
                              value={normalizedCourse.endDate || ''}
                              onChange={(e) => handleCourseChange(idx, 'endDate', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              className={`course-input course-input-time ${normalizedCourse.startTime !== originalNormalized?.startTime ? 'edited' : ''}`}
                              value={normalizedCourse.startTime || ''}
                              onChange={(e) => handleCourseChange(idx, 'startTime', e.target.value)}
                              placeholder="9:00 AM"
                            />
                          </td>
                          <td>
                            <input
                              className={`course-input course-input-time ${normalizedCourse.endTime !== originalNormalized?.endTime ? 'edited' : ''}`}
                              value={normalizedCourse.endTime || ''}
                              onChange={(e) => handleCourseChange(idx, 'endTime', e.target.value)}
                              placeholder="10:30 AM"
                            />
                          </td>
                          <td>
                            <DaysMultiSelect
                              selectedDays={Array.isArray(normalizedCourse.days) ? normalizedCourse.days : (normalizedCourse.days ? [normalizedCourse.days] : [])}
                              onChange={(selectedDays) => handleCourseChange(idx, 'days', selectedDays)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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
                {isCalendarConnected ? (
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
                ) : (
                  <button 
                    className="btn btn-gold btn-lg" 
                    onClick={() => {
                      const events = generateCalendarEvents(courses);
                      setCalendarEvents(events);
                      setStep(4);
                    }}
                    disabled={courses.length === 0}
                  >
                    <Icons.ArrowRight />
                    Preview Events
                  </button>
                  )}
                </div>

              {!isCalendarConnected && (
        <div className="connect-prompt">
                  <p>Want to add events directly to Google Calendar?</p>
                  <button 
                    className="btn btn-outline"
                    onClick={() => setStep(1)}
                  >
                    Connect Google Calendar
          </button>
                </div>
              )}
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
                  {addResult?.success ? 'Events Added!' : 'Events Created'}
                </h2>
                <p className="success-text">
                  {addResult?.totalCreated 
                    ? `Successfully added ${addResult.totalCreated} events to your Google Calendar`
                    : `${calendarEvents.length} calendar events are ready`
                  }
                </p>
                {addResult?.totalFailed > 0 && (
                  <p className="success-warning">
                    {addResult.totalFailed} events could not be added
                  </p>
                )}
      </div>

              <div className="divider">Your Events</div>

              <div className="events-grid">
                {calendarEvents.map((event) => (
                  <div key={event.id} className="event-card">
                    <div className="event-info">
                      <span className="event-code">{event.courseNo}</span>
                      <h3 className="event-title">{event.title}</h3>
                      <div className="event-details">
                        <span className="event-detail">
                          <Icons.User />
                          {event.instructor}
                        </span>
                        <span className="event-detail">
                          <Icons.Clock />
                          {event.day}s, {event.startTime} - {event.endTime}
                        </span>
                        <span className="event-detail">
                          <Icons.MapPin />
                          {event.location}
                        </span>
      </div>
      </div>
    </div>
                ))}
              </div>

              <div className="download-section">
                <h3 className="download-title">Need a backup?</h3>
                <p className="download-text">
                  Download an ICS file for use with other calendar apps
                </p>
                <button 
                  className="btn btn-secondary"
                  onClick={() => downloadICSFile(calendarEvents)}
                >
                  <Icons.Download />
                  Download .ICS File
                </button>
            </div>

              <div className="action-bar">
                <button className="btn btn-secondary" onClick={() => setStep(3)}>
                  <Icons.ArrowLeft />
                  Back to Review
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setCourses([]);
                    setOriginalCourses([]);
                    setCalendarEvents([]);
                    setAddResult(null);
                    setStep(2);
                  }}
                >
                  Add More Courses
                </button>
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
