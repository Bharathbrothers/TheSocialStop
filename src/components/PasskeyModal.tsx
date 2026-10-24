import React, { useState, useEffect } from 'react';
import { KeyRound, ShieldAlert, Clock, Eye, EyeOff, X, Lock } from 'lucide-react';
import { getRemainingCooldownSeconds } from '../services/auth';

interface PasskeyModalProps {
  isOpen: boolean;
  hasAppsScript: boolean;
  onClose: () => void;
  onVerify: (passkey: string) => Promise<{ success: boolean; error?: string }>;
}

export const PasskeyModal: React.FC<PasskeyModalProps> = ({
  isOpen,
  hasAppsScript,
  onClose,
  onVerify,
}) => {
  const [passkey, setPasskey] = useState('');
  const [showPasskey, setShowPasskey] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(() => getRemainingCooldownSeconds());

  // Countdown timer for anti-brute-force lockout
  useEffect(() => {
    if (!isOpen) return;
    setCooldownSeconds(getRemainingCooldownSeconds());
  }, [isOpen]);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setErrorMessage(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldownSeconds > 0 || isVerifying || !passkey.trim()) return;

    setIsVerifying(true);
    setErrorMessage(null);

    const result = await onVerify(passkey.trim());
    setIsVerifying(false);

    if (result.success) {
      setPasskey('');
      setErrorMessage(null);
      onClose();
    } else {
      setErrorMessage(result.error || 'Incorrect passkey');
      const rem = getRemainingCooldownSeconds();
      if (rem > 0) {
        setCooldownSeconds(rem);
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans"
      role="dialog"
      aria-modal="true"
    >
      {/* Fixed-dimension Modal Container centered in viewport */}
      <div className="w-full max-w-md m-auto bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-100 text-orange-700 rounded-lg">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif text-stone-900 leading-tight">
                Author Authentication
              </h3>
              <p className="text-[11px] text-stone-500 font-sans">
                {hasAppsScript 
                  ? 'Server verification via Google Apps Script' 
                  : 'Local Preview Mode (Default: writer2026)'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body - Selected Element */}
        <div className="p-6 sm:p-7 overflow-y-auto max-h-[calc(90vh-90px)]">
          <p className="text-sm text-stone-600 mb-5 leading-relaxed font-sans">
            Enter your author secret to unlock the Markdown editor and publish articles directly to your Google Sheets backend.
          </p>

          {cooldownSeconds > 0 ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs flex items-center gap-2.5 mb-2">
              <Clock className="w-4 h-4 text-red-600 shrink-0 animate-pulse" />
              <div>
                <p className="font-semibold">Anti-Brute-Force Lockout Active</p>
                <p className="text-[11px] text-red-700 mt-0.5">
                  Too many failed attempts. Please wait <strong>{cooldownSeconds}s</strong> before retrying.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Author Passkey
                </label>
                
                {/* Fixed-height Input with show/hide toggle */}
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-stone-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPasskey ? 'text' : 'password'}
                    required
                    autoFocus
                    disabled={isVerifying}
                    value={passkey}
                    onChange={(e) => {
                      setPasskey(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder={hasAppsScript ? 'Enter passkey...' : 'Default: writer2026'}
                    className="w-full pl-9 pr-10 py-2.5 text-sm bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white font-mono tracking-wider transition-all"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPasskey(!showPasskey)}
                    className="absolute right-3 p-1 text-stone-400 hover:text-stone-700 rounded transition-colors cursor-pointer"
                    title={showPasskey ? 'Hide passkey' : 'Show passkey'}
                  >
                    {showPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Fixed-height error slot prevents modal layout jump */}
                <div className="min-h-[22px] mt-1.5">
                  {errorMessage && (
                    <div className="flex items-center gap-1.5 text-xs text-red-600 font-sans animate-in fade-in duration-100">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-100 font-sans">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifying || !passkey.trim()}
                  className="px-5 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                >
                  {isVerifying ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Unlock Studio</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
