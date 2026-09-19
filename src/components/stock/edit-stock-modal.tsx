"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateStockTake } from "@/app/actions/stock";
import { X, Edit, CheckCircle2, AlertTriangle } from "lucide-react";
import { decimalToNumber } from "@/lib/utils";

export function EditStockModal({ stockTake }: { stockTake: any }) {
  const [open, setOpen] = useState(false);
  const [countedStock, setCountedStock] = useState(decimalToNumber(stockTake.countedStock).toString());
  const [reason, setReason] = useState(stockTake.reason || "");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseFloat(countedStock);

    if (isNaN(count) || count < 0) {
      setStatus({ message: "Counted stock must be a non-negative number", type: "error" });
      return;
    }

    setLoading(true);
    setStatus(null);

    const res = await updateStockTake(stockTake.id, {
      countedStock: count,
      reason: reason.trim() || undefined,
    });

    setLoading(false);

    if (!res.ok) {
      setStatus({ message: res.error || "Failed to update stock take", type: "error" });
      return;
    }

    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-slate-400 hover:text-emerald-600 transition-colors"
        title="Edit Stock Take"
      >
        <Edit className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 px-5 py-4">
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                Edit Stock Audit
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {status && (
                <div
                  className={`rounded-xl p-3 text-xs font-medium border flex items-center gap-2 ${
                    status.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-red-50 text-red-800 border-red-200"
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

              <div className="bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-lg text-sm border border-slate-100 dark:border-zinc-800">
                <span className="font-semibold">{stockTake.product.name}</span>
                <div className="text-xs text-slate-500 mt-1">Expected Stock: {decimalToNumber(stockTake.expectedStock)} {stockTake.product.unit}</div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
                  Counted Stock *
                </label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  min={0}
                  value={countedStock}
                  onChange={(e) => setCountedStock(e.target.value)}
                />
                <p className="text-[10px] text-slate-400 mt-1">Updates product stock accordingly</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
                  Reason / Notes
                </label>
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Recounted after error"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 rounded-xl"
              >
                {loading ? "Updating..." : "Update Audit Log"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
