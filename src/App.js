import React, { useState, useEffect } from 'react';
import { User, CalendarDays } from 'lucide-react';
import './App.css';
import courseData from './courseData';

// Add this at the top of the file, after the imports
const API_URL = process.env.REACT_APP_API_URL;

// --- Utility Functions ---
const courseDatabase = {};

// Helper function to create dates in Pacific Time
const createDateInPT = (dateString, hours = 0, minutes = 0) => {
  // Create date in Pacific Time
  const date = new Date(dateString + 'T00:00:00');
  
  // Use the browser's timezone conversion to get Pacific Time
  // This automatically handles PST/PDT transitions
  const pacificTime = new Date(date.toLocaleString("en-US", {timeZone: "America/Los_Angeles"}));
  
  // Create a new date with the Pacific Time components
  const ptDate = new Date();
  ptDate.setFullYear(pacificTime.getFullYear());
  ptDate.setMonth(pacificTime.getMonth());
  ptDate.setDate(pacificTime.getDate());
  ptDate.setHours(hours, minutes, 0, 0);
  
  // Convert to UTC while preserving the Pacific Time
  const utcDate = new Date(ptDate.toLocaleString("en-US", {timeZone: "America/Los_Angeles"}));
  
  return utcDate;
};

// Helper function to format date for Google Calendar (in PT)
const formatGoogleDateInPT = (date) => {
  // Convert the date to Pacific Time and format for Google Calendar
  const pacificTime = new Date(date.toLocaleString("en-US", {timeZone: "America/Los_Angeles"}));
  return pacificTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

// Helper function to format date for ICS file (in PT)
const formatICSDateInPT = (date) => {
  // Convert the date to Pacific Time and format for ICS
  const pacificTime = new Date(date.toLocaleString("en-US", {timeZone: "America/Los_Angeles"}));
  return pacificTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

// Load course data from CSV (with JSON fallback)
const loadCourseDatabase = async () => {
  try {
    console.log('=== LOADING COURSE DATABASE ===');
    
    // Try to load from CSV first
    try {
      await loadCourseDatabaseFromCSV();
      console.log('Successfully loaded course data from CSV');
    } catch (csvError) {
      console.warn('Failed to load CSV, falling back to static JSON data:', csvError);
      
      // Clear existing database
      Object.keys(courseDatabase).forEach(key => delete courseDatabase[key]);
      
      // Copy all course data to the database from static JSON
      Object.assign(courseDatabase, courseData);
      
      console.log('=== COURSE DATABASE LOADED FROM JSON FALLBACK ===');
      console.log('Total courses loaded:', Object.keys(courseDatabase).length);
    }
    
    // Verify database integrity
    const testCourse = 'MBA210B.1';
    const testResult = getCourseInfo(testCourse);
    console.log('Database verification:', {
      course: testCourse,
      result: testResult,
      found: !!courseDatabase[testCourse]
    });
    
  } catch (error) {
    console.error('DATABASE LOAD ERROR:', error);
    throw error; // Re-throw to handle in the component
  }
};

const getCourseInfo = (courseNo) => {
  if (!courseNo) {
    console.log('No course number provided, using defaults');
    return { 
      location: 'Room TBD', 
      startDate: '2025-08-28', 
      endDate: '2025-12-05' 
    };
  }

  // Clean up the course number (remove any extra spaces)
  const cleanCourseNo = courseNo.trim();
  console.log('Looking up course info for:', cleanCourseNo);
  
  // First try exact match
  if (courseDatabase[cleanCourseNo]) {
    const course = courseDatabase[cleanCourseNo];
    console.log('Found exact match:', course);
    return {
      location: course.location || 'Room TBD',
      startDate: course.startDate || '2025-08-28',
      endDate: course.endDate || '2025-12-05'
    };
  }

  // Try matching without section number (e.g., MBA212A.1 -> MBA212A)
  const baseCourseNo = cleanCourseNo.split('.')[0];
  if (courseDatabase[baseCourseNo]) {
    const course = courseDatabase[baseCourseNo];
    console.log('Found match without section:', course);
    return {
      location: course.location || 'Room TBD',
      startDate: course.startDate || '2025-08-28',
      endDate: course.endDate || '2025-12-05'
    };
  }

  // Try matching just the prefix (e.g., MBA212A.1 -> MBA212)
  const coursePrefix = cleanCourseNo.match(/^MBA\d{3}[A-Z]?/)?.[0];
  if (coursePrefix) {
    const matchingCourses = Object.keys(courseDatabase)
      .filter(key => key.startsWith(coursePrefix));
    
    if (matchingCourses.length > 0) {
      const course = courseDatabase[matchingCourses[0]];
      console.log('Found match by prefix:', course);
      return {
        location: course.location || 'Room TBD',
        startDate: course.startDate || '2025-08-28',
        endDate: course.endDate || '2025-12-05'
      };
    }
  }

  console.log('No course info found for', cleanCourseNo, 'using defaults');
  return { 
    location: 'Room TBD', 
    startDate: '2025-08-28', 
    endDate: '2025-12-05' 
  };
};

// Parse day abbreviations into full day names, or handle array of full names
const parseDays = (dayCodeOrArray) => {
  if (Array.isArray(dayCodeOrArray)) {
    // Assume it's already an array of full day names from backend
    return dayCodeOrArray;
  }

  // Handle string abbreviations (for manual edits or older OCR)
  if (typeof dayCodeOrArray !== 'string') return [];

  const dayMap = {
    'M': ['Monday'], 'T': ['Tuesday'], 'W': ['Wednesday'], 'Th': ['Thursday'], 'F': ['Friday'],
    'Sa': ['Saturday'], 'Su': ['Sunday'], 'TTh': ['Tuesday', 'Thursday'], 'MW': ['Monday', 'Wednesday'], 'MWF': ['Monday', 'Wednesday', 'Friday']
  };

  if (dayMap[dayCodeOrArray]) return dayMap[dayCodeOrArray];

  const days = [];
  let i = 0;
  while (i < dayCodeOrArray.length) {
    if (i + 1 < dayCodeOrArray.length && dayCodeOrArray.substring(i, i + 2) === 'Th') { days.push('Thursday'); i += 2; }
    else {
      const char = dayCodeOrArray[i];
      if (char === 'M') days.push('Monday');
      else if (char === 'T') days.push('Tuesday');
      else if (char === 'W') days.push('Wednesday');
      else if (char === 'F') days.push('Friday');
      else if (char === 'S' && i + 1 < dayCodeOrArray.length && dayCodeOrArray[i+1] === 'a') { days.push('Saturday'); i++; }
      else if (char === 'S' && i + 1 < dayCodeOrArray.length && dayCodeOrArray[i+1] === 'u') { days.push('Sunday'); i++; }
      i++;
    }
  }
  return days;
};

const parseTimeRange = (timeRange) => {
  if (!timeRange) return { startTime: '09:00 AM', endTime: '10:00 AM' };
  const times = timeRange.split(' - ').map(time => time.trim());
  return { startTime: times[0] || '09:00 AM', endTime: times[1] || '10:00 AM' };
};

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

const processOCRText = (text) => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  const parsedCourses = [];
  const headerKeywords = [
    'Course No', 'Course Title', 'Instructor', 'Days', 'Times', 'Fall', 'Spring', 'Summer', 'Winter', '20', 'Schedule', 'Section'
  ];
  const rowRegex = /^(MBA\d{3}[A-Z]?\.\d{1,2}[A-Z]?)\s+(.+?)\s{2,}([\w.,\s]+)\s{1,}(M|T|W|Th|F|Sa|Su|TTh|MW|MWF)\s{1,}((?:\d{1,2}:\d{2}\s*(?:AM|PM)\s*-\s*\d{1,2}:\d{2}\s*(?:AM|PM)))/i;
  lines.forEach(line => {
    if (headerKeywords.some(keyword => line.includes(keyword))) return;
    const match = line.match(rowRegex);
    if (match) {
      parsedCourses.push({
        courseNo: match[1], courseTitle: match[2].trim(), instructor: match[3].trim(), days: match[4].trim(), times: match[5].trim()
      });
    } else {
      const chunks = line.split(/\s{2,}|\t+/).map(c => c.trim()).filter(Boolean);
      if (chunks.length >= 5) {
        parsedCourses.push({
          courseNo: chunks[0], courseTitle: chunks[1], instructor: chunks[2], days: chunks[3], times: chunks[4]
        });
      }
    }
  });
  return parsedCourses;
};

// Parse CSV data and convert to JSON format
const parseCSVToJSON = (csvText) => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  const courses = {};
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    // Parse CSV line, handling quoted fields
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim()); // Add the last value
    
    if (values.length >= headers.length) {
      const courseNo = values[0];
      const course = {
        title: values[1],
        units: values[2],
        instructor: values[3],
        startDate: values[4],
        endDate: values[5],
        days: values[6],
        time: values[7],
        notes: values[8] || '',
        location: values[9],
        capacity: values[10],
        filled: values[11],
        available: values[12]
      };
      
      courses[courseNo] = course;
    }
  }
  
  return courses;
};

