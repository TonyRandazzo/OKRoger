import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    setIsAuthenticated(!!token);
    setUserType(userType || '');
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleHomeLinkClick = () => {
    if (isAuthenticated) {
      navigate('/home');
    } else {
      alert("Please login or register first.");
    }
  };



  return (
    <header>
      <nav>
        <Link to="/home" className="home-link" onClick={handleHomeLinkClick}>OKRoger</Link>
        <div className="menu">
          <div className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={toggleMenu}>
            {menuOpen ? '✕' : '☰'}
          </div>
          <div className={`menu-items ${menuOpen ? 'open' : ''}`}>
            <Link to="/" onClick={toggleMenu}>Login/Register</Link>
            {isAuthenticated && (
              <Link to="/profile" onClick={toggleMenu}>User Profile</Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
