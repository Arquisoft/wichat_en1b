import React from 'react';

const ErrorMessage = ({ message }) => {
  return (
    <div className="error-message">
      <i className="error-icon">⚠️</i>
      <p>{message}</p>
    </div>
  );
};

export default ErrorMessage;