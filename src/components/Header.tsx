import React, { useState } from 'react';
import { PenSquare, Settings, Github, Table, Search, Lock, Unlock, CheckCircle2, LayoutDashboard } from 'lucide-react';
import { BlogSettings } from '../types/blog';
import { PasskeyModal } from './PasskeyModal';

interface HeaderProps {
  settings: BlogSettings;
  isAuthor: boolean;
  onLoginAuthor: (passkey: string) => Promise<{ success: boolean; error?: string }>;
  onLogoutAuthor: () => void;
  onNewPost: () => void;
  onOpenSettings: () => void;
  onOpenGitHubPages: () => void;
  onOpenPasskeyModal?: () => void;
  activeTab: 'home' | 'author' | 'about';
  setActiveTab: (tab: 'home' | 'author' | 'about') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  isAuthor,
  onLoginAuthor,
  onLogoutAuthor,
  onNewPost,
  onOpenSettings,
  onOpenGitHubPages,
  onOpenPasskeyModal,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [showPasskeyModal, setShowPasskeyModal] = useState(false);

  return (
    <header className="border-b border-stone-200 bg-[#fbfbf9] sticky top-0 z-40 transition-all font-sans">
      {/* Top Banner: Substack-style Masthead */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        {/* Brand / Title */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setActiveTab('home')}
            className="cursor-pointer group flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-serif font-black text-lg shadow-xs group-hover:bg-orange-700 transition-colors">
              I
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 tracking-tight leading-none group-hover:text-orange-600 transition-colors">
                {settings.publicationName || "InkSheet"}
              </h1>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Toggle */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
            title="Search articles"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Author-only Controls (Hidden completely from readers) */}
          {isAuthor ? (
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* GitHub Pages Setup Guide */}
              <button
                onClick={onOpenGitHubPages}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors cursor-pointer border border-stone-200"
                title="GitHub Pages Deployment Guide"
              >
                <Github className="w-3.5 h-3.5" />
                <span>Pages Guide</span>
              </button>

              {/* Backend Settings */}
              <button
                onClick={onOpenSettings}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors cursor-pointer border border-stone-200"
                title="Configure Backend Settings"
              >
                <Settings className="w-3.5 h-3.5 text-stone-600" />
                <span className="hidden sm:inline">Settings</span>
              </button>

              {/* Write New Post */}
              <button
                onClick={onNewPost}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-full transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <PenSquare className="w-3.5 h-3.5" />
                <span>Write</span>
              </button>

              {/* Logout / Lock Session */}
              <button
                onClick={onLogoutAuthor}
                className="p-1.5 text-stone-500 hover:text-red-600 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
                title="Author Studio unlocked (Click to lock session)"
              >
                <Unlock className="w-4 h-4 text-emerald-600" />
              </button>
            </div>
          ) : (
            /* Subtle Author Login for Blog Owner (discreet lock icon) */
            <button
              onClick={onOpenPasskeyModal ? onOpenPasskeyModal : () => setShowPasskeyModal(true)}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
              title="Author Login"
              aria-label="Author Login"
            >
              <Lock className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Sub-navigation bar */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between border-t border-stone-200/60 text-xs font-semibold text-stone-600">
        <nav className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('home')}
            className={`py-2.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'home'
                ? 'border-stone-900 text-stone-900 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Publication Feed
          </button>

          {/* Dedicated Author Studio Tab when authenticated */}
          {isAuthor && (
            <button
              onClick={() => setActiveTab('author')}
              className={`py-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'author'
                  ? 'border-orange-600 text-orange-600 font-bold'
                  : 'border-transparent text-stone-600 hover:text-orange-600'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Author Studio</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('about')}
            className={`py-2.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'about'
                ? 'border-stone-900 text-stone-900 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            About & Author
          </button>
        </nav>

        <div className="hidden md:block text-[11px] text-stone-400">
          Independent Publication by {settings.authorName}
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="border-t border-stone-200 bg-white px-4 sm:px-6 py-2.5 animate-in slide-in-from-top-1 duration-150">
          <div className="max-w-xl mx-auto relative flex items-center">
            <Search className="w-4 h-4 text-stone-400 absolute left-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles by title, tags, or content..."
              className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-stone-50 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:bg-white transition-all font-sans"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-xs text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Dedicated Passkey Modal with Eye toggle */}
      <PasskeyModal
        isOpen={showPasskeyModal}
        hasAppsScript={Boolean(settings.appsScriptUrl)}
        onClose={() => setShowPasskeyModal(false)}
        onVerify={async (passkey) => {
          const res = await onLoginAuthor(passkey);
          if (res.success) {
            setActiveTab('author'); // Automatically open full Author Studio!
          }
          return res;
        }}
      />
    </header>
  );
};
