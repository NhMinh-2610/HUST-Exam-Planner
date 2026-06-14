import React, { useState, useEffect } from 'react';

const ProgressBar = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Fake progress animation from 0 to 95% over 1.5 seconds
    const interval = setInterval(() => {
      setProgress(old => {
        if (old >= 95) {
          clearInterval(interval);
          return 95;
        }
        return old + 5;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ marginTop: '1.5rem', textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
        <span>Tiến trình xử lý...</span>
        <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{progress}%</span>
      </div>
      <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-panel-hover)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${progress}%`, height: '100%', backgroundColor: 'var(--primary)', transition: 'width 0.1s ease' }} />
      </div>
      <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Thời gian ước tính: ~1 giây</p>
    </div>
  );
};

export default ProgressBar;
