import React, { useState } from 'react';
import { Comment, BlogSettings } from '../types/blog';
import { MessageSquare, Send, Heart, User, CheckCircle2, Clock } from 'lucide-react';

interface CommentsSectionProps {
  postId: string;
  postTitle: string;
  comments: Comment[];
  settings: BlogSettings;
  onAddComment: (commentData: { authorName: string; authorEmail: string; comment: string }) => Promise<void>;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  postId: _postId,
  postTitle: _postTitle,
  comments,
  settings,
  onAddComment,
}) => {
  const [authorName, setAuthorName] = useState(() => {
    return localStorage.getItem('inksheet_commenter_name') || '';
  });
  const [authorEmail, setAuthorEmail] = useState(() => {
    return localStorage.getItem('inksheet_commenter_email') || '';
  });
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentLikes, setCommentLikes] = useState<Record<string, number>>({});
  const [justSubmitted, setJustSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !authorName.trim()) return;

    setIsSubmitting(true);
    try {
      // Save name & email for next time
      localStorage.setItem('inksheet_commenter_name', authorName.trim());
      if (authorEmail.trim()) {
        localStorage.setItem('inksheet_commenter_email', authorEmail.trim());
      }

      await onAddComment({
        authorName: authorName.trim(),
        authorEmail: authorEmail.trim(),
        comment: commentText.trim(),
      });

      setCommentText('');
      setJustSubmitted(true);
      setTimeout(() => setJustSubmitted(false), 4000);
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = (commentId: string) => {
    setCommentLikes(prev => ({
      ...prev,
      [commentId]: (prev[commentId] || 0) + 1
    }));
  };

  const formatCommentDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <section className="mt-12 pt-10 border-t border-stone-200" id="comments">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2.5">
          <MessageSquare className="w-5 h-5 text-stone-700" />
          <h3 className="text-xl font-bold font-sans text-stone-900 tracking-tight">
            Discussion ({comments.length})
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-stone-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>
            {settings.spreadsheetId ? 'Saved to Google Sheets' : 'Active Discussion'}
          </span>
        </div>
      </div>

      {/* Success Notification */}
      {justSubmitted && (
        <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Your comment was posted and recorded to the backend!</span>
        </div>
      )}

      {/* New Comment Form */}
      <form onSubmit={handleSubmit} className="mb-10 bg-white border border-stone-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-[11px] font-semibold text-stone-600 uppercase tracking-wider mb-1">
              Your Name *
            </label>
            <input
              type="text"
              required
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="e.g. Maya Lindqvist"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:bg-white transition-all font-sans"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-stone-600 uppercase tracking-wider mb-1">
              Email (Optional, not displayed)
            </label>
            <input
              type="email"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              placeholder="maya@example.com"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:bg-white transition-all font-sans"
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-[11px] font-semibold text-stone-600 uppercase tracking-wider mb-1">
            Write a comment *
          </label>
          <textarea
            required
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Share your perspective or ask a question..."
            className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:bg-white transition-all font-sans resize-y"
          ></textarea>
        </div>

        <div className="flex items-center justify-between pt-1">
          <p className="text-[11px] text-stone-400">
            Comments are synced to the publication's Google Sheet backend.
          </p>
          <button
            type="submit"
            disabled={isSubmitting || !commentText.trim() || !authorName.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Posting...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Post Comment</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-12 px-4 bg-stone-50 rounded-xl border border-dashed border-stone-200">
            <MessageSquare className="w-8 h-8 text-stone-300 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-stone-700 font-sans">No comments yet</h4>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              Be the first to share your perspective on this essay. Leave a thought using the form above.
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white p-4 sm:p-5 rounded-xl border border-stone-200/90 shadow-2xs hover:border-stone-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-xs font-bold text-stone-700">
                    {comment.authorName ? comment.authorName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-stone-900 font-sans">
                      {comment.authorName}
                    </h5>
                    <p className="text-[11px] text-stone-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatCommentDate(comment.createdAt)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleLikeComment(comment.id)}
                  className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-stone-50 cursor-pointer"
                  title="Like comment"
                >
                  <Heart className="w-3.5 h-3.5" />
                  <span>{commentLikes[comment.id] || 0}</span>
                </button>
              </div>

              <div className="pl-10 text-xs sm:text-sm text-stone-700 leading-relaxed font-sans whitespace-pre-wrap">
                {comment.comment}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};
