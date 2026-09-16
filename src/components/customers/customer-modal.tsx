"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCustomer } from "@/app/actions/customers";
import { UserPlus, X } from "lucide-react";

export function CustomerModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Customer name is required");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await createCustomer({
      name: name.trim(),
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
    });

    setLoading(false);

    if (!res.ok) {
      setError(res.error || "Failed to create customer");
      return;
    }

    setName("");
    setPhone("");
    setAddress("");
    setOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
      >
        <UserPlus className="h-4 w-4" /> Add Customer
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 px-6 py-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                New Customer Profile
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
                  Full Name *
                </label>
                <Input
                  required
                  placeholder="e.g. Tariq Mehmood"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
                  Phone Number
                </label>
                <Input
                  placeholder="e.g. 0300-1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
                  Address / Sector
                </label>
                <Input
                  placeholder="e.g. House 14, Street 3, Block B"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[100px]"
                >
                  {loading ? "Saving..." : "Create Profile"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
