"use client";

import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { ArrowUpDown, Download, Copy, Check, Database, AlertCircle } from "lucide-react";
import { Q_Diagnostic } from "@/types/contracts";

interface DataTableCardProps {
  diagnostic: Q_Diagnostic;
  hideHeader?: boolean;
}

export const DataTableCard: React.FC<DataTableCardProps> = ({
  diagnostic,
  hideHeader = false,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [copiedSql, setCopiedSql] = useState(false);

  // Column definitions with formatting for financial metrics
  const columns = useMemo<ColumnDef<Record<string, any>>[]>(() => {
    return [
      {
        accessorKey: "region",
        header: "Territory / Region",
        cell: (info) => {
          const name = String(info.getValue());
          const isSouth = name.toLowerCase().includes("south");
          return (
            <div className="flex items-center gap-2">
              <span className={`font-body text-sm ${isSouth ? "font-bold text-accent-rust" : "font-medium text-text-primary"}`}>
                {name}
              </span>
              {isSouth && (
                <span className="inline-flex items-center gap-1 rounded bg-accent-rust/15 px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider text-accent-rust">
                  <AlertCircle className="h-2.5 w-2.5" />
                  Primary Anomaly
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "q1_revenue",
        header: "Q1 Revenue",
        cell: (info) => {
          const val = Number(info.getValue());
          return (
            <span className="font-mono text-sm tabular-nums text-text-secondary text-right block">
              ${val.toLocaleString("en-US")}
            </span>
          );
        },
      },
      {
        accessorKey: "q2_revenue",
        header: "Q2 Revenue",
        cell: (info) => {
          const val = Number(info.getValue());
          return (
            <span className="font-mono text-sm tabular-nums text-text-primary font-semibold text-right block">
              ${val.toLocaleString("en-US")}
            </span>
          );
        },
      },
      {
        accessorKey: "revenue_delta_pct",
        header: "Rev. Δ %",
        cell: (info) => {
          const val = Number(info.getValue());
          const isNegative = val < 0;
          return (
            <span
              className={`font-mono text-sm tabular-nums text-right block ${
                isNegative ? "text-accent-rust font-semibold" : "text-text-secondary"
              }`}
            >
              {val > 0 ? `+${val.toFixed(2)}%` : `${val.toFixed(2)}%`}
            </span>
          );
        },
      },
      {
        accessorKey: "q1_cogs",
        header: "Q1 COGS",
        cell: (info) => {
          const val = Number(info.getValue());
          return (
            <span className="font-mono text-sm tabular-nums text-text-secondary text-right block">
              ${val.toLocaleString("en-US")}
            </span>
          );
        },
      },
      {
        accessorKey: "q2_cogs",
        header: "Q2 COGS",
        cell: (info) => {
          const val = Number(info.getValue());
          return (
            <span className="font-mono text-sm tabular-nums text-text-primary font-semibold text-right block">
              ${val.toLocaleString("en-US")}
            </span>
          );
        },
      },
      {
        accessorKey: "cogs_delta_pct",
        header: "COGS Δ %",
        cell: (info) => {
          const val = Number(info.getValue());
          const isHighExpansion = val > 5;
          return (
            <span
              className={`font-mono text-sm tabular-nums text-right block ${
                isHighExpansion ? "text-accent-rust font-bold" : "text-text-secondary"
              }`}
            >
              {val > 0 ? `+${val.toFixed(2)}%` : `${val.toFixed(2)}%`}
            </span>
          );
        },
      },
      {
        accessorKey: "q1_gm_pct",
        header: "Q1 GM %",
        cell: (info) => (
          <span className="font-mono text-sm tabular-nums text-text-secondary text-right block">
            {Number(info.getValue()).toFixed(2)}%
          </span>
        ),
      },
      {
        accessorKey: "q2_gm_pct",
        header: "Q2 GM %",
        cell: (info) => {
          const val = Number(info.getValue());
          return (
            <span className="font-mono text-sm tabular-nums text-text-primary font-semibold text-right block">
              {val.toFixed(2)}%
            </span>
          );
        },
      },
      {
        accessorKey: "gm_variance_bps",
        header: "Variance (bps)",
        cell: (info) => {
          const val = Number(info.getValue());
          const isSeverelyNegative = val < -500;
          return (
            <span
              className={`font-mono text-sm tabular-nums font-bold text-right block ${
                isSeverelyNegative ? "text-accent-rust" : "text-text-secondary"
              }`}
            >
              {val > 0 ? `+${val.toLocaleString()} bps` : `${val.toLocaleString()} bps`}
            </span>
          );
        },
      },
    ];
  }, []);

  const table = useReactTable({
    data: diagnostic.rows,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleCopySql = () => {
    navigator.clipboard.writeText(diagnostic.executed_sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleDownloadCsv = () => {
    const headers = diagnostic.table_headers.join(",");
    const rowLines = diagnostic.rows.map((row) =>
      diagnostic.table_headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rowLines].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "black_swan_q_diagnostic_slice.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="rounded-md border border-noir bg-bg-surface p-6 shadow-none transition-all">
      {/* Optional Card Header */}
      {!hideHeader && (
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-noir mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-text-secondary">
              <Database className="h-4 w-4" />
            </div>
            <span className="font-display text-base font-bold uppercase tracking-tight text-text-primary leading-none">
              Diagnostic Financial Ledger Slice
            </span>
            <span className="text-text-secondary/40 mx-2 text-xs">|</span>
            <span className="text-xs uppercase tracking-wider font-body font-medium italic text-text-secondary">
              AGENT Q • IN-MEMORY DUCKDB ({diagnostic.execution_time_ms.toFixed(1)}MS)
            </span>
          </div>

          {/* Action Buttons — Single-line whitespace-nowrap */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleCopySql}
              className="h-8 px-3.5 whitespace-nowrap text-xs font-body font-bold uppercase tracking-wider inline-flex items-center gap-2 border border-noir rounded bg-transparent hover:bg-bg-surface-subtle transition-colors leading-none text-text-primary"
            >
              {copiedSql ? (
                <Check className="h-3.5 w-3.5 text-text-primary" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-text-secondary" />
              )}
              <span>{copiedSql ? "Copied" : "Copy Raw SQL"}</span>
            </button>

            <button
              onClick={handleDownloadCsv}
              className="h-8 px-3.5 whitespace-nowrap text-xs font-body font-bold uppercase tracking-wider inline-flex items-center gap-2 border border-noir rounded bg-transparent hover:bg-bg-surface-subtle transition-colors leading-none text-text-primary"
            >
              <Download className="h-3.5 w-3.5 text-text-secondary" />
              <span>Download CSV Slice</span>
            </button>
          </div>
        </div>
      )}

      {/* TanStack Interactive Table with Punch-Card Telemetry Grid Watermark */}
      <div data-lenis-prevent className="relative overflow-x-auto rounded border border-noir bg-bg-canvas/50">
        {/* Cold War Cryptographic Punch-Card / Ledger Grid Watermark */}
        <div
          className="pointer-events-none select-none absolute inset-0 opacity-[0.06] z-0"
          style={{
            backgroundImage: `radial-gradient(circle, var(--text-secondary) 1.5px, transparent 1.5px), repeating-linear-gradient(to right, var(--border-noir) 0px, var(--border-noir) 1px, transparent 1px, transparent 48px)`,
            backgroundSize: `12px 12px, 48px 100%`,
            mixBlendMode: "var(--dither-blend)" as any,
          }}
        />
        <table className="relative z-10 w-full border-collapse text-left font-body text-xs">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-noir bg-bg-surface-subtle"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="cursor-pointer py-3 px-4 font-body text-xs uppercase tracking-wider font-bold text-text-primary border-b border-noir select-none hover:bg-bg-surface transition-colors whitespace-nowrap"
                  >
                    <div className="flex items-center justify-between gap-2 w-full">
                      <span className="truncate">{flexRender(header.column.columnDef.header, header.getContext())}</span>
                      <ArrowUpDown className="h-3 w-3 flex-shrink-0 text-text-secondary" />
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => {
              const isAnomaly = String(row.original.region).toLowerCase().includes("south");
              return (
                <tr
                  key={row.id}
                  className={`border-b border-noir/40 transition-colors ${
                    isAnomaly
                      ? "bg-accent-rust/15 hover:bg-accent-rust/20 border-l-4 border-l-accent-rust"
                      : "hover:bg-bg-surface-subtle/50"
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 whitespace-nowrap first:text-left first:font-body">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
