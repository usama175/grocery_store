/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useCallback } from "react";
import { exportToCSV, exportToPDF } from "@/lib/export";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, decimalToNumber } from "@/lib/utils";
import { FileText, Table, TrendingUp, Receipt, Users, Building2, ClipboardList } from "lucide-react";

type DateRange = "today" | "thisWeek" | "thisMonth" | "all";

export function ReportsDashboard({
  initialSales,
  initialExpenses,
  initialStock,
  initialCustomers,
  initialAccounts,
}: {
  initialSales: any[];
  initialExpenses: any[];
  initialStock: any[];
  initialCustomers: any[];
  initialAccounts: any[];
}) {
  const [activeTab, setActiveTab] = useState<"sales" | "expenses" | "stock" | "customers" | "accounts">("sales");
  const [dateRange, setDateRange] = useState<DateRange>("thisMonth");

  // Filter Data based on Date Range
  const filterByDate = useCallback((dateField: string, items: any[]) => {
    if (dateRange === "all") return items;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return items.filter((item) => {
      const itemDate = new Date(item[dateField]);
      if (dateRange === "today") {
        return itemDate >= today;
      } else if (dateRange === "thisWeek") {
        const firstDayOfWeek = new Date(today);
        firstDayOfWeek.setDate(today.getDate() - today.getDay());
        return itemDate >= firstDayOfWeek;
      } else if (dateRange === "thisMonth") {
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return itemDate >= firstDayOfMonth;
      }
      return true;
    });
  }, [dateRange]);

  const filteredSales = useMemo(() => filterByDate("createdAt", initialSales), [filterByDate, initialSales]);
  const filteredExpenses = useMemo(() => filterByDate("date", initialExpenses), [filterByDate, initialExpenses]);
  const filteredStock = useMemo(() => filterByDate("performedAt", initialStock), [filterByDate, initialStock]);
  const filteredAccounts = useMemo(() => filterByDate("createdAt", initialAccounts), [filterByDate, initialAccounts]);
  // Customers aren't filtered by date for their balance/profile, but we could filter their sales. 
  // For simplicity, customer report is "all time".
  const customers = initialCustomers;

  const handleExport = (type: "pdf" | "csv") => {
    let headers: string[] = [];
    let data: any[][] = [];
    let title = "";
    let filename = "";

    const dateSuffix = new Date().toISOString().split("T")[0];

    if (activeTab === "sales") {
      headers = ["Invoice", "Date", "Customer", "Items", "Gross", "Discount", "Net Amount", "Payments"];
      data = filteredSales.map((s) => [
        s.invoiceNumber,
        new Date(s.createdAt).toLocaleString(),
        s.customer?.name || "Guest",
        s.items.length,
        formatCurrency(decimalToNumber(s.totalAmount)),
        formatCurrency(decimalToNumber(s.discountAmount)),
        formatCurrency(decimalToNumber(s.netAmount)),
        s.payments.map((p: any) => `${p.method}`).join(", ")
      ]);
      title = "Sales Report";
      filename = `sales_report_${dateSuffix}`;
    } else if (activeTab === "expenses") {
      headers = ["Date", "Category", "Title", "Payment Method", "Amount", "Notes"];
      data = filteredExpenses.map((e) => [
        new Date(e.date).toLocaleDateString(),
        e.category,
        e.title,
        e.paymentMethod,
        formatCurrency(decimalToNumber(e.amount)),
        e.notes || ""
      ]);
      title = "Expenses Report";
      filename = `expenses_report_${dateSuffix}`;
    } else if (activeTab === "stock") {
      headers = ["Date", "Product", "Expected", "Counted", "Variance", "Reason"];
      data = filteredStock.map((s) => [
        new Date(s.performedAt).toLocaleString(),
        s.product.name,
        decimalToNumber(s.expectedStock),
        decimalToNumber(s.countedStock),
        decimalToNumber(s.difference),
        s.reason || ""
      ]);
      title = "Stock Adjustments Report";
      filename = `stock_report_${dateSuffix}`;
    } else if (activeTab === "customers") {
      headers = ["Name", "Phone", "Total Purchases", "Outstanding Khata Balance"];
      data = customers.map((c) => {
        const totalPurchases = c.sales.reduce((sum: number, s: any) => sum + decimalToNumber(s.netAmount), 0);
        return [
          c.name,
          c.phone || "N/A",
          formatCurrency(totalPurchases),
          formatCurrency(decimalToNumber(c.balance))
        ];
      });
      title = "Customer Khata & Sales Report";
      filename = `customers_report_${dateSuffix}`;
    } else if (activeTab === "accounts") {
      headers = ["Date", "Channel", "Type", "Amount", "Description"];
      data = filteredAccounts.map((a) => [
        new Date(a.createdAt).toLocaleString(),
        a.accountType,
        a.transactionType.toUpperCase(),
        formatCurrency(decimalToNumber(a.amount)),
        a.description || ""
      ]);
      title = "Account Transactions Report";
      filename = `accounts_report_${dateSuffix}`;
    }

    if (type === "pdf") {
      exportToPDF(headers, data, title, filename);
    } else {
      exportToCSV([headers, ...data], filename);
    }
  };

  const tabs = [
    { id: "sales", label: "Sales", icon: TrendingUp },
    { id: "expenses", label: "Expenses", icon: Receipt },
    { id: "stock", label: "Stock", icon: ClipboardList },
    { id: "customers", label: "Customers", icon: Users },
    { id: "accounts", label: "Accounts", icon: Building2 },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
                    : "text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {activeTab !== "customers" && (
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              className="h-9 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 text-xs font-semibold"
            >
              <option value="today">Today</option>
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
              <option value="all">All Time</option>
            </select>
          )}

          <div className="flex items-center gap-2 border-l border-slate-200 dark:border-zinc-700 pl-3">
            <button
              onClick={() => handleExport("csv")}
              className="flex items-center gap-1.5 h-9 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-lg text-xs font-bold transition-colors"
            >
              <Table className="w-4 h-4" /> CSV
            </button>
            <button
              onClick={() => handleExport("pdf")}
              className="flex items-center gap-1.5 h-9 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
            >
              <FileText className="w-4 h-4" /> PDF
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {activeTab === "sales" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Total Net Revenue</p>
              <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                {formatCurrency(filteredSales.reduce((s, x) => s + decimalToNumber(x.netAmount), 0))}
              </p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Total Discounts</p>
              <p className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">
                {formatCurrency(filteredSales.reduce((s, x) => s + decimalToNumber(x.discountAmount), 0))}
              </p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Invoices Count</p>
              <p className="mt-1 text-2xl font-black text-blue-600 dark:text-blue-400">
                {filteredSales.length}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Data Table View */}
      <Card>
        <CardContent className="p-0 overflow-x-auto max-h-[600px]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-zinc-800/50 text-slate-600 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider sticky top-0 border-b border-slate-200 dark:border-zinc-800 shadow-sm z-10">
              {activeTab === "sales" && (
                <tr>
                  <th className="py-3 px-4">Invoice</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3 text-right">Gross</th>
                  <th className="py-3 px-3 text-right">Discount</th>
                  <th className="py-3 px-4 text-right">Net Amount</th>
                </tr>
              )}
              {activeTab === "expenses" && (
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Title</th>
                  <th className="py-3 px-3">Payment Via</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              )}
              {activeTab === "stock" && (
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3 text-right">Expected</th>
                  <th className="py-3 px-3 text-right">Counted</th>
                  <th className="py-3 px-3 text-right">Variance</th>
                  <th className="py-3 px-4">Reason</th>
                </tr>
              )}
              {activeTab === "customers" && (
                <tr>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3 text-right">Total Purchases</th>
                  <th className="py-3 px-4 text-right">Khata Balance</th>
                </tr>
              )}
              {activeTab === "accounts" && (
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-3">Channel</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {activeTab === "sales" && filteredSales.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 text-xs">
                  <td className="py-2.5 px-4 font-mono font-bold">{s.invoiceNumber}</td>
                  <td className="py-2.5 px-3 text-slate-500">{new Date(s.createdAt).toLocaleString()}</td>
                  <td className="py-2.5 px-3">{s.customer?.name || "Guest"}</td>
                  <td className="py-2.5 px-3 text-right text-slate-500">{formatCurrency(decimalToNumber(s.totalAmount))}</td>
                  <td className="py-2.5 px-3 text-right text-red-500">{formatCurrency(decimalToNumber(s.discountAmount))}</td>
                  <td className="py-2.5 px-4 text-right font-black text-emerald-600">{formatCurrency(decimalToNumber(s.netAmount))}</td>
                </tr>
              ))}
              
              {activeTab === "expenses" && filteredExpenses.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 text-xs">
                  <td className="py-2.5 px-4 text-slate-500">{new Date(e.date).toLocaleDateString()}</td>
                  <td className="py-2.5 px-3 font-semibold capitalize">{e.category}</td>
                  <td className="py-2.5 px-3">{e.title}</td>
                  <td className="py-2.5 px-3 capitalize">{e.paymentMethod}</td>
                  <td className="py-2.5 px-4 text-right font-bold text-slate-900 dark:text-white">{formatCurrency(decimalToNumber(e.amount))}</td>
                </tr>
              ))}
              
              {activeTab === "stock" && filteredStock.map((s) => {
                const diff = decimalToNumber(s.difference);
                return (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 text-xs">
                    <td className="py-2.5 px-4 text-slate-500">{new Date(s.performedAt).toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-semibold">{s.product.name}</td>
                    <td className="py-2.5 px-3 text-right">{decimalToNumber(s.expectedStock)}</td>
                    <td className="py-2.5 px-3 text-right font-bold">{decimalToNumber(s.countedStock)}</td>
                    <td className={`py-2.5 px-3 text-right font-bold ${diff < 0 ? 'text-red-500' : diff > 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                      {diff > 0 ? `+${diff}` : diff}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500">{s.reason}</td>
                  </tr>
                );
              })}

              {activeTab === "customers" && customers.map((c) => {
                const bal = decimalToNumber(c.balance);
                const purchases = c.sales.reduce((sum: number, s: any) => sum + decimalToNumber(s.netAmount), 0);
                return (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 text-xs">
                    <td className="py-2.5 px-4 font-bold">{c.name}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{c.phone || "—"}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-600 font-medium">{formatCurrency(purchases)}</td>
                    <td className={`py-2.5 px-4 text-right font-black ${bal > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                      {formatCurrency(bal)}
                    </td>
                  </tr>
                );
              })}

              {activeTab === "accounts" && filteredAccounts.map((a) => {
                const isInflow = a.transactionType === "inflow";
                return (
                  <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 text-xs">
                    <td className="py-2.5 px-4 text-slate-500">{new Date(a.createdAt).toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-semibold capitalize">{a.accountType}</td>
                    <td className={`py-2.5 px-3 font-bold uppercase text-[10px] ${isInflow ? 'text-emerald-600' : 'text-red-600'}`}>
                      {a.transactionType}
                    </td>
                    <td className="py-2.5 px-3">{a.description}</td>
                    <td className={`py-2.5 px-4 text-right font-black ${isInflow ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                      {isInflow ? "+" : "-"}{formatCurrency(decimalToNumber(a.amount))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
