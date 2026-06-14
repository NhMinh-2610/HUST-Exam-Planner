import React from 'react';
import Select from 'react-select';

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'var(--bg-panel)',
    borderColor: state.isFocused ? 'var(--primary)' : 'var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '4px',
    boxShadow: state.isFocused ? '0 0 0 1px var(--primary)' : 'none',
    '&:hover': {
      borderColor: 'var(--primary-hover)'
    }
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: 'var(--bg-panel)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-lg)',
    zIndex: 9999
  }),
  menuPortal: (provided) => ({
    ...provided,
    zIndex: 9999
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected 
      ? 'var(--primary)' 
      : state.isFocused 
        ? 'rgba(204, 0, 0, 0.1)' 
        : 'transparent',
    color: state.isSelected ? 'white' : 'var(--text-main)',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: 'var(--primary)'
    }
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: 'rgba(204, 0, 0, 0.15)',
    borderRadius: '4px',
    border: '1px solid rgba(204, 0, 0, 0.25)'
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: 'var(--primary)',
    fontWeight: '500'
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: 'var(--primary)',
    ':hover': {
      backgroundColor: 'var(--primary)',
      color: 'white',
    },
  }),
  input: (provided) => ({
    ...provided,
    color: 'var(--text-main)'
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'var(--text-main)'
  }),
  placeholder: (provided) => ({
    ...provided,
    color: 'var(--text-muted)'
  })
};

const ClassSelector = ({ classCodes, selectedCodes, onChange }) => {
  const options = classCodes.map(code => ({
    value: code,
    label: code
  }));

  const value = selectedCodes.map(code => ({
    value: code,
    label: code
  }));

  const handleChange = (selectedOptions) => {
    onChange(selectedOptions ? selectedOptions.map(opt => opt.value) : []);
  };

  return (
    <div className="class-selector animate-fade-in delay-100" style={{ marginBottom: '2rem', position: 'relative', zIndex: 100 }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
        Chọn mã lớp của bạn
      </h2>
      <Select
        isMulti
        name="classCodes"
        options={options}
        value={value}
        onChange={handleChange}
        placeholder="Nhập hoặc chọn mã lớp... (ví dụ: 168228)"
        styles={customStyles}
        noOptionsMessage={() => "Không tìm thấy mã lớp"}
        className="react-select-container"
        classNamePrefix="react-select"
        menuPlacement="bottom"
      />
    </div>
  );
};

export default ClassSelector;
