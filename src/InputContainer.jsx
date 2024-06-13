import React from 'react';

function InputContainer({
  salt,
  masterKey,
  site,
  length,
  includeLowerCase,
  includeUpperCase,
  includeNumbers,
  includeSpecialCharacters,
  setSalt,
  setMasterKey,
  setSite,
  setLength,
  setIncludeLowerCase,
  setIncludeUpperCase,
  setIncludeNumbers,
  setIncludeSpecialCharacters,
  handleUnlock
}) {
  return (
    <div className="input-container">
      <div className="form-group">
        <label htmlFor="masterKey">Master Key</label>
        <input
          id="masterKey"
          type="password"
          value={masterKey}
          onChange={(e) => setMasterKey(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="site">Site</label>
        <input
          id="site"
          type="text"
          value={site}
          onChange={(e) => setSite(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="salt">Salt</label>
        <input
          id="salt"
          type="text"
          value={salt}
          onChange={(e) => setSalt(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="length">Password Length</label>
        <input
          id="length"
          type="number"
          min="8"
          max="128"
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
        />
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={includeLowerCase}
            onChange={() => setIncludeLowerCase(!includeLowerCase)}
          />
          Include Lower Case
        </label>
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={includeUpperCase}
            onChange={() => setIncludeUpperCase(!includeUpperCase)}
          />
          Include Upper Case
        </label>
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={includeNumbers}
            onChange={() => setIncludeNumbers(!includeNumbers)}
          />
          Include Numbers
        </label>
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={includeSpecialCharacters}
            onChange={() => setIncludeSpecialCharacters(!includeSpecialCharacters)}
          />
          Include Special Characters
        </label>
      </div>

      <button onClick={handleUnlock} className="unlock-button">
        Unlock
      </button>
    </div>
  );
}

export default InputContainer;
