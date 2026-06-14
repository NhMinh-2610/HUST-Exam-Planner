import React, { useState, useMemo } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import UploadBox from './components/UploadBox';
import ClassSelector from './components/ClassSelector';
import ScheduleTable from './components/ScheduleTable';
import ConflictWarning from './components/ConflictWarning';
import { uploadPdf } from './services/api';
import './index.css';

function App() {
  const [fileData, setFileData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCodes, setSelectedCodes] = useState([]);

  const handleUpload = async (file) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await uploadPdf(file);
      setFileData(result);
      setSelectedCodes([]);
    } catch (err) {
      setError(err.response?.data?.detail || "Đã có lỗi xảy ra khi đọc file PDF. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFileData(null);
    setSelectedCodes([]);
    setError(null);
  };

  const { schedule, conflicts } = useMemo(() => {
    if (!fileData || !selectedCodes || selectedCodes.length === 0) {
      return { schedule: [], conflicts: [] };
    }

    // Filter
    let filtered = fileData.data.filter(item => selectedCodes.includes(item.classCode));

    // Sort by Date then Shift
    // Note: Vietnamese dates are usually dd.MM.yyyy
    filtered.sort((a, b) => {
      const parseDate = (d) => {
        const parts = d.split('.');
        if (parts.length === 3) {
          return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
        }
        return 0;
      };
      
      const dateDiff = parseDate(a.examDate) - parseDate(b.examDate);
      if (dateDiff !== 0) return dateDiff;
      
      return a.examShift.localeCompare(b.examShift);
    });

    // Detect conflicts
    const shiftMap = {};
    filtered.forEach(item => {
      const key = `${item.examDate}-${item.examShift}`;
      if (!shiftMap[key]) {
        shiftMap[key] = [];
      }
      shiftMap[key].push(item);
    });

    const detectedConflicts = [];
    Object.keys(shiftMap).forEach(key => {
      if (shiftMap[key].length > 1) {
        detectedConflicts.push({
          date: shiftMap[key][0].examDate,
          shift: shiftMap[key][0].examShift,
          count: shiftMap[key].length,
          courses: shiftMap[key]
        });
        
        // Mark items as having conflict
        shiftMap[key].forEach(item => {
          item.hasConflict = true;
        });
      }
    });

    return { schedule: filtered, conflicts: detectedConflicts };
  }, [fileData, selectedCodes]);

  return (
    <div className="container">
      <header style={{ textAlign: 'center', marginBottom: '3rem' }} className="animate-fade-in">
        <h1>HUST Exam Schedule</h1>
        <p className="subtitle">Tạo lịch thi cá nhân thông minh từ file PDF</p>
      </header>

      <main>
        {!fileData ? (
          <UploadBox onUpload={handleUpload} isLoading={isLoading} error={error} />
        ) : (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <p style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ✓ Đã tải thành công {fileData.totalRows} dữ liệu lớp thi.
              </p>
              <button className="btn btn-secondary" onClick={handleReset}>
                <RefreshCw size={16} /> Chọn file khác
              </button>
            </div>
            
            <ClassSelector 
              classCodes={fileData.classCodes} 
              selectedCodes={selectedCodes}
              onChange={setSelectedCodes}
            />

            {selectedCodes.length > 0 && (
              <>
                <ConflictWarning conflicts={conflicts} />
                <ScheduleTable schedule={schedule} />
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
