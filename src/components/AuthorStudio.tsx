import React, { useState, useMemo } from 'react';
import { Post, Comment, BlogSettings } from '../types/blog';
import { 
  PenSquare, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Heart, 
  MessageSquare, 
  Table, 
  Settings, 
  Trash2, 
  Edit3, 
  Eye, 
  Globe, 
  Search, 
  Sparkles,
  Lock,
  ArrowUpRight
} from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

interface AuthorStudioProps {
  settings: BlogSettings;
  posts: Post[];
  comments: Comment[];
  onNewPost: () => void;
  onEditPost: (post: Post) => void;
  onPreviewPost: (post: Post) => void;
  onDeletePost: (postId: string) => Promise<void>;
  onTogglePublishPost: (post: Post) => Promise<void>;
  onOpenSettings: () => void;
  onOpenGitHubPages: () => void;
  onSwitchToReaderView: () => void;
}

export const AuthorStudio: React.FC<AuthorStudioProps> = ({
  settings,
  posts,
  comments,
  onNewPost,
  onEditPost,
  onPreviewPost,
  onDeletePost,
  onTogglePublishPost,
  onOpenSettings,
  onOpenGitHubPages,
  onSwitchToReaderView,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);

  // Compute statistics
  const stats = useMemo(() => {
    const published = posts.filter(p => p.status === 'published').length;
    const drafts = posts.filter(p => p.status === 'draft').length;
    const totalLikes = posts.reduce((sum, p) => sum + (p.likesCount || 0), 0);
    return {
      total: posts.length,
      published,
      drafts,
      totalLikes,
      totalComments: comments.length
    };
  }, [posts, comments]);

  // Filter posts based on status and search query
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      if (filterStatus === 'published' && post.status !== 'published') return false;
      if (filterStatus === 'draft' && post.status !== 'draft') return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = post.title.toLowerCase().includes(q);
        const matchesSubtitle = post.subtitle?.toLowerCase().includes(q);
        const matchesTags = post.tags?.some(t => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesSubtitle && !matchesTags) return false;
      }
      return true;
    });
  }, [posts, filterStatus, searchTerm]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 font-sans pb-24">
      {/* Author Studio Hero / Masthead */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-stone-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-600 text-white font-serif font-black text-2xl flex items-center justify-center shadow-xs">
              I
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Author Studio Active
                </span>
                <span className="text-xs text-stone-400">•</span>
                <span className="text-xs text-stone-500 font-medium">
                  {settings.appsScriptUrl ? 'Google Sheets Sync Enabled' : 'Local Storage Mode'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight leading-tight">
                {settings.publicationName} CMS
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                Manage your articles, edit drafts, and monitor reader comments.
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={onNewPost}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <PenSquare className="w-4 h-4" />
              <span>Write New Article</span>
            </button>

            <button
              type="button"
              onClick={onSwitchToReaderView}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer border border-stone-200"
              title="Preview publication as a reader"
            >
              <Globe className="w-4 h-4" />
              <span>Reader View</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
              Published Posts
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-serif text-stone-900">{stats.published}</span>
              <span className="text-[11px] text-stone-500">of {stats.total} total</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
              Active Drafts
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-serif text-stone-900">{stats.drafts}</span>
              <span className="text-[11px] text-amber-700 font-medium">in progress</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
              Reader Comments
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-serif text-stone-900">{stats.totalComments}</span>
              <span className="text-[11px] text-emerald-700 font-medium">on Google Sheets</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
              Total Claps / Likes
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-serif text-stone-900">{stats.totalLikes}</span>
              <span className="text-[11px] text-red-600 font-medium">reactions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Articles ({stats.total})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('published')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filterStatus === 'published'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Published ({stats.published})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('draft')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filterStatus === 'draft'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Drafts ({stats.drafts})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search title, tag..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-orange-500 font-sans"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2 text-xs text-stone-400 hover:text-stone-600 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Article Cards Grid */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-2xs">
          <FileText className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold font-serif text-stone-900 mb-1">
            No articles match your filter
          </h3>
          <p className="text-xs text-stone-500 mb-6 max-w-sm mx-auto">
            {searchTerm ? 'Try a different search keyword.' : 'Write your next piece and publish it to Google Sheets.'}
          </p>
          <button
            type="button"
            onClick={onNewPost}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <PenSquare className="w-3.5 h-3.5" />
            <span>Write New Post</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const postComments = comments.filter(c => c.postId === post.id);
            const dateStr = new Date(post.publishedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <div
                key={post.id}
                className="bg-white rounded-xl border border-stone-200/90 p-5 shadow-2xs hover:border-stone-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
              >
                {/* Left: Info & Thumbnail */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {post.coverImage && (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-16 h-16 rounded-lg object-cover border border-stone-200 shrink-0 hidden sm:block"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${
                        post.status === 'published'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {post.status}
                      </span>
                      <span className="text-xs text-stone-400">•</span>
                      <span className="text-xs text-stone-500">{dateStr}</span>
                      <span className="text-xs text-stone-400">•</span>
                      <span className="text-xs text-stone-500">{post.readTimeMinutes} min read</span>
                    </div>

                    <h3 
                      onClick={() => onPreviewPost(post)}
                      className="text-base sm:text-lg font-bold font-serif text-stone-900 hover:text-orange-600 transition-colors cursor-pointer truncate"
                    >
                      {post.title}
                    </h3>

                    {post.subtitle && (
                      <p className="text-xs text-stone-500 truncate mt-0.5 font-sans">
                        {post.subtitle}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-2.5 text-xs text-stone-400">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5" />
                        <span>{post.likesCount || 0} claps</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{postComments.length} comments</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100">
                  <button
                    type="button"
                    onClick={() => onPreviewPost(post)}
                    className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                    title="View post reader"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onEditPost(post)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-orange-600 hover:bg-orange-50 border border-stone-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onTogglePublishPost(post)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer border ${
                      post.status === 'published'
                        ? 'border-stone-200 text-stone-600 hover:bg-stone-100'
                        : 'border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
                    }`}
                  >
                    {post.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPostToDelete(post)}
                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Deletion */}
      <ConfirmationModal
        isOpen={Boolean(postToDelete)}
        title="Delete this article?"
        message={`Are you sure you want to delete "${postToDelete?.title || 'this post'}"? This action will remove it from your publication and Google Sheets.`}
        confirmLabel="Delete Article"
        isDestructive={true}
        onConfirm={() => {
          if (postToDelete) {
            onDeletePost(postToDelete.id);
            setPostToDelete(null);
          }
        }}
        onCancel={() => setPostToDelete(null)}
      />
    </div>
  );
};
