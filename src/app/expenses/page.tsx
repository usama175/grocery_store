import { getExpenses } from "@/app/actions/expenses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { EditExpenseModal } from "@/components/expenses/edit-expense-modal";
import { formatCurrency, decimalToNumber } from "@/lib/utils";
import { Receipt, Calendar, CreditCard } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const expenses = await getExpenses(100);

  const todayStr = new Date().toISOString().slice(0, 10);
  let todayTotal = 0;
  let allTimeTotal = 0;
  const categoryTotals: Record<string, number> = {};

  for (const e of expenses) {
    const amt = decimalToNumber(e.amount);
    allTimeTotal += amt;
    const eDateStr = new Date(e.date).toISOString().slice(0, 10);
    if (eDateStr === todayStr) {
      todayTotal += amt;
    }
    categoryTotals[e.category] = (categoryTotals[e.category] ?? 0) + amt;
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Daily Expense Tracking
          </h1>
          <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs px-2.5 py-0.5 font-bold">
            Store Overheads
          </span>
        </div>
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          Log store utilities, staff wages, rent, packaging bags, delivery charges, and miscellaneous costs
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500">
                Today&apos;s Overhead
              </span>
              <Calendar className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">
              {formatCurrency(todayTotal)}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Deducted from daily gross profit</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500">
                Total Expenses Logged
              </span>
              <Receipt className="h-4 w-4 text-red-500" />
            </div>
            <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
              {formatCurrency(allTimeTotal)}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{expenses.length} expense receipts</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500">
                Top Expense Category
              </span>
              <CreditCard className="h-4 w-4 text-blue-500" />
            </div>
            <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white capitalize">
              {Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "None"}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]
                ? formatCurrency(Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0][1])
                : "No data"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Form vs History */}
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <ExpenseForm />

        <Card>
          <CardHeader className="py-3.5 px-5 border-b border-slate-100 dark:border-zinc-800">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Receipt className="h-4 w-4 text-emerald-600" />
              Recent Expense Records ({expenses.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-zinc-800/50 text-slate-600 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-3">Title & Notes</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Paid From</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {expenses.map((e) => (
                  <tr
                    key={e.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 text-xs"
                  >
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono">
                      {new Date(e.date).toLocaleDateString("en-PK", {
                        dateStyle: "medium",
                      })}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {e.title}
                      </div>
                      {e.notes && (
                        <div className="text-[11px] text-slate-400 font-normal">
                          {e.notes}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span className="inline-block rounded-md bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-zinc-300 capitalize">
                        {e.category}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="inline-block rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 capitalize">
                        {e.paymentMethod}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-black text-slate-900 dark:text-white text-sm">
                      {formatCurrency(decimalToNumber(e.amount))}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <EditExpenseModal expense={e} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {expenses.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                <Receipt className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p className="font-medium">No expenses recorded yet.</p>
                <p className="text-xs mt-1">Use the form to log daily shop overheads.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
