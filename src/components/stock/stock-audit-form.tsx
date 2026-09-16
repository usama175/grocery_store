"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { recordStockTake } from "@/app/actions/stock";
import { ClipboardCheck, CheckCircle2, AlertTriangle } from "lucide-react";

export type AuditProduct = {
  id: number;
  name: string;
  unit: string;
  currentStock: number;
  barcode: string | null;
};

const AUDIT_REASONS = [
  { value: "audit", label: "Periodic physical count reconciliation" },
  { value: "damage", label: "Damaged / Broken packaging" },
  { value: "expiry", label: "Expired product write-off" },
  { value: "theft", label: "Theft / Unrecorded shrinkage" },
  { value: "samples", label: "Gift / Promotion / Sampling" },
  { value: "vendor_shortage", label: "Supplier / Delivery discrepancy" },
  { value: "other", label: "Other / Custom note" },
];

export function StockAuditForm({ products }: { products: AuditProduct[] }) {
  const [productId, setProductId] = useState<number | "">("");
  const [countedStock, setCountedStock] = useState("");
  const [reason, setReason] = useState("audit");
  const [customReason, setCustomReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const selectedProduct = products.find((p) => p.id === productId);
  const systemStock = selectedProduct ? selectedProduct.currentStock : 0;
  const countedNum = countedStock !== "" ? parseFloat(countedStock) || 0 : null;
  const difference =
    countedNum !== null && selectedProduct ? countedNum - systemStock : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (productId === "") {
      setStatus({ message: "Please select a product to audit", type: "error" });
      return;
    }
    if (countedStock === "") {
      setStatus({ message: "Please enter the physical counted quantity", type: "error" });
      return;
    }

    setLoading(true);
    setStatus(null);

    const auditReason =
      reason === "other" && customReason.trim()
        ? customReason.trim()
        : AUDIT_REASONS.find((r) => r.value === reason)?.label || reason;

    const res = await recordStockTake({
      productId: Number(productId),
      countedStock: parseFloat(countedStock) || 0,
      reason: auditReason,
    });

    setLoading(false);

    if (!res.ok) {
      setStatus({ message: res.error || "Failed to save stock take", type: "error" });
      return;
    }

    setStatus({
      message: `Stock reconciled for "${selectedProduct?.name}". Discrepancy: ${res.difference > 0 ? "+" : ""}${res.difference} ${selectedProduct?.unit}`,
      type: "success",
    });

    setCountedStock("");
    setCustomReason("");
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b border-slate-100 dark:border-zinc-800 py-3.5 px-5">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-emerald-600" />
          Physical Stock Count & Discrepancy
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {status && (
            <div
              className={`rounded-xl p-3 text-xs font-medium border flex items-center gap-2 ${
                status.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300"
              }`}
            >
              {status.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0" />
              )}
              <span>{status.message}</span>
            </div>
          )}

          {/* Product Select */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
              Select Product SKU *
            </label>
            <select
              required
              className="h-10 w-full rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 text-xs font-semibold"
              value={productId}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : "";
                setProductId(val);
                setCountedStock("");
              }}
            >
              <option value="">Select SKU to audit...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (System: {p.currentStock} {p.unit})
                  {p.barcode ? ` · ${p.barcode}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Live System Count vs Physical Count */}
          {selectedProduct && (
            <div className="rounded-xl bg-slate-50 dark:bg-zinc-800/60 p-3.5 border border-slate-200 dark:border-zinc-700/80 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">System Recorded Stock:</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200">
                  {selectedProduct.currentStock} {selectedProduct.unit}
                </span>
              </div>

              {difference !== null && (
                <div className="flex justify-between items-center text-xs font-bold pt-1 border-t border-slate-200 dark:border-zinc-700">
                  <span>Calculated Discrepancy:</span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      difference === 0
                        ? "bg-slate-200 text-slate-700 dark:bg-zinc-700 dark:text-zinc-200"
                        : difference > 0
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                    }`}
                  >
                    {difference > 0 ? `+${difference}` : difference} {selectedProduct.unit}
                    {difference === 0
                      ? " (Exact Match)"
                      : difference > 0
                      ? " (Surplus)"
                      : " (Shortage / Loss)"}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Counted Quantity */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
              Physical Count Quantity *
            </label>
            <Input
              required
              type="number"
              step="0.01"
              min={0}
              placeholder="Enter physically counted quantity on shelf"
              value={countedStock}
              onChange={(e) => setCountedStock(e.target.value)}
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
              Adjustment Reason
            </label>
            <select
              className="h-10 w-full rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 text-xs"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              {AUDIT_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {reason === "other" && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
                Custom Audit Note
              </label>
              <Input
                placeholder="Explain the audit discrepancy..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
              />
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || productId === "" || countedStock === ""}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 rounded-xl"
          >
            {loading ? "Reconciling Stock..." : "Apply Physical Count Adjustment"}
          </Button>

          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            Auto-calculates: <code className="font-mono">Discrepancy = Physical Count − System Count</code>.
            Updates stock immediately and logs the audit event.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
