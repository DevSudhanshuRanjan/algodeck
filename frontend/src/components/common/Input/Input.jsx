import { forwardRef } from 'react';
import './Input.css';

const Input = forwardRef(({ 
  label,
  error,
  helperText,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  ...props 
}, ref) => {
  const wrapperClasses = [
    'input-wrapper',
    fullWidth && 'input-full',
    error && 'input-error',
    icon && `input-with-icon input-icon-${iconPosition}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClasses}>
      {label && <label className="input-label">{label}</label>}
      <div className="input-container">
        {icon && iconPosition === 'left' && (
          <span className="input-icon">{icon}</span>
        )}
        <input ref={ref} className="input-field" {...props} />
        {icon && iconPosition === 'right' && (
          <span className="input-icon">{icon}</span>
        )}
      </div>
      {(error || helperText) && (
        <span className={`input-helper ${error ? 'input-helper-error' : ''}`}>
          {error || helperText}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
