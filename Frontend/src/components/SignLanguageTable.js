import React, { useEffect, useState } from "react";
import "./SignLanguageTable.css";
import axios from "axios";
import AddSignForm from "./AddSignForm";

const SignLanguageTable = ({ isDarkMode }) => {
  const [signs, setSigns] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch all signs
  const fetchAllSigns = async () => {
    try {
      const response = await axios.get("/api/signs");
      return response.data;
    } catch (err) {
      throw new Error("Failed to fetch signs");
    }
  };

  // Function to fetch common signs
  const fetchCommonSigns = async () => {
    try {
      const response = await axios.get("/api/signs/iscommon");
      return response.data;
    } catch (err) {
      throw new Error("Failed to fetch common signs");
    }
  };

  // Function to refresh signs after adding a new one
  const refreshSigns = async () => {
    try {
      setLoading(true);
      if (searchTerm.trim()) {
        const allSigns = await fetchAllSigns();
        setSigns(allSigns);
      } else {
        const commonSigns = await fetchCommonSigns();
        setSigns(commonSigns);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load - get only common signs
    refreshSigns();
  }, []);

  useEffect(() => {
    // Handle search - when search term exists, get all signs and filter
    const handleSearch = async () => {
      try {
        refreshSigns();
      } catch (err) {
        setError(err.message);
      }
    };

    // Debounce the search to avoid too many API calls
    const timeoutId = setTimeout(handleSearch, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Filter the signs based on search term
  const filteredSigns = signs.filter((sign) =>
    sign.translation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="table-container">
      <AddSignForm onSignAdded={refreshSigns} />
      
      <div className="search-container">
        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="search-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24"
              viewBox="0 0 24 24"
              width="24"
            >
              <path d="M0 0h24v24H0z" fill="none"></path>
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
            </svg>
          </div>
        </div>
        <div className="glow"></div>
      </div>

      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">Error: {error}</div>}

      <table className="table">
        <thead>
          <tr>
            <th>الصورة</th>
            <th>الترجمة</th>
          </tr>
        </thead>
        <tbody>
          {filteredSigns.map((sign) => (
            <tr
              key={sign._id}
              className={`${isDarkMode ? "dark-mode-row" : ""}`}
            >
              <td>
                <img
                  src={`/uploads/${sign.image}`}
                  width="200"
                  alt={sign.translation}
                />
              </td>
              <td>{sign.translation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SignLanguageTable;