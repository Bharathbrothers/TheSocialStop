/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Post, Comment, BlogSettings } from './types/blog';
import { DEFAULT_SETTINGS, INITIAL_POSTS, INITIAL_COMMENTS } from './services/mockData';
import { BLOG_CONFIG } from './blog.config';
import { 
  isAuthorLoggedIn, 
  getAuthorSessionToken,
  setAuthorSessionToken,
  logoutAuthor,
  recordClientFailedAttempt
} from './services/auth';
import { 
  fetchPostsViaAppsScript, 
  savePostViaAppsScript, 
  deletePostViaAppsScript,
  fetchCommentsViaAppsScript,
  submitCommentViaAppsScript,
  subscribeViaAppsScript,
  fetchPostsFromPublicSheet,
  verifyPasskeyViaAppsScript
} from './services/googleSheets';
import { Header } from './components/Header';
import { PostCard } from './components/PostCard';
import { PostReader } from './components/PostReader';
import { MarkdownEditor } from './components/MarkdownEditor';
import { AuthorStudio } from './components/AuthorStudio';
import { GitHubPagesModal } from './components/GitHubPagesModal';
import { SettingsModal } from './components/SettingsModal';
import { PasskeyModal } from './components/PasskeyModal';
import { AboutView } from './components/AboutView';
import { Sparkles, RefreshCw, Send, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  // Author mode state (for GitHub Pages publishing)
  const [isAuthor, setIsAuthor] = useState(() => isAuthorLoggedIn());

  // Blog data state: merges default BLOG_CONFIG with any stored settings
  const [settings, setSettings] = useState<BlogSettings>(() => {
    try {
      const saved = localStorage.getItem('inksheet_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          appsScriptUrl: parsed.appsScriptUrl || BLOG_CONFIG.appsScriptUrl,
          spreadsheetId: parsed.spreadsheetId || BLOG_CONFIG.spreadsheetId,
        };
      }
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('inksheet_posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  const [comments, setComments] = useState<Comment[]>(() => {
    const saved = localStorage.getItem('inksheet_comments');
    return saved ? JSON.parse(saved) : INITIAL_COMMENTS;
  });

  // UI Navigation states
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'author' | 'about'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGitHubPagesOpen, setIsGitHubPagesOpen] = useState(false);
  const [isPasskeyModalOpen, setIsPasskeyModalOpen] = useState(false);

  // Status & Sync Feedback
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [heroEmail, setHeroEmail] = useState('');
  const [heroSubscribed, setHeroSubscribed] = useState(false);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('inksheet_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('inksheet_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('inksheet_comments', JSON.stringify(comments));
  }, [comments]);

  // Sync from Google Sheets backend (silent by default for regular readers on page load)
  const syncFromBackend = useCallback(async (silent = false) => {
    const targetScript = settings.appsScriptUrl || BLOG_CONFIG.appsScriptUrl;
    const targetSheet = settings.spreadsheetId || BLOG_CONFIG.spreadsheetId;
    if (!targetScript && !targetSheet) return;

    setIsSyncing(true);
    try {
      if (targetScript) {
        const remotePosts = await fetchPostsViaAppsScript(targetScript);
        if (remotePosts && remotePosts.length > 0) {
          setPosts(remotePosts);
        }
        const remoteComments = await fetchCommentsViaAppsScript(targetScript);
        if (remoteComments && remoteComments.length > 0) {
          setComments(remoteComments);
        }
        if (!silent) {
          showToast('Synced with Google Sheets backend', 'info');
        }
      } else if (targetSheet) {
        const publicPosts = await fetchPostsFromPublicSheet(targetSheet);
        if (publicPosts && publicPosts.length > 0) {
          setPosts(publicPosts);
          if (!silent) {
            showToast('Updated from Public Google Sheet', 'info');
          }
        }
      }
    } catch (err: unknown) {
      console.warn('Backend sync failed, using cached data:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [settings.appsScriptUrl, settings.spreadsheetId, showToast]);

  // On mount: check URL parameters for author portal and auto-fetch posts silently
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('author') === '1' || urlParams.get('admin') === '1' || urlParams.get('author') === 'true') {
      if (isAuthor) {
        setActiveTab('author');
      } else {
        setIsPasskeyModalOpen(true);
      }
    }

    // Auto-fetch latest posts immediately on page load so readers don't need to do any manual actions!
    syncFromBackend(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-sync if author updates script or sheet settings
  useEffect(() => {
    if (settings.appsScriptUrl || settings.spreadsheetId) {
      syncFromBackend(true);
    }
  }, [settings.appsScriptUrl, settings.spreadsheetId, syncFromBackend]);

  // Secure Author Login Handler (Verified against Google Apps Script backend)
  const handleLoginAuthor = async (passkey: string): Promise<{ success: boolean; error?: string }> => {
    const targetScript = settings.appsScriptUrl || BLOG_CONFIG.appsScriptUrl;
    if (targetScript) {
      const res = await verifyPasskeyViaAppsScript(targetScript, passkey);
      if (res.success && res.sessionToken) {
        setAuthorSessionToken(res.sessionToken);
        setIsAuthor(true);
        setActiveTab('author');
        setIsPasskeyModalOpen(false);
        showToast('Author Studio unlocked (Server verified)', 'success');
        return { success: true };
      }
      return { success: false, error: res.error || 'Authentication failed' };
    }

    // Local preview fallback (before connecting Apps Script)
    const validPass = BLOG_CONFIG.defaultPasskey || 'writer2026';
    if (passkey.trim() === validPass) {
      const mockSessionToken = 'local_' + Date.now();
      setAuthorSessionToken(mockSessionToken);
      setIsAuthor(true);
      setActiveTab('author');
      setIsPasskeyModalOpen(false);
      showToast('Author Studio unlocked', 'success');
      return { success: true };
    } else {
      const { remainingAttempts, isLockedOut, cooldownSeconds } = recordClientFailedAttempt();
      if (isLockedOut) {
        return { 
          success: false, 
          error: `Too many failed attempts. Locked for ${cooldownSeconds}s to protect against brute forcing.` 
        };
      }
      return { 
        success: false, 
        error: `Incorrect passkey. ${remainingAttempts} attempt(s) remaining.` 
      };
    }
  };

  // Author Logout Handler
  const handleLogoutAuthor = () => {
    logoutAuthor();
    setIsAuthor(false);
    setActiveTab('home');
    showToast('Author Studio locked');
  };

  // Save / Publish Post
  const handleSavePost = async (postPayload: Post, isPublishing: boolean) => {
    setPosts(prev => {
      const idx = prev.findIndex(p => p.id === postPayload.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = postPayload;
        return next;
      }
      return [postPayload, ...prev];
    });

    setIsEditorOpen(false);
    setEditingPost(null);

    if (isPublishing) {
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
      showToast(postPayload.status === 'published' ? 'Article published successfully!' : 'Draft saved!');
    } else {
      showToast('Draft saved!');
    }

    if (settings.appsScriptUrl) {
      try {
        const sessionToken = getAuthorSessionToken() || undefined;
        await savePostViaAppsScript(settings.appsScriptUrl, postPayload, { sessionToken });
        showToast('Saved to Google Sheet Posts tab', 'success');
      } catch (err: unknown) {
        console.error('Failed to sync post to Apps Script:', err);
        showToast('Saved in browser. Check your Apps Script URL.', 'info');
      }
    }
  };

  // Toggle draft / published status directly
  const handleTogglePublishPost = async (post: Post) => {
    const nextStatus = post.status === 'published' ? 'draft' : 'published';
    const updatedPost: Post = {
      ...post,
      status: nextStatus,
      updatedAt: new Date().toISOString()
    };

    setPosts(prev => prev.map(p => p.id === post.id ? updatedPost : p));
    showToast(`Post marked as ${nextStatus}`, 'success');

    if (settings.appsScriptUrl) {
      try {
        const sessionToken = getAuthorSessionToken() || undefined;
        await savePostViaAppsScript(settings.appsScriptUrl, updatedPost, { sessionToken });
      } catch (err: unknown) {
        console.warn('Failed to update post status on backend:', err);
      }
    }
  };

  // Delete Post
  const handleDeletePost = async (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    setIsEditorOpen(false);
    setEditingPost(null);
    setSelectedPost(null);
    showToast('Post deleted', 'info');

    if (settings.appsScriptUrl) {
      try {
        const sessionToken = getAuthorSessionToken() || undefined;
        await deletePostViaAppsScript(settings.appsScriptUrl, postId, { sessionToken });
      } catch (err: unknown) {
        console.error('Failed to delete post from Apps Script:', err);
      }
    }
  };

  // Add Comment (works seamlessly for readers on GitHub Pages)
  const handleAddComment = async (data: { authorName: string; authorEmail: string; comment: string }) => {
    if (!selectedPost) return;

    const newComment: Comment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      postId: selectedPost.id,
      authorName: data.authorName,
      authorEmail: data.authorEmail,
      comment: data.comment,
      createdAt: new Date().toISOString(),
    };

    setComments(prev => [...prev, newComment]);

    if (settings.appsScriptUrl) {
      try {
        await submitCommentViaAppsScript(settings.appsScriptUrl, newComment);
      } catch (err: unknown) {
        console.warn('Failed to submit comment to Apps Script:', err);
      }
    }
  };

  // Clap / Like Post
  const handleLikePost = (post: Post, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const updatedLikes = (post.likesCount || 0) + 1;
    const updatedPost = { ...post, likesCount: updatedLikes };

    setPosts(prev => prev.map(p => p.id === post.id ? updatedPost : p));
    if (selectedPost && selectedPost.id === post.id) {
      setSelectedPost(updatedPost);
    }
  };

  // Subscribe Email
  const handleSubscribe = async (email: string): Promise<boolean> => {
    if (!email.trim()) return false;

    if (settings.appsScriptUrl) {
      try {
        await subscribeViaAppsScript(settings.appsScriptUrl, email);
      } catch {
        // ignore
      }
    }
    showToast('Subscribed! Stored in Google Sheets backend', 'success');
    return true;
  };

  const handleHeroSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroEmail.trim()) return;
    const ok = await handleSubscribe(heroEmail.trim());
    if (ok) {
      setHeroSubscribed(true);
      setHeroEmail('');
      try {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    }
  };

  // Filter & Search Posts for Reader view
  const allTags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach(p => p.tags?.forEach(t => set.add(t)));
    return Array.from(set);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // In Reader View: only show published articles unless in author studio
      if (activeTab === 'home' && post.status !== 'published' && !isAuthor) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = post.title.toLowerCase().includes(q);
        const matchesSubtitle = post.subtitle?.toLowerCase().includes(q);
        const matchesContent = post.content?.toLowerCase().includes(q);
        const matchesTags = post.tags?.some(t => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesSubtitle && !matchesContent && !matchesTags) {
          return false;
        }
      }

      if (selectedTag) {
        if (!post.tags?.includes(selectedTag)) return false;
      }

      return true;
    });
  }, [posts, searchQuery, selectedTag, activeTab, isAuthor]);

  // If in Reader mode, render PostReader
  if (selectedPost) {
    const postComments = comments.filter(c => c.postId === selectedPost.id);
    return (
      <PostReader
        post={selectedPost}
        comments={postComments}
        settings={settings}
        onBack={() => setSelectedPost(null)}
        onEdit={(p) => {
          setEditingPost(p);
          setSelectedPost(null);
          setIsEditorOpen(true);
        }}
        onLike={handleLikePost}
        onAddComment={handleAddComment}
        onSubscribe={handleSubscribe}
        isAuthor={isAuthor}
      />
    );
  }

  // If in Editor mode, render full MarkdownEditor
  if (isEditorOpen) {
    return (
      <MarkdownEditor
        post={editingPost}
        authorName={settings.authorName}
        authorEmail="author@example.com"
        authorAvatar={settings.authorAvatar}
        onSave={handleSavePost}
        onDelete={handleDeletePost}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingPost(null);
          if (isAuthor) setActiveTab('author');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-900 flex flex-col font-sans selection:bg-orange-100 selection:text-orange-900">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold shadow-2xl animate-in slide-in-from-bottom-2 duration-150">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
          {toast.type === 'info' && <RefreshCw className="w-4 h-4 text-orange-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        settings={settings}
        isAuthor={isAuthor}
        onLoginAuthor={handleLoginAuthor}
        onLogoutAuthor={handleLogoutAuthor}
        onNewPost={() => {
          setEditingPost(null);
          setIsEditorOpen(true);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGitHubPages={() => setIsGitHubPagesOpen(true)}
        onOpenPasskeyModal={() => setIsPasskeyModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* View routing: Author Studio vs About vs Reader Feed */}
      {activeTab === 'author' && isAuthor ? (
        <AuthorStudio
          settings={settings}
          posts={posts}
          comments={comments}
          onNewPost={() => {
            setEditingPost(null);
            setIsEditorOpen(true);
          }}
          onEditPost={(p) => {
            setEditingPost(p);
            setIsEditorOpen(true);
          }}
          onPreviewPost={(p) => setSelectedPost(p)}
          onDeletePost={handleDeletePost}
          onTogglePublishPost={handleTogglePublishPost}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenGitHubPages={() => setIsGitHubPagesOpen(true)}
          onSwitchToReaderView={() => setActiveTab('home')}
        />
      ) : activeTab === 'about' ? (
        <AboutView
          settings={settings}
          totalPosts={posts.filter(p => p.status === 'published').length}
          totalComments={comments.length}
          onSubscribe={handleSubscribe}
        />
      ) : (
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Substack Hero Masthead & Newsletter subscribe box */}
          <section className="mb-10 text-center pb-8 border-b border-stone-200">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-stone-900 tracking-tight leading-tight mb-3">
              {settings.publicationName}
            </h2>
            <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto mb-6 leading-relaxed">
              {settings.publicationTagline}
            </p>

            {/* Newsletter input */}
            <div className="max-w-md mx-auto">
              {heroSubscribed ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold inline-flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Thank you for subscribing! You'll receive our dispatches directly in your inbox.</span>
                </div>
              ) : (
                <form onSubmit={handleHeroSubscribe} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    required
                    value={heroEmail}
                    onChange={(e) => setHeroEmail(e.target.value)}
                    placeholder="Enter your email to subscribe..."
                    className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-white rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-2xs font-sans"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <span>Subscribe</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </section>

          {/* Tag Filter Bar */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                  selectedTag === null
                    ? 'bg-stone-900 text-white font-semibold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                All Stories
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                    selectedTag === tag
                      ? 'bg-stone-900 text-white font-semibold'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Posts Feed */}
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white rounded-2xl border border-stone-200 shadow-2xs">
              <Sparkles className="w-10 h-10 text-orange-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold font-serif text-stone-900 mb-1">No articles found</h3>
              <p className="text-xs sm:text-sm text-stone-500 mb-6 max-w-sm mx-auto font-sans">
                {searchQuery || selectedTag ? 'Try adjusting your search query or tag filter.' : 'Start your publication by creating your first article.'}
              </p>
              {isAuthor && (
                <button
                  onClick={() => {
                    setEditingPost(null);
                    setIsEditorOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <span>Write First Post</span>
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-transparent">
              {filteredPosts.map((post) => {
                const postCommentCount = comments.filter(c => c.postId === post.id).length;
                return (
                  <PostCard
                    key={post.id}
                    post={post}
                    commentCount={postCommentCount}
                    onRead={(p) => setSelectedPost(p)}
                    onEdit={(p) => {
                      setEditingPost(p);
                      setIsEditorOpen(true);
                    }}
                    onLike={handleLikePost}
                    isAuthor={isAuthor}
                  />
                );
              })}
            </div>
          )}
        </main>
      )}

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-8 mt-auto text-xs text-stone-500 font-sans">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-stone-800 text-sm">
              {settings.publicationName}
            </span>
            <span>•</span>
            <span>© {new Date().getFullYear()} {settings.authorName}. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('about')}
              className="hover:text-stone-900 transition-colors cursor-pointer"
            >
              About & Author
            </button>
            {isAuthor ? (
              <>
                <button
                  onClick={() => setActiveTab('author')}
                  className="hover:text-orange-600 font-semibold transition-colors cursor-pointer"
                >
                  Author Studio
                </button>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="hover:text-stone-900 transition-colors cursor-pointer"
                >
                  Settings
                </button>
                <button
                  onClick={handleLogoutAuthor}
                  className="hover:text-red-600 transition-colors cursor-pointer"
                >
                  Lock Session
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsPasskeyModalOpen(true)}
                className="hover:text-stone-900 transition-colors cursor-pointer text-stone-400 hover:text-stone-600 flex items-center gap-1"
                title="Author Login"
              >
                <Lock className="w-3 h-3" />
                <span>Author Portal</span>
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onSaveSettings={(newSettings) => {
          setSettings(newSettings);
          showToast('Settings saved');
        }}
        onClose={() => setIsSettingsOpen(false)}
        onOpenGitHubPages={() => setIsGitHubPagesOpen(true)}
      />

      <GitHubPagesModal
        isOpen={isGitHubPagesOpen}
        settings={settings}
        onClose={() => setIsGitHubPagesOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <PasskeyModal
        isOpen={isPasskeyModalOpen}
        hasAppsScript={Boolean(settings.appsScriptUrl || BLOG_CONFIG.appsScriptUrl)}
        onClose={() => setIsPasskeyModalOpen(false)}
        onVerify={handleLoginAuthor}
      />
    </div>
  );
}
