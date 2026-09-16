"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createExpense } from "@/app/actions/expenses";
import { EXPENSE_CATEGORIES, EXPENSE_PAYMENT_METHODS } from "@/lib/constants";
import { Receipt, CheckCircle2, AlertTriangle } from "lucide-react";

export function ExpenseForm() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("utilities");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [date, setDate] = useState(todayStr);
  const [notes, setNotes] = useState("");
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

    const res = await createExpense({
      title: title.trim(),
      category,
      amount: num,
      paymentMethod,
      date,
      notes: notes.trim() || undefined,
    });

    setLoading(false);

    if (!res.ok) {
      setStatus({ message: res.error || "Failed to save expense", type: "error" });
      return;
    }

    setStatus({
      message: `Expense "${title}" (Rs ${num}) saved & deducted from ${paymentMethod}.`,
      type: "success",
    });

    setTitle("");
    setAmount("");
    setNotes("");
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="py-3.5 px-5 border-b border-slate-100 dark:border-zinc-800">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Receipt className="h-4 w-4 text-emerald-600" />
          Log Daily Business Overhead
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

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
              Expense Title *
            </label>
            <Input
              required
              placeholder="e.g. Electricity bill / Packaging bags 50kg"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
                Category *
              </label>
              <select
                className="h-10 w-full rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 text-xs font-semibold"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
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
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
                Paid From Channel *
              </label>
              <select
                className="h-10 w-full rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 text-xs font-semibold capitalize"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                {EXPENSE_PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
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
              Notes (Optional)
            </label>
            <Input
              placeholder="e.g. Paid to vendor Waseem Bhai"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 rounded-xl"
          >
            {loading ? "Recording..." : "Save Expense & Post Outflow"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
