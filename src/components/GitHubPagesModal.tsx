import React, { useState } from 'react';
import { X, Github, Copy, Check, ExternalLink, Code2, Rocket, FileText, CheckCircle2 } from 'lucide-react';
import { APPS_SCRIPT_TEMPLATE } from '../services/googleSheets';
import { BlogSettings } from '../types/blog';

interface GitHubPagesModalProps {
  isOpen: boolean;
  settings: BlogSettings;
  onClose: () => void;
  onOpenSettings: () => void;
}

export const GitHubPagesModal: React.FC<GitHubPagesModalProps> = ({
  isOpen,
  settings,
  onClose,
  onOpenSettings,
}) => {
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedWorkflow, setCopiedWorkflow] = useState(false);
  const [activeTab, setActiveTab] = useState<'guide' | 'script' | 'workflow'>('guide');

  if (!isOpen) return null;

  const githubActionsWorkflow = `# .github/workflows/deploy.yml
name: Deploy InkSheet to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build static site
        run: npm run build

      - name: Upload artifact for GitHub Pages
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_TEMPLATE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleCopyWorkflow = () => {
    navigator.clipboard.writeText(githubActionsWorkflow);
    setCopiedWorkflow(true);
    setTimeout(() => setCopiedWorkflow(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-stone-900 text-white rounded-lg">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-stone-900 leading-tight">
                Deploying to GitHub Pages
              </h2>
              <p className="text-xs text-stone-500 font-sans">
                Host your Substack publication for free with a Google Sheets serverless backend
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

        {/* Tab Switcher */}
        <div className="px-6 border-b border-stone-200 flex items-center gap-4 text-xs font-semibold text-stone-600 bg-white">
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'guide' ? 'border-orange-600 text-orange-600 font-bold' : 'border-transparent hover:text-stone-900'
            }`}
          >
            <Rocket className="w-4 h-4" />
            <span>3-Step Quickstart</span>
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'script' ? 'border-orange-600 text-orange-600 font-bold' : 'border-transparent hover:text-stone-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Google Apps Script (Comments Backend)</span>
          </button>
          <button
            onClick={() => setActiveTab('workflow')}
            className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'workflow' ? 'border-orange-600 text-orange-600 font-bold' : 'border-transparent hover:text-stone-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>GitHub Actions Workflow</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-stone-700 font-sans text-xs sm:text-sm">
          {activeTab === 'guide' && (
            <div className="space-y-5">
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-stone-800">
                <h4 className="font-bold text-orange-900 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-orange-600" />
                  Zero-Server Architecture
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Your blog lives on GitHub's global CDN as static files. When you write or edit in the Markdown editor, articles are stored in Google Sheets. Readers browse instantaneously and can post comments directly to your spreadsheet!
                </p>
              </div>

              {/* Steps */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </span>
                  <div>
                    <h5 className="font-bold text-stone-900 text-sm">Create a Google Sheet</h5>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Create a new blank Google Sheet in your Google Drive (named e.g. "My Publication").
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </span>
                  <div>
                    <h5 className="font-bold text-stone-900 text-sm">Deploy Google Apps Script for Public Comments</h5>
                    <p className="text-xs text-stone-500 mt-0.5">
                      In your Google Sheet, go to <strong>Extensions &gt; Apps Script</strong>, paste the script from the tab above, and deploy it as a Web App (Access: Anyone). This allows any reader on GitHub Pages to comment!
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    3
                  </span>
                  <div>
                    <h5 className="font-bold text-stone-900 text-sm">Push to GitHub & Enable Pages</h5>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Create a GitHub repository, push this code, and go to <strong>Settings &gt; Pages &gt; Build and deployment: GitHub Actions</strong>. Your blog is live on <code className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-800">https://yourusername.github.io</code>!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'script' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">Google Apps Script Web Connector</h4>
                  <p className="text-xs text-stone-500">
                    Paste this into your Google Sheet to enable unauthenticated reader comments and post retrieval.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyScript}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedScript ? 'Copied Code!' : 'Copy Script'}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 bg-stone-900 text-stone-200 rounded-xl text-xs font-mono overflow-x-auto max-h-72 border border-stone-800">
                  <code>{APPS_SCRIPT_TEMPLATE}</code>
                </pre>
              </div>

              <div className="text-[11px] text-stone-500 space-y-1">
                <p><strong>Deployment instructions:</strong></p>
                <ol className="list-decimal pl-5 space-y-0.5">
                  <li>In Google Sheets: <em>Extensions &gt; Apps Script</em></li>
                  <li>Paste the code, click <em>Deploy &gt; New deployment</em></li>
                  <li>Select <em>Web app</em>: Execute as <strong>Me</strong>, Who has access: <strong>Anyone</strong></li>
                  <li>Copy Web App URL into this app's <strong>Settings &gt; Google Apps Script URL</strong>.</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'workflow' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">GitHub Actions Workflow</h4>
                  <p className="text-xs text-stone-500">
                    Save this file in your repo at <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800">.github/workflows/deploy.yml</code>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyWorkflow}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  {copiedWorkflow ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedWorkflow ? 'Copied Workflow!' : 'Copy Workflow'}</span>
                </button>
              </div>

              <pre className="p-4 bg-stone-900 text-stone-200 rounded-xl text-xs font-mono overflow-x-auto max-h-72 border border-stone-800">
                <code>{githubActionsWorkflow}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <span className="text-xs text-stone-500">
            Current backend: <strong className="text-stone-800">{settings.spreadsheetId ? 'Google Sheets' : 'Local Demo Storage'}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
