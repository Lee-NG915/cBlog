import React from 'react';
import style from './StandardInput.scss';

export interface StandardInputProps {
  className?: string;
}

const StandardInput: React.FC<StandardInputProps> = ({ className = '', ...props }) => (
  <div className={`${style.StandardInput} ${className}`}>
    <input type="text" {...props} />
  </div>
);

export default StandardInput;
