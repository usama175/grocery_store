"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  Printer,
  Calendar,
  DollarSign,
  TrendingUp,
  Receipt,
  PiggyBank,
  CheckCircle2,
} from "lucide-react";

export type EodReportData = {
  date: string;
  saleCount: number;
  totalSales: number;
  totalCogs: number;
  grossProfit: number;
  grossMarginPercent: string;
  totalExpenses: number;
  netProfit: number;
  netMarginPercent: string;
  byPayment: Record<string, number>;
};

export function EodReportView({ report }: { report: EodReportData }) {
  const [selectedDate, setSelectedDate] = useState(report.date);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Date Filter & Print Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        <form className="flex items-center gap-2" method="get">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-emerald-600" /> Select EOD Date:
          </label>
          <Input
            type="date"
            name="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-9 w-40 text-xs font-semibold"
          />
          <Button type="submit" size="sm" variant="secondary">
            Load Report
          </Button>
        </form>

        <Button
          type="button"
          onClick={handlePrint}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 h-9 text-xs font-semibold"
        >
          <Printer className="h-4 w-4" /> Print Day-End Summary
        </Button>
      </div>

      {/* Main EOD Financial KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="rounded-2xl bg-white dark:bg-zinc-900 p-4 border border-slate-200 dark:border-zinc-800 shadow-sm border-l-4 border-l-blue-500">
          <p className="text-[11px] font-bold uppercase text-slate-400">Total Invoices</p>
          <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
            {report.saleCount}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Orders completed</p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-zinc-900 p-4 border border-slate-200 dark:border-zinc-800 shadow-sm border-l-4 border-l-emerald-500">
          <p className="text-[11px] font-bold uppercase text-slate-400">Net Sales</p>
          <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(report.totalSales)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">After discounts</p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-zinc-900 p-4 border border-slate-200 dark:border-zinc-800 shadow-sm border-l-4 border-l-slate-400">
          <p className="text-[11px] font-bold uppercase text-slate-400">Cost of Goods (COGS)</p>
          <p className="mt-1 text-2xl font-black text-slate-800 dark:text-zinc-200">
            {formatCurrency(report.totalCogs)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Direct product purchase cost</p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-zinc-900 p-4 border border-slate-200 dark:border-zinc-800 shadow-sm border-l-4 border-l-indigo-500">
          <p className="text-[11px] font-bold uppercase text-slate-400">Gross Profit</p>
          <p className="mt-1 text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {formatCurrency(report.grossProfit)}
          </p>
          <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">
            {report.grossMarginPercent}% gross margin
          </p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-zinc-900 p-4 border border-slate-200 dark:border-zinc-800 shadow-sm border-l-4 border-l-amber-500">
          <p className="text-[11px] font-bold uppercase text-slate-400">Daily Expenses</p>
          <p className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">
            {formatCurrency(report.totalExpenses)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Store overhead costs</p>
        </div>

        <div
          className={`rounded-2xl p-4 border shadow-sm border-l-4 ${
            report.netProfit >= 0
              ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 border-l-emerald-600"
              : "bg-red-50/60 dark:bg-red-950/20 border-red-200 dark:border-red-900 border-l-red-600"
          }`}
        >
          <p className="text-[11px] font-bold uppercase text-slate-500">Net Daily Profit</p>
          <p
            className={`mt-1 text-2xl font-black ${
              report.netProfit >= 0
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-red-700 dark:text-red-300"
            }`}
          >
            {formatCurrency(report.netProfit)}
          </p>
          <p className="text-[10px] font-bold mt-0.5">
            {report.netMarginPercent}% net margin
          </p>
        </div>
      </div>

      {/* Payment Mix Breakdown */}
      <Card>
        <CardHeader className="py-3.5 px-5 border-b border-slate-100 dark:border-zinc-800">
          <CardTitle className="text-base font-bold flex items-center justify-between">
            <span>Sales Breakdown by Payment Method</span>
            <span className="text-xs font-normal text-slate-500">
              For date: {report.date}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {Object.entries(report.byPayment).map(([method, amt]) => {
              const share =
                report.totalSales > 0
                  ? ((amt / report.totalSales) * 100).toFixed(0)
                  : "0";
              return (
                <div
                  key={method}
                  className="rounded-xl bg-slate-50 dark:bg-zinc-800/60 p-3 border border-slate-200 dark:border-zinc-700/80"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 capitalize">
                      {method}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 font-bold">
                      {share}%
                    </span>
                  </div>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-1.5">
                    {formatCurrency(amt)}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
