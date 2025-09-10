import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, Trash2 } from 'lucide-react';
import { AppContext } from '../context/AppContext.jsx';
import { AppConstants } from '../util/constants.js';
import avatarFallback from '../assets/img/avatarfallback.png';
import imageFallback from '../assets/img/imagefallback.jpg';
import DeleteConfirmModal from './DeleteConfirmModal.jsx';
import './Post.css';

const Post = ({ post, currentUserId, onPostDeleted }) => {
  const { api, isLoggedIn } = useContext(AppContext);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [isSaved, setIsSaved] = useState(false);
  const [saveCount, setSaveCount] = useState(post.saveCount || 0);
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [openCommentMenuId, setOpenCommentMenuId] = useState(null);

  useEffect(() => {
    setLikeCount(post.likeCount || 0);
    setIsLiked(post.isLikedByCurrentUser ?? false);
    setSaveCount(post.saveCount || 0);
    setIsSaved(post.isSavedByCurrentUser ?? false);
    setComments(post.comments || []);
  }, [post.postId, post.likeCount, post.isLikedByCurrentUser, post.saveCount, post.isSavedByCurrentUser, post.comments]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && !event.target.closest('.post-menu-container')) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleLike = async () => {
    try {
      if (isLiked) {
        await api.post(`/posts/${post.postId}/unlike`);
        setLikeCount(prev => Math.max(0, prev - 1));
        setIsLiked(false);
      } else {
        await api.post(`/posts/${post.postId}/like`);
        setLikeCount(prev => prev + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error handling like:', error);
      if (isLiked) {
        setLikeCount(prev => prev + 1);
        setIsLiked(true);
      } else {
        setLikeCount(prev => Math.max(0, prev - 1));
        setIsLiked(false);
      }
    }
  };

  const handleSave = async () => {
    try {
      if (isSaved) {
        await api.post(`/posts/${post.postId}/unsave`);
        setSaveCount(prev => Math.max(0, prev - 1));
        setIsSaved(false);
      } else {
        await api.post(`/posts/${post.postId}/save`);
        setSaveCount(prev => prev + 1);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error handling save:', error);
      if (isSaved) {
        setSaveCount(prev => prev + 1);
        setIsSaved(true);
      } else {
        setSaveCount(prev => Math.max(0, prev - 1));
        setIsSaved(false);
      }
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await api.post(`/posts/${post.postId}/comments`, {
        content: newComment
      });
      
      setComments(prev => [response.data, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      setDeletingCommentId(commentId);
      await api.delete(`/posts/comments/${commentId}`);
      setComments(prev => prev.filter(c => c.commentId !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment.');
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleDelete = async () => {
    if (!isLoggedIn) {
      alert('Please log in to delete posts.');
      return;
    }
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/posts/${post.postId}`);
      if (onPostDeleted) {
        onPostDeleted(post.postId);
      }
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting post:', error);
      
      // Better error handling
      if (error.response?.status === 401) {
        alert('You are not authorized to delete this post. Please log in again.');
      } else if (error.response?.status === 403) {
        alert('You can only delete your own posts.');
      } else if (error.response?.status === 404) {
        alert('Post not found. It may have been already deleted.');
      } else {
        alert('Failed to delete post. Please try again.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setShowMenu(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const isPostOwner = currentUserId === post.userId && isLoggedIn;

  return (
    <div className="post">
      <div className="post-header">
        <div className="post-user-info">
          <Link to={`/user/${post.username}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <img 
              src={post.userAvatar && post.userAvatar.trim() !== "" ? 
                  `${AppConstants.getBaseUrl()}${post.userAvatar}` : 
                  avatarFallback} 
              alt={post.username}
              className="post-avatar"
            />
          </Link>
          <div className="post-user-details">
            <Link to={`/user/${post.username}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <span className="post-username">{post.username}</span>
            </Link>
            {post.location && <span className="post-location">{post.location}</span>}
          </div>
        </div>
        <div className="post-header-right">
          <span className="post-time">{formatDate(post.createdAt)}</span>
          {isPostOwner && (
            <div className="post-menu-container">
              <button 
                className="post-menu-button"
                onClick={() => setShowMenu(!showMenu)}
                disabled={isDeleting}
              >
                <MoreHorizontal size={20} />
              </button>
              {showMenu && (
                <div className="post-menu-dropdown">
                  <button 
                    className="post-menu-item delete-item"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    <Trash2 size={16} />
                    {isDeleting ? 'Deleting...' : 'Delete Post'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {post.imageUrl && (
        <div className="post-image-container">
          <img 
            src={post.imageUrl && post.imageUrl.trim() !== "" ? 
                `${AppConstants.getBaseUrl()}${post.imageUrl}` : 
                imageFallback} 
            alt="Post" 
            className="post-image" 
          />
        </div>
      )}

      <div className="post-actions">
        <div className="post-action-buttons">
          <button 
            className={`like-button ${isLiked ? 'liked' : ''}`}
            onClick={handleLike}
          >
            <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
          </button>
          <button 
            className="action-button"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle size={24} />
          </button>
          <button className="action-button">
            <Share size={24} />
          </button>
        </div>
        <button 
          className={`save-button ${isSaved ? 'saved' : ''}`}
          onClick={handleSave}
        >
          <Bookmark size={24} fill={isSaved ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="post-stats">
        <span className="post-likes">{likeCount} likes</span>
        {saveCount > 0 && <span className="post-saves">{saveCount} saves</span>}
        {post.commentCount > 0 && (
          <span 
            className="post-comments"
            onClick={() => setShowComments(!showComments)}
            style={{ cursor: 'pointer' }}
          >
            View all {post.commentCount} comments
          </span>
        )}
      </div>

      {post.caption && (
        <div className="post-caption">
          <Link to={`/user/${post.username}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="post-username">{post.username}</span>
          </Link>
          <span className="post-caption-text">{post.caption}</span>
        </div>
      )}

      {showComments && (
        <div className="post-comments-section">
          <form onSubmit={handleComment} className="comment-form">
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="comment-input"
            />
            <button type="submit" className="comment-submit" disabled={!newComment.trim()}>
              Post
            </button>
          </form>
          
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.commentId} className="comment">
                <img 
                  src={comment.userAvatar && comment.userAvatar.trim() !== "" ? 
                      `${AppConstants.getBaseUrl()}${comment.userAvatar}` : 
                      avatarFallback} 
                  alt={comment.username}
                  className="comment-avatar"
                />
                <div className="comment-content">
                  <span className="comment-username">{comment.username}</span>
                  <span className="comment-text">{comment.content}</span>
                  <div className="comment-actions">
                    <span className="comment-time">{formatDate(comment.createdAt)}</span>
                    {currentUserId === comment.userId && (
                      <div className="comment-menu-container">
                        <button
                          className="comment-menu-button"
                          onClick={() => setOpenCommentMenuId(openCommentMenuId === comment.commentId ? null : comment.commentId)}
                          aria-label="Comment menu"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        {openCommentMenuId === comment.commentId && (
                          <div className="comment-menu-dropdown">
                            <button
                              className="comment-menu-item"
                              onClick={() => handleDeleteComment(comment.commentId)}
                              disabled={deletingCommentId === comment.commentId}
                            >
                              {deletingCommentId === comment.commentId ? 'Deleting…' : 'Delete Comment'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {post.tags && (
        <div className="post-tags">
          {post.tags.split(',').map((tag, index) => (
            <span key={index} className="post-tag">#{tag.trim()}</span>
          ))}
        </div>
      )}

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
      />
    </div>
  );
};

export default Post;

