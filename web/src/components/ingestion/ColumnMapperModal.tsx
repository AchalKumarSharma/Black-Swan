"use client";

import React, { useState } from "react";
import { X, CheckCircle2, AlertTriangle, Loader2, ArrowRight } from "lucide-react";
import {
  ColumnRole,
  ConfirmMappingResponse,
  InferredColumn,
  InferredSchema,
  ValidationIssue,
} from "@/types/data";

interface ColumnMapperModalProps {
  datasetId: string;
  fileName: string;
  inferredSchema: InferredSchema;
  onConfirm: (response: ConfirmMappingResponse) => void;
  onCancel: () => void;
  onError: (errors: ValidationIssue[]) => void;
}

const ROLE_OPTIONS: { role: ColumnRole; label: string; description: string }[] = [
  { role: "period", label: "Period / Time", description: "Quarter, Month, Date, Fiscal Period" },
  { role: "dimension", label: "Dimension / Entity", description: "Region, Segment, Cohort, Product" },
  { role: "revenue", label: "Revenue / Inflow", description: "Top-line Income, ARR, Bookings" },
  { role: "cogs", label: "COGS / Cost", description: "Cost of Goods Sold, Direct Expense" },
  { role: "other", label: "Other / Unmapped", description: "Ignored for primary variance formula" },
];

export const ColumnMapperModal: React.FC<ColumnMapperModalProps> = ({
  datasetId,
  fileName,
  inferredSchema,
  onConfirm,
  onCancel,
  onError,
}) => {
  // Initialize role mappings with initially detected roles
  const [mappings, setMappings] = useState<Record<string, ColumnRole>>(() => {
    const initial: Record<string, ColumnRole> = {};
    for (const col of inferredSchema.columns) {
      initial[col.name] = col.detected_role;
    }
    return initial;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const handleRoleChange = (columnName: string, role: ColumnRole) => {
    setMappings((prev) => ({
      ...prev,
      [columnName]: role,
    }));
    setValidationError(null);
  };

  const handleSubmit = async () => {
    // Validate that at least one revenue column is mapped
    const hasRevenue = Object.values(mappings).includes("revenue");
    if (!hasRevenue) {
      setValidationError("At least one column must be mapped as 'Revenue / Inflow'.");
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);

    try {
      const response = await fetch(`${apiBase}/api/v1/data/${datasetId}/confirm-mapping`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mapping: mappings,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 422 && Array.isArray(errorData.detail)) {
          onError(errorData.detail);
        } else {
          setValidationError(errorData.detail || "Failed to confirm column mappings.");
        }
        setIsSubmitting(false);
        return;
      }

      const result: ConfirmMappingResponse = await response.json();
      onConfirm(result);
    } catch (err: any) {
      console.error("Confirm mapping error:", err);
      setValidationError(err?.message || "Failed to communicate with schema mapping server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm transition-opacity duration-200">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-noir bg-bg-surface shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-noir bg-bg-canvas px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-accent-rust">
              CLASSIFIED //
            </span>
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-text-primary">
              Resolve Ledger Column Roles
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded p-1 text-text-secondary hover:bg-bg-surface hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-noir bg-bg-canvas p-3.5 text-xs text-text-secondary">
            <AlertTriangle className="h-4 w-4 text-accent-rust shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-text-primary">
                Dataset: {fileName}
              </span>
              <p className="mt-0.5 text-text-secondary leading-relaxed">
                Automated inference detected ambiguity in financial role assignments. Verify or
                override the analytical roles below before registering into DuckDB.
              </p>
            </div>
          </div>

          {validationError && (
            <div className="rounded-lg border border-red-900/50 bg-red-950/20 px-4 py-2.5 text-xs text-red-300">
              {validationError}
            </div>
          )}

          {/* Columns Table */}
          <div className="rounded-lg border border-noir overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-noir bg-bg-canvas font-display uppercase tracking-wider text-text-secondary text-[11px]">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Column</th>
                  <th className="py-2.5 px-3 font-semibold">Type</th>
                  <th className="py-2.5 px-4 font-semibold">Samples</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Analytical Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-noir bg-bg-surface font-body">
                {inferredSchema.columns.map((col: InferredColumn) => {
                  const currentRole = mappings[col.name] || "other";
                  return (
                    <tr key={col.name} className="hover:bg-bg-canvas/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-text-primary">
                        {col.name}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-text-muted">
                        {col.dtype}
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] text-text-secondary max-w-[180px] truncate">
                        {col.sample_values && col.sample_values.length > 0
                          ? col.sample_values.filter(Boolean).slice(0, 3).join(", ")
                          : "—"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <select
                          value={currentRole}
                          onChange={(e) => handleRoleChange(col.name, e.target.value as ColumnRole)}
                          className="rounded border border-noir bg-bg-canvas px-2.5 py-1 text-xs font-medium text-text-primary focus:border-text-secondary focus:outline-none cursor-pointer"
                        >
                          {ROLE_OPTIONS.map((opt) => (
                            <option key={opt.role} value={opt.role} className="bg-bg-surface text-text-primary">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-noir bg-bg-canvas px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded border border-noir px-4 py-2 font-body text-xs font-bold uppercase tracking-wider text-text-secondary hover:border-text-primary hover:text-text-primary transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded bg-accent-contrast px-5 py-2 font-body text-xs font-bold uppercase tracking-wider text-bg-canvas hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Registering Table...</span>
              </>
            ) : (
              <>
                <span>Confirm & Register In DuckDB</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
