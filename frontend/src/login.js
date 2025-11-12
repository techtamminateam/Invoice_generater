import React, { useState } from 'react';
import './login.css';
import loginImage from './assets/newbg.png';
import Logo from './assets/tammina-blue-logo.svg';
import { createUser, loginUser } from './apiService'; // ✅ import both

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
    role: 'Employee', // ✅ always Employee since Admin creates Employees
  });

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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (activeTab === 'employee') {
      // ✅ Employee Login
      try {
        const user = await loginUser(email, password);
        if (user) {
          alert(`✅ Welcome ${user.name || 'Employee'}!`);
        localStorage.setItem('loggedInUser', JSON.stringify(user));
          onLoginSuccess(user); // you can navigate or save user data here
        }
      } catch (error) {
        alert('❌ Invalid email or password');
      }
    } else {
      // 🟢 Admin creating new Employee
      try {
        const result = await createUser({
          name: adminData.name,
          email: adminData.email,
          password: adminData.password,
          role: 'Employee',
        });

        alert('✅ Employee created successfully!');
        console.log('Created user:', result);
       
        // Reset form
        setAdminData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'Employee',
        });

        // Switch back to Employee tab automatically
        setActiveTab('employee');
      } catch (error) {
        alert('❌ Failed to create user. Please try again.');
      }
    }
  };

  return (
    <div className="login-container">
      {/* Left side illustration */}
      <div className="login-left">
        <img src={loginImage} alt="Tech Tammina illustration" />
      </div>

      {/* Right side form */}
      <div className="login-right">
        <div className="login-box">
          <img src={Logo} alt="Tech Tammina Logo" className="logo" />

          {/* Tabs */}
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

          {/* Employee Login Form */}
          {activeTab === 'employee' && (
            <>
              <h2>Log into your account</h2>
              <form onSubmit={handleSubmit} noValidate>
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

          {/* Admin User Creation Form */}
          {activeTab === 'admin' && (
            <>
              <h2>Create Employee User</h2>
              <form onSubmit={handleSubmit} noValidate>
                <div class="d-flex">
                    <div>
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
                    </div>
                    <div>
                                 <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter email"
                  value={adminData.email}
                  onChange={(e) =>
                    setAdminData({ ...adminData, email: e.target.value })
                  }
                />
                {errors.email && <p className="error-text">{errors.email}</p>}
                    </div>
                </div>
              

       <div class="d-flex">
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



           

                <button type="submit">Create User</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
