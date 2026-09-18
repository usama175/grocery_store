import { getLedgerSummary } from "@/lib/services/accounts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransferModal } from "@/components/accounts/transfer-modal";
import { formatCurrency, decimalToNumber } from "@/lib/utils";
import {
  Wallet,
  Building2,
  Smartphone,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  History,
} from "lucide-react";

export const dynamic = "force-dynamic";

const CHANNEL_CONFIG = {
  cash: {
    label: "Cash Register Drawer",
    desc: "Physical cash in register",
    icon: Coins,
    color: "from-emerald-500 to-emerald-700",
    border: "border-l-emerald-500",
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  },
  jazzcash: {
    label: "JazzCash Wallet",
    desc: "Merchant / Till account",
    icon: Smartphone,
    color: "from-amber-600 to-red-600",
    border: "border-l-amber-500",
    badge: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300",
  },
  easypaisa: {
    label: "Easypaisa Wallet",
    desc: "Merchant / QR account",
    icon: Smartphone,
    color: "from-green-600 to-emerald-700",
    border: "border-l-green-500",
    badge: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  },
  bank: {
    label: "Bank Account(s)",
    desc: "Meezan / HBL store account",
    icon: Building2,
    color: "from-blue-600 to-indigo-700",
    border: "border-l-blue-500",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  },
};

export default async function AccountsPage() {
  const { balances, recent } = await getLedgerSummary();

  const totalLiquid = Object.values(balances).reduce((sum, b) => sum + b, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Payment Channels & Reconciliation
            </h1>
            <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs px-2.5 py-0.5 font-bold">
              4 Channels
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            Real-time balance ledger for Cash, JazzCash, Easypaisa, Bank, and internal transfers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right pr-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Total Liquid Funds
            </span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalLiquid)}
            </span>
          </div>
          <TransferModal balances={balances} />
        </div>
      </div>

      {/* 4 Branded Account Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(["cash", "jazzcash", "easypaisa", "bank"] as const).map((key) => {
          const cfg = CHANNEL_CONFIG[key];
          const Icon = cfg.icon;
          const bal = balances[key] ?? 0;

          return (
            <Card key={key} className={`border-l-4 ${cfg.border} shadow-sm overflow-hidden`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${cfg.badge}`}>
                    {key}
                  </span>
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${cfg.color} text-white shadow-sm`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <div className="mt-3">
                  <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                    {cfg.label}
                  </p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                    {formatCurrency(bal)}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">{cfg.desc}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Full Transaction History Ledger */}
      <Card>
        <CardHeader className="py-3.5 px-5 border-b border-slate-100 dark:border-zinc-800 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <History className="h-4 w-4 text-emerald-600" />
            General Account Ledger Statement ({recent.length} Events)
          </CardTitle>
          <span className="text-xs text-slate-400">Real-time Inflow & Outflow journal</span>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-zinc-800/50 text-slate-600 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-3">Account Channel</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Transaction Description</th>
                <th className="py-3 px-4 text-right">Amount (PKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {recent.map((t) => {
                const isInflow = t.transactionType === "inflow";
                const amt = decimalToNumber(t.amount);

                return (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 text-xs"
                  >
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono">
                      {new Date(t.createdAt).toLocaleString()}
                    </td>

                    <td className="py-3 px-3">
                      <span className="inline-block rounded-md bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 text-[11px] font-bold text-slate-800 dark:text-zinc-200 capitalize">
                        {t.accountType}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${
                          isInflow
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                        }`}
                      >
                        {isInflow ? (
                          <ArrowDownLeft className="h-3 w-3" />
                        ) : (
                          <ArrowUpRight className="h-3 w-3" />
                        )}
                        {isInflow ? "Inflow" : "Outflow"}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-700 dark:text-zinc-300 font-medium">
                      {t.description || "—"}
                    </td>

                    <td
                      className={`py-3 px-4 text-right font-black text-sm ${
                        isInflow
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {isInflow ? `+${formatCurrency(amt)}` : `-${formatCurrency(amt)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {recent.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              <Wallet className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="font-medium">No ledger transactions recorded yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
