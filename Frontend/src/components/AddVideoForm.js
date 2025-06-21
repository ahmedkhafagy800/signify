import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './AddVideoForm.css';

const AddVideoForm = ({ isDarkMode, onClose, onSuccess, videoToEdit }) => {
  const [formData, setFormData] = useState({
    title: '',
    place: '',
    videoUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const titleInputRef = useRef(null);
  
  const isEditing = !!videoToEdit;

  useEffect(() => {
    if (isEditing) {
      setFormData({
        title: videoToEdit.title,
        place: videoToEdit.place,
        videoUrl: videoToEdit.videoUrl,
      });
    }
    
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [videoToEdit, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.place || !formData.videoUrl) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      let response;
      if (isEditing) {
        response = await axios.put(`http://localhost:5000/api/videos/${videoToEdit._id}`, formData);
      } else {
        response = await axios.post('http://localhost:5000/api/videos', formData);
      }
      
      if (response.data.success) {
        onSuccess(response.data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || `حدث خطأ أثناء ${isEditing ? 'تعديل' : 'إضافة'} الفيديو`);
      console.error(`Error ${isEditing ? 'updating' : 'adding'} video:`, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`add-video-modal ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h2>{isEditing ? 'تعديل الفيديو' : 'إضافة فيديو جديد'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="add-video-form">
          <div className="form-group">
            <label htmlFor="title">عنوان الفيديو</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="أدخل عنوان الفيديو"
              required
              ref={titleInputRef}
            />
          </div>

          <div className="form-group">
            <label htmlFor="place">الفئة/المكان</label>
            <input
              type="text"
              id="place"
              name="place"
              value={formData.place}
              onChange={handleInputChange}
              placeholder="أدخل الفئة أو المكان"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="videoUrl">رابط الفيديو</label>
            <input
              type="url"
              id="videoUrl"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleInputChange}
              placeholder="أدخل رابط الفيديو"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={loading}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? (isEditing ? 'جاري التعديل...' : 'جاري الإضافة...') : (isEditing ? 'تعديل الفيديو' : 'إضافة الفيديو')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVideoForm; 