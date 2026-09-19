"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateExpense } from "@/app/actions/expenses";
import { EXPENSE_CATEGORIES, EXPENSE_PAYMENT_METHODS } from "@/lib/constants";
import { X, Edit, CheckCircle2, AlertTriangle } from "lucide-react";

export function EditExpenseModal({ expense }: { expense: any }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(expense.title);
  const [category, setCategory] = useState(expense.category);
  const [amount, setAmount] = useState(expense.amount.toString());
  const [paymentMethod, setPaymentMethod] = useState(expense.paymentMethod);
  const [date, setDate] = useState(new Date(expense.date).toISOString().slice(0, 10));
  const [notes, setNotes] = useState(expense.notes || "");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount) || 0;
    if (!title.trim()) {
      setStatus({ message: "Expense title is required", type: "error" });
      return;
    }
    if (num <= 0) {
      setStatus({ message: "Amount must be greater than zero", type: "error" });
      return;
    }

    setLoading(true);
    setStatus(null);

    const res = await updateExpense(expense.id, {
      title: title.trim(),
      category,
      amount: num,
      paymentMethod,
      date,
      notes: notes.trim() || undefined,
    });

    setLoading(false);

    if (!res.ok) {
      setStatus({ message: res.error || "Failed to update expense", type: "error" });
      return;
    }

    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-slate-400 hover:text-emerald-600 transition-colors"
        title="Edit Expense"
      >
        <Edit className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 px-5 py-4">
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                Edit Expense
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

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
                  Expense Title *
                </label>
                <Input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
                    Category *
                  </label>
                  <Input
                    required
                    list="expense-categories-edit"
                    className="h-10 w-full rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 text-xs font-semibold"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                  <datalist id="expense-categories-edit">
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
                    Amount (PKR) *
                  </label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
                    Paid From *
                  </label>
                  <Input
                    required
                    list="expense-payment-methods-edit"
                    className="h-10 w-full rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 text-xs font-semibold capitalize"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <datalist id="expense-payment-methods-edit">
                    {EXPENSE_PAYMENT_METHODS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
                    Expense Date
                  </label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
                  Notes
                </label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 rounded-xl"
              >
                {loading ? "Updating..." : "Update Expense"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
