import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { RefreshCw, FilePlus, Calendar as CalendarIcon, List as ListIcon, Download, Printer, BookOpen } from 'lucide-react';
import UploadBox from './components/UploadBox';
import ClassSelector from './components/ClassSelector';
import ScheduleTable from './components/ScheduleTable';
import ConflictWarning from './components/ConflictWarning';
import ClassConflictResolver from './components/ClassConflictResolver';
import CalendarView from './components/CalendarView';
import ProgressBar from './components/ProgressBar';
import { uploadPdf, getDefaultPdf } from './services/api';
import './index.css';

function exportCSV(schedule) {
  const BOM = '\uFEFF';
  const headers = ['Ngày thi', 'Thứ', 'Giờ', 'Kíp', 'Mã lớp', 'Môn học', 'Phòng', 'Mã lớp thi'];
  const rows = schedule.map(item => [
    item.examDate,
    item.dayOfWeek,
    item.examTime,
    item.examShift,
    item.classCode,
    `"${item.courseName}"`,
    item.room,
    item.examClassCode,
  ].join(','));

  const csv = BOM + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'lich-thi-ca-nhan.csv';
  link.click();
  URL.revokeObjectURL(url);
}

function printSchedule() {
  window.print();
}

function App() {
  const [fileData, setFileData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCodes, setSelectedCodes] = useState([]);
  const [resolvedConflicts, setResolvedConflicts] = useState({});
  const [viewMode, setViewMode] = useState('table');
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const loadDefault = async () => {
      try {
        const result = await getDefaultPdf();
        setFileData(result);
      } catch (err) {
        // Ignored. Default file might not exist.
      } finally {
        setIsInitializing(false);
      }
    };
    loadDefault();
  }, []);

  const handleUpload = async (files) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await uploadPdf(files);

      if (fileData) {
        const mergedData = [...fileData.data, ...result.data];
        const uniqueClassCodes = [...new Set(mergedData.map(item => item.classCode))].sort();
        setFileData({
          ...fileData,
          totalRows: mergedData.length,
          classCodes: uniqueClassCodes,
          data: mergedData,
        });
      } else {
        setFileData(result);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Đã có lỗi xảy ra khi đọc file PDF. Vui lòng kiểm tra lại định dạng file.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFileData(null);
    setSelectedCodes([]);
    setResolvedConflicts({});
    setError(null);
  };

  const handleRemoveClass = useCallback((classCode) => {
    setSelectedCodes(prev => prev.filter(c => c !== classCode));
    setResolvedConflicts(prev => {
      const next = { ...prev };
      delete next[classCode];
      return next;
    });
  }, []);

  const ambiguousClasses = useMemo(() => {
    if (!fileData || selectedCodes.length === 0) return [];

    return selectedCodes.reduce((result, code) => {
      const items = fileData.data.filter(item => item.classCode === code);
      const uniqueExamCodes = [...new Set(items.map(i => i.examClassCode))].filter(Boolean);

      if (uniqueExamCodes.length > 1) {
        result.push({
          classCode: code,
          courseName: items[0]?.courseName,
          options: uniqueExamCodes,
        });
      }
      return result;
    }, []);
  }, [fileData, selectedCodes]);

  const { schedule, conflicts } = useMemo(() => {
    if (!fileData || selectedCodes.length === 0) {
      return { schedule: [], conflicts: [] };
    }

    const parseViDate = (d) => {
      if (!d) return 0;
      const [day, month, year] = d.split('.');
      return year && month && day ? new Date(`${year}-${month}-${day}`).getTime() : 0;
    };

    let filtered = fileData.data
      .filter(item => selectedCodes.includes(item.classCode))
      .filter(item => {
        const isAmbiguous = ambiguousClasses.some(ac => ac.classCode === item.classCode);
        if (!isAmbiguous) return true;
        const chosen = resolvedConflicts[item.classCode];
        return chosen ? item.examClassCode === chosen : false;
      });

    filtered.sort((a, b) => {
      const dateDiff = parseViDate(a.examDate) - parseViDate(b.examDate);
      if (dateDiff !== 0) return dateDiff;
      return (a.examShift || "").localeCompare(b.examShift || "");
    });

    const shiftGroups = {};
    filtered.forEach(item => {
      if (!item.examDate || !item.examShift) return;
      const key = `${item.examDate}|${item.examShift}`;
      (shiftGroups[key] ??= []).push(item);
    });

    const detectedConflicts = Object.values(shiftGroups)
      .filter(group => group.length > 1)
      .map(group => {
        group.forEach(item => { item.hasConflict = true; });
        return {
          date: group[0].examDate,
          shift: group[0].examShift,
          count: group.length,
          courses: group,
        };
      });

    return { schedule: filtered, conflicts: detectedConflicts };
  }, [fileData, selectedCodes, ambiguousClasses, resolvedConflicts]);

  const handleResolveConflict = (classCode, examClassCode) => {
    setResolvedConflicts(prev => ({ ...prev, [classCode]: examClassCode }));
  };

  return (
    <div className="container">
      <header className="app-header animate-fade-in">
        <h1>HUST Exam Planner</h1>
        <p className="subtitle">Tạo lịch thi cá nhân từ file PDF lịch thi tổng hợp</p>
      </header>

      <main>
        {isInitializing ? (
          <div className="glass-panel animate-fade-in" style={{ padding: '3rem', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1.25rem' }}>Đang khởi tạo hệ thống...</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Đang nạp file lịch thi mặc định để bạn có thể tra cứu ngay lập tức.</p>
            <ProgressBar />
          </div>
        ) : !fileData ? (
          <UploadBox onUpload={handleUpload} isLoading={isLoading} error={error} />
        ) : (
          <div className="animate-fade-in">
            <div className="status-bar">
              <p className="status-success">
                ✓ Đã tải {fileData.totalRows} dữ liệu lớp thi
              </p>
              <div className="status-actions">
                <label className="btn btn-secondary">
                  <input
                    type="file"
                    multiple
                    accept=".pdf"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files?.length > 0) {
                        handleUpload(Array.from(e.target.files));
                      }
                    }}
                  />
                  {isLoading ? <RefreshCw className="spin" size={16} /> : <FilePlus size={16} />}
                  Tải thêm file
                </label>
                <button className="btn btn-danger-outline" onClick={handleReset}>
                  <RefreshCw size={16} /> Bắt đầu lại
                </button>
              </div>
            </div>

            {error && (
              <div className="error-message" style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                {error}
              </div>
            )}

            <ClassSelector
              classCodes={fileData.classCodes}
              selectedCodes={selectedCodes}
              onChange={setSelectedCodes}
            />

            {ambiguousClasses.length > 0 && (
              <ClassConflictResolver
                ambiguousClasses={ambiguousClasses}
                resolvedConflicts={resolvedConflicts}
                onResolve={handleResolveConflict}
              />
            )}

            {selectedCodes.length === 0 ? (
              <div className="empty-state glass-panel animate-fade-in delay-100" style={{ padding: '4rem 2rem', textAlign: 'center', marginTop: '2rem' }}>
                <BookOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', opacity: 0.5 }} />
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--text-main)' }}>Chưa có mã lớp nào được chọn</h3>
                <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto', lineHeight: 1.6 }}>
                  Hãy tìm kiếm và chọn các mã lớp của bạn ở ô tìm kiếm phía trên. Lịch thi cá nhân sẽ tự động được tạo và hiển thị tại đây.
                </p>
              </div>
            ) : (
              <div className="animate-fade-in delay-100">
                <ConflictWarning conflicts={conflicts} />

                <div className="view-toggle">
                  <div className="view-toggle-left">
                    <button
                      className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setViewMode('table')}
                    >
                      <ListIcon size={18} /> Dạng Bảng
                    </button>
                    <button
                      className={`btn ${viewMode === 'calendar' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setViewMode('calendar')}
                    >
                      <CalendarIcon size={18} /> Dạng Lịch
                    </button>
                  </div>

                  {schedule.length > 0 && (
                    <div className="export-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => exportCSV(schedule)}>
                        <Download size={16} /> Xuất CSV
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={printSchedule}>
                        <Printer size={16} /> In lịch
                      </button>
                    </div>
                  )}
                </div>

                {viewMode === 'table' ? (
                  <ScheduleTable schedule={schedule} onRemoveClass={handleRemoveClass} />
                ) : (
                  <CalendarView schedule={schedule} />
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
