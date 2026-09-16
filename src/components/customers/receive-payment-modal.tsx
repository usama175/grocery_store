"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { receivePayment } from "@/app/actions/customers";
import { ACCOUNT_TYPES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { HandCoins, X } from "lucide-react";

export function ReceivePaymentModal({
  customer,
}: {
  customer: {
    id: number;
    name: string;
    phone: string | null;
    balance: number;
  };
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [amount, setAmount] = useState(
    customer.balance > 0 ? String(customer.balance) : ""
  );
  const [accountType, setAccountType] = useState("cash");
  const [referenceId, setReferenceId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount) || 0;
    if (num <= 0) {
      setError("Please enter a valid payment amount");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await receivePayment({
      customerId: customer.id,
      amount: num,
      accountType,
      referenceId: referenceId.trim() || undefined,
    });

    setLoading(false);

    if (!res.ok) {
      setError(res.error || "Failed to record payment");
      return;
    }

    setOpen(false);
    setReferenceId("");
  };

  return (
    <>
      <Button
        type="button"
        size="sm"
        onClick={() => setOpen(true)}
        className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs font-semibold gap-1"
      >
        <HandCoins className="h-3.5 w-3.5" /> Receive Khata
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Receive Khata Payment
                </h3>
                <p className="text-xs text-slate-500">
                  Customer: <span className="font-semibold">{customer.name}</span>
                </p>
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
              {error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900">
                  {error}
                </div>
              )}

              <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 p-3 text-xs border border-amber-200 dark:border-amber-900 flex justify-between items-center">
                <span className="text-amber-800 dark:text-amber-200 font-medium">
                  Total Outstanding Dues:
                </span>
                <span className="text-base font-black text-amber-900 dark:text-amber-100">
                  {formatCurrency(customer.balance)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
                  Amount Received (PKR) *
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
                  Received Into Account *
                </label>
                <select
                  className="h-10 w-full rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 text-xs font-semibold capitalize"
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                >
                  {ACCOUNT_TYPES.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>

              {(accountType === "jazzcash" ||
                accountType === "easypaisa" ||
                accountType === "bank") && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
                    Transaction ID / Reference
                  </label>
                  <Input
                    placeholder="e.g. TID 987654"
                    value={referenceId}
                    onChange={(e) => setReferenceId(e.target.value)}
                  />
                </div>
              )}

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
                  {loading ? "Recording..." : "Record Inflow"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
