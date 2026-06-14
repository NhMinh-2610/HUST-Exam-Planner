import React, { useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/vi';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarView.css';

moment.locale('vi');
const localizer = momentLocalizer(moment);

const CalendarView = ({ schedule }) => {
  const events = useMemo(() => {
    if (!schedule || schedule.length === 0) return [];

    return schedule.map(item => {
      // Parse dates like "30.06.2026"
      const dateParts = item.examDate.split('.');
      if (dateParts.length !== 3) return null;

      // Parse time like "15h00" or "7h30"
      const timeStr = item.examTime.replace('h', ':');
      
      const startDateTimeStr = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T${timeStr.padStart(5, '0')}:00`;
      const startDate = new Date(startDateTimeStr);
      
      if (isNaN(startDate.getTime())) return null;

      // Default duration is 2 hours (120 minutes)
      const endDate = new Date(startDate.getTime() + 120 * 60000);

      return {
        id: `${item.classCode}-${item.examClassCode}`,
        title: `${item.courseName} (${item.room})`,
        start: startDate,
        end: endDate,
        resource: item
      };
    }).filter(Boolean);
  }, [schedule]);

  if (events.length === 0) return null;

  // Determine the default date to show (earliest exam)
  const defaultDate = new Date(Math.min(...events.map(e => e.start.getTime())));

  const EventComponent = ({ event }) => {
    return (
      <div style={{ padding: '2px 4px' }} title={`Phòng thi: ${event.resource.room}\nMã lớp thi: ${event.resource.examClassCode}`}>
        <div style={{ fontWeight: '600', fontSize: '0.85em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {event.resource.courseName}
        </div>
        <div style={{ fontSize: '0.75em', marginTop: '2px' }}>
          P: {event.resource.room} | Lớp: {event.resource.classCode}
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-container animate-fade-in delay-200">
      <div className="glass-panel" style={{ padding: '1.5rem', height: '700px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultDate={defaultDate}
          defaultView="month"
          views={['month', 'week', 'agenda']}
          components={{
            event: EventComponent
          }}
          messages={{
            today: 'Hôm nay',
            previous: 'Trước',
            next: 'Sau',
            month: 'Tháng',
            week: 'Tuần',
            day: 'Ngày',
            agenda: 'Lịch trình',
            date: 'Ngày',
            time: 'Thời gian',
            event: 'Sự kiện',
            noEventsInRange: 'Không có môn thi nào trong khoảng thời gian này.',
          }}
        />
      </div>
    </div>
  );
};

export default CalendarView;
