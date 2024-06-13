import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faCopy, faTimes } from '@fortawesome/free-solid-svg-icons';

function FinalContainer({
  displayedPassword,
  showPassword,
  togglePasswordVisibility,
  handleCopy,
  handleClear,
  passwordStatus,
  isOnline
}) {
  return (
    <div className="final-container">
      <div className="password-display">
        <input
          type="text"
          readOnly
          value={displayedPassword}
          className={`password-input ${passwordStatus === 'breached' ? 'breached' : passwordStatus === 'safe' ? 'safe' : ''}`}
        />
        <button onClick={togglePasswordVisibility} className="toggle-password-visibility">
          <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
        </button>
        <button onClick={handleCopy} className="copy-password">
          <FontAwesomeIcon icon={faCopy} />
        </button>
        <button onClick={handleClear} className="clear-password">
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      <div className="password-status">
        {isOnline ? (
          passwordStatus === 'breached' ? (
            <div className="breached-status">This password has been breached!</div>
          ) : passwordStatus === 'safe' ? (
            <div className="safe-status">This password is safe!</div>
          ) : (
            <div className="checking-status">Checking password status...</div>
          )
        ) : (
          <div className="offline-status">You are offline. Password status check is unavailable.</div>
        )}
      </div>
    </div>
  );
}

export default FinalContainer;
