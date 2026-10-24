import React, { useState } from 'react';
import { BlogSettings } from '../types/blog';
import { Mail, Check, Send, Sparkles, BookOpen, Heart, MessageSquare } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AboutViewProps {
  settings: BlogSettings;
  totalPosts: number;
  totalComments: number;
  onSubscribe: (email: string) => Promise<boolean>;
}

export const AboutView: React.FC<AboutViewProps> = ({
  settings,
  totalPosts,
  totalComments,
  onSubscribe,
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;

    setLoading(true);
    const ok = await onSubscribe(email.trim());
    if (ok) {
      setSubscribed(true);
      setEmail('');
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
      <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-10 shadow-2xs text-center">
        {/* Author Avatar */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden border-2 border-stone-200 shadow-sm">
          {settings.authorAvatar ? (
            <img
              src={settings.authorAvatar}
              alt={settings.authorName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-stone-900 text-white flex items-center justify-center font-serif text-2xl font-bold">
              {settings.authorName.charAt(0)}
            </div>
          )}
        </div>

        {/* Publication & Author */}
        <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 mb-2">
          {settings.publicationName}
        </h2>
        <p className="text-xs font-semibold text-orange-600 uppercase tracking-widest mb-4">
          By {settings.authorName}
        </p>

        {/* Bio */}
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-lg mx-auto mb-8 font-sans">
          {settings.authorBio || settings.publicationTagline}
        </p>

        {/* Publication Stats */}
        <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto py-4 border-y border-stone-100 mb-8 text-stone-700">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold font-serif text-stone-900">{totalPosts}</span>
            <span className="text-xs text-stone-500 font-sans flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> Published Posts
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold font-serif text-stone-900">{totalComments}</span>
            <span className="text-xs text-stone-500 font-sans flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> Reader Comments
            </span>
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className="bg-stone-50 rounded-xl p-5 sm:p-6 border border-stone-200 text-left">
          <h4 className="font-bold text-stone-900 font-serif text-base mb-1">
            Subscribe for free
          </h4>
          <p className="text-xs text-stone-600 mb-4 font-sans leading-relaxed">
            Join the community of readers. Posts and comments are saved directly into the publication's Google Sheet backend.
          </p>

          {subscribed ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Thank you for subscribing! Your email is recorded in Google Sheets.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-white rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-orange-500 font-sans"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                {loading ? (
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
      </div>
    </div>
  );
};
