import React, { useState, useRef, useMemo } from 'react';
import { Post } from '../types/blog';
import { marked } from 'marked';
import { 
  ArrowLeft, 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  Quote, 
  Code, 
  List, 
  ListOrdered, 
  Link2, 
  Image as ImageIcon, 
  Minus, 
  Eye, 
  Columns, 
  Edit3, 
  Check, 
  Trash2,
  Sparkles,
  ExternalLink,
  Save,
  CheckCircle2
} from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

interface MarkdownEditorProps {
  post: Post | null;
  authorName: string;
  authorEmail: string;
  authorAvatar: string;
  onSave: (post: Post, isPublishing: boolean) => Promise<void>;
  onDelete: (postId: string) => Promise<void>;
  onClose: () => void;
}

const PRESET_COVERS = [
  { label: 'Minimalist Desk', url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Vintage Typewriter', url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Modern Laptop', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Books & Tea', url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Architectural Shadow', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80' },
];

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  post,
  authorName,
  authorEmail,
  authorAvatar,
  onSave,
  onDelete,
  onClose,
}) => {
  const [title, setTitle] = useState(post?.title || '');
  const [subtitle, setSubtitle] = useState(post?.subtitle || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [content, setContent] = useState(post?.content || '');
  const [coverImage, setCoverImage] = useState(post?.coverImage || PRESET_COVERS[0].url);
  const [tagsInput, setTagsInput] = useState(post?.tags?.join(', ') || 'Essays, Web');
  const [status, setStatus] = useState<'draft' | 'published'>(post?.status || 'draft');
  const [viewMode, setViewMode] = useState<'edit' | 'split' | 'preview'>('edit');
  const [isSaving, setIsSaving] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);

  // Confirmation modals
  const [confirmPublishOpen, setConfirmPublishOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-generate slug from title if new
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!post || !slug) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
    }
  };

  // Word count & read time calculation
  const { words, chars, readTime } = useMemo(() => {
    const trimmed = content.trim();
    const wordList = trimmed ? trimmed.split(/\s+/) : [];
    const count = wordList.length;
    const time = Math.max(1, Math.ceil(count / 200));
    return {
      words: count,
      chars: content.length,
      readTime: time
    };
  }, [content]);

  // Render markdown for preview
  const renderedMarkdown = useMemo(() => {
    try {
      return marked.parse(content || '*No content written yet.*', { breaks: true, gfm: true }) as string;
    } catch {
      return content;
    }
  }, [content]);

  // Insert markdown helper
  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);

    const replacement = prefix + (selected || 'text') + suffix;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selected ? selected.length : 4)
      );
    }, 10);
  };

  const handleSavePost = async (publish: boolean) => {
    if (!title.trim()) {
      alert('Please enter a title for your post.');
      return;
    }

    setIsSaving(true);
    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const postPayload: Post = {
      id: post?.id || `post-${Date.now()}`,
      title: title.trim(),
      subtitle: subtitle.trim(),
      slug: slug.trim() || `post-${Date.now()}`,
      content,
      author: post?.author || authorName || 'Bharath Sathuri',
      authorEmail: post?.authorEmail || authorEmail || 'bharathsathuri@gmail.com',
      authorAvatar: post?.authorAvatar || authorAvatar,
      coverImage,
      tags: parsedTags,
      status: publish ? 'published' : 'draft',
      publishedAt: post?.publishedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likesCount: post?.likesCount || 0,
      readTimeMinutes: readTime
    };

    try {
      await onSave(postPayload, publish);
      setStatus(publish ? 'published' : 'draft');
    } catch (err) {
      console.error('Failed to save post:', err);
    } finally {
      setIsSaving(false);
      setConfirmPublishOpen(false);
    }
  };

  const handleDeletePost = async () => {
    if (!post?.id) return;
    try {
      await onDelete(post.id);
    } finally {
      setConfirmDeleteOpen(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#faf9f6] flex flex-col font-sans pb-28">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Return to Author Studio"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Author Studio</span>
          </button>
          <div className="flex items-center gap-2 border-l border-stone-200 pl-3">
            <span className="text-xs font-semibold text-stone-700 truncate max-w-[150px] sm:max-w-xs">
              {title || 'Untitled Article'}
            </span>
            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
              status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
            }`}>
              {status}
            </span>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-xs font-medium text-stone-600">
          <button
            type="button"
            onClick={() => setViewMode('edit')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer ${
              viewMode === 'edit' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'hover:text-stone-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Write</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer ${
              viewMode === 'split' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'hover:text-stone-900'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Split View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer ${
              viewMode === 'preview' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'hover:text-stone-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </button>
        </div>

        {/* Top Quick Save Actions */}
        <div className="flex items-center gap-2">
          {post && (
            <button
              type="button"
              onClick={() => setConfirmDeleteOpen(true)}
              className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Delete this post"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSavePost(false)}
            className="px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
          >
            Save Draft
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => setConfirmPublishOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Publish</span>
          </button>
        </div>
      </header>

      {/* Editor Main Canvas */}
      <div className="max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        {/* Title & Metadata Inputs Card */}
        <div className="bg-white rounded-xl border border-stone-200/90 p-5 sm:p-6 mb-4 shadow-2xs">
          {/* Post Title */}
          <input
            type="text"
            required
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Article Title..."
            className="w-full text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-stone-900 placeholder:text-stone-300 border-none outline-none focus:ring-0 mb-3 bg-transparent tracking-tight"
          />

          {/* Subtitle / Deck */}
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Add an editorial subtitle or excerpt..."
            className="w-full text-sm sm:text-base text-stone-600 placeholder:text-stone-400 border-none outline-none focus:ring-0 mb-4 bg-transparent font-sans"
          />

          {/* Metadata Row */}
          <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Tags */}
              <div className="flex items-center gap-1.5 text-stone-500">
                <span className="font-semibold text-stone-700">Tags:</span>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Essays, Design, Code"
                  className="px-2 py-1 bg-stone-50 rounded border border-stone-200 focus:outline-none focus:bg-white text-xs w-44 font-sans"
                />
              </div>

              {/* Cover Image Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCoverPicker(!showCoverPicker)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-stone-600 bg-stone-50 hover:bg-stone-100 rounded border border-stone-200 cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-orange-600" />
                  <span>{coverImage ? 'Cover Selected' : 'Choose Cover'}</span>
                </button>

                {showCoverPicker && (
                  <div className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-stone-200 p-3 z-50 animate-in fade-in zoom-in-95">
                    <p className="text-[11px] font-bold text-stone-700 uppercase mb-2">Preset Editorial Covers</p>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {PRESET_COVERS.map((preset, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setCoverImage(preset.url);
                            setShowCoverPicker(false);
                          }}
                          className={`group cursor-pointer rounded-lg overflow-hidden border relative h-16 ${
                            coverImage === preset.url ? 'ring-2 ring-orange-500 border-orange-500' : 'border-stone-200'
                          }`}
                        >
                          <img src={preset.url} alt={preset.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] text-white font-medium p-1 text-center">
                            {preset.label}
                          </span>
                        </div>
                      ))}
                    </div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-1">Custom Image URL</label>
                    <input
                      type="url"
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-2 py-1 text-xs border border-stone-200 rounded font-mono"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Reading stats */}
            <div className="flex items-center gap-2 text-stone-400">
              <span>{words} words</span>
              <span>•</span>
              <span className="font-semibold text-stone-600">{readTime} min read</span>
            </div>
          </div>
        </div>

        {/* Formatting Toolbar */}
        {viewMode !== 'preview' && (
          <div className="bg-white rounded-t-xl border border-stone-200 px-3 py-2 flex items-center gap-1 flex-wrap text-stone-600 shadow-2xs">
            <button
              type="button"
              onClick={() => insertMarkdown('**', '**')}
              className="p-1.5 hover:text-stone-900 hover:bg-stone-100 rounded cursor-pointer"
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('*', '*')}
              className="p-1.5 hover:text-stone-900 hover:bg-stone-100 rounded cursor-pointer"
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-stone-200 mx-1"></div>
            <button
              type="button"
              onClick={() => insertMarkdown('# ', '')}
              className="p-1.5 hover:text-stone-900 hover:bg-stone-100 rounded cursor-pointer"
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('## ', '')}
              className="p-1.5 hover:text-stone-900 hover:bg-stone-100 rounded cursor-pointer"
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-stone-200 mx-1"></div>
            <button
              type="button"
              onClick={() => insertMarkdown('> ', '')}
              className="p-1.5 hover:text-stone-900 hover:bg-stone-100 rounded cursor-pointer"
              title="Blockquote"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('```\n', '\n```')}
              className="p-1.5 hover:text-stone-900 hover:bg-stone-100 rounded cursor-pointer"
              title="Code block"
            >
              <Code className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('- ', '')}
              className="p-1.5 hover:text-stone-900 hover:bg-stone-100 rounded cursor-pointer"
              title="Bullet list"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('1. ', '')}
              className="p-1.5 hover:text-stone-900 hover:bg-stone-100 rounded cursor-pointer"
              title="Numbered list"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-stone-200 mx-1"></div>
            <button
              type="button"
              onClick={() => insertMarkdown('[', '](https://)')}
              className="p-1.5 hover:text-stone-900 hover:bg-stone-100 rounded cursor-pointer"
              title="Insert Link"
            >
              <Link2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('![Image description](', ')')}
              className="p-1.5 hover:text-stone-900 hover:bg-stone-100 rounded cursor-pointer"
              title="Insert Image"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('\n---\n', '')}
              className="p-1.5 hover:text-stone-900 hover:bg-stone-100 rounded cursor-pointer"
              title="Divider"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content Area with Full Responsive Flow */}
        <div className="w-full bg-white rounded-b-xl border border-stone-200/90 overflow-hidden min-h-[500px] flex flex-col md:flex-row">
          {/* Write / Edit Column */}
          {viewMode !== 'preview' && (
            <div className={`flex-1 flex flex-col p-4 sm:p-5 ${viewMode === 'split' ? 'border-r border-stone-200' : ''}`}>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your article in Markdown here...

Use headings (#), blockquotes (>), lists, and formatting. You can switch to 'Split View' to see your words render live in real time."
                className="w-full flex-1 min-h-[460px] text-stone-800 font-mono text-sm leading-relaxed border-none outline-none focus:ring-0 resize-y bg-transparent"
              />
            </div>
          )}

          {/* Preview Column */}
          {(viewMode === 'split' || viewMode === 'preview') && (
            <div className="flex-1 p-6 sm:p-8 bg-[#faf9f6] overflow-y-auto max-h-[750px]">
              <div className="max-w-2xl mx-auto">
                {coverImage && (
                  <div className="mb-6 rounded-lg overflow-hidden border border-stone-200 shadow-2xs">
                    <img src={coverImage} alt={title} className="w-full h-48 object-cover" />
                  </div>
                )}
                <h1 className="text-3xl font-bold font-serif text-stone-900 mb-2 leading-tight">
                  {title || 'Untitled Post'}
                </h1>
                {subtitle && (
                  <p className="text-stone-600 font-sans text-base mb-6 leading-relaxed">
                    {subtitle}
                  </p>
                )}
                <article
                  className="prose-editorial"
                  dangerouslySetInnerHTML={{ __html: renderedMarkdown }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Persistent Bottom Bar with Stats and Publishing Controls */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-4 sm:px-6 py-3 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-stone-500">
            <span className="font-semibold text-stone-800">{words} words</span>
            <span>•</span>
            <span>{chars} characters</span>
            <span>•</span>
            <span className="text-orange-600 font-medium">{readTime} min read</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
            >
              Exit Editor
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSavePost(false)}
              className="px-4 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
            >
              {isSaving && status === 'draft' ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => setConfirmPublishOpen(true)}
              className="px-5 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{status === 'published' ? 'Update Post' : 'Publish Article'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Publishing */}
      <ConfirmationModal
        isOpen={confirmPublishOpen}
        title="Publish Article to Google Sheets?"
        message={`This will upload "${title || 'Untitled'}" to your Google Sheets database. Readers on GitHub Pages will immediately be able to read and leave comments.`}
        confirmLabel={status === 'published' ? 'Update Post' : 'Publish Article'}
        onConfirm={() => handleSavePost(true)}
        onCancel={() => setConfirmPublishOpen(false)}
      />

      {/* Confirmation Modal for Deleting Post */}
      <ConfirmationModal
        isOpen={confirmDeleteOpen}
        title="Delete this article?"
        message={`Are you sure you want to permanently delete "${title || 'this post'}"? This action will remove it from your publication and clear the row in Google Sheets.`}
        confirmLabel="Delete Post"
        isDestructive={true}
        onConfirm={handleDeletePost}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
};
