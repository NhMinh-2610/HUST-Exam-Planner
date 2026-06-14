import React from 'react';
import { HelpCircle } from 'lucide-react';

const ClassConflictResolver = ({ ambiguousClasses, resolvedConflicts, onResolve }) => {
  return (
    <div className="animate-fade-in delay-200" style={{ marginBottom: '2rem' }}>
      <div style={{
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem',
      }}>
        <h3 style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          color: 'var(--warning)',
          margin: '0 0 1rem 0',
          fontSize: '1.1rem'
        }}>
          <HelpCircle size={20} />
          Xác nhận mã lớp thi
        </h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.95rem' }}>
          Một số môn học có nhiều mã lớp thi (thường do chia phòng). Vui lòng chọn chính xác mã lớp thi của bạn để hiển thị lịch đúng nhất:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {ambiguousClasses.map((ac) => (
            <div key={ac.classCode} style={{ padding: '1rem', backgroundColor: 'var(--bg-panel)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                {ac.courseName} (Mã lớp: <span style={{ color: 'var(--primary)' }}>{ac.classCode}</span>)
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                {ac.options.map(opt => {
                  const isSelected = resolvedConflicts[ac.classCode] === opt;
                  return (
                    <label 
                      key={opt} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        cursor: 'pointer',
                        color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                        fontWeight: isSelected ? '600' : '400',
                        padding: '0.5rem 1rem',
                        border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                        borderRadius: '4px',
                        backgroundColor: isSelected ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                        transition: 'all 0.2s'
                      }}
                    >
                      <input 
                        type="radio" 
                        name={`conflict-${ac.classCode}`} 
                        value={opt}
                        checked={isSelected}
                        onChange={() => onResolve(ac.classCode, opt)}
                        style={{ accentColor: 'var(--primary)' }}
                      />
                      Mã lớp thi: {opt}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClassConflictResolver;
