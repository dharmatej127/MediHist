import React from 'react';
import './Input.css';

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false
}) => {
  return (
    <div className="input-group">
      {label && <label htmlFor={name} className="input-label">{label} {required && <span className="required">*</span>}</label>}
      <input
        id={name}
        name={name}
        type={type}
        className={`input-field ${error ? 'input-error' : ''}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default Input;
