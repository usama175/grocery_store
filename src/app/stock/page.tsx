import { getProducts } from "@/app/actions/products";
import { getRecentStockTakes } from "@/app/actions/stock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockAuditForm } from "@/components/stock/stock-audit-form";
import { EditStockModal } from "@/components/stock/edit-stock-modal";
import { decimalToNumber } from "@/lib/utils";
import { ClipboardList, History } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StockPage() {
  const [products, takes] = await Promise.all([
    getProducts(),
    getRecentStockTakes(60),
  ]);

  const auditProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    unit: p.unit,
    currentStock: decimalToNumber(p.currentStock),
    barcode: p.barcode,
  }));

  let totalShortage = 0;
  let totalSurplus = 0;
  for (const t of takes) {
    const diff = decimalToNumber(t.difference);
    if (diff < 0) totalShortage += Math.abs(diff);
    if (diff > 0) totalSurplus += diff;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Stock Taking & Audits
          </h1>
          <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs px-2.5 py-0.5 font-bold">
            Physical Reconciliation
          </span>
        </div>
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          Conduct periodic physical stock counts, auto-calculate variances, and record shrinkage logs
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase text-slate-500 font-semibold">Total Audits Performed</p>
            <p className="text-2xl font-black mt-1 text-slate-900 dark:text-white">{takes.length}</p>
            <p className="text-xs text-slate-400 mt-0.5">Historical reconciliation events</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <p className="text-xs uppercase text-slate-500 font-semibold">Total Shortage / Shrinkage</p>
            <p className="text-2xl font-black mt-1 text-red-600 dark:text-red-400">
              -{totalShortage.toFixed(1)} units
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Damages, expiry, and lost stock</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <p className="text-xs uppercase text-slate-500 font-semibold">Total Surplus Recorded</p>
            <p className="text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400">
              +{totalSurplus.toFixed(1)} units
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Recount gains & unrecorded returns</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Form on Left, History Table on Right */}
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <StockAuditForm products={auditProducts} />

        {/* Audit Log Table */}
        <Card>
          <CardHeader className="py-3.5 px-5 border-b border-slate-100 dark:border-zinc-800">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <History className="h-4 w-4 text-emerald-600" />
              Recent Stock Reconciliation Logs ({takes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-zinc-800/50 text-slate-600 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-3">Product SKU</th>
                  <th className="py-3 px-2 text-right">Expected</th>
                  <th className="py-3 px-2 text-right">Counted</th>
                  <th className="py-3 px-2 text-right">Variance</th>
                  <th className="py-3 px-4">Reason / Notes</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {takes.map((t) => {
                  const diff = decimalToNumber(t.difference);
                  const isNegative = diff < 0;
                  const isPositive = diff > 0;

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 text-xs"
                    >
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono">
                        {new Date(t.performedAt).toLocaleString()}
                      </td>

                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                        {t.product.name}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          Unit: {t.product.unit}
                        </span>
                      </td>

                      <td className="py-3 px-2 text-right font-medium text-slate-600 dark:text-zinc-300">
                        {decimalToNumber(t.expectedStock)}
                      </td>

                      <td className="py-3 px-2 text-right font-bold text-slate-900 dark:text-white">
                        {decimalToNumber(t.countedStock)}
                      </td>

                      <td className="py-3 px-2 text-right">
                        <span
                          className={`font-black px-1.5 py-0.5 rounded text-[11px] ${
                            isNegative
                              ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                              : isPositive
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                              : "text-slate-400"
                          }`}
                        >
                          {diff > 0 ? `+${diff}` : diff}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-zinc-300">
                        <span className="inline-block max-w-[220px] truncate" title={t.reason || ""}>
                          {t.reason || "Audit reconciliation"}
                        </span>
                      </td>

                      <td className="py-3 px-2 text-right">
                        <EditStockModal stockTake={t} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {takes.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                <ClipboardList className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p className="font-medium">No stock adjustments recorded yet.</p>
                <p className="text-xs mt-1">Use the physical count form to reconcile shelf counts.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
