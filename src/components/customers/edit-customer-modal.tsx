"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateCustomer } from "@/app/actions/customers";
import { X, Edit, CheckCircle2, AlertTriangle } from "lucide-react";
import { decimalToNumber } from "@/lib/utils";

export function EditCustomerModal({ customer }: { customer: any }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(customer.name);
  const [phone, setPhone] = useState(customer.phone || "");
  const [address, setAddress] = useState(customer.address || "");
  const [balance, setBalance] = useState(decimalToNumber(customer.balance).toString());
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setStatus({ message: "Customer name is required", type: "error" });
      return;
    }

    setLoading(true);
    setStatus(null);

    const numBalance = parseFloat(balance) || 0;

    const res = await updateCustomer(customer.id, {
      name: name.trim(),
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      balance: numBalance,
    });

    setLoading(false);

    if (!res.ok) {
      setStatus({ message: res.error || "Failed to update customer", type: "error" });
      return;
    }

    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-slate-200 dark:border-zinc-800 p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
        title="Edit Customer"
      >
        <Edit className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 px-5 py-4">
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                Edit Customer
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
                  Customer Name *
                </label>
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
                  Address
                </label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
                  Khata Balance (PKR)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                />
                <p className="text-[10px] text-slate-400 mt-1">Manual adjustment of balance</p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 rounded-xl"
              >
                {loading ? "Updating..." : "Update Customer"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
