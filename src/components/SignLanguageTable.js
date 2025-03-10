import React, { useEffect, useState } from "react";
import signsData from "./signs.json";
import "./SignLanguageTable.css";
const SignLanguageTable = () => {
  const [signs, setSigns] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); 

  useEffect(() => {
    setSigns(signsData);
  }, []);

  
  const filteredSigns = signs.filter((sign) =>
    sign.translation.includes(searchTerm.toUpperCase())
  );

  return (
    <div className="table-container">
      
      {/* <input
              type="text"
        className="search-input"
        placeholder="ابحث عن .."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      /> */}

{/* <div class="search-container">
  <div class="search-bar">
    <input type="text" class="search-input" placeholder="Search..." />
    <div class="search-icon">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24"
        viewBox="0 0 24 24"
        width="24"
      >
        <path d="M0 0h24v24H0z" fill="none"></path>
        <path
          d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
        ></path>
      </svg>
    </div>
  </div>
  <div class="glow"></div>
</div> */}


<div class="input-container">
  <input
    class="input"
    name="text"
    type="text"
    placeholder="ابحث عن .."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
</div>

      <table className="table">
        <thead>
          <tr>
            <th>الصورة</th>
            <th>الترجمة</th>
          </tr>
        </thead>
        <tbody>
          {filteredSigns.map((sign) => (
            <tr key={sign.id}>
              <td>
                <img
                  src={process.env.PUBLIC_URL + sign.image}
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
