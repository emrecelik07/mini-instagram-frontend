import React, { useState, useRef, useContext } from 'react';
import { Image, X, Loader2 } from 'lucide-react';
import { AppContext } from '../context/AppContext.jsx';
import { AppConstants } from '../util/constants.js';
import './CreatePost.css';

const CreatePost = ({ onPostCreated, onClose }) => {
  const { api } = useContext(AppContext);
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!imageFile) {
      alert('Please select an image');
      return;
    }

    setIsLoading(true);
    
    try {
      // First upload the image
      const formData = new FormData();
      formData.append('file', imageFile);
      
      const uploadResponse = await api.post('/users/avatar/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const imageUrl = uploadResponse.data.imageUrl;

      // Then create the post
      const postData = {
        caption: caption.trim(),
        imageUrl: imageUrl,
        isPrivate: isPrivate,
        location: location.trim(),
        tags: tags.trim()
      };

      const postResponse = await api.post('/posts', postData);
      const newPost = postResponse.data;
      
      onPostCreated(newPost);
      onClose();
      
      // Reset form
      setCaption('');
      setImageFile(null);
      setImagePreview('');
      setLocation('');
      setTags('');
      setIsPrivate(false);
      
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="create-post-overlay">
      <div className="create-post-modal">
        <div className="create-post-header">
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
          <h2>Create New Post</h2>
          <button 
            className="share-button" 
            onClick={handleSubmit}
            disabled={!imageFile || isLoading}
          >
            {isLoading ? <Loader2 size={20} className="spinner" /> : 'Share'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="create-post-form">
          <div className="image-upload-section">
            {!imagePreview ? (
              <div 
                className="image-upload-placeholder"
                onClick={() => fileInputRef.current?.click()}
              >
                <Image size={48} />
                <p>Click to select an image</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                />
              </div>
            ) : (
              <div className="image-preview-container">
                <img src={imagePreview} alt="Preview" className="image-preview" />
                <button 
                  type="button" 
                  className="remove-image-button"
                  onClick={removeImage}
                >
                  <X size={20} />
                </button>
              </div>
            )}
          </div>

          <div className="post-details-section">
            <div className="input-group">
              <label>Caption</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption..."
                maxLength={2200}
                rows={4}
              />
              <span className="character-count">{caption.length}/2200</span>
            </div>

            <div className="input-group">
              <label>Location (optional)</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add location"
              />
            </div>

            <div className="input-group">
              <label>Tags (optional)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Add tags separated by commas"
              />
            </div>

            <div className="input-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                />
                Make this post private
              </label>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;