// Load course data from CSV
const loadCourseDatabaseFromCSV = async () => {
  try {
    console.log('=== LOADING COURSE DATABASE FROM CSV ===');
    
    const response = await fetch('/data/courses.csv');
    if (!response.ok) {
      throw new Error(`Failed to load CSV: ${response.status}`);
    }
    
    const csvText = await response.text();
    const csvCourses = parseCSVToJSON(csvText);
    
    // Clear existing database
    Object.keys(courseDatabase).forEach(key => delete courseDatabase[key]);
    
    // Load CSV data into database
    Object.assign(courseDatabase, csvCourses);
    
    console.log('=== COURSE DATABASE LOADED FROM CSV ===');
    console.log('Total courses loaded:', Object.keys(courseDatabase).length);
    
    // Verify database integrity
    const testCourse = 'MBA210B.1';
    const testResult = getCourseInfo(testCourse);
    console.log('Database verification:', {
      course: testCourse,
      result: testResult,
      found: !!courseDatabase[testCourse]
    });
    
    return csvCourses;
  } catch (error) {
    console.error('CSV LOAD ERROR:', error);
    // Fallback to static JSON data
    console.log('Falling back to static course data...');
    Object.assign(courseDatabase, courseData);
    throw error;
  }
};

// Convert military time string (HH:MM-HH:MM) to 12-hour format (HH:MM AM/PM - HH:MM AM/PM)
const convertMilitaryTo12Hour = (militaryTime) => {
  if (!militaryTime || typeof militaryTime !== 'string') return '09:00 AM - 10:00 AM'; // Default
  const [startMil, endMil] = militaryTime.split('-');

  const formatTime = (mil) => {
    const [hoursStr, minutes] = mil.split(':');
    let hours = parseInt(hoursStr, 10);
    if (isNaN(hours) || isNaN(parseInt(minutes, 10))) return null;

    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const paddedMinutes = minutes.padStart(2, '0');
    return `${hours}:${paddedMinutes} ${period}`;
  };

  const startTime = formatTime(startMil);
  const endTime = formatTime(endMil);

  if (!startTime || !endTime) return '09:00 AM - 10:00 AM'; // Default if parsing fails

  return `${startTime} - ${endTime}`;
};

