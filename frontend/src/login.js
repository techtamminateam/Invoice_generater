import React, { useState } from 'react';
import './login.css';
import loginImage from './assets/newbg.png';
import Logo from './assets/tammina-blue-logo.svg';

const API_URL = 'http://localhost:5000/api';

const Login = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState('employee');

  // Employee login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const isDisabled = !email || !password;

  // Admin user creation states
  const [adminData, setAdminData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    verication_code: '',
    role: 'Employee',
  });

  // OTP states
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);

  // Validate form inputs
  const validateForm = () => {
    const newErrors = {};

    if (activeTab === 'employee') {
      if (!email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(email))
        newErrors.email = 'Please enter a valid email';

      if (!password.trim()) newErrors.password = 'Password is required';
      else if (password.length < 6)
        newErrors.password = 'Password must be at least 6 characters';
    } else {
      if (!adminData.name.trim()) newErrors.name = 'Name is required';
      if (!adminData.email.trim())
        newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(adminData.email))
        newErrors.email = 'Enter valid email';

      if (!adminData.password.trim())
        newErrors.password = 'Password is required';
      else if (adminData.password.length < 6)
        newErrors.password = 'Minimum 6 characters required';

      if (adminData.confirmPassword !== adminData.password)
        newErrors.confirmPassword = 'Passwords do not match';

      if (!adminData.verication_code.trim())
        newErrors.verication_code = 'Verification code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // =====================================
  // EMPLOYEE LOGIN
  // =====================================
  const handleEmployeeLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Invalid email or password');
      }

      alert(`✅ Welcome ${result.name || 'Employee'}!`);
      localStorage.setItem('loggedInUser', JSON.stringify(result));
      onLoginSuccess(result);
    } catch (error) {
      alert(`❌ ${error.message}`);
      console.error('Login error:', error);
    }
  };

  // =====================================
  // SEND VERIFICATION CODE
  // =====================================
  const handleSendCode = async (e) => {
    e.preventDefault();

    if (!adminData.email.trim()) {
      setErrors({ email: 'Email is required before sending code' });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(adminData.email)) {
      setErrors({ email: 'Please enter a valid email' });
      return;
    }

    setIsSendingCode(true);

    try {
      const response = await fetch(`${API_URL}/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminData.email }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send code');
      }

      alert('📧 Verification code sent to your email!');
      setIsCodeSent(true);
      setErrors({});
    } catch (error) {
      alert(`❌ ${error.message}`);
      setErrors({ email: error.message });
    } finally {
      setIsSendingCode(false);
    }
  };

  // =====================================
  // CREATE EMPLOYEE USER
  // =====================================
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!isCodeSent) {
      alert('⚠️ Please send and verify the verification code first');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: adminData.name,
          email: adminData.email,
          verication_code: adminData.verication_code,
          password: adminData.password,
          role: 'Employee',
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user');
      }

      alert('✅ Employee created successfully!');
      console.log('Created user:', result);

      // Reset form
      setAdminData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        verication_code: '',
        role: 'Employee',
      });
      setIsCodeSent(false);
      setErrors({});

      // Switch back to login tab
      setActiveTab('employee');
    } catch (error) {
      alert(`❌ ${error.message}`);
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="login-container">
      
      <div className="login-left">
        <img src={loginImage} alt="Tech Tammina illustration" />
      </div>

      
      <div className="login-right">
        <div className="login-box">
          <img src={Logo} alt="Tech Tammina Logo" className="logo" />

          
          <div className="tabs">
            <button
              className={activeTab === 'employee' ? 'active' : ''}
              onClick={() => setActiveTab('employee')}
            >
              Employee
            </button>
            <button
              className={activeTab === 'admin' ? 'active' : ''}
              onClick={() => setActiveTab('admin')}
            >
              Admin
            </button>
          </div>

          
          {activeTab === 'employee' && (
            <>
              <h2>Log into your account</h2>
              <form onSubmit={handleEmployeeLogin} noValidate>
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <p className="error-text">{errors.email}</p>}

                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && <p className="error-text">{errors.password}</p>}

                <div className="forgot-password">
                  <a href="#">Forgot Password?</a>
                </div>

                <button type="submit" disabled={isDisabled}>Login</button>
              </form>
            </>
          )}

          
          {activeTab === 'admin' && (
            <>
              <h2>Create Employee User</h2>
              <form noValidate>
                
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={adminData.name}
                  onChange={(e) =>
                    setAdminData({ ...adminData, name: e.target.value })
                  }
                />
                {errors.name && <p className="error-text">{errors.name}</p>}

                
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter email"
                  value={adminData.email}
                  onChange={(e) =>
                    setAdminData({ ...adminData, email: e.target.value })
                  }
                  disabled={isCodeSent}
                />
                {errors.email && <p className="error-text">{errors.email}</p>}

                
                <label>Verification Code</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Enter verification code"
                    value={adminData.verication_code}
                    onChange={(e) =>
                      setAdminData({
                        ...adminData,
                        verication_code: e.target.value,
                      })
                    }
                  />

                  <button
                    type="button"
                    className="verification-btn"
                    onClick={handleSendCode}
                    disabled={isSendingCode || isCodeSent}
                  >
                    {isSendingCode ? 'Sending...' : isCodeSent ? '✓ Code Sent' : 'Send Verification Code'}
                  </button>
                </div>
                {errors.verication_code && <p className="error-text">{errors.verication_code}</p>}
                <div className="d-flex">
                  <div>
                    <label>Password</label>
                    <input
                      type="password"
                      placeholder="Enter password"
                      value={adminData.password}
                      onChange={(e) =>
                        setAdminData({ ...adminData, password: e.target.value })
                      }
                    />
                    {errors.password && <p className="error-text">{errors.password}</p>}
                  </div>

                  <div>
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      placeholder="Confirm password"
                      value={adminData.confirmPassword}
                      onChange={(e) =>
                        setAdminData({
                          ...adminData,
                          confirmPassword: e.target.value,
                        })
                      }
                    />
                    {errors.confirmPassword && (
                      <p className="error-text">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                
                <button
                  className="create-user-btn"
                  onClick={handleCreateUser}
                >
                  Create User
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;