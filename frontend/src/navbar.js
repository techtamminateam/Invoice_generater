import React, { useEffect, useState } from 'react';
import './navbar.css';
import Logo from './assets/tammina-blue-logo.svg';

const Navbar = () => {
  const [activeUser, setActiveUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      setActiveUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    window.location.reload(); // reload back to login page
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src={Logo} alt="Tech Tammina Logo" className="navbar-logo" />
      </div>

      <div className="navbar-right">
        <span className="navbar-user">
          {activeUser ? `Welcome, ${activeUser.name}` : 'Employee Portal'}
        </span>
        {activeUser && (
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
