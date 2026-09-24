"use client";

import React, { useState, useRef, DragEvent } from "react";
import { UploadCloud, FileSpreadsheet, Loader2, Sparkles, AlertCircle, ArrowUpRight } from "lucide-react";
import { UploadResponse, ValidationIssue } from "@/types/data";

interface UploadDropzoneProps {
  onUploadSuccess: (response: UploadResponse) => void;
  onError: (errors: ValidationIssue[]) => void;
  workspaceId?: string;
  disabled?: boolean;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onUploadSuccess,
  onError,
  workspaceId = "00000000-0000-0000-0000-000000000001",
  disabled = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const handleUploadFile = async (file: File) => {
    if (!file || disabled || isUploading) return;

    setIsUploading(true);
    setUploadStatusText("Vaulting file to secure storage...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("workspace_id", workspaceId);

      setUploadStatusText("Running dynamic schema inference & DuckDB allocation...");

      const response = await fetch(`${apiBase}/api/v1/data/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 422 && Array.isArray(errorData.detail)) {
          onError(errorData.detail);
        } else {
          onError([
            {
              field: "upload",
              issue: errorData.detail || `Upload failed with status ${response.status}`,
            },
          ]);
        }
        setIsUploading(false);
        setUploadStatusText("");
        return;
      }

      const result: UploadResponse = await response.json();
      setUploadStatusText("Ingestion complete!");
      onUploadSuccess(result);
    } catch (err: any) {
      console.error("Upload error:", err);
      onError([
        {
          field: "network",
          issue: err?.message || "Failed to reach backend ingestion server.",
        },
      ]);
    } finally {
      setIsUploading(false);
      setUploadStatusText("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleLoadSample = async () => {
    if (disabled || isUploading) return;
    setIsUploading(true);
    setUploadStatusText("Retrieving reference dataset (SaaS_Q2_Financials.csv)...");

    try {
      const res = await fetch("/SaaS_Q2_Financials.csv");
      if (!res.ok) throw new Error("Could not find sample dataset file in public directory.");
      const blob = await res.blob();
      const sampleFile = new File([blob], "SaaS_Q2_Financials.csv", {
        type: "text/csv",
      });
      await handleUploadFile(sampleFile);
    } catch (err: any) {
      console.error("Load sample error:", err);
      onError([
        {
          field: "sample",
          issue: err?.message || "Could not load sample dataset.",
        },
      ]);
      setIsUploading(false);
      setUploadStatusText("");
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled || isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleUploadFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUploadFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv,.xlsx,.xls,.parquet,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (!isUploading && !disabled && fileInputRef.current) {
            fileInputRef.current.click();
          }
        }}
        className={`group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 sm:p-10 transition-all duration-200 cursor-pointer select-none ${
          isDragOver
            ? "border-accent-rust bg-accent-rust/5 shadow-lg"
            : "border-noir bg-bg-surface hover:border-text-secondary/60 hover:bg-bg-surface-subtle"
        } ${isUploading ? "pointer-events-none opacity-80" : ""}`}
      >
        {/* Subtle Archival Grid / Watermark accent */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />

        {/* Center Upload Icon / Spinner */}
        <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-noir bg-bg-canvas text-text-secondary group-hover:border-text-secondary group-hover:text-text-primary transition-colors">
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-accent-rust" />
          ) : (
            <UploadCloud className="h-6 w-6 transition-transform group-hover:-translate-y-0.5" />
          )}
        </div>

        {/* Primary Headline & Instructions */}
        <div className="text-center">
          <h4 className="font-display text-base sm:text-lg font-bold uppercase tracking-tight text-text-primary mb-1">
            {isUploading ? "Ingesting Financial Data" : "Deploy Financial Dossier"}
          </h4>

          <p className="font-body text-xs text-text-secondary max-w-sm mb-4">
            {isUploading
              ? uploadStatusText
              : "Drag and drop your ledger file here, or click to browse. Automatically classified and ingested into in-memory DuckDB."}
          </p>
        </div>

        {/* File Format Badge Strip */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <span className="rounded border border-noir bg-bg-canvas px-2 py-0.5 font-mono text-[10px] text-text-muted uppercase">
            .CSV
          </span>
          <span className="rounded border border-noir bg-bg-canvas px-2 py-0.5 font-mono text-[10px] text-text-muted uppercase">
            .XLSX
          </span>
          <span className="rounded border border-noir bg-bg-canvas px-2 py-0.5 font-mono text-[10px] text-text-muted uppercase">
            .XLS
          </span>
          <span className="rounded border border-noir bg-bg-canvas px-2 py-0.5 font-mono text-[10px] text-text-muted uppercase">
            .PARQUET
          </span>
          <span className="font-body text-[10px] text-text-muted ml-1">
            Max 50MB • Accounting parentheses parsed automatically
          </span>
        </div>

        {/* Divider with MI6 Dossier Style */}
        <div className="flex items-center gap-3 w-full max-w-xs my-1">
          <div className="h-px flex-1 bg-border-noir" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-text-muted">
            OR TEST WITH BENCHMARK
          </span>
          <div className="h-px flex-1 bg-border-noir" />
        </div>

        {/* Secondary Action: Load Sample Dataset */}
        <div className="mt-4" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            disabled={isUploading || disabled}
            onClick={handleLoadSample}
            className="inline-flex items-center gap-2 rounded-lg border border-accent-rust/60 bg-accent-rust/10 px-4 py-2 font-body text-xs font-bold uppercase tracking-wider text-accent-rust hover:bg-accent-rust/20 hover:border-accent-rust transition-colors cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Load Sample Dataset (SaaS Q2 Financials)</span>
            <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
          </button>
        </div>
      </div>
    </div>
  );
};
