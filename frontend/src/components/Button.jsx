import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  type = 'button', 
  fullWidth = false,
  onClick,
  disabled
}) => {
  const classes = `btn btn-${variant} ${fullWidth ? 'btn-full' : ''}`;
  
  return (
    <button 
      type={type} 
      className={classes} 
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
