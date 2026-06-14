import React from 'react';
import { HelpCircle } from 'lucide-react';
import './ClassConflictResolver.css';

const ClassConflictResolver = ({ ambiguousClasses, resolvedConflicts, onResolve }) => {
  return (
    <div className="resolver animate-fade-in delay-200">
      <div className="resolver-panel">
        <h3 className="resolver-title">
          <HelpCircle size={20} />
          Xác nhận mã lớp thi
        </h3>
        <p className="resolver-desc">
          Một số môn có nhiều mã lớp thi do chia phòng. Chọn đúng mã lớp thi của bạn:
        </p>

        <div className="resolver-items">
          {ambiguousClasses.map((ac) => (
            <div key={ac.classCode} className="resolver-item">
              <div className="resolver-item-label">
                {ac.courseName} (Mã lớp: <span className="text-primary">{ac.classCode}</span>)
              </div>
              <div className="resolver-options">
                {ac.options.map(opt => {
                  const isSelected = resolvedConflicts[ac.classCode] === opt;
                  return (
                    <label key={opt} className={`resolver-option ${isSelected ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name={`resolve-${ac.classCode}`}
                        value={opt}
                        checked={isSelected}
                        onChange={() => onResolve(ac.classCode, opt)}
                      />
                      {opt}
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