// --- Validation helpers ---
const validateCourseCode = code => /^MBA\d{3}[A-Z]?\.\d{1,2}[A-Z]?$/.test(code);
const validateTime = time => /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM) - (0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/.test(time);
const validDayCodes = ['M','T','W','Th','F','Sa','Su','TTh','MW','MWF'];
const validDayCodeOrNames = ['M','T','W','Th','F','Sa','Su','TTh','MW','MWF', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const validateDays = (days) => {
  if (Array.isArray(days)) {
    // Check if array contains valid full day names
    const validFullNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days.every(day => typeof day === 'string' && validFullNames.includes(day));
  }
  // Fallback for string abbreviations
  return typeof days === 'string' && validDayCodes.includes(days.trim());
};

// --- Editable Table Component ---
function EditableCourseTable({ courses, onChange, validation, originalCourses }) {
  const handleFieldChange = (idx, field, value) => {
    const updated = courses.map((c, i) => i === idx ? { ...c, [field]: value } : c);
    onChange(updated);
  };

  return (
    <div className="course-list">
      <h2>Review & Edit Extracted Courses</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <thead>
          <tr>
            <th>Course No</th>
            <th>Title</th>
            <th>Instructor</th>
            <th>Days</th>
            <th>Times</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course, idx) => (
            <tr key={idx}>
              <td>
                <input
                  value={course.courseNo}
                  onChange={e => handleFieldChange(idx, 'courseNo', e.target.value)}
                  className={
                    (course.courseNo !== originalCourses[idx]?.courseNo ? 'edited-field ' : '') +
                    (!validateCourseCode(course.courseNo) ? 'invalid-field' : '')
                  }
                />
              </td>
              <td>
                <input
                  value={course.courseTitle}
                  onChange={e => handleFieldChange(idx, 'courseTitle', e.target.value)}
                  className={course.courseTitle !== originalCourses[idx]?.courseTitle ? 'edited-field' : ''}
                />
              </td>
              <td>
                <input
                  value={course.instructor}
                  onChange={e => handleFieldChange(idx, 'instructor', e.target.value)}
                  className={course.instructor !== originalCourses[idx]?.instructor ? 'edited-field' : ''}
                />
              </td>
              <td>
                <input
                  value={Array.isArray(course.days) ? course.days.join(', ') : course.days}
                  onChange={e => handleFieldChange(idx, 'days', e.target.value.split(',').map(d => d.trim()))}
                  className={
                    (Array.isArray(course.days) && Array.isArray(originalCourses[idx]?.days) && JSON.stringify(course.days) !== JSON.stringify(originalCourses[idx]?.days) ? 'edited-field ' : '') +
                    (!validateDays(course.days) ? 'invalid-field' : '')
                  }
                />
              </td>
              <td>
                <input
                  value={course.times}
                  onChange={e => handleFieldChange(idx, 'times', e.target.value)}
                  className={
                    (course.times !== originalCourses[idx]?.times ? 'edited-field ' : '') +
                    (!validateTime(course.times) ? 'invalid-field' : '')
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: '1rem', color: '#e53e3e' }}>{validation.error}</div>
    </div>
  );
}

// --- UI Components ---
const EventPreview = ({ events, generateGoogleCalendarURL }) => {
  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="calendar-preview">
      <h2>Preview of Events</h2>
      {events.length === 0 && <div>No events generated. Please check your course data.</div>}
      {events.map((event, index) => (
        <div key={index} className="course-item">
          <div className="course-info">
            <h3 className="course-title">{event.courseNo} - {event.title}</h3>
            <p className="course-details">
              <User size={16} /> {event.instructor}<br />
              <CalendarDays size={16} /> {event.day}s, {event.start.toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', minute: '2-digit', hour12: true })} - {event.end.toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', minute: '2-digit', hour12: true })} PT<br />
              📍 {event.location}<br />
              <span className="text-sm text-gray-500">
                Course runs from {formatDate(event.startDate)} to {formatDate(event.endDate)}
              </span>
            </p>
          </div>
          <div className="calendar-actions">
            <a
              href={generateGoogleCalendarURL(event)}
              target="_blank"
              rel="noopener noreferrer"
              className="button button-secondary"
            >
              Add to Google Calendar
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Main App ---
export default function ScheduleConverter() {
  const [step, setStep] = useState(1);
  const [courses, setCourses] = useState([]);
  const [originalCourses, setOriginalCourses] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [validation, setValidation] = useState({ error: '' });

  // Load course database on component mount
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        console.log('=== INITIALIZING APPLICATION ===');
        await loadCourseDatabase();
        console.log('=== APPLICATION INITIALIZED ===');
      } catch (error) {
        console.error('Failed to initialize application:', error);
        setError('Failed to load course database. Please refresh the page.');
      }
    };

    initializeDatabase();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setError('');
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await fetch(`${API_URL}/api/extract-table`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.courses && data.courses.length > 0) {
        // Transform the received data format (only time transformation needed now)
        const transformedCourses = data.courses.map(course => ({
          ...course,
          // Keep days as array of full names
          times: convertMilitaryTo12Hour(course.times)
        }));
        setCourses(transformedCourses);
        setOriginalCourses(transformedCourses);
        setStep(2);
      } else {
        setError('No courses found in the image. Please make sure the image is clear and contains course information.');
      }
    } catch (err) {
      setError('Failed to extract table.');
      console.error('Frontend fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Validate all courses before generating events
  const validateAllCourses = (courses) => {
    for (const c of courses) {
      if (!validateCourseCode(c.courseNo)) return 'Invalid course code.';
      if (!validateDays(c.days)) return 'Invalid days format or value.'; // Updated error message
      if (!validateTime(c.times)) return 'Invalid time format. Use e.g. 09:00 AM - 10:30 AM';
    }
    return '';
  };

  const handleGenerateCalendar = () => {
    console.log('=== STARTING CALENDAR GENERATION ===');
    console.log('Initial courses:', courses);
    
    // Validate courses
    const err = validateAllCourses(courses);
    if (err) {
      console.error('Validation error:', err);
      setValidation({ error: err });
      return;
    }
    setValidation({ error: '' });

    try {
      // Look up course information
      console.log('Looking up course information...');
      const coursesWithInfo = courses.map(course => {
        console.log('Looking up info for course:', course.courseNo);
        const courseInfo = getCourseInfo(course.courseNo);
        console.log('Found info:', courseInfo);
        
        return {
          ...course,
          location: courseInfo.location,
          startDate: courseInfo.startDate,
          endDate: courseInfo.endDate
        };
      });

      // Generate calendar events
      const events = [];
      const skippedCourses = [];
      
      coursesWithInfo.forEach(course => {
        console.log('Processing course:', course.courseNo);
        
        // Validate required fields
        if (!course.days || !course.times) {
          console.log('Skipping course due to missing days or times:', course.courseNo);
          skippedCourses.push(course);
          return;
        }
        
        // Parse days and validate
        const days = parseDays(course.days);
        if (!days.length) {
          console.log('Skipping course due to invalid days:', course.courseNo, course.days);
          skippedCourses.push(course);
          return;
        }
        
        // Parse time information
        const { startTime, endTime } = parseTimeRange(course.times);
        const start = parseTime(startTime);
        const end = parseTime(endTime);
        
        // Generate events for each day
        days.forEach(day => {
          try {
            const dayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(day);
            const termStart = new Date(course.startDate);
            const daysToAdd = (dayIndex - termStart.getDay() + 7) % 7;
            
            const firstOccurrence = new Date(termStart);
            firstOccurrence.setDate(termStart.getDate() + daysToAdd);
            
            // Create dates in Pacific Time
            const startDateTime = createDateInPT(
              firstOccurrence.toISOString().split('T')[0], 
              start.hours, 
              start.minutes
            );
            const endDateTime = createDateInPT(
              firstOccurrence.toISOString().split('T')[0], 
              end.hours, 
              end.minutes
            );
            
            const event = {
              id: `${course.courseNo}-${day}`,
              title: course.courseTitle,
              courseNo: course.courseNo,
              instructor: course.instructor,
              location: course.location,
              start: startDateTime,
              end: endDateTime,
              recurrence: { frequency: 'WEEKLY', until: createDateInPT(course.endDate) },
              day,
              startDate: course.startDate,
              endDate: course.endDate
            };
            
            console.log('Generated event:', {
              courseNo: course.courseNo,
              day,
              start: startDateTime.toLocaleString(),
              end: endDateTime.toLocaleString(),
              location: course.location,
              startDate: course.startDate,
              endDate: course.endDate
            });
            
            events.push(event);
          } catch (error) {
            console.error('Error generating event for course:', course.courseNo, 'day:', day, error);
            skippedCourses.push(course);
          }
        });
      });
      
      console.log('=== CALENDAR GENERATION COMPLETE ===');
      console.log('Total events generated:', events.length);
      console.log('Skipped courses:', skippedCourses.length);
      
      setCalendarEvents(events);
      setError(skippedCourses.length > 0 
        ? `${skippedCourses.length} course(s) were skipped due to missing or invalid data.` 
        : '');
      setStep(3);
      
    } catch (error) {
      console.error('Calendar generation error:', error);
      setError('Failed to generate calendar events. Please try again.');
    }
  };

  const generateGoogleCalendarURL = (event) => {
    const baseURL = 'https://calendar.google.com/calendar/render';
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `${event.courseNo} - ${event.title}`,
      details: `Instructor: ${event.instructor}\nCourse: ${event.courseNo}\nDates: ${event.startDate} to ${event.endDate}`,
      location: event.location,
      dates: `${formatGoogleDateInPT(event.start)}/${formatGoogleDateInPT(event.end)}`,
      recur: `RRULE:FREQ=WEEKLY;UNTIL=${formatGoogleDateInPT(event.recurrence.until)}`
    });
    return `${baseURL}?${params.toString()}`;
  };

  const downloadICSFile = () => {
    let icsContent = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//MBA Course Schedule Converter//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'
    ];
    calendarEvents.forEach(event => {
      const getDayAbbreviation = (day) => {
        const dayMap = { 'Sunday': 'SU', 'Monday': 'MO', 'Tuesday': 'TU', 'Wednesday': 'WE', 'Thursday': 'TH', 'Friday': 'FR', 'Saturday': 'SA' };
        return dayMap[day] || day.substring(0, 2).toUpperCase();
      };
      icsContent = icsContent.concat([
        'BEGIN:VEVENT',
        `UID:${event.id}@mbaschedule.com`,
        `SUMMARY:${event.courseNo} - ${event.title}`,
        `DESCRIPTION:Instructor: ${event.instructor}\\nCourse: ${event.courseNo}\\nDates: ${event.startDate} to ${event.endDate}`,
        `LOCATION:${event.location}`,
        `DTSTART:${formatICSDateInPT(event.start)}`,
        `DTEND:${formatICSDateInPT(event.end)}`,
        `RRULE:FREQ=WEEKLY;UNTIL=${formatICSDateInPT(event.recurrence.until)};BYDAY=${getDayAbbreviation(event.day)}`,
        'SEQUENCE:0', 'STATUS:CONFIRMED', 'TRANSP:OPAQUE', 'END:VEVENT'
      ]);
    });
    icsContent.push('END:VCALENDAR');
    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'MBA_Course_Schedule.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Step Renderers ---
  const renderStep1 = () => (
    <div className="step-container">
      <div className="header">
        <h1>Berkeley Haas Schedule Converter</h1>
        <a
          href="https://olr.haas.berkeley.edu/Student/MySchedule"
          target="_blank"
          rel="noopener noreferrer"
          className="olr-link"
        >
          Take a screenshot of your schedule from OLR and upload here
        </a>
      </div>

      <p className="example-label">Example screenshot:</p>
      <img src="/images/schedule_example.png" alt="Example of a course schedule screenshot from OLR" className="example-schedule-img" aria-label="Example course schedule screenshot to upload" />

      <div className="upload-section" onClick={() => document.getElementById('fileInput').click()}>
        <span className="upload-icon">📤</span>
        <h2>Upload Your Schedule</h2>
        <p>Click to upload or drag and drop your schedule image</p>
        <input id="fileInput" type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
      </div>
      {loading && (
        <div className="loading">
          <div className="loading-spinner" />
          <p className="loading-text">Processing image... {Math.round(progress)}%</p>
        </div>
      )}
      {error && <div className="error-message">{error}</div>}
    </div>
  );

  const renderStep2 = () => (
    <div className="step-container">
      <div className="header">
        <h1>Review & Edit Your Courses</h1>
        <p>Edit any field below. Fields you change are highlighted. Invalid fields are marked in red.</p>
      </div>
      <EditableCourseTable
        courses={courses}
        onChange={setCourses}
        validation={validation}
        originalCourses={originalCourses}
      />
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
        <button className="button button-secondary" onClick={() => setStep(1)}>Back</button>
        <button className="button" onClick={handleGenerateCalendar}>Generate Calendar</button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="step-container">
      <div className="header">
        <h1>Calendar Generated!</h1>
        <p>Your calendar events are ready to be added to your calendar</p>
        <p className="timezone-notice">🕐 All times are in Pacific Time (PT)</p>
      </div>
      <EventPreview events={calendarEvents} generateGoogleCalendarURL={generateGoogleCalendarURL} />
      <div className="download-all-section">
        <h2>Download All Events</h2>
        <p>Download a single ICS file containing all your course events</p>
        <button className="button" onClick={downloadICSFile}>Download All Events (ICS)</button>
      </div>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
        <button className="button button-secondary" onClick={() => setStep(2)}>Back</button>
      </div>
    </div>
  );

  // --- Main Render ---
  return (
    <div className="App">
      <div className="step-indicator">
        <div className="step-indicator-container">
          {[
            { number: 1, label: 'Upload', active: step >= 1 },
            { number: 2, label: 'Verify', active: step >= 2 },
            { number: 3, label: 'Create Calendar', active: step >= 3 }
          ].map((stepInfo, index) => (
            <div
              key={index}
              className={`step-item ${stepInfo.active ? 'clickable' : ''}`}
              onClick={() => { if (stepInfo.active) setStep(index + 1); }}
            >
              <div className={`step-number ${stepInfo.active ? 'active' : ''}`}>{stepInfo.number}</div>
              <div className={`step-label ${stepInfo.active ? 'active' : ''}`}>{stepInfo.label}</div>
            </div>
          ))}
        </div>
        <div className="step-progress-bar">
          <div className="step-progress" style={{ width: `${((step - 1) / 2) * 100}%` }} />
        </div>
      </div>
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
}