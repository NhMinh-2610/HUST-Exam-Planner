import React from 'react';
import { Calendar, Clock, MapPin, BookOpen, X } from 'lucide-react';
import './ScheduleTable.css';

const ScheduleTable = ({ schedule, onRemoveClass }) => {
  if (!schedule || schedule.length === 0) return null;

  return (
    <div className="schedule-container animate-fade-in delay-200">
      <div className="schedule-header">
        <h2 className="schedule-title">Lịch thi của bạn</h2>
        <span className="schedule-count">{schedule.length} môn</span>
      </div>

      <div className="table-responsive glass-panel">
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Ngày thi</th>
              <th>Thứ</th>
              <th>Giờ</th>
              <th>Kíp</th>
              <th>Mã lớp</th>
              <th>Môn học</th>
              <th>Phòng</th>
              <th>Mã lớp thi</th>
              <th className="th-action"></th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((item, index) => (
              <tr key={`${item.classCode}-${index}`} className={item.hasConflict ? 'row-conflict' : ''}>
                <td className="font-medium whitespace-nowrap">
                  <div className="flex-cell">
                    <Calendar size={16} className="text-primary" />
                    {item.examDate}
                  </div>
                </td>
                <td>{item.dayOfWeek}</td>
                <td className="font-medium">
                  <div className="flex-cell text-secondary">
                    <Clock size={16} />
                    {item.examTime}
                  </div>
                </td>
                <td>{item.examShift}</td>
                <td>
                  <span className="badge badge-primary">{item.classCode}</span>
                </td>
                <td>
                  <div className="flex-cell">
                    <BookOpen size={16} className="text-muted" />
                    <span className="course-name" title={item.courseName}>{item.courseName}</span>
                  </div>
                </td>
                <td>
                  <div className="flex-cell">
                    <MapPin size={16} className="text-muted" />
                    {item.room}
                  </div>
                </td>
                <td>
                  <span className="badge badge-outline">{item.examClassCode}</span>
                </td>
                <td className="td-action">
                  <button
                    className="btn-remove"
                    title={`Bỏ chọn mã lớp ${item.classCode}`}
                    onClick={() => onRemoveClass(item.classCode)}
                  >
                    <X size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScheduleTable;
