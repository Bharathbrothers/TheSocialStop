import React from 'react';
import { Post } from '../types/blog';
import { MessageSquare, Heart, Clock, Calendar, Edit3 } from 'lucide-react';

interface PostCardProps {
  post: Post;
  commentCount: number;
  onRead: (post: Post) => void;
  onEdit: (post: Post) => void;
  onLike: (post: Post, e: React.MouseEvent) => void;
  isAuthor?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  commentCount,
  onRead,
  onEdit,
  onLike,
  isAuthor = false,
}) => {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <article 
      onClick={() => onRead(post)}
      className="group cursor-pointer py-6 sm:py-8 border-b border-stone-200/80 transition-colors hover:bg-stone-50/50 -mx-3 px-3 rounded-xl"
    >
      <div className="flex flex-col-reverse sm:flex-row items-start justify-between gap-6">
        {/* Left Column: Editorial Details */}
        <div className="flex-1 min-w-0">
          {/* Byline: Author & Date */}
          <div className="flex items-center gap-2 mb-2 text-xs text-stone-500 font-sans">
            {post.authorAvatar ? (
              <img
                src={post.authorAvatar}
                alt={post.author}
                className="w-5 h-5 rounded-full object-cover border border-stone-200"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-stone-300 text-stone-700 flex items-center justify-center text-[10px] font-bold">
                {post.author.charAt(0)}
              </div>
            )}
            <span className="font-semibold text-stone-800">{post.author}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-stone-400" />
              {formattedDate}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-stone-400" />
              {post.readTimeMinutes} min read
            </span>
            {post.status === 'draft' && (
              <span className="ml-1 px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-amber-100 text-amber-800 rounded">
                Draft
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 group-hover:text-orange-600 transition-colors leading-snug tracking-tight mb-2">
            {post.title}
          </h2>

          {/* Subtitle / Excerpt */}
          {post.subtitle && (
            <p className="text-sm sm:text-base text-stone-600 line-clamp-2 leading-relaxed font-sans mb-3 font-normal">
              {post.subtitle}
            </p>
          )}

          {/* Footer Metrics & Actions */}
          <div className="flex items-center justify-between pt-2 text-xs text-stone-500 font-sans">
            <div className="flex items-center gap-4">
              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {post.tags.slice(0, 2).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded-full text-[11px] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Likes / Claps */}
              <button
                type="button"
                onClick={(e) => onLike(post, e)}
                className="flex items-center gap-1 text-stone-500 hover:text-red-500 transition-colors cursor-pointer py-1"
                title="Clap for this article"
              >
                <Heart className="w-3.5 h-3.5 fill-transparent hover:fill-red-500 transition-colors" />
                <span className="text-[11px] font-medium">{post.likesCount || 0}</span>
              </button>

              {/* Comments count */}
              <div className="flex items-center gap-1 text-stone-500 py-1">
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">{commentCount}</span>
              </div>
            </div>

            {/* Author Quick Edit */}
            {isAuthor && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(post);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 px-2.5 py-1 text-xs text-stone-600 hover:text-orange-600 hover:bg-orange-50 rounded-md cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Cover Image thumbnail */}
        {post.coverImage && (
          <div className="w-full sm:w-44 h-32 sm:h-28 shrink-0 overflow-hidden rounded-lg bg-stone-100 border border-stone-200/80">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        )}
      </div>
    </article>
  );
};
