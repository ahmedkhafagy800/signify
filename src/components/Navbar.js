
  import React, { useState } from "react";
  import { Link } from "react-router-dom";
  import logo from "../assets/signifybg.png";

  import "./Navbar.css";

  const Navbar = () => {
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

      {/* Desktop Navigation */}
      <ul className={`nav-links ${isOpen ? "open" : ""}`}>
        <li>
          <Link to="/dictionary" className="dictionary-link">
            📖القاموس
          </Link>
        </li>
        <li>
            <Link to="/upload" className="dictionary-link">📤رفع فيديو</Link>
        </li>
        <li>
          <Link to="/live" className="dictionary-link">📷كاميرا مباشرة</Link>
        </li>
      </ul>

      {/* Styled Hamburger Icon (Mobile) */}
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
