import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = ({ isDarkMode, onToggleDarkMode }) => {
return (
    <footer className="footer">
    <div className="footer-content" id="footer">
        <p>&copy; {new Date().getFullYear()} Signify. All rights reserved.</p>
        <nav className="footer-nav">
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/privacy-policy">Privacy Policy</Link>
        </nav>
        
    </div>
    </footer>
);
};

export default Footer;