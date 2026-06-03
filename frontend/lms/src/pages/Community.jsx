import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import api from '../api/client.js'
import { moderateContent } from '../api/lms.js'
import '../styles/community.css'

const HOURS_48 = 48 * 60 * 60 * 1000

function canEdit(createdAt) {
  return Date.now() - new Date(createdAt).getTime() < HOURS_48
}

export default function Community() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // toast notifications
  const [toasts, setToasts] = useState([])
  const notify = useCallback((text, type = 'error') => {
    const id = Date.now()
    setToasts(ts => [...ts, { id, text, type }])
    setTimeout(() => setToasts(ts => ts.filter(x => x.id !== id)), 4000)
  }, [])

  // create post
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPost, setNewPost] = useState({ title: '', content: '' })
  const [submitting, setSubmitting] = useState(false)

  // post detail
  const [selectedPost, setSelectedPost] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [commentError, setCommentError] = useState('')

  // edit post
  const [editingPost, setEditingPost] = useState(null)
  const [editForm, setEditForm] = useState({ title: '', content: '' })

  // delete confirmation modal
  const [deleteTarget, setDeleteTarget] = useState(null)

  // report
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportingUserId, setReportingUserId] = useState(null)
  const [reportingUsername, setReportingUsername] = useState('')
  const [reportSubmitting, setReportSubmitting] = useState(false)
  const [showReportSuccess, setShowReportSuccess] = useState(false)

  // reports against me
  const [reportsAgainstMe, setReportsAgainstMe] = useState([])
  const [showReportsAgainstMe, setShowReportsAgainstMe] = useState(false)

  useEffect(() => { fetchPosts() }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const res = await api.get('/community/posts/')
      setPosts(res.data)
    } catch {
      setError(t('failedToLoadPosts'))
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async (postId) => {
    try {
      const res = await api.get(`/community/comments/?post=${postId}`)
      setComments(res.data)
    } catch {}
  }

  const fetchReportsAgainstMe = async () => {
    try {
      const res = await api.get('/community/reports-against-me/')
      setReportsAgainstMe(res.data)
      setShowReportsAgainstMe(true)
    } catch {}
  }

  const handleCreatePost = async (e) => {
    e.preventDefault()
    if (!newPost.title.trim() || !newPost.content.trim()) return
    try {
      setSubmitting(true)
      try {
        const result = await moderateContent(`${newPost.title} ${newPost.content}`)
        if (result.flagged) {
          notify(t('postFlagged'))
          return
        }
      } catch {
        // moderation unavailable — allow post through
      }
      const res = await api.post('/community/posts/', newPost)
      setPosts([res.data, ...posts])
      setNewPost({ title: '', content: '' })
      setShowCreateModal(false)
      notify(t('postSuccess'), 'success')
    } catch {
      notify(t('postFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditPost = async (e) => {
    e.preventDefault()
    if (!editForm.title.trim() || !editForm.content.trim()) return
    if (!canEdit(editingPost.created_at)) {
      notify(t('postTooOld'))
      setEditingPost(null)
      return
    }
    try {
      const res = await api.patch(`/community/posts/${editingPost.id}/`, editForm)
      setPosts(posts.map(p => p.id === editingPost.id ? res.data : p))
      if (selectedPost?.id === editingPost.id) setSelectedPost(res.data)
      setEditingPost(null)
      notify(t('postUpdated'), 'success')
    } catch (err) {
      notify(err?.response?.data?.detail || t('postEditFailed'))
    }
  }

  const requestDeletePost = (post, e) => {
    e.stopPropagation()
    if (!canEdit(post.created_at)) {
      notify(t('postTooOld'))
      return
    }
    setDeleteTarget(post)
  }

  const confirmDeletePost = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`/community/posts/${deleteTarget.id}/`)
      setPosts(posts.filter(p => p.id !== deleteTarget.id))
      if (selectedPost?.id === deleteTarget.id) setSelectedPost(null)
      notify(t('postDeleted'), 'success')
    } catch (err) {
      notify(err?.response?.data?.detail || t('postDeleteFailed'))
    } finally {
      setDeleteTarget(null)
    }
  }

  const handleAddComment = async (postId) => {
    if (!newComment.trim()) {
      setCommentError(t('replyEmpty'))
      return
    }
    setCommentError('')
    try {
      try {
        const result = await moderateContent(newComment)
        if (result.flagged) {
          setCommentError(t('replyFlagged'))
          return
        }
      } catch {
        // moderation unavailable — allow comment through
      }
      const res = await api.post('/community/comments/', { post: postId, content: newComment })
      setComments([...comments, res.data])
      setNewComment('')
      setPosts(posts.map(p => p.id === postId ? { ...p, replies: (p.replies || 0) + 1 } : p))
    } catch {
      notify(t('commentFailed'))
    }
  }

  const handleReportUser = async () => {
    if (!reportReason.trim() || !reportingUserId) return
    try {
      setReportSubmitting(true)
      await api.post('/community/report/', { reported_user: reportingUserId, reason: reportReason })
      setShowReportModal(false)
      setReportReason('')
      setReportingUserId(null)
      setReportingUsername('')
      setShowReportSuccess(true)
    } catch (err) {
      const msg = err.response?.data ? Object.values(err.response.data).flat().join(', ') : t('reportFailed')
      notify(msg)
    } finally {
      setReportSubmitting(false)
    }
  }

  const openPostDetail = async (post) => {
    setSelectedPost(post)
    setCommentError('')
    setNewComment('')
    await fetchComments(post.id)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const diffMs = Date.now() - date.getTime()
    const mins = Math.floor(diffMs / 60000)
    const hours = Math.floor(diffMs / 3600000)
    const days = Math.floor(diffMs / 86400000)
    if (mins < 1) return t('justNow')
    if (mins < 60) return `${mins}m ${t('minutesAgo')}`
    if (hours < 24) return `${hours}h ${t('hoursAgo')}`
    if (days < 7) return `${days}d ${t('daysAgo')}`
    return date.toLocaleDateString()
  }

  if (loading) return (
    <div className="community-loading">
      <div className="loading-spinner"></div>
      <p>{t('loading')}</p>
    </div>
  )

  if (error) return (
    <div className="community-error">
      <p>{error}</p>
      <button onClick={fetchPosts} className="retry-btn">{t('retry')}</button>
    </div>
  )

  return (
    <div className="community-container">

      {/* Toast Notifications */}
      <div className="community-toasts">
        {toasts.map(toast => (
          <div key={toast.id} className={`community-toast community-toast--${toast.type}`}>
            {toast.type === 'success' ? '✓' : '✕'} {toast.text}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="community-header">
        <div>
          <h1 className="community-title">{t('communityHub')}</h1>
          <p className="community-subtitle">{t('connectShareLearn')}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button onClick={fetchReportsAgainstMe} className="retry-btn" style={{ marginTop: 0 }}>
            {t('reportsAgainstMe')}
          </button>
          <button onClick={() => setShowCreateModal(true)} className="new-post-btn">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('newDiscussion')}
          </button>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="posts-grid">
        {posts.length === 0 ? (
          <div className="no-posts"><p>{t('noPostsYet')}</p></div>
        ) : (
          posts.map((post) => {
            const isOwner = user && Number(user.id) === Number(post.user)
            const editable = canEdit(post.created_at)
            return (
              <div key={post.id} className="post-card" onClick={() => openPostDetail(post)}>
                <div className="post-header">
                  <div className="post-author">
                    <div className="author-avatar">
                      {post.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="author-info">
                      <span className="author-name">{post.username || t('anonymous')}</span>
                      <span className="post-date">{formatDate(post.created_at)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }} onClick={e => e.stopPropagation()}>
                    {isOwner && (
                      <>
                        <button
                          className="report-btn"
                          title={!editable ? t('postTooOld') : t('edit')}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (!editable) { notify(t('postTooOld')); return }
                            setEditingPost(post)
                            setEditForm({ title: post.title || '', content: post.content })
                          }}
                        >{t('edit')}</button>
                        <button
                          className="report-btn"
                          title={!editable ? t('postTooOld') : t('delete')}
                          style={{ color: editable ? 'var(--color-sienna-600)' : undefined }}
                          onClick={(e) => requestDeletePost(post, e)}
                        >{t('delete')}</button>
                      </>
                    )}
                    {!isOwner && (
                      <button className="report-btn" onClick={() => { setReportingUserId(post.user); setReportingUsername(post.username || t('thisUser')); setShowReportModal(true) }}>{t('report')}</button>
                    )}
                  </div>
                </div>
                <h3 className="post-title">{post.title || t('untitled')}</h3>
                <p className="post-content">{post.content}</p>
                <div className="post-footer">
                  <div className="post-stats">💬 {post.replies || 0} {t('comments')}</div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-content delete-confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="delete-confirm-icon">🗑️</div>
            <h2 className="delete-confirm-title">{t('deleteDiscussion')}</h2>
            <p className="delete-confirm-message">{t('deleteConfirmMsg')}</p>
            <div className="delete-confirm-actions">
              <button className="cancel-btn" onClick={() => setDeleteTarget(null)}>{t('cancel')}</button>
              <button className="submit-btn delete-btn" onClick={confirmDeletePost}>{t('delete')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('createDiscussion')}</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreatePost}>
              <div className="form-group">
                <label>{t('title')}</label>
                <input type="text" value={newPost.title} onChange={e => setNewPost({ ...newPost, title: e.target.value })} placeholder={t('discussionTitlePlaceholder')} required />
              </div>
              <div className="form-group">
                <label>{t('content')}</label>
                <textarea value={newPost.content} onChange={e => setNewPost({ ...newPost, content: e.target.value })} placeholder={t('discussionContentPlaceholder')} rows={6} required />
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setShowCreateModal(false)}>{t('cancel')}</button>
                <button type="submit" className="submit-btn" disabled={submitting}>{submitting ? t('posting') : t('post')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {editingPost && (
        <div className="modal-overlay" onClick={() => setEditingPost(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('editDiscussion')}</h2>
              <button className="modal-close" onClick={() => setEditingPost(null)}>×</button>
            </div>
            <form onSubmit={handleEditPost}>
              <div className="form-group">
                <label>{t('title')}</label>
                <input type="text" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>{t('content')}</label>
                <textarea value={editForm.content} onChange={e => setEditForm({ ...editForm, content: e.target.value })} rows={6} required />
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setEditingPost(null)}>{t('cancel')}</button>
                <button type="submit" className="submit-btn">{t('save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="modal-overlay" onClick={() => setSelectedPost(null)}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedPost.title || t('discussion')}</h2>
              <button className="modal-close" onClick={() => setSelectedPost(null)}>×</button>
            </div>
            <div className="post-detail">
              <div className="post-author-large">
                <div className="author-avatar large">{selectedPost.username?.[0]?.toUpperCase() || 'U'}</div>
                <div>
                  <div className="author-name">{selectedPost.username || t('anonymous')}</div>
                  <div className="post-date">{formatDate(selectedPost.created_at)}</div>
                </div>
              </div>
              <p className="post-content-large">{selectedPost.content}</p>
            </div>
            <div className="comments-section">
              <h3>{t('comments')} ({comments.length})</h3>
              <div className="comments-list">
                {comments.map(comment => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-header">
                      <div className="comment-author">
                        <div className="author-avatar small">{comment.username?.[0]?.toUpperCase() || 'U'}</div>
                        <span className="author-name">{comment.username || t('anonymous')}</span>
                        <span className="comment-date">{formatDate(comment.created_at)}</span>
                      </div>
                      {user && Number(user.id) !== Number(comment.user) && (
                        <button className="report-small-btn" onClick={() => { setReportingUserId(comment.user); setReportingUsername(comment.username || t('thisUser')); setShowReportModal(true) }}>{t('report')}</button>
                      )}
                    </div>
                    <p className="comment-content">{comment.content}</p>
                  </div>
                ))}
                {comments.length === 0 && <p className="no-comments">{t('noCommentsYet')}</p>}
              </div>
              <div className="add-comment">
                <textarea value={newComment} onChange={e => { setNewComment(e.target.value); setCommentError('') }} placeholder={t('writeReply')} rows={3} />
                {commentError && <p style={{ color: 'var(--color-sienna-600)', fontSize: '0.8rem', margin: '0' }}>{commentError}</p>}
                <button onClick={() => handleAddComment(selectedPost.id)} className="submit-comment-btn">{t('postReply')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('reportUser')}</h2>
              <button className="modal-close" onClick={() => setShowReportModal(false)}>×</button>
            </div>
            <div className="form-group">
              <label>{t('reportReasonLabel')} <strong>{reportingUsername}</strong></label>
              <textarea value={reportReason} onChange={e => setReportReason(e.target.value)} placeholder={t('reportPlaceholder')} rows={4} />
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => { setShowReportModal(false); setReportReason(''); setReportingUserId(null); setReportingUsername('') }}>{t('cancel')}</button>
              <button className="submit-btn report" onClick={handleReportUser} disabled={!reportReason.trim() || reportSubmitting}>
                {reportSubmitting ? t('submitting') : t('submitReport')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Success Modal */}
      {showReportSuccess && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '360px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: 'var(--color-forest-900)', marginBottom: '0.5rem' }}>{t('reported')}</h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--color-forest-600)', marginBottom: '1.5rem' }}>{t('reportedSuccess')}</p>
            <button className="submit-btn" style={{ width: '100%' }} onClick={() => setShowReportSuccess(false)}>{t('ok')}</button>
          </div>
        </div>
      )}

      {/* Reports Against Me Modal */}
      {showReportsAgainstMe && (
        <div className="modal-overlay" onClick={() => setShowReportsAgainstMe(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('reportsAgainstYou')}</h2>
              <button className="modal-close" onClick={() => setShowReportsAgainstMe(false)}>×</button>
            </div>
            {reportsAgainstMe.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-forest-600)', padding: '1rem 0' }}>{t('noReportsAgainstYou')}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.5rem 0' }}>
                {reportsAgainstMe.map((r, i) => (
                  <div key={i} className="comment-item">
                    <p className="comment-content">{r.reason}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="modal-footer">
              <button className="submit-btn" onClick={() => setShowReportsAgainstMe(false)}>{t('close')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
