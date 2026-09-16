import Link from "next/link";
import { notFound } from "next/navigation";
import { getCustomerWithSales } from "@/app/actions/customers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReceivePaymentModal } from "@/components/customers/receive-payment-modal";
import { formatCurrency, decimalToNumber } from "@/lib/utils";
import { ArrowLeft, User, Phone, MapPin, Receipt, Clock, CreditCard } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomerWithSales(Number(id));
  if (!customer) notFound();

  const balance = decimalToNumber(customer.balance);
  const totalPurchases = customer.sales.reduce(
    (sum, s) => sum + decimalToNumber(s.netAmount),
    0
  );

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/customers"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Customers Directory
      </Link>

      {/* Customer Header Card */}
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-none shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-black">{customer.name}</h1>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1">
                  {customer.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-slate-400" /> {customer.phone}
                    </span>
                  )}
                  {customer.address && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-400" /> {customer.address}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
              <div className="text-right">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Current Khata Balance
                </span>
                <span
                  className={`text-xl font-black ${
                    balance > 0 ? "text-amber-400" : "text-emerald-400"
                  }`}
                >
                  {formatCurrency(balance)}
                </span>
              </div>
              {balance > 0 && (
                <ReceivePaymentModal
                  customer={{
                    id: customer.id,
                    name: customer.name,
                    phone: customer.phone,
                    balance,
                  }}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase text-slate-500 font-semibold">Total Invoices</p>
            <p className="text-2xl font-black mt-1 text-slate-900 dark:text-white">
              {customer.sales.length}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Lifetime orders placed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase text-slate-500 font-semibold">Lifetime Spend</p>
            <p className="text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalPurchases)}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Total retail volume</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase text-slate-500 font-semibold">Customer Since</p>
            <p className="text-base font-bold mt-2 text-slate-800 dark:text-zinc-200">
              {new Date(customer.createdAt).toLocaleDateString("en-PK", {
                dateStyle: "medium",
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Purchase History */}
      <Card>
        <CardHeader className="py-4 px-6 border-b border-slate-100 dark:border-zinc-800">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Receipt className="h-4 w-4 text-emerald-600" />
            Order & Khata Purchase History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {customer.sales.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <Receipt className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">No purchase records found for this customer.</p>
            </div>
          ) : (
            customer.sales.map((sale) => (
              <div
                key={sale.id}
                className="rounded-2xl border border-slate-200 dark:border-zinc-800 p-4 hover:border-slate-300 dark:hover:border-zinc-700 transition-all bg-white dark:bg-zinc-900"
              >
                {/* Sale Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
                      {sale.invoiceNumber}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(sale.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(decimalToNumber(sale.netAmount))}
                    </span>
                    {decimalToNumber(sale.discountAmount) > 0 && (
                      <span className="text-[10px] text-slate-400 block">
                        Discount: -Rs {decimalToNumber(sale.discountAmount)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Line Items */}
                <div className="py-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Purchased Items ({sale.items.length})
                  </span>
                  <div className="grid gap-1.5 sm:grid-cols-2 text-xs">
                    {sale.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/50"
                      >
                        <span className="font-medium text-slate-800 dark:text-zinc-200 truncate pr-2">
                          {item.product.name}
                        </span>
                        <span className="text-slate-500 shrink-0 font-mono">
                          {item.quantity.toString()} × {formatCurrency(decimalToNumber(item.saleRate))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Breakdown */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs">
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <CreditCard className="h-3 w-3" /> Paid via:
                  </span>
                  {sale.payments.map((p) => (
                    <span
                      key={p.id}
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                        p.method === "udhaar"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      <span className="capitalize">{p.method}</span>:{" "}
                      {formatCurrency(decimalToNumber(p.amount))}
                      {p.referenceId && (
                        <span className="text-[9px] opacity-75 font-mono">
                          (TID:{p.referenceId})
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
