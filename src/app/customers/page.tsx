import Link from "next/link";
import { getCustomers } from "@/app/actions/customers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerModal } from "@/components/customers/customer-modal";
import { EditCustomerModal } from "@/components/customers/edit-customer-modal";
import { ReceivePaymentModal } from "@/components/customers/receive-payment-modal";
import { formatCurrency, decimalToNumber } from "@/lib/utils";
import { Users, Search, BookOpen, AlertCircle, ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const customers = await getCustomers(q);

  let totalUdhaar = 0;
  let customersWithUdhaar = 0;

  for (const c of customers) {
    const bal = decimalToNumber(c.balance);
    if (bal > 0) {
      totalUdhaar += bal;
      customersWithUdhaar++;
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Customer Tracking & Khata
            </h1>
            <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs px-2.5 py-0.5 font-bold">
              {customers.length} Profiles
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            Customer profiles, credit (Udhaar) ledger, purchase history, and receiving dues
          </p>
        </div>

        <CustomerModal />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500">
                Registered Customers
              </span>
              <Users className="h-4 w-4 text-blue-500" />
            </div>
            <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
              {customers.length}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Profiles with contact information</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500">
                Total Outstanding Udhaar
              </span>
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">
              {formatCurrency(totalUdhaar)}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Total credit receivables</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500">
                Active Khata Accounts
              </span>
              <BookOpen className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {customersWithUdhaar}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Customers with pending balance</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <form className="flex gap-2 max-w-md" method="get">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                name="q"
                defaultValue={q || ""}
                placeholder="Search by customer name or phone..."
                className="pl-9 h-10 text-xs"
              />
            </div>
            <Button type="submit" variant="secondary" size="sm">
              Search
            </Button>
            {q && (
              <Link
                href="/customers"
                className="text-xs text-slate-500 hover:text-slate-800 underline flex items-center"
              >
                Reset
              </Link>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Customer List Table */}
      <Card>
        <CardHeader className="py-3 px-5 border-b border-slate-100 dark:border-zinc-800">
          <CardTitle className="text-base font-bold">
            Customer Directory & Ledgers ({customers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-zinc-800/50 text-slate-600 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-3">Contact Details</th>
                <th className="py-3.5 px-3">Address</th>
                <th className="py-3.5 px-3 text-right">Khata Balance</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {customers.map((c) => {
                const bal = decimalToNumber(c.balance);
                const hasBalance = bal > 0;

                return (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <Link
                        href={`/customers/${c.id}`}
                        className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 flex items-center gap-1 group"
                      >
                        {c.name}
                        <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      <span className="text-xs text-slate-400">ID: #{c.id}</span>
                    </td>

                    <td className="py-3 px-3 text-xs text-slate-600 dark:text-zinc-400 font-mono">
                      {c.phone || "No phone"}
                    </td>

                    <td className="py-3 px-3 text-xs text-slate-500">
                      {c.address || "—"}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <span
                        className={`font-black text-sm ${
                          hasBalance
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-slate-400"
                        }`}
                      >
                        {formatCurrency(bal)}
                      </span>
                      {hasBalance && (
                        <div className="text-[10px] text-amber-600 font-semibold">
                          Udhaar Due
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {hasBalance ? (
                          <ReceivePaymentModal
                            customer={{
                              id: c.id,
                              name: c.name,
                              phone: c.phone,
                              balance: bal,
                            }}
                          />
                        ) : (
                          <span className="text-xs text-slate-400 italic">Settled</span>
                        )}

                        <Link
                          href={`/customers/${c.id}`}
                          className="rounded-lg border border-slate-200 dark:border-zinc-800 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                        >
                          View History
                        </Link>
                        
                        <EditCustomerModal customer={c} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {customers.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              <Users className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="font-medium">No customer profiles found.</p>
              <p className="text-xs mt-1">Add customers to track their Udhaar and purchases.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
