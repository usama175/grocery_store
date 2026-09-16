"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { internalTransfer } from "@/app/actions/accounts";
import { ACCOUNT_TYPES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeftRight, X, AlertTriangle, CheckCircle2 } from "lucide-react";

export function TransferModal({
  balances,
}: {
  balances: Record<string, number>;
}) {
  const [open, setOpen] = useState(false);
  const [fromAccount, setFromAccount] = useState("cash");
  const [toAccount, setToAccount] = useState("bank");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const available = balances[fromAccount] ?? 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount) || 0;
    if (fromAccount === toAccount) {
      setStatus({ message: "Source and destination accounts must differ", type: "error" });
      return;
    }
    if (num <= 0) {
      setStatus({ message: "Transfer amount must be greater than zero", type: "error" });
      return;
    }
    if (num > available) {
      setStatus({
        message: `Insufficient funds in ${fromAccount}. Available: ${formatCurrency(available)}`,
        type: "error",
      });
      return;
    }

    setLoading(true);
    setStatus(null);

    const res = await internalTransfer({
      fromAccount,
      toAccount,
      amount: num,
      description: description.trim() || undefined,
    });

    setLoading(false);

    if (!res.ok) {
      setStatus({ message: res.error || "Failed to complete transfer", type: "error" });
      return;
    }

    setStatus({
      message: `Transferred ${formatCurrency(num)} from ${fromAccount} to ${toAccount}.`,
      type: "success",
    });

    setAmount("");
    setDescription("");
    setTimeout(() => {
      setOpen(false);
      setStatus(null);
    }, 1500);
  };

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
      >
        <ArrowLeftRight className="h-4 w-4" /> Internal Transfer
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 px-6 py-4">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Transfer Between Accounts
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
                    From Channel *
                  </label>
                  <select
                    className="h-10 w-full rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 text-xs font-semibold capitalize"
                    value={fromAccount}
                    onChange={(e) => setFromAccount(e.target.value)}
                  >
                    {ACCOUNT_TYPES.map((a) => (
                      <option key={a.value} value={a.value}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
                    To Channel *
                  </label>
                  <select
                    className="h-10 w-full rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 text-xs font-semibold capitalize"
                    value={toAccount}
                    onChange={(e) => setToAccount(e.target.value)}
                  >
                    {ACCOUNT_TYPES.map((a) => (
                      <option key={a.value} value={a.value}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Source Account Balance Badge */}
              <div className="rounded-xl bg-slate-50 dark:bg-zinc-800/60 p-3 text-xs border border-slate-200 dark:border-zinc-700 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Available in {fromAccount}:</span>
                <span className="font-black text-slate-900 dark:text-white text-sm">
                  {formatCurrency(available)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
                  Transfer Amount (PKR) *
                </label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  min={1}
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
                  Transfer Description / Purpose
                </label>
                <Input
                  placeholder="e.g. Depositing cash register takings into Meezan Bank"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]"
                >
                  {loading ? "Transferring..." : "Confirm Transfer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
