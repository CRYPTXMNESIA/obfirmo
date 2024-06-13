import React from 'react';

const InfoSection = React.forwardRef((props, ref) => (
  <div className="info-section" ref={ref} style={{ paddingTop: '15px' }}>
    <h2>About Obfirmo</h2>
    <p>Obfirmo is a deterministic password manager that generates passwords based on a master key, and site/account name.</p>
    <h3 style={{ marginTop: '10px', marginBottom: '5px' }}>Pros</h3>
    <ul>
      <li>- Free</li>
      <li>- Easy to use</li>
      <li>- Fully offline</li>
      <li>- No data collection</li>
      <li>- Most secure passwords</li>
      <li>- You can install it as an app from the browser</li>
      <li>- Built-in security breach checker (haveibeenpwned API)</li>
    </ul>
    <h3 style={{ marginTop: '10px', marginBottom: '5px' }}>Cons</h3>
    <ul>
      <li>- If you forget the master key, you can't recover it</li>
      <li>- If your master key gets leaked, all of your passwords can be compromised</li>
    </ul>
    <h3 style={{ marginTop: '10px', marginBottom: '5px' }}>How to Use</h3>
    <ul>
      <li>1. Enter your Obfirmo ID (username)</li>
      <li>2. Enter your Master Key</li>
      <li>3. Enter the site or account name</li>
      <li>4. Specify the desired length of the password</li>
      <li>5. Click the key button to get your password</li>
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
));

export default InfoSection;
