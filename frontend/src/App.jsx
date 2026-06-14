import React, { useState, useMemo } from 'react';
import { Download, RefreshCw, FilePlus, Calendar as CalendarIcon, List as ListIcon } from 'lucide-react';
import UploadBox from './components/UploadBox';
import ClassSelector from './components/ClassSelector';
import ScheduleTable from './components/ScheduleTable';
import ConflictWarning from './components/ConflictWarning';
import ClassConflictResolver from './components/ClassConflictResolver';
import CalendarView from './components/CalendarView';
import { uploadPdf } from './services/api';
import './index.css';

function App() {
  const [fileData, setFileData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCodes, setSelectedCodes] = useState([]);
  
  // Tracks the chosen examClassCode when a classCode has multiple exam sections
  // Format: { "classCode": "chosenExamClassCode" }
  const [resolvedConflicts, setResolvedConflicts] = useState({});
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'calendar'

  const handleUpload = async (files) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await uploadPdf(files);
      
      if (fileData) {
        // Append data if already uploaded a file
        const mergedData = [...fileData.data, ...result.data];
        const uniqueClassCodes = [...new Set(mergedData.map(item => item.classCode))].sort();
        
        setFileData({
          ...fileData,
          totalRows: mergedData.length,
          classCodes: uniqueClassCodes,
          data: mergedData
        });
      } else {
        setFileData(result);
      }
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
    setResolvedConflicts({});
    setError(null);
  };

  // Group data to find classes that have multiple examClassCodes
  const ambiguousClasses = useMemo(() => {
    if (!fileData || !selectedCodes || selectedCodes.length === 0) return [];
    
    const ambiguous = [];
    selectedCodes.forEach(code => {
      const itemsForCode = fileData.data.filter(item => item.classCode === code);
      // Find unique examClassCodes for this classCode
      const uniqueExamClasses = [...new Set(itemsForCode.map(item => item.examClassCode))].filter(Boolean);
      
      if (uniqueExamClasses.length > 1) {
        ambiguous.push({
          classCode: code,
          courseName: itemsForCode[0]?.courseName,
          options: uniqueExamClasses,
          items: itemsForCode
        });
      }
    });
    return ambiguous;
  }, [fileData, selectedCodes]);

  // Main logic to filter and generate the final schedule
  const { schedule, conflicts } = useMemo(() => {
    if (!fileData || !selectedCodes || selectedCodes.length === 0) {
      return { schedule: [], conflicts: [] };
    }

    // Filter by selected classCodes
    let filtered = fileData.data.filter(item => selectedCodes.includes(item.classCode));

    // Resolve ambiguous classes (keep only the chosen examClassCode)
    filtered = filtered.filter(item => {
      const isAmbiguous = ambiguousClasses.some(ac => ac.classCode === item.classCode);
      if (isAmbiguous) {
        const chosen = resolvedConflicts[item.classCode];
        if (chosen) {
          return item.examClassCode === chosen;
        }
        return false; // If not yet chosen, don't show to avoid clutter
      }
      return true;
    });

    // Sort by Date then Shift
    filtered.sort((a, b) => {
      const parseDate = (d) => {
        if (!d) return 0;
        const parts = d.split('.');
        if (parts.length === 3) {
          return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
        }
        return 0;
      };
      
      const dateDiff = parseDate(a.examDate) - parseDate(b.examDate);
      if (dateDiff !== 0) return dateDiff;
      
      return (a.examShift || "").localeCompare(b.examShift || "");
    });

    // Detect true schedule conflicts (same day and shift)
    const shiftMap = {};
    filtered.forEach(item => {
      if (!item.examDate || !item.examShift) return;
      const key = `${item.examDate}-${item.examShift}`;
      if (!shiftMap[key]) shiftMap[key] = [];
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
        
        shiftMap[key].forEach(item => {
          item.hasConflict = true;
        });
      }
    });

    return { schedule: filtered, conflicts: detectedConflicts };
  }, [fileData, selectedCodes, ambiguousClasses, resolvedConflicts]);

  const handleResolveConflict = (classCode, chosenExamClassCode) => {
    setResolvedConflicts(prev => ({
      ...prev,
      [classCode]: chosenExamClassCode
    }));
  };

  return (
    <div className="container">
      <header style={{ textAlign: 'center', marginBottom: '3rem' }} className="animate-fade-in">
        <h1>HUST Exam Schedule</h1>
        <p className="subtitle">Tạo lịch thi cá nhân thông minh từ file PDF</p>
      </header>

      <main>
        {!fileData ? (
          <UploadBox onUpload={handleUpload} isLoading={isLoading} error={error} multiple={true} />
        ) : (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', backgroundColor: 'var(--bg-panel)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <p style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                ✓ Đã tải {fileData.totalRows} dữ liệu lớp thi.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label className="btn btn-secondary" style={{ cursor: 'pointer', margin: 0 }}>
                  <input 
                    type="file" 
                    multiple
                    accept=".pdf" 
                    style={{ display: 'none' }} 
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleUpload(Array.from(e.target.files));
                      }
                    }} 
                  />
                  {isLoading ? <RefreshCw className="spin" size={16} /> : <FilePlus size={16} />} 
                  Tải thêm file
                </label>
                <button className="btn btn-secondary" onClick={handleReset} style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                  <RefreshCw size={16} /> Bắt đầu lại
                </button>
              </div>
            </div>
            
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

            {selectedCodes.length > 0 && (
              <>
                <ConflictWarning conflicts={conflicts} />
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
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

                {viewMode === 'table' ? (
                  <ScheduleTable schedule={schedule} />
                ) : (
                  <CalendarView schedule={schedule} />
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
