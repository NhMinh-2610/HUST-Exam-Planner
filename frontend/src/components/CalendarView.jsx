import React, { useMemo, useState, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/vi';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import './CalendarView.css';

moment.locale('vi');
const localizer = momentLocalizer(moment);

const EXAM_DURATION_MS = 120 * 60 * 1000;

const CALENDAR_MESSAGES = {
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
  showMore: (count) => `+ ${count} môn khác`,
};

const SHIFT_COLORS = {
  'Kíp 1': '#3b82f6',
  'Kíp 2': '#8b5cf6',
  'Kíp 3': '#ec4899',
  'Kíp 4': '#f59e0b',
  'Kíp 5': '#10b981',
};

function parseExamDateTime(examDate, examTime) {
  if (!examDate || !examTime || examTime === '-' || examDate === '-') return null;
  const [day, month, year] = String(examDate).split('.');
  if (!day || !month || !year) return null;
  const time = String(examTime).replace('h', ':');
  const start = new Date(`${year}-${month}-${day}T${time.padStart(5, '0')}:00`);
  return isNaN(start.getTime()) ? null : start;
}

const CustomToolbar = (toolbar) => {
  const goToBack = () => {
    toolbar.onNavigate('PREV');
  };

  const goToNext = () => {
    toolbar.onNavigate('NEXT');
  };

  const goToCurrent = () => {
    toolbar.onNavigate('TODAY');
  };

  const label = () => {
    const date = moment(toolbar.date);
    if (toolbar.view === 'month') {
      return date.format('MMMM YYYY').replace(/^\w/, (c) => c.toUpperCase());
    }
    if (toolbar.view === 'week') {
      const start = moment(date).startOf('week');
      const end = moment(date).endOf('week');
      return `${start.format('DD/MM')} - ${end.format('DD/MM/YYYY')}`;
    }
    return date.format('DD/MM/YYYY');
  };

  return (
    <div className="cal-toolbar custom-toolbar">
      <div className="cal-toolbar-group">
        <button className="btn btn-secondary btn-sm" onClick={goToCurrent}>
          Hôm nay
        </button>
        <button className="btn btn-secondary btn-sm btn-icon" onClick={goToBack} title="Trước">
          <ChevronLeft size={16} />
        </button>
        <button className="btn btn-secondary btn-sm btn-icon" onClick={goToNext} title="Sau">
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="cal-toolbar-label">
        <CalendarIcon size={18} className="text-primary" />
        <span>{label()}</span>
      </div>

      <div className="cal-toolbar-group">
        {['month', 'week', 'agenda'].map((viewName) => (
          <button
            key={viewName}
            className={`btn btn-sm ${toolbar.view === viewName ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => toolbar.onView(viewName)}
          >
            {CALENDAR_MESSAGES[viewName]}
          </button>
        ))}
      </div>
    </div>
  );
};

const EventComponent = ({ event }) => (
  <div className="cal-event-content" title={`${event.resource.courseName}\n${event.resource.examTime} — ${event.resource.room}\nMã lớp: ${event.resource.classCode}\nMã lớp thi: ${event.resource.examClassCode}`}>
    <span className="cal-event-title">{event.resource.courseName}</span>
    <span className="cal-event-detail">{event.resource.room} · {event.resource.examTime}</span>
  </div>
);

const CalendarView = ({ schedule }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [view, setView] = useState('week');
  const [date, setDate] = useState(new Date());

  const events = useMemo(() => {
    if (!schedule?.length) return [];

    return schedule.reduce((acc, item) => {
      const start = parseExamDateTime(item.examDate, item.examTime);
      if (!start) return acc;

      acc.push({
        id: `${item.classCode}-${item.examClassCode}`,
        title: item.courseName,
        start,
        end: new Date(start.getTime() + EXAM_DURATION_MS),
        resource: item,
      });
      return acc;
    }, []);
  }, [schedule]);

  const missingTimeCount = schedule?.length ? schedule.length - events.length : 0;

  // Set the default date to the earliest exam date only once when events are loaded
  React.useEffect(() => {
    if (events.length > 0) {
      const earliest = new Date(Math.min(...events.map(e => e.start.getTime())));
      setDate(earliest);
    }
  }, [events]);

  const eventStyleGetter = useCallback((event) => {
    const bg = SHIFT_COLORS[event.resource.examShift] || '#8b5cf6';
    return {
      style: {
        backgroundColor: bg,
        border: 'none',
        borderRadius: '6px',
        padding: '2px 6px',
        fontSize: '0.8em',
        boxShadow: `0 2px 8px ${bg}40`,
      },
    };
  }, []);

  const handleSelectEvent = useCallback((event) => {
    setSelectedEvent(prev => prev?.id === event.id ? null : event);
  }, []);

  return (
    <div className="calendar-container animate-fade-in delay-200">
      {missingTimeCount > 0 && (
        <div className="status-bar" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', marginBottom: '1rem', color: 'var(--warning)', justifyContent: 'center', textAlign: 'center' }}>
          <span>
            ⚠️ Có <strong>{missingTimeCount}</strong> môn học chưa có thời gian thi cụ thể (bị ẩn trên Lịch). Vui lòng xem ở tab <strong>Danh sách</strong>.
          </span>
        </div>
      )}

      {selectedEvent && (
        <div className="cal-detail-card glass-panel">
          <div className="cal-detail-header">
            <h3>{selectedEvent.resource.courseName}</h3>
            <button className="cal-detail-close" onClick={() => setSelectedEvent(null)}>✕</button>
          </div>
          <div className="cal-detail-body">
            <div className="cal-detail-row">
              <span className="cal-detail-label">Ngày thi</span>
              <span>{selectedEvent.resource.examDate} ({selectedEvent.resource.dayOfWeek})</span>
            </div>
            <div className="cal-detail-row">
              <span className="cal-detail-label">Giờ thi</span>
              <span>{selectedEvent.resource.examTime} — {selectedEvent.resource.examShift}</span>
            </div>
            <div className="cal-detail-row">
              <span className="cal-detail-label">Phòng thi</span>
              <span>{selectedEvent.resource.room}</span>
            </div>
            <div className="cal-detail-row">
              <span className="cal-detail-label">Mã lớp</span>
              <span className="badge badge-primary">{selectedEvent.resource.classCode}</span>
            </div>
            <div className="cal-detail-row">
              <span className="cal-detail-label">Mã lớp thi</span>
              <span>{selectedEvent.resource.examClassCode}</span>
            </div>
          </div>
        </div>
      )}

      <div className="cal-legend">
        {Object.entries(SHIFT_COLORS).map(([shift, color]) => (
          <div key={shift} className="cal-legend-item">
            <span className="cal-legend-dot" style={{ backgroundColor: color }} />
            <span>{shift}</span>
          </div>
        ))}
      </div>

      <div className="glass-panel cal-wrapper">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          date={date}
          onView={setView}
          onNavigate={setDate}
          views={['month', 'week', 'agenda']}
          components={{ 
            event: EventComponent,
            toolbar: CustomToolbar
          }}
          messages={CALENDAR_MESSAGES}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
          min={new Date(2026, 0, 1, 6, 0)}
          max={new Date(2026, 0, 1, 20, 0)}
          step={30}
          timeslots={2}
          popup
        />
      </div>
    </div>
  );
};

export default CalendarView;
