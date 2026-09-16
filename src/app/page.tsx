import Link from "next/link";
import { getDayEndReport, getLowStockProducts } from "@/lib/services/reports";
import { getLedgerSummary } from "@/app/actions/accounts";
import { formatCurrency, decimalToNumber } from "@/lib/utils";
import {
  Package,
  TrendingUp,
  DollarSign,
  TrendingDown,
  ShoppingBag,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [eod, lowStock, ledger] = await Promise.all([
    getDayEndReport(),
    getLowStockProducts(),
    getLedgerSummary(),
  ]);

  const totalLiquid = Object.values(ledger.balances).reduce(
    (sum, b) => sum + b,
    0
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Summary of your inventory and sales performance.</p>
        </div>
        <Link 
          href="/inventory"
          className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          + Add Product
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Net Sales</span>
            <div className="p-2 bg-gray-50 rounded-lg">
              <ShoppingBag className="w-4 h-4 text-gray-600" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-semibold text-gray-900">{formatCurrency(eod.totalSales)}</h3>
            <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
              <span>{eod.saleCount} invoices today</span>
            </div>
          </div>
        </div>

        {/* Gross Profit */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Gross Profit</span>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-semibold text-gray-900">{formatCurrency(eod.grossProfit)}</h3>
            <div className="flex items-center gap-1 mt-1 text-sm text-emerald-600 font-medium">
              <span>{eod.grossMarginPercent}% margin</span>
            </div>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Expenses</span>
            <div className="p-2 bg-rose-50 rounded-lg">
              <TrendingDown className="w-4 h-4 text-rose-600" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-semibold text-gray-900">{formatCurrency(eod.totalExpenses)}</h3>
            <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
              <span>Daily overhead</span>
            </div>
          </div>
        </div>

        {/* Total Liquid / Assets */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Liquid Assets</span>
            <div className="p-2 bg-blue-50 rounded-lg">
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-semibold text-gray-900">{formatCurrency(totalLiquid)}</h3>
            <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
              <span>Across all accounts</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Stock Movements / placeholder */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Inventory Value Trend</h2>
            <button className="text-sm text-gray-500 hover:text-gray-900">View Report</button>
          </div>
          <div className="p-5 flex-1 flex items-center justify-center min-h-[300px]">
            {/* Placeholder for a chart */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900">Chart Data Pending</p>
              <p className="text-xs text-gray-500 mt-1">Connect your analytics to see value trends.</p>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-gray-900">Stock Alerts</h2>
              {lowStock.length > 0 && (
                <span className="bg-rose-100 text-rose-700 text-xs font-medium px-2 py-0.5 rounded-full">
                  {lowStock.length}
                </span>
              )}
            </div>
            <Link href="/alerts" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">View All</Link>
          </div>
          
          <div className="flex-1 overflow-auto">
            {lowStock.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                <Package className="w-8 h-8 text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-900">All Stock Healthy</p>
                <p className="text-xs text-gray-500 mt-1">No items fall below the reorder threshold.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {lowStock.slice(0, 5).map((p) => {
                  const stock = decimalToNumber(p.currentStock);
                  const min = decimalToNumber(p.minStockAlert);
                  return (
                    <div key={p.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">{p.name}</p>
                          <p className="text-xs text-gray-500">Min: {min} {p.unit}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2 py-1 rounded bg-rose-50 text-rose-700 text-xs font-medium">
                          {stock} Left
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
