import React from 'react';
import { AlertTriangle } from 'lucide-react';
import './ConflictWarning.css';

const ConflictWarning = ({ conflicts }) => {
  if (!conflicts || conflicts.length === 0) return null;

  return (
    <div className="conflict-warning animate-fade-in delay-300">
      <div className="conflict-panel">
        <h3 className="conflict-title">
          <AlertTriangle size={20} />
          Cảnh báo trùng lịch thi
        </h3>
        <ul className="conflict-list">
          {conflicts.map((conflict, index) => (
            <li key={index}>
              <strong>{conflict.count}</strong> môn thi trùng ngày <strong>{conflict.date}</strong> — <strong>{conflict.shift}</strong>:
              <ul className="conflict-courses">
                {conflict.courses.map((course, i) => (
                  <li key={i}>{course.courseName} ({course.classCode})</li>
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
