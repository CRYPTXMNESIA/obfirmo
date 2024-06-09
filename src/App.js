import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUnlock, faCopy, faEye, faEyeSlash, faTimes, faCheck, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { AlertTriangle } from 'react-feather';
import jsSHA from 'jssha';
import seedrandom from 'seedrandom';
import './App.css';

function App() {
  const [masterKey, setMasterKey] = useState('');
  const [site, setSite] = useState('');
  const [salt, setSalt] = useState('');
  const [length, setLength] = useState(32);
  const [hash, setHash] = useState('');
  const [password, setPassword] = useState('');
  const [displayedPassword, setDisplayedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [stage, setStage] = useState('input');
  const [featureSupported, setFeatureSupported] = useState(true);
  const [copyIcon, setCopyIcon] = useState(faCopy);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [passwordStatus, setPasswordStatus] = useState(null);
  const buttonsContainerRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  const progressMessageRef = useRef(null);
  const infoSectionRef = useRef(null);

  const [includeLowerCase, setIncludeLowerCase] = useState(true);
  const [includeUpperCase, setIncludeUpperCase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSpecialCharacters, setIncludeSpecialCharacters] = useState(true);

  const specialCharacters = "!@#$%^&*()-_=+[]{}|;:'\",.<>?/`~";
  const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowerCase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";

  const getRandomCharacter = (characters, rng) => {
    const randomIndex = Math.floor(rng() * characters.length);
    return characters[randomIndex];
  };

  const shuffleArray = (array, rng) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const generateRandomPassword = (key, site, salt, length) => {
    const combinedString = key + site + salt;
    const rng = seedrandom(combinedString);

    let passwordArray = [];

    setProgressMessage('Stage 1...');
    if (includeSpecialCharacters) {
      passwordArray.push(getRandomCharacter(specialCharacters, rng));
    }
    setProgress(20);

    setProgressMessage('Stage 2...');
    if (includeUpperCase) {
      passwordArray.push(getRandomCharacter(upperCase, rng));
    }
    setProgress(40);

    setProgressMessage('Stage 3...');
    if (includeLowerCase) {
      passwordArray.push(getRandomCharacter(lowerCase, rng));
    }
    setProgress(60);

    setProgressMessage('Stage 4...');
    if (includeNumbers) {
      passwordArray.push(getRandomCharacter(numbers, rng));
    }
    setProgress(80);

    const allCharacters = 
      (includeSpecialCharacters ? specialCharacters : '') + 
      (includeUpperCase ? upperCase : '') + 
      (includeLowerCase ? lowerCase : '') + 
      (includeNumbers ? numbers : '');

    setProgressMessage('Stage 5...');
    for (let i = passwordArray.length; i < length; i++) {
      passwordArray.push(getRandomCharacter(allCharacters, rng));
    }

    passwordArray = shuffleArray(passwordArray, rng);

    return passwordArray.join('');
  };

  const checkPasswordPwned = async (password) => {
    const sha1 = new jsSHA("SHA-1", "TEXT");
    sha1.update(password);
    const hash = sha1.getHash("HEX");
    const prefix = hash.substring(0, 5).toUpperCase();
    const suffix = hash.substring(5).toUpperCase();

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    const data = await response.text();
    const pwned = data.split('\n').some(line => line.startsWith(suffix));

    return pwned ? 'breached' : 'safe';
  };

  const generateFinalPassword = async (key, site, salt, length) => {
    setProgressMessage('Finishing.....');
    const finalPassword = generateRandomPassword(key, site, salt, length);
    const formattedPassword = formatPassword(finalPassword, length);
    setPassword(formattedPassword);
    setDisplayedPassword(formatPassword('*'.repeat(length)));

    setProgressMessage('Checking...');
    if (navigator.onLine) {
      console.log('Online: Checking password status...');
      const status = await checkPasswordPwned(finalPassword);
      setPasswordStatus(status);
      console.log('Password status:', status);
    } else {
      console.log('Offline: Skipping password check.');
      setPasswordStatus(null);
    }

    setTimeout(() => {
      setStage('final');
      setProgress(100);
      setProgressMessage('Done!');
    }, 500);
  };

  const animateHashGeneration = async (key, site, salt, length) => {
    setProgress(0);
    setProgressMessage('Initializing...');
    await new Promise(resolve => setTimeout(resolve, 500));
    setProgress(10);

    await generateFinalPassword(key, site, salt, length);
  };

  const formatPassword = (password, length) => {
    return password.slice(0, length);
  };

  const handleUnlock = () => {
    const masterKeyInput = document.getElementById('masterKey');
    const siteInput = document.getElementById('site');
  
    if (!masterKey || !site) {
      if (!masterKey) masterKeyInput.classList.add('input-error');
      if (!site) siteInput.classList.add('input-error');
      return;
    }
  
    if (length < 8 || length > 128) {
      alert('Password length must be between 8 and 128 characters.');
      return;
    }
  
    if (!includeLowerCase && !includeUpperCase && !includeNumbers && !includeSpecialCharacters) {
      alert('At least one character type must be selected.');
      return;
    }
  
    setTimeout(() => {
      setStage('hash');
      animateHashGeneration(masterKey, site, salt, length);
    }, 0);
  };

  const handleClear = () => {
      setMasterKey('');
      setSite('');
      setSalt('');
      setLength(32);
      setHash('');
      setPassword('');
      setDisplayedPassword('');
      setShowPassword(false);
      setStage('input');
      setPasswordStatus(null);
  };

  const handleCopy = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(password.replace(/\n/g, ''))
        .then(() => {
          setCopyIcon(faCheck);
          setTimeout(() => {
            setCopyIcon(faCopy);
          }, 1500);
        })
        .catch(err => {
          console.log('Clipboard API failed, using execCommand fallback:', err);
          fallbackCopyTextToClipboard(password.replace(/\n/g, ''));
        });
    } else {
      console.error('Clipboard API not supported, using execCommand fallback.');
      fallbackCopyTextToClipboard(password.replace(/\n/g, ''));
    }
  };
  
  const fallbackCopyTextToClipboard = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);

    textArea.style.position = 'fixed';  // Prevent scrolling to bottom of page in MS Edge.
    textArea.style.left = '-9999px';  // Move element out of view
    textArea.setAttribute('readonly', '');  // Prevent keyboard from showing on mobile devices

    const range = document.createRange();
    range.selectNodeContents(textArea);

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    textArea.setSelectionRange(0, 999999); // Ensure everything is selected

    try {
      document.execCommand('copy');
      setCopyIcon(faCheck);
      setTimeout(() => {
        setCopyIcon(faCopy);
      }, 1500);
    } catch (err) {
      console.error('Fallback: Unable to copy', err);
    }

    document.body.removeChild(textArea);
  };

  const revealPassword = () => {
    let revealIndex = 0;
    const interval = setInterval(() => {
      let currentPassword = password.replace(/\n/g, '');
      if (revealIndex < length) {
        setDisplayedPassword(formatPassword(currentPassword.slice(0, revealIndex + 1) + '*'.repeat(Math.max(0, length - revealIndex - 1)), length));
        revealIndex++;
      } else {
        clearInterval(interval);
      }
    }, 10);
  };

  const hidePassword = () => {
    let hideIndex = length - 1;
    const interval = setInterval(() => {
      let currentPassword = password.replace(/\n/g, '');
      if (hideIndex >= 0) {
        setDisplayedPassword(formatPassword(currentPassword.slice(0, hideIndex) + '*'.repeat(Math.max(0, length - hideIndex)), length));
        hideIndex--;
      } else {
        clearInterval(interval);
      }
    }, 10);
  };

  const togglePasswordVisibility = () => {
    if (showPassword) {
      hidePassword();
    } else {
      revealPassword();
    }
    setShowPassword(!showPassword);
  };

  const supportsRequiredFeatures = () => {
    return (
      'clipboard' in navigator &&
      CSS.supports('(--fake-var: 0)')
    );
  };

  useEffect(() => {
    const checkInternetConnection = () => {
      if (navigator.onLine) {
        console.log('Currently online');
        setIsOnline(true);
      } else {
        console.log('Currently offline');
        setIsOnline(false);
      }
    };

    checkInternetConnection();

    const interval = setInterval(checkInternetConnection, 1500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleOnline = async () => {
      console.log('Back online');
      setIsOnline(true);
      if (password && passwordStatus === null) {
        const status = await checkPasswordPwned(password);
        setPasswordStatus(status);
        console.log('Password status updated:', status);
      }
    };

    const handleOffline = () => {
      console.log('Went offline');
      setIsOnline(false);
      setPasswordStatus(null);
      console.log('Password status reset due to offline status');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [password, passwordStatus]);

  useEffect(() => {
    console.log('%cDO NOT PASTE ANYTHING HERE!', 'font-size:40px;color:red;background-color:black;border:5px solid black;');
  }, []);

  useEffect(() => {
    const isSupported = supportsRequiredFeatures();
    setFeatureSupported(isSupported);
  }, []);

  useEffect(() => {
    const handleInputFocus = (e) => {
      const input = e.target;
      input.classList.remove('input-error');
    };

    const inputs = document.querySelectorAll('input');

    inputs.forEach(input => {
      input.addEventListener('focus', handleInputFocus);
      input.addEventListener('input', handleInputFocus);
    });

    return () => {
      inputs.forEach(input => {
        input.removeEventListener('focus', handleInputFocus);
        input.removeEventListener('input', handleInputFocus);
      });
    };
  }, []);

  const asciiArt = `         __    _____                    
  ____  / /_  / __(_)________ ___  ____ 
 / __ \\/ __ \\/ /_/ / ___/ __ \`__ \\/ __ \\
/ /_/ / /_/ / __/ / /  / / / / / / /_/ /
\\____/_.___/_/ /_/_/  /_/ /_/ /_/\\____/ 
`;

  //if (!featureSupported) {return (<div className="unsupported-warning"><AlertTriangle size={48} color="#FFA500" style={{ marginTop: '5px' }} /><h1>Unsupported Browser</h1><p>Your browser does not support the essential features that are needed for Obfirmo to work properly. Please update your browser or switch to a newer browser.</p></div>);}

  return (
    <div className="App">
      <div className="wrapper">
        <header style={{ fontWeight: "bold" }} className="App-header">
          <pre className={`ascii-art ${passwordStatus === 'breached' ? 'breached-ascii' : passwordStatus === 'safe' ? 'safe-ascii' : 'default-ascii'}`}>
            {asciiArt}
            <div style={{ marginTop: '10px', fontSize: "13px" }}>deterministic password manager</div>
          </pre>
          <div className="ascii-line"></div>
        </header>
        <div className="container">
          {stage === 'input' ? (
            <div className="input-container">
              <input
                type="password"
                id="masterKey"
                placeholder="* Master Key"
                value={masterKey}
                style={{ fontSize: "1.05rem" }}
                onChange={(e) => setMasterKey(e.target.value)}
              />
              <input
                type="password"
                id="salt"
                placeholder="Salt"
                value={salt}
                className="salt-input"
                style={{ fontSize: "1.05rem" }}
                onChange={(e) => setSalt(e.target.value)}
              />
              <input
                type="text"
                id="site"
                placeholder="* Site/Account"
                value={site}
                style={{ fontSize: "1.05rem" }}
                onChange={(e) => setSite(e.target.value)}
              />
              <input
                type="number"
                placeholder="Length"
                value={length}
                style={{ fontSize: "1.05rem" }}
                onChange={(e) => setLength(e.target.value)}
                onBlur={(e) => {
                  if (e.target.value === '' || e.target.value < 8) {
                    setLength(8);
                  } else if (e.target.value > 128) {
                    setLength(128);
                  }
                }}
                onKeyDown={(e) => {
                  if (!/[0-9]/.test(e.key) && e.key !== 'Backspace') {
                    e.preventDefault();
                  }
                }}
              />
              <div className="checkbox-grid">
                <label className="checkbox-label">
                  <input type="checkbox" checked={includeLowerCase} onChange={() => setIncludeLowerCase(!includeLowerCase)} />
                  <span className="custom-checkbox"></span>
                  <span>abc</span>
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={includeUpperCase} onChange={() => setIncludeUpperCase(!includeUpperCase)} />
                  <span className="custom-checkbox"></span>
                  <span>ABC</span>
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={includeNumbers} onChange={() => setIncludeNumbers(!includeNumbers)} />
                  <span className="custom-checkbox"></span>
                  <span>012</span>
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={includeSpecialCharacters} onChange={() => setIncludeSpecialCharacters(!includeSpecialCharacters)} />
                  <span className="custom-checkbox"></span>
                  <span>$>#</span>
                </label>
              </div>
              <button style={{ border: "1px solid #bebebe" }} onClick={handleUnlock}>
                <FontAwesomeIcon icon={faUnlock} />
              </button>
              <hr style={{ width: "100%", textAlign: "left", marginLeft: "0", marginTop: '15px', color: "#444" }} />
              <div className="info-section" ref={infoSectionRef} style={{ paddingTop: '15px' }}>
                <h2>About Obfirmo</h2>
                <p>Obfirmo is a deterministic password manager that generates passwords based on a master key, site, and salt.</p>
                <h3 style={{ marginTop: '10px', marginBottom: '5px' }}>Advantages</h3>
                <ul>
                  <li>- No need to store passwords, reducing the risk of a single point of failure.</li>
                  <li>- Easy to generate passwords for any site, ensuring quick and efficient access.</li>
                  <li>- Passwords are unique and secure, enhancing overall security for each account.</li>
                  <li>- Operates offline, ensuring data is never exposed to the internet.</li>
                  <li>- Available as a Progressive Web App (PWA), providing cross-platform accessibility and offline capabilities.</li>
                </ul>
                <h3 style={{ marginTop: '10px', marginBottom: '5px' }}>Challenges</h3>
                <ul>
                  <li>- If the master key is lost, all passwords are irretrievable.</li>
                  <li>- Exact master key, site, and salt must be remembered precisely for password regeneration.</li>
                  <li>- Site-specific password rules might require manual adjustments to generated passwords.</li>
                  <li>- A compromised master password can lead to exposure of all derived passwords.</li>
                  <li>- No ability to import existing passwords, requiring a fresh setup for all accounts.</li>
                </ul>
                <h3 style={{ marginTop: '10px', marginBottom: '5px' }}>How to Use</h3>
                <ul>
                  <li>1. Enter a strong master key.</li>
                  <li>2. Optionally enter a salt value for extra security.</li>
                  <li>3. Enter the site or account name.</li>
                  <li>4. Specify the desired length of the password.</li>
                  <li>5. Click the unlock button to generate your password.</li>
                </ul>
                <p>
                  <strong>
                    Made with <span>&lt;3</span> by{' '}
                    <span className="zodsec-link" onClick={() => window.location.href = 'https://discord.gg/y8y95AXT7r'}>
                      ZODSEC
                    </span>
                  </strong>
                </p>
              </div>
            </div>
          ) : stage === 'hash' ? (
            <div className="hash-container">
              <div className='yourPass' style={{ fontSize: "1.05em" }} ref={progressMessageRef}>{progressMessage}</div>
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
          ) : (
            <div className="final-container">
              <div className='yourPass'>
                {isOnline && passwordStatus !== null ? (
                  passwordStatus === 'safe' ? (
                    <span><span style={{ color: "rgb(0, 95, 133)" }}>&gt; STATUS: SAFE &lt;</span></span>
                  ) : (
                    <span><span style={{ color: "red" }}>&gt; STATUS: PWNED &lt;</span></span>
                  )
                ) : (
                  <span>&gt; STATUS: OFFLINE &lt;</span>
                )}
              </div>
              <input
                type="text"
                className={`password-result ${passwordStatus === 'breached' ? 'breached-password' : passwordStatus === 'safe' ? 'safe-password' : ''}`}
                value={displayedPassword}
                readOnly
                style={{ width: '100%', textAlign: 'left' }}
              />
              <div className="buttons-container" ref={buttonsContainerRef}>
                <button style={{ borderLeft: "1px solid #bebebe", borderTop: "1px solid #bebebe", borderRight: "none", borderLeft: "1px solid #bebebe", borderBottom: "1px solid #bebebe" }} onClick={togglePasswordVisibility}>
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
                <button style={{ borderLeft: "none", borderTop: "1px solid #bebebe", borderRight: "none", borderLeft: "none", borderBottom: "1px solid #bebebe" }} onClick={handleCopy}>
                  <FontAwesomeIcon icon={copyIcon} />
                </button>
                <button style={{ borderLeft: "none", borderTop: "1px solid #bebebe", borderRight: "1px solid #bebebe", borderLeft: "none", borderBottom: "1px solid #bebebe" }} onClick={handleClear}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
