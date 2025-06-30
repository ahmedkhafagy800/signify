  import React, { useState } from "react";
  import { Link , useLocation} from "react-router-dom";
  import logo from "../assets/signifybg.png";
  import "./Navbar.css";
  import Switch from "./Switch";
  const Navbar = ({ isDarkMode, onToggleDarkMode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    return (
      <nav className={`navbar ${isDarkMode ? 'dark-mode-navbar' : ''}`}>
        <div className="nav-logo">
          <Link to="/">
            <img src={logo} alt="Signify Logo" className="logo" />
          </Link>
          <Link to="/" className="brand-name hover-underline-animation right">
            Signify
          </Link>
        </div>

        <ul className={`nav-links   ${isOpen ? "open" : ""}`}>
        <li>
          <Link to="/dictionary"className={`hover-underline-animation right ${
              location.pathname === "/dictionary" ? "active-link" : ""
            }`}>
  <span className="text-container">
    <span className="text">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24"
                    height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-a"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" /><path d="m8 13 4-7 4 7" /><path d="M9.1 11h5.7" /></svg>
      القاموس
    </span>
  </span>
</Link>

        </li>
 <li>
          <Link to="/translatedvideos"className={`hover-underline-animation right ${
              location.pathname === "/translatedvideos" || location.pathname === "/" ?  "active-link" : ""
            }`}>
        <span className="text-container">
          <span className="text">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24"
                    height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-a"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" /><path d="m8 13 4-7 4 7" /><path d="M9.1 11h5.7" /></svg>
خدمات    </span>
  </span>
</Link>

        </li>
          <li >
            <Link to="/upload" className={`hover-underline-animation right ${
              location.pathname === "/upload" ? "active-link" : ""
            }`}>
              <span className="text-container">
              <span className="text">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-upload"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg> رفع فيديو
              </span>
            </span>
            </Link>
          </li>
          <li >
            <Link to="/live" className={`hover-underline-animation right ${
              location.pathname === "/live"?"active-link" : ""
            }`}>
              <span className="text-container">
  <span className="text">
                  <svg xmlns="http://www.w3.org/2000/svg"
                    width="24" height="24" viewBox="0 -2 24 24" fill="none"
                    stroke="currentColor" stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round" class="lucide lucide-camera">
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg> كاميرا مباشرة
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
