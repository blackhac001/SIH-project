import React, { useState, useEffect, useRef } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';
import {
  FileText, UploadCloud, CheckCircle2, AlertTriangle,
  Download, Trash2, RefreshCw, FileCheck, ShieldCheck,
  Eye, ChevronDown, ChevronUp, Copy, Check, Sparkles
} from 'lucide-react';
import { resumeService } from '../../services/resumeService';
import { ResumeData, ResumeStatus, ResumeExtractedText } from '../../types/resume';

interface ResumeUploadCardProps {
  onUploadSuccess?: (resume: ResumeData) => void;
  onDeleteSuccess?: () => void;
  onAnalyzeSuccess?: (analysis: any) => void;
  onAnalyzeClick?: () => void;
  isAnalyzing?: boolean;
  className?: string;
  glow?: 'none' | 'cyan' | 'purple' | 'blue' | 'emerald';
}

export const ResumeUploadCard: React.FC<ResumeUploadCardProps> = ({
  onUploadSuccess,
  onDeleteSuccess,
  onAnalyzeSuccess,
  onAnalyzeClick,
  isAnalyzing = false,
  className = '',
  glow = 'cyan',
}) => {
  const [status, setStatus] = useState<ResumeStatus>({ has_resume: false, resume: null });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [internalAnalyzing, setInternalAnalyzing] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showExtractedText, setShowExtractedText] = useState<boolean>(false);
  const [extractedData, setExtractedData] = useState<ResumeExtractedText | null>(null);
  const [isLoadingText, setIsLoadingText] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      const data = await resumeService.getStatus();
      setStatus(data);
    } catch {
      setStatus({ has_resume: false, resume: null });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (isoString?: string): string => {
    if (!isoString) return '';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const handleToggleText = async () => {
    if (!showExtractedText && !extractedData) {
      try {
        setIsLoadingText(true);
        const data = await resumeService.getExtractedText();
        setExtractedData(data);
      } catch (err: any) {
        setErrorMsg(err?.response?.data?.detail || 'Failed to retrieve extracted text.');
      } finally {
        setIsLoadingText(false);
      }
    }
    setShowExtractedText(!showExtractedText);
  };

  const handleCopyText = () => {
    if (extractedData?.extracted_text) {
      navigator.clipboard.writeText(extractedData.extracted_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFileSelection = async (file: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setExtractedData(null);
    setShowExtractedText(false);

    // Validate extension
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (ext !== '.pdf' && ext !== '.docx') {
      setErrorMsg('Invalid file format. Only PDF (.pdf) and Word (.docx) documents are supported.');
      return;
    }

    // Validate size (10 MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the 10 MB limit.`);
      return;
    }

    if (file.size === 0) {
      setErrorMsg('The selected file is empty (0 bytes). Please upload a valid document.');
      return;
    }

    try {
      setIsUploading(true);
      const res = await resumeService.upload(file);
      setStatus({ has_resume: true, resume: res.resume });
      setSuccessMsg(`Uploaded "${res.resume.filename}". Click "Analyse" to generate verified capability scores.`);
      if (onUploadSuccess) {
        onUploadSuccess(res.resume);
      }
      setTimeout(() => setSuccessMsg(null), 6000);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Failed to upload CV. Please try again.';
      setErrorMsg(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAnalyse = async () => {
    if (onAnalyzeClick) {
      onAnalyzeClick();
      return;
    }

    try {
      setInternalAnalyzing(true);
      setErrorMsg(null);
      const data = await resumeService.analyze("Senior AI & Cloud Platform Engineer");
      setSuccessMsg("AI Resume Analysis completed successfully!");
      if (onAnalyzeSuccess) {
        onAnalyzeSuccess(data);
      }
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Could not complete AI analysis. Please ensure your CV has readable text.';
      setErrorMsg(msg);
    } finally {
      setInternalAnalyzing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleDownload = async () => {
    try {
      const { blob, filename } = await resumeService.download();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || status.resume?.filename || 'my_cv.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || 'Failed to download CV.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to remove your uploaded CV?')) {
      return;
    }
    try {
      setIsDeleting(true);
      await resumeService.delete();
      setStatus({ has_resume: false, resume: null });
      setExtractedData(null);
      setShowExtractedText(false);
      setSuccessMsg('Active CV and extracted text removed from your account.');
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || 'Failed to delete CV.');
    } finally {
      setIsDeleting(false);
    }
  };

  const analyzingState = isAnalyzing || internalAnalyzing;

  return (
    <Card
      glow={glow}
      title="Verified Career Document & Structured CV"
      subtitle="Secure document parsing, text extraction and capability ledger"
      className={className}
      icon={<FileCheck className="w-4 h-4 text-cyan-400" />}
      action={
        status.has_resume ? (
          <Badge variant="emerald" size="sm" dot>
            Active CV Verified
          </Badge>
        ) : (
          <Badge variant="slate" size="sm">
            No CV Uploaded
          </Badge>
        )
      }
    >
      <div className="space-y-4">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={handleInputChange}
          disabled={isUploading || isDeleting || analyzingState}
        />

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between gap-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-rose-400 hover:text-rose-200 text-xs font-mono font-bold px-1"
            >
              ✕
            </button>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Upload Dropzone / Existing File Card */}
        {isLoading ? (
          <div className="py-8 flex items-center justify-center text-slate-400 text-xs gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Checking document ledger...</span>
          </div>
        ) : status.has_resume && status.resume ? (
          /* Active CV Display Card */
          <div className="space-y-3">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-cyan-500/5">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-md">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white truncate">
                      {status.resume.filename}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 font-mono border border-cyan-500/30">
                      {status.resume.filename.endsWith('.docx') ? 'DOCX' : 'PDF'}
                    </span>
                    {status.resume.word_count ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 font-mono border border-emerald-500/30">
                        {status.resume.word_count} words
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>{formatFileSize(status.resume.file_size)}</span>
                    <span>•</span>
                    <span>Uploaded {formatDate(status.resume.created_at)}</span>
                    <span>•</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Structured Text Extracted
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                {/* Clear "Analyse" Button */}
                <Button
                  variant="cyber"
                  size="sm"
                  onClick={handleAnalyse}
                  isLoading={analyzingState}
                  disabled={analyzingState}
                  leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                >
                  Analyse
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleText}
                  isLoading={isLoadingText}
                  leftIcon={<Eye className="w-3.5 h-3.5" />}
                  rightIcon={showExtractedText ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                >
                  {showExtractedText ? 'Hide Text' : 'View Text'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                >
                  Download
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  isLoading={isUploading}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5 text-cyan-400" />}
                >
                  Replace CV
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  isLoading={isDeleting}
                  className="text-slate-400 hover:text-rose-400 hover:bg-rose-950/30"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Structured Extracted Text Viewer Accordion */}
            {showExtractedText && (
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono uppercase text-cyan-300">
                      Normalized Extracted Text
                    </span>
                    {extractedData && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        ({extractedData.char_count} chars, {extractedData.word_count} words)
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyText}
                    leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  >
                    {copied ? 'Copied' : 'Copy Text'}
                  </Button>
                </div>

                {isLoadingText ? (
                  <div className="py-6 flex items-center justify-center text-slate-500 text-xs gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>Loading extracted text...</span>
                  </div>
                ) : extractedData?.extracted_text ? (
                  <div className="max-h-60 overflow-y-auto p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed select-text">
                    {extractedData.extracted_text}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-amber-500/30 text-amber-300 text-xs">
                    No text content could be extracted from this file. Scanned images require OCR.
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Empty State & Upload Dropzone */
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center group ${
              dragActive
                ? 'border-cyan-400 bg-cyan-950/20'
                : 'border-slate-800 hover:border-cyan-500/40 bg-slate-950/50 hover:bg-slate-900/60'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-cyan-500/10">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">
              Upload your CV or Resume
            </h4>
            <p className="text-xs text-slate-400 max-w-sm">
              Drag and drop your <strong className="text-cyan-300">PDF</strong> or <strong className="text-cyan-300">DOCX</strong> file here, or click to browse. Max size 10 MB.
            </p>
            <div className="mt-4">
              <Button
                variant="cyber"
                size="sm"
                isLoading={isUploading}
                leftIcon={<UploadCloud className="w-4 h-4" />}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Select Document
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
