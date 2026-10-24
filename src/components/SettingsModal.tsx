import React, { useState } from 'react';
import { BlogSettings } from '../types/blog';
import { fetchPostsViaAppsScript, fetchPostsFromPublicSheet } from '../services/googleSheets';
import { X, Table, ExternalLink, CheckCircle2, AlertCircle, RefreshCw, Save, ShieldCheck, HelpCircle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  settings: BlogSettings;
  onSaveSettings: (newSettings: BlogSettings) => void;
  onClose: () => void;
  onOpenGitHubPages: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onSaveSettings,
  onClose,
  onOpenGitHubPages,
}) => {
  const [formData, setFormData] = useState<BlogSettings>({ ...settings });
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!formData.appsScriptUrl && !formData.spreadsheetId) {
      setTestStatus('error');
      setTestMessage('Please provide a Google Apps Script Web App URL or Spreadsheet ID.');
      return;
    }

    setTestStatus('testing');
    try {
      if (formData.appsScriptUrl) {
        const posts = await fetchPostsViaAppsScript(formData.appsScriptUrl);
        setTestStatus('success');
        setTestMessage(`Connection verified! Found ${posts.length} articles via Apps Script.`);
      } else if (formData.spreadsheetId) {
        const posts = await fetchPostsFromPublicSheet(formData.spreadsheetId);
        setTestStatus('success');
        setTestMessage(`Connection verified! Read ${posts.length} articles from Public Sheet.`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Connection test failed';
      setTestStatus('error');
      setTestMessage(`Error: ${msg}. Make sure Web App access is set to "Anyone".`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-700 text-white rounded-lg">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-stone-900 leading-tight">
                Publication & Backend Settings
              </h2>
              <p className="text-xs text-stone-500 font-sans">
                GitHub Pages + Google Sheets Backend Configuration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 font-sans text-xs sm:text-sm">
          {/* Section: Publication Branding */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Publication Branding
            </h3>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Publication Name
              </label>
              <input
                type="text"
                required
                value={formData.publicationName}
                onChange={(e) => setFormData({ ...formData, publicationName: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:bg-white text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Publication Tagline
              </label>
              <input
                type="text"
                value={formData.publicationTagline}
                onChange={(e) => setFormData({ ...formData, publicationTagline: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:bg-white text-xs sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Author Name
                </label>
                <input
                  type="text"
                  value={formData.authorName}
                  onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:bg-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Author Avatar URL
                </label>
                <input
                  type="url"
                  value={formData.authorAvatar}
                  onChange={(e) => setFormData({ ...formData, authorAvatar: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:bg-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Author Short Bio
              </label>
              <textarea
                rows={2}
                value={formData.authorBio}
                onChange={(e) => setFormData({ ...formData, authorBio: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:bg-white text-xs resize-none"
              ></textarea>
            </div>
          </div>

          {/* Section: Google Sheets Backend for GitHub Pages */}
          <div className="pt-4 border-t border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Google Sheets Backend (GitHub Pages)
              </h3>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenGitHubPages();
                }}
                className="text-orange-600 hover:text-orange-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>View Setup Guide</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Google Apps Script Web App URL (Recommended)
              </label>
              <input
                type="url"
                value={formData.appsScriptUrl}
                onChange={(e) => setFormData({ ...formData, appsScriptUrl: e.target.value.trim() })}
                placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                className="w-full px-3 py-2 bg-stone-50 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:bg-white text-xs font-mono"
              />
              <p className="text-[11px] text-stone-500 mt-1">
                Enables writing, editing, and anonymous reader comments directly on GitHub Pages without any Google Cloud API keys.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Google Sheet ID (Optional for direct public reading)
              </label>
              <input
                type="text"
                value={formData.spreadsheetId}
                onChange={(e) => setFormData({ ...formData, spreadsheetId: e.target.value.trim() })}
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgm..."
                className="w-full px-3 py-2 bg-stone-50 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:bg-white text-xs font-mono"
              />
            </div>

            {/* Security Guarantee Box */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Zero Secret Exposure on GitHub Pages</p>
                <p className="text-[11px] text-emerald-800 leading-relaxed mt-0.5">
                  Your author password is never saved in the browser or GitHub code. It resides on Google's cloud servers in your Apps Script project with anti-brute-force lockout protection (max 5 failed attempts, 15-minute freeze).
                </p>
              </div>
            </div>

            {formData.spreadsheetId && (
              <a
                href={`https://docs.google.com/spreadsheets/d/${formData.spreadsheetId}`}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 hover:text-emerald-800 text-xs font-semibold inline-flex items-center gap-1"
              >
                <span>Open Google Sheet in new tab</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            {/* Test Connection feedback */}
            {testStatus !== 'idle' && (
              <div className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                testStatus === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : testStatus === 'error'
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-stone-50 text-stone-800 border border-stone-200'
              }`}>
                {testStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                {testStatus === 'error' && <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />}
                {testStatus === 'testing' && <RefreshCw className="w-4 h-4 text-stone-600 animate-spin shrink-0 mt-0.5" />}
                <span>{testMessage}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleTestConnection}
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 underline flex items-center gap-1 cursor-pointer"
            >
              <span>Test Google Sheets Backend Connection</span>
            </button>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
