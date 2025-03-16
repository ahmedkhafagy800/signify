import React, { useState } from "react";
import axios from "axios";
import "./AddSignForm.css";

const AddSignForm = ({ onSignAdded }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    translation: "",
    iscommon: false,
    image: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === "file") {
      setFormData({
        ...formData,
        [name]: files[0]
      });
    } else if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Create FormData object to handle file upload
      const data = new FormData();
      data.append("translation", formData.translation);
      data.append("iscommon", formData.iscommon);
      if (formData.image) {
        data.append("image", formData.image);
      }

      // Send POST request to the backend
      const response = await axios.post("/api/signs", data, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      // Reset form
      setFormData({
        translation: "",
        iscommon: false,
        image: null
      });

      // Show success message
      setSuccess(true);
      
      // Call the callback function to refresh the signs list
      if (onSignAdded) {
        onSignAdded();
      }

      // Close modal after 2 seconds
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to add sign");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError(null);
    setSuccess(false);
  };

  return (
    <div className="add-sign-container">
      <button 
        className="add-sign-button" 
        onClick={() => setIsModalOpen(true)}
      >
        إضافة إشارة جديدة
      </button>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>إضافة إشارة جديدة</h2>
              <button className="close-button" onClick={closeModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="translation">الترجمة:</label>
                <input
                  type="text"
                  id="translation"
                  name="translation"
                  value={formData.translation}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group checkbox-group">
                <label htmlFor="iscommon">إشارة شائعة:</label>
                <input
                  type="checkbox"
                  id="iscommon"
                  name="iscommon"
                  checked={formData.iscommon}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="image">الصورة:</label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  required
                />
              </div>

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">تمت إضافة الإشارة بنجاح</div>}

              <button 
                type="submit" 
                className="submit-button" 
                disabled={loading}
              >
                {loading ? "جاري الإضافة..." : "إضافة"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddSignForm;