"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveSupplier } from "@/app/actions/suppliers";
import { Truck, X } from "lucide-react";

export function SupplierModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await saveSupplier(null, formData);
    setLoading(false);
    setOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        <Truck className="h-4 w-4" /> Add Supplier
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between border-b pb-3 mb-4 border-slate-100">
              <h3 className="font-bold text-slate-900">
                New Supplier
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <Input
                  autoFocus
                  name="name"
                  placeholder="e.g. Fresh Farms Inc."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <Input
                  name="contactPerson"
                  placeholder="e.g. Ahmed Ali"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <Input
                    name="phone"
                    placeholder="e.g. 0300-1234567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="e.g. orders@fresh.com"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" name="isActive" defaultChecked id="isActive" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                <label htmlFor="isActive" className="text-sm text-gray-700">Supplier is Active</label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {loading ? "Saving..." : "Save Supplier"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
