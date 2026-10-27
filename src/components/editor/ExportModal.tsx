import React, { useState } from 'react';
import { useSiteContent } from '../../context/ContentContext.tsx';
import {
  Download,
  Copy,
  Check,
  Upload,
  RefreshCw,
  FileCode,
  FileJson,
  X,
  Server,
  Sparkles,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const {
    exportTypeScriptCode,
    exportJsonCode,
    importJsonCode,
    publishToCodebase,
    saveDraft,
    resetToDefaults,
  } = useSiteContent();

  const [copiedTs, setCopiedTs] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleCopyTs = () => {
    navigator.clipboard.writeText(exportTypeScriptCode());
    setCopiedTs(true);
    setTimeout(() => setCopiedTs(false), 2000);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(exportJsonCode());
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleDownloadTs = () => {
    const code = exportTypeScriptCode();
    const blob = new Blob([code], { type: 'text/typescript;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'siteContent.ts';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const json = exportJsonCode();
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sgs-site-config-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setPublishResult(null);
    saveDraft();
    const result = await publishToCodebase();
    setIsPublishing(false);
    setPublishResult(result);
  };

  const handleImportSubmit = () => {
    if (!importText.trim()) return;
    const res = importJsonCode(importText);
    if (res.success) {
      setImportStatus('Configuration successfully imported!');
      setTimeout(() => {
        setImportStatus(null);
        onClose();
      }, 1500);
    } else {
      setImportStatus(`Error: ${res.error}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#101318] p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#2563EB]/20 text-[#2563EB]">
              <Server className="size-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold">
                Publish & Export Site Content
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Permanent deployment for GitHub & Cloudflare Pages static hosting.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-5 space-y-5 max-h-[75vh] overflow-y-auto pr-1">
          {/* Primary Action: Direct Codebase Publish */}
          <div className="rounded-xl border border-[#2563EB]/30 bg-gradient-to-r from-[#2563EB]/10 to-transparent p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#38BDF8] uppercase tracking-wider mb-1">
                  <Sparkles className="size-3" /> Recommended (1-Click)
                </span>
                <h4 className="font-display font-bold text-base text-white">
                  Publish to Codebase File
                </h4>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">
                  Writes all active edits directly to <code className="text-white bg-black/50 px-1.5 py-0.5 rounded font-mono">src/data/siteContent.ts</code>. Your changes will be preserved permanently in the project repository.
                </p>
              </div>
              <button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing}
                className="shrink-0 flex items-center gap-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] px-4 py-2.5 text-xs font-bold text-white shadow-lg transition disabled:opacity-50 cursor-pointer"
              >
                {isPublishing ? (
                  <RefreshCw className="size-4 animate-spin" />
                ) : (
                  <Server className="size-4" />
                )}
                <span>{isPublishing ? 'Publishing...' : 'Save to Codebase'}</span>
              </button>
            </div>

            {publishResult && (
              <div
                className={`mt-3 rounded-lg p-2.5 text-xs font-semibold ${
                  publishResult.success
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {publishResult.message}
              </div>
            )}
          </div>

          {/* Static Deployment Options */}
          <div className="grid grid-cols-2 gap-3">
            {/* Download siteContent.ts */}
            <div className="rounded-xl border border-white/10 bg-[#161B22] p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-white font-bold text-xs mb-1">
                  <FileCode className="size-4 text-[#38BDF8]" />
                  Download siteContent.ts
                </div>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  Export ready-to-replace TypeScript source file for permanent manual commitment.
                </p>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadTs}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 py-2 text-xs font-semibold text-white transition"
                >
                  <Download className="size-3.5" />
                  <span>Download .ts</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyTs}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
                  title="Copy to clipboard"
                >
                  {copiedTs ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                </button>
              </div>
            </div>

            {/* Export JSON Config */}
            <div className="rounded-xl border border-white/10 bg-[#161B22] p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-white font-bold text-xs mb-1">
                  <FileJson className="size-4 text-emerald-400" />
                  Export JSON Backup
                </div>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  Portable JSON snapshot of all 6 sections, media crops, and project dossiers.
                </p>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 py-2 text-xs font-semibold text-white transition"
                >
                  <Download className="size-3.5" />
                  <span>Download .json</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
                  title="Copy to clipboard"
                >
                  {copiedJson ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Import JSON Configuration */}
          <div className="rounded-xl border border-white/10 bg-[#161B22] p-4">
            <h4 className="font-display font-bold text-xs text-white mb-2 flex items-center gap-2">
              <Upload className="size-3.5 text-[#2563EB]" />
              Import Configuration JSON
            </h4>
            <textarea
              rows={3}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste JSON configuration payload here..."
              className="w-full rounded-lg border border-white/10 bg-black/60 p-2.5 font-mono text-[11px] text-white/80 focus:border-[#2563EB] focus:outline-none"
            />
            <div className="mt-2 flex items-center justify-between">
              {importStatus ? (
                <span className="text-xs text-amber-300 font-semibold">{importStatus}</span>
              ) : (
                <span className="text-[11px] text-[#94A3B8]">Replaces active working draft</span>
              )}
              <button
                type="button"
                onClick={handleImportSubmit}
                className="rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-semibold text-white transition"
              >
                Apply JSON
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => {
              if (confirm('Revert all edits back to code defaults?')) {
                resetToDefaults();
                onClose();
              }
            }}
            className="text-red-400 hover:text-red-300 hover:underline"
          >
            Reset All to Factory Defaults
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-white/10 hover:bg-white/20 px-4 py-1.5 font-semibold text-white transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
