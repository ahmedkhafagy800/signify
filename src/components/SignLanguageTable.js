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
      
      <input
              type="text"
        className="search-input"
        placeholder="ابحث عن .."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

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
