import React from 'react';

const ProgressContainer = ({ progress, progressMessage, passwordStatus }) => (
  <div className="hash-container">
    <div className='yourPass' style={{ fontSize: "1.05em" }}>{progressMessage}</div>
    <div className={`progress-container ${passwordStatus ? passwordStatus + '-progress' : 'default-progress'}`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <React.Fragment key={index}>
          <div
            className={`progress-stage ${progress >= (index + 1) * 20 ? 'active' : ''}`}
          ></div>
          {index < 4 && <div className="progress-connector"></div>}
        </React.Fragment>
      ))}
    </div>
  </div>
);

export default ProgressContainer;
