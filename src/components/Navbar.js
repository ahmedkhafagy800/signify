  // Navbar.js
  import React, { useState } from "react";
  import { Link } from "react-router-dom";
  import logo from "../assets/signifybg.png";
  import "./Navbar.css";
  import Switch from "./Switch";
  const Navbar = ({ isDarkMode, onToggleDarkMode }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <nav className="navbar">
        <div className="nav-logo">
          <Link to="/">
            <img src={logo} alt="Signify Logo" className="logo" />
          </Link>
          <Link to="/" className="brand-name">
            Signify
          </Link>
        </div>

        <ul className={`nav-links   ${isOpen ? "open" : ""}`}>
        <li>
          <Link to="/dictionary" className="btn-17">
            <span className="text-container">
                <span className="text">
    <i className="fas fa-book"></i> القاموس
                </span>
            </span>
          </Link>
        </li>

          <li >
            <Link to="/upload" className="btn-17 ">
              <span className="text-container">
              <span className="text">
                <i className="fas fa-upload"></i> رفع فيديو
              </span>
            </span>
            </Link>
          </li>
          <li >
            <Link to="/live" className="btn-17">
              <span className="text-container">
  <span className="text">
    <i className="fas fa-camera"></i> كاميرا مباشرة
  </span>
            </span>
            </Link>
          </li>

          <li >
            {/* <input class="l" type="checkbox" onClick={onToggleDarkMode}/> */}
            <Switch isDarkMode={isDarkMode} onToggle={onToggleDarkMode} />
            
          </li>
        </ul>

        <div
          className={`hamburger ${isOpen ? "active" : ""}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
      </nav>
    );
  };

  export default Navbar;
