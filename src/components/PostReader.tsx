import React, { useEffect, useState, useMemo } from 'react';
import { Post, Comment, BlogSettings } from '../types/blog';
import { CommentsSection } from './CommentsSection';
import { marked } from 'marked';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  Heart, 
  MessageSquare, 
  Share2, 
  Twitter, 
  Linkedin, 
  Link2, 
  Check, 
  Clock, 
  Calendar,
  Send,
  Edit3
} from 'lucide-react';

interface PostReaderProps {
  post: Post;
  comments: Comment[];
  settings: BlogSettings;
  onBack: () => void;
  onEdit: (post: Post) => void;
  onLike: (post: Post) => void;
  onAddComment: (commentData: { authorName: string; authorEmail: string; comment: string }) => Promise<void>;
  onSubscribe: (email: string) => Promise<boolean>;
  isAuthor?: boolean;
}

export const PostReader: React.FC<PostReaderProps> = ({
  post,
  comments,
  settings,
  onBack,
  onEdit,
  onLike,
  onAddComment,
  onSubscribe,
  isAuthor = false,
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [subscriberEmail, setSubscriberEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  // Track reading scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top when reader opens
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [post.id]);

  // Parse markdown into HTML safely using marked
  const renderedContent = useMemo(() => {
    try {
      return marked.parse(post.content || '', { breaks: true, gfm: true }) as string;
    } catch {
      return post.content;
    }
  }, [post.content]);

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`"${post.title}" via ${settings.publicationName}`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleClap = () => {
    setHasLiked(true);
    onLike(post);
    try {
      confetti({
        particleCount: 28,
        spread: 60,
        origin: { y: 0.85 },
        colors: ['#ea580c', '#f97316', '#fb923c']
      });
    } catch {
      // ignore
    }
  };

  const handleSubscribeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscriberEmail.trim() || subscribeStatus === 'loading') return;

    setSubscribeStatus('loading');
    const ok = await onSubscribe(subscriberEmail.trim());
    if (ok) {
      setSubscribeStatus('success');
      setSubscriberEmail('');
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.7 }
        });
      } catch {
        // ignore
      }
    } else {
      setSubscribeStatus('idle');
    }
  };

  const scrollToComments = () => {
    const el = document.getElementById('comments');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-900 pb-24">
      {/* Scroll Reading Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-orange-600 z-50 transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        {/* Navigation & Controls */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>All posts</span>
          </button>

          <div className="flex items-center gap-2">
            {isAuthor && (
              <button
                onClick={() => onEdit(post)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-orange-600 hover:bg-orange-50 border border-stone-200 rounded-full transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Post</span>
              </button>
            )}

            <button
              onClick={handleCopyLink}
              className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
              title="Copy link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Link2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Post Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif text-stone-900 tracking-tight leading-[1.18] mb-4">
          {post.title}
        </h1>

        {/* Subtitle / Deck */}
        {post.subtitle && (
          <p className="text-lg sm:text-xl text-stone-600 font-sans leading-relaxed mb-6 font-normal">
            {post.subtitle}
          </p>
        )}

        {/* Author Byline & Metadata Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-stone-200 mb-8 font-sans">
          <div className="flex items-center gap-3">
            {post.authorAvatar ? (
              <img
                src={post.authorAvatar}
                alt={post.author}
                className="w-10 h-10 rounded-full object-cover border border-stone-300 shadow-2xs"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-stone-800 text-white flex items-center justify-center text-sm font-bold">
                {post.author.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-stone-900 leading-none mb-1">
                {post.author}
              </p>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formattedDate}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.readTimeMinutes} min read
                </span>
              </div>
            </div>
          </div>

          {/* Social Reaction Bar */}
          <div className="flex items-center gap-3">
            {/* Clap / Like Button */}
            <button
              onClick={handleClap}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                hasLiked
                  ? 'bg-red-50 text-red-600 border-red-200 scale-105'
                  : 'bg-white text-stone-700 border-stone-200 hover:border-red-300 hover:text-red-500'
              }`}
              title="Like this article"
            >
              <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{post.likesCount}</span>
            </button>

            {/* Jump to comments */}
            <button
              onClick={scrollToComments}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{comments.length}</span>
            </button>

            {/* Share Menu */}
            <div className="flex items-center gap-1 border-l border-stone-200 pl-3">
              <button
                onClick={handleShareTwitter}
                className="p-1.5 text-stone-500 hover:text-[#1DA1F2] hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
                title="Share on X / Twitter"
              >
                <Twitter className="w-4 h-4" />
              </button>
              <button
                onClick={handleShareLinkedIn}
                className="p-1.5 text-stone-500 hover:text-[#0A66C2] hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
                title="Share on LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="mb-10 overflow-hidden rounded-xl border border-stone-200 shadow-xs">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-auto max-h-[500px] object-cover"
            />
          </div>
        )}

        {/* Main Article Body (Editorial Prose) */}
        <article 
          className="prose-editorial"
          dangerouslySetInnerHTML={{ __html: renderedContent }}
        />

        {/* Bottom Reaction & Share Bar */}
        <div className="mt-12 py-6 border-y border-stone-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleClap}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all cursor-pointer ${
                hasLiked
                  ? 'bg-red-50 text-red-600 border-red-200 shadow-xs'
                  : 'bg-white text-stone-700 border-stone-300 hover:border-red-300 hover:text-red-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${hasLiked ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{post.likesCount} Claps</span>
            </button>

            <button
              onClick={scrollToComments}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-white text-stone-700 border border-stone-300 hover:bg-stone-50 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{comments.length} Comments</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Link copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share article</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Newsletter Subscription Box (Substack signature) */}
        <div className="my-12 p-6 sm:p-8 bg-orange-50/70 border border-orange-200/80 rounded-2xl text-center">
          <h3 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 mb-2">
            Subscribe to {settings.publicationName}
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto mb-5 font-sans leading-relaxed">
            Get future essays delivered directly to your inbox. No spam, ever.
          </p>

          {subscribeStatus === 'success' ? (
            <div className="p-3 bg-white rounded-xl text-emerald-800 text-xs sm:text-sm font-semibold inline-flex items-center gap-2 border border-emerald-200 shadow-xs">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>You're subscribed! Stored in your Google Sheets backend.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribeSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                value={subscriberEmail}
                onChange={(e) => setSubscriberEmail(e.target.value)}
                placeholder="Type your email..."
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-white rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500 font-sans shadow-2xs"
              />
              <button
                type="submit"
                disabled={subscribeStatus === 'loading'}
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                {subscribeStatus === 'loading' ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <span>Subscribe</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Comments Section */}
        <CommentsSection
          postId={post.id}
          postTitle={post.title}
          comments={comments}
          settings={settings}
          onAddComment={onAddComment}
        />
      </div>
    </div>
  );
};
