import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Eye, EyeOff, AlertTriangle } from 'react-feather';
import jsSHA from 'jssha';
import seedrandom from 'seedrandom';
import { faUnlock, faCopy, faEye, faEyeSlash, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import { faWindows, faApple, faLinux, faAndroid } from '@fortawesome/free-brands-svg-icons';
import PwaLogo from './pwa.svg'; // Import the SVG file
import './App.css';

function App() {
  const [masterKey, setMasterKey] = useState('');
  const [site, setSite] = useState('');
  const [salt, setSalt] = useState(''); // New state for salt
  const [hash, setHash] = useState('');
  const [password, setPassword] = useState('');
  const [displayedPassword, setDisplayedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [stage, setStage] = useState('input');
  const [animationClass, setAnimationClass] = useState('fade-in-down');
  const [featureSupported, setFeatureSupported] = useState(true);
  const [copyIcon, setCopyIcon] = useState(faCopy);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [passwordStatus, setPasswordStatus] = useState(null);
  const buttonsContainerRef = useRef(null);
  const [backgroundTransition, setBackgroundTransition] = useState('default-bg');
  const [loading, setLoading] = useState(true);
  const [overlayActive, setOverlayActive] = useState(true);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  const progressBarRef = useRef(null);
  const progressMessageRef = useRef(null);

  const specialCharacters = "!@#$%^&*()-_=+[]{}|;:'\",.<>?/`~";
  const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowerCase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";

  const generateSHA256Hash = async (input) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

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

  const generateRandomPassword = (key, site, salt) => {
    const combinedString = key + site + salt; // Combine key, site, and salt
    const rng = seedrandom(combinedString);

    let passwordArray = [];

    setProgressMessage('Stage 1...');
    passwordArray.push(getRandomCharacter(specialCharacters, rng));
    setProgress(20);

    setProgressMessage('Stage 2...');
    passwordArray.push(getRandomCharacter(upperCase, rng));
    setProgress(40);

    setProgressMessage('Stage 3...');
    passwordArray.push(getRandomCharacter(lowerCase, rng));
    setProgress(60);

    setProgressMessage('Stage 4...');
    passwordArray.push(getRandomCharacter(numbers, rng));
    setProgress(80);

    const allCharacters = specialCharacters + upperCase + lowerCase + numbers;
    setProgressMessage('Stage 5...');
    for (let i = 4; i < 32; i++) {
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

  const generateFinalPassword = async (key, site, salt) => {
    setProgressMessage('Finishing.....');
    const finalPassword = generateRandomPassword(key, site, salt); // Pass salt to the function
    const formattedPassword = formatPassword(finalPassword);
    setPassword(formattedPassword);
    setDisplayedPassword(formatPassword('*'.repeat(32)));
    setAnimationClass('fade-out-up');

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
      setAnimationClass('fade-in-down');
      setProgress(100);
      setProgressMessage('Done!');
    }, 500);
  };

  const animateHashGeneration = async (key, site, salt) => {
    setProgress(0);
    setProgressMessage('Initializing...');
    await new Promise(resolve => setTimeout(resolve, 500));
    setProgress(10);
  
    await generateFinalPassword(key, site, salt); // Pass salt to the function
  };

  const formatPassword = (password) => {
    return password.slice(0, 32);
  };

  const handleUnlock = () => {
    setAnimationClass('fade-out-up');
    setTimeout(() => {
      setStage('hash');
      setAnimationClass('fade-in-down');
      animateHashGeneration(masterKey, site, salt); // Pass salt to the function
    }, 0);
  };

  const handleClear = () => {
    setAnimationClass('fade-out-up');
    setTimeout(() => {
      setMasterKey('');
      setSite('');
      setSalt(''); // Clear salt input
      setHash('');
      setPassword('');
      setDisplayedPassword('');
      setShowPassword(false);
      setStage('input');
      setAnimationClass('fade-in-down');
      setPasswordStatus(null);

      const asciiArtElement = document.querySelector('.ascii-art');
      const safeLayer = document.querySelector('.safe-layer');
      const breachedLayer = document.querySelector('.breached-layer');

      if (asciiArtElement && safeLayer && breachedLayer) {
        asciiArtElement.classList.remove('breached-ascii', 'safe-ascii');
        safeLayer.style.opacity = '0';
        breachedLayer.style.opacity = '0';
      }
    }, 0);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(password.replace(/\n/g, ''));
    setCopyIcon(faCheck);
    setTimeout(() => {
      setCopyIcon(faCopy);
    }, 1500);
  };

  const revealPassword = () => {
    let revealIndex = 0;
    const interval = setInterval(() => {
      let currentPassword = password.replace(/\n/g, '');
      setDisplayedPassword(formatPassword(currentPassword.slice(0, revealIndex + 1) + '*'.repeat(32 - revealIndex - 1)));
      revealIndex++;
      if (revealIndex === 32) {
        clearInterval(interval);
      }
    }, 10);
  };

  const hidePassword = () => {
    let hideIndex = 31;
    const interval = setInterval(() => {
      let currentPassword = password.replace(/\n/g, '');
      setDisplayedPassword(formatPassword(currentPassword.slice(0, hideIndex) + '*'.repeat(32 - hideIndex)));
      hideIndex--;
      if (hideIndex < 0) {
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
    const boxElement = document.querySelector('.box');
    const safeLayer = document.querySelector('.safe-layer');
    const breachedLayer = document.querySelector('.breached-layer');
    const asciiArtElement = document.querySelector('.ascii-art');
  
    console.log('Password status:', passwordStatus);
  
    if (boxElement && asciiArtElement && safeLayer && breachedLayer) {
      asciiArtElement.classList.remove('safe-ascii', 'breached-ascii', 'default-ascii');
      boxElement.classList.remove('safe-bg', 'breached-bg', 'default-bg');
  
      // Force reflow
      void boxElement.offsetWidth;
  
      if (passwordStatus === 'safe') {
        safeLayer.style.opacity = '1';
        breachedLayer.style.opacity = '0';
        asciiArtElement.classList.add('safe-ascii');
        console.log('Added safe-bg and safe-ascii classes');
      } else if (passwordStatus === 'breached') {
        safeLayer.style.opacity = '0';
        breachedLayer.style.opacity = '1';
        asciiArtElement.classList.add('breached-ascii');
        console.log('Added breached-bg and breached-ascii classes');
      } else {
        safeLayer.style.opacity = '0';
        breachedLayer.style.opacity = '0';
        asciiArtElement.classList.add('default-ascii');
        console.log('Added default-bg class');
      }
    }
  }, [passwordStatus]);  

  useEffect(() => {
    const handleResize = () => {
      const buttonsContainer = buttonsContainerRef.current;
      if (buttonsContainer) {
        const containerHeight = buttonsContainer.offsetHeight;
        const windowHeight = window.innerHeight;

        if (containerHeight > windowHeight) {
          document.body.classList.add('grid-layout');
        } else {
          document.body.classList.remove('grid-layout');
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    console.log('%cDO NOT PASTE ANYTHING HERE!', 'font-size:40px;color:red;background-color:black;border:5px solid black;');
  }, []);

  useEffect(() => {
    const isSupported = supportsRequiredFeatures();
    setFeatureSupported(isSupported);
  }, []);

  const asciiArt = `         __    _____                    
  ____  / /_  / __(_)________ ___  ____ 
 / __ \\/ __ \\/ /_/ / ___/ __ \`__ \\/ __ \\
/ /_/ / /_/ / __/ / /  / / / / / / /_/ /
\\____/_.___/_/ /_/_/  /_/ /_/ /_/\\____/ 
`;

  // if (!featureSupported) { return ( <div className="unsupported-warning"> <AlertTriangle size={48} color="#FFA500" style={{ marginTop: '60px' }} /> <h1>Unsupported Browser</h1> <p>Your browser does not support the essential features that are needed for Obfirmo to work properly. Please update your browser or switch to a newer browser.</p> </div> ); }

  const generateTestPassword = (status) => {
    const testPassword = status === 'safe' ? 'SafeTestPassword123!' : 'BreachedTestPassword456!';
    const formattedPassword = formatPassword(testPassword.padEnd(32, '*'));
    setPassword(testPassword);
    setDisplayedPassword(formattedPassword);
    setPasswordStatus(status);
    setStage('final');
  };

  return (
    <div className="App">
      <div className='fade-overlay'></div>
      <div className="tilt-container">
        <div className="box">
          <div className="layer default-layer"></div>
          <div className="layer safe-layer"></div>
          <div className="layer breached-layer"></div>
        </div>
      </div>
      <div className="wrapper">
        <header style={{ fontWeight: "bold" }} className="App-header">
          <pre className={`ascii-art ${passwordStatus === 'breached' ? 'breached-ascii' : passwordStatus === 'safe' ? 'safe-ascii' : 'default-ascii'}`}>
          <div class="infinity-container">
            <div class="infinity">
            <svg fill="#bebebe" width="110px" height="150px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M5.25 8.5c-2.032 0-3.75 1.895-3.75 3.75S3.218 16 5.25 16c1.017 0 2.014-.457 3.062-1.253.89-.678 1.758-1.554 2.655-2.497-.897-.943-1.765-1.82-2.655-2.497C7.264 8.957 6.267 8.5 5.25 8.5zM12 11.16c-.887-.933-1.813-1.865-2.78-2.6C8.048 7.667 6.733 7 5.25 7 2.343 7 0 9.615 0 12.25s2.343 5.25 5.25 5.25c1.483 0 2.798-.668 3.97-1.56.967-.735 1.893-1.667 2.78-2.6.887.933 1.813 1.865 2.78 2.6 1.172.892 2.487 1.56 3.97 1.56 2.907 0 5.25-2.615 5.25-5.25S21.657 7 18.75 7c-1.483 0-2.798.668-3.97 1.56-.967.735-1.893 1.667-2.78 2.6zm1.033 1.09c.897.943 1.765 1.82 2.655 2.497C16.736 15.543 17.733 16 18.75 16c2.032 0 3.75-1.895 3.75-3.75S20.782 8.5 18.75 8.5c-1.017 0-2.014.457-3.062 1.253-.89.678-1.758 1.554-2.655 2.497z"/></svg>
            </div>
          </div>
          </pre>
        </header>
        <div className="container">
          {stage === 'input' ? (
            <div className={`input-container ${animationClass}`}>
              <input
                type="password"
                placeholder="Master Key"
                value={masterKey}
                style={{ fontSize: "1.05rem" }}
                onChange={(e) => setMasterKey(e.target.value)}
              />
              <input
                type="text"
                placeholder="Salt" // New salt input field
                value={salt}
                className="salt-input"
                style={{ fontSize: "1.05rem" }}
                onChange={(e) => setSalt(e.target.value)}
              />
              <input
                type="text"
                placeholder="Site/Account"
                value={site}
                style={{ fontSize: "1.05rem" }}
                onChange={(e) => setSite(e.target.value)}
              />
              <button style={{ border: "1px solid #bebebe" }} onClick={handleUnlock}>
                <FontAwesomeIcon icon={faUnlock} />
              </button>
            </div>
          ) : stage === 'hash' ? (
            <div className={`hash-container ${animationClass}`}>
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
            <div className={`final-container ${animationClass}`}>
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
                  <FontAwesomeIcon icon={copyIcon} /> {/* Use the dynamic copyIcon */}
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
