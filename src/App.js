import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Eye, EyeOff, AlertTriangle } from 'react-feather';
import jsSHA from 'jssha';
import seedrandom from 'seedrandom';
import { faUnlock, faCopy, faEye, faEyeSlash, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import './App.css';

const Loader = () => {
  return (
    <div className="loader"></div>
  );
}

function App() {
  const [masterKey, setMasterKey] = useState('');
  const [site, setSite] = useState('');
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
  const [loaderClass, setLoaderClass] = useState("");
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  const progressBarRef = useRef(null);
  const progressMessageRef = useRef(null);

  const specialCharacters = "!@#$%^&*()-_=+[]{}|;:'\",.<>?/`~";
  const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowerCase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        setOverlayActive(false);
      }, 800);
    }
  }, [loading]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaderClass("loader-fade-out");
      setTimeout(() => setLoading(false), 800);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

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

  const generateRandomPassword = (key, site) => {
    const combinedString = key + site;
    const rng = seedrandom(combinedString);

    let passwordArray = [];

    setProgressMessage('Adding special characters...');
    passwordArray.push(getRandomCharacter(specialCharacters, rng));
    setProgress(20);

    setProgressMessage('Adding uppercase letters...');
    passwordArray.push(getRandomCharacter(upperCase, rng));
    setProgress(40);

    setProgressMessage('Adding lowercase letters...');
    passwordArray.push(getRandomCharacter(lowerCase, rng));
    setProgress(60);

    setProgressMessage('Adding numbers...');
    passwordArray.push(getRandomCharacter(numbers, rng));
    setProgress(80);

    const allCharacters = specialCharacters + upperCase + lowerCase + numbers;
    setProgressMessage('Generating remaining characters...');
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

  const generateFinalPassword = async (key, site) => {
    setProgressMessage('Generating final password...');
    const finalPassword = generateRandomPassword(key, site);
    const formattedPassword = formatPassword(finalPassword);
    setPassword(formattedPassword);
    setDisplayedPassword(formatPassword('*'.repeat(32)));
    setAnimationClass('fade-out-up');

    setProgressMessage('Checking password for breach...');
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
      setProgressMessage('Password generation complete!');
    }, 500);
  };

  const animateHashGeneration = async (key, site) => {
    setProgress(0);
    setProgressMessage('Initializing...');
    await new Promise(resolve => setTimeout(resolve, 500));
    setProgress(10);
  
    await generateFinalPassword(key, site);
  };

  const formatPassword = (password) => {
    const partLength = 8;
    const lines = [];
    for (let i = 0; i < 4; i++) {
      lines.push(password.substring(i * partLength, (i + 1) * partLength));
    }
    return lines.join('\n');
  };

  const handleUnlock = () => {
    setAnimationClass('fade-out-up');
    setTimeout(() => {
      setStage('hash');
      setAnimationClass('fade-in-down');
      animateHashGeneration(masterKey, site);
    }, 500);
  };

  const handleClear = () => {
    setAnimationClass('fade-out-up');
    setTimeout(() => {
      setMasterKey('');
      setSite('');
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
    }, 500);
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
    }, 5);
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
    }, 5);
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

const asciiArt = `
         __    _____                    
  ____  / /_  / __(_)________ ___  ____ 
 / __ \\/ __ \\/ /_/ / ___/ __ \`__ \\/ __ \\
/ /_/ / /_/ / __/ / /  / / / / / / /_/ /
\\____/_.___/_/ /_/_/  /_/ /_/ /_/\\____/ 
`;

  if (!featureSupported) {
    return (
      <div className="unsupported-warning">
        <AlertTriangle size={48} color="#FFA500" style={{ marginTop: '60px' }} />
        <h1>Unsupported Browser</h1>
        <p>Your browser does not support the essential features that are needed for Zodiac Obfirmo to work properly. Please update your browser or switch to a newer browser.</p>
      </div>
    );
  }

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
      {overlayActive && <div className="overlay"></div>}
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
            {asciiArt}
          </pre>
        </header>
        <div className="container">
          {stage === 'input' ? (
            <div className={`input-container ${animationClass}`}>
              <input
                type="password"
                placeholder="Master Key"
                value={masterKey}
                onChange={(e) => setMasterKey(e.target.value)}
              />
              <input
                type="text"
                placeholder="Site/Account"
                value={site}
                onChange={(e) => setSite(e.target.value)}
              />
              <button onClick={handleUnlock}>
                <FontAwesomeIcon icon={faUnlock} />
              </button>
            </div>
          ) : stage === 'hash' ? (
            <div className={`hash-container ${animationClass}`}>
              <div className='yourPass' ref={progressMessageRef}>{progressMessage}</div>
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
                    <span><span style={{ color: "rgb(23, 194, 0)" }}>[ STATUS: SAFE ]</span></span>
                  ) : (
                    <span><span style={{ color: "red" }}>[ STATUS: PWNED ]</span></span>
                  )
                ) : (
                  <span>[ STATUS: OFFLINE ]</span>
                )}
              </div>
              <pre className={`password-result ${passwordStatus === 'breached' ? 'breached-password' : passwordStatus === 'safe' ? 'safe-password' : ''}`}>{displayedPassword}</pre>
              <div className="buttons-container" ref={buttonsContainerRef}>
                <button onClick={togglePasswordVisibility}>
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
                <button onClick={handleCopy}>
                  <FontAwesomeIcon icon={copyIcon} /> {/* Use the dynamic copyIcon */}
                </button>
                <button onClick={handleClear}>
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
