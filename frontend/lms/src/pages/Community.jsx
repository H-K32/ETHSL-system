import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../api/client.js'
import '../styles/community.css'

export default function Community() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPost, setNewPost] = useState({ title: '', content: '' })
  const [submitting, setSubmitting] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportingUser, setReportingUser] = useState(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await api.get('/community/posts/')
      setPosts(response.data)
    } catch (err) {
      console.error('Error fetching posts:', err)
      setError('Failed to load community posts')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async (postId) => {
    try {
      const response = await api.get(`/community/comments/?post=${postId}`)
      setComments(response.data)
    } catch (err) {
      console.error('Error fetching comments:', err)
    }
  }

  const handleCreatePost = async (e) => {
    e.preventDefault()
    if (!newPost.title.trim() || !newPost.content.trim()) return

    try {
      setSubmitting(true)
      const response = await api.post('/community/posts/', {
        title: newPost.title,
        content: newPost.content
      })
      setPosts([response.data, ...posts])
      setNewPost({ title: '', content: '' })
      setShowCreateModal(false)
    } catch (err) {
      console.error('Error creating post:', err)
      alert('Failed to create post')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddComment = async (postId) => {
    if (!newComment.trim()) return

    try {
      const response = await api.post('/community/comments/', {
        post: postId,
        content: newComment
      })
      setComments([...comments, response.data])
      setNewComment('')
      
      // Update comment count in posts
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, comments: [...(post.comments || []), response.data] }
          : post
      ))
    } catch (err) {
      console.error('Error adding comment:', err)
      alert('Failed to add comment')
    }
  }

  const handleReportUser = async (reportedUser) => {
    if (!reportReason.trim()) return

    try {
      await api.post('/community/report/', {
        reported_user: reportedUser.id,
        reason: reportReason
      })
      alert('User reported successfully')
      setShowReportModal(false)
      setReportReason('')
      setReportingUser(null)
    } catch (err) {
      console.error('Error reporting user:', err)
      alert('Failed to report user')
    }
  }

  const openPostDetail = async (post) => {
    setSelectedPost(post)
    await fetchComments(post.id)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="community-loading">
        <div className="loading-spinner"></div>
        <p>Loading community...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="community-error">
        <p>{error}</p>
        <button onClick={fetchPosts} className="retry-btn">Try Again</button>
      </div>
    )
  }

  return (
    <div className="community-container">
      {/* Header */}
      <div className="community-header">
        <div>
          <h1 className="community-title">Community Hub</h1>
          <p className="community-subtitle">Connect, share, and learn together with fellow learners</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="new-post-btn">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Discussion
        </button>
      </div>

      {/* Posts Grid */}
      <div className="posts-grid">
        {posts.length === 0 ? (
          <div className="no-posts">
            <p>No posts yet. Be the first to start a discussion!</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="post-card" onClick={() => openPostDetail(post)}>
              <div className="post-header">
                <div className="post-author">
                  <div className="author-avatar">
                    {post.user?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="author-info">
                    <span className="author-name">{post.user?.username || 'Anonymous'}</span>
                    <span className="post-date">{formatDate(post.created_at)}</span>
                  </div>
                </div>
                {user && user.id !== post.user?.id && (
                  <button 
                    className="report-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      setReportingUser(post.user)
                      setShowReportModal(true)
                    }}
                  >
                    Report
                  </button>
                )}
              </div>
              <h3 className="post-title">{post.title || 'Untitled'}</h3>
              <p className="post-content">{post.content}</p>
              <div className="post-footer">
                <div className="post-stats">
                  <span>💬 {post.comments?.length || 0} comments</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Discussion</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreatePost}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="What's your question or topic?"
                  required
                />
              </div>
              <div className="form-group">
                <label>Content</label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Share your thoughts, questions, or insights..."
                  rows={6}
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? 'Posting...' : 'Post Discussion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="modal-overlay" onClick={() => setSelectedPost(null)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedPost.title || 'Discussion'}</h2>
              <button className="modal-close" onClick={() => setSelectedPost(null)}>×</button>
            </div>
            
            <div className="post-detail">
              <div className="post-author-large">
                <div className="author-avatar large">
                  {selectedPost.user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="author-name">{selectedPost.user?.username || 'Anonymous'}</div>
                  <div className="post-date">{formatDate(selectedPost.created_at)}</div>
                </div>
              </div>
              <p className="post-content-large">{selectedPost.content}</p>
            </div>

            <div className="comments-section">
              <h3>Comments ({comments.length})</h3>
              <div className="comments-list">
                {comments.map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-header">
                      <div className="comment-author">
                        <div className="author-avatar small">
                          {comment.user?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span className="author-name">{comment.user?.username || 'Anonymous'}</span>
                        <span className="comment-date">{formatDate(comment.created_at)}</span>
                      </div>
                      {user && user.id !== comment.user?.id && (
                        <button 
                          className="report-small-btn"
                          onClick={() => {
                            setReportingUser(comment.user)
                            setShowReportModal(true)
                          }}
                        >
                          Report
                        </button>
                      )}
                    </div>
                    <p className="comment-content">{comment.content}</p>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className="no-comments">No comments yet. Be the first to reply!</p>
                )}
              </div>

              <div className="add-comment">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  rows={3}
                />
                <button onClick={() => handleAddComment(selectedPost.id)} className="submit-comment-btn">
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Report User</h2>
              <button className="modal-close" onClick={() => setShowReportModal(false)}>×</button>
            </div>
            <div className="form-group">
              <label>Reason for reporting {reportingUser?.username}</label>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Please explain why you are reporting this user..."
                rows={4}
                required
              />
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowReportModal(false)}>Cancel</button>
              <button 
                className="submit-btn report" 
                onClick={() => handleReportUser(reportingUser)}
                disabled={!reportReason.trim()}
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}