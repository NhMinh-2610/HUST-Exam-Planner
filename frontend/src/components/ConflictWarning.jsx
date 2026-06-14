import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ConflictWarning = ({ conflicts }) => {
  if (!conflicts || conflicts.length === 0) {
    return null;
  }

  return (
    <div className="animate-fade-in delay-300" style={{ marginBottom: '2rem' }}>
      <div style={{
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem',
        color: '#fca5a5'
      }}>
        <h3 style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          color: 'var(--danger)',
          margin: '0 0 1rem 0',
          fontSize: '1.1rem'
        }}>
          <AlertTriangle size={20} />
          Cảnh báo: Trùng lịch thi!
        </h3>
        <ul style={{ margin: 0, paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {conflicts.map((conflict, index) => (
            <li key={index}>
              Bạn có <strong>{conflict.count}</strong> môn thi cùng ngày <strong>{conflict.date}</strong>, cùng <strong>{conflict.shift}</strong>:
              <ul style={{ marginTop: '0.25rem', color: 'var(--text-main)', paddingLeft: '1rem', listStyleType: 'circle' }}>
                {conflict.courses.map((course, i) => (
                  <li key={i}>{course.courseName} (Mã lớp: {course.classCode})</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ConflictWarning;
