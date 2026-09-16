"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { upsertCategory } from "@/app/actions/products";
import { FolderPlus, X } from "lucide-react";

export function CategoryModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await upsertCategory(name.trim());
    setLoading(false);
    setName("");
    setOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="gap-1.5"
      >
        <FolderPlus className="h-4 w-4" /> Add Category
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border border-slate-200 dark:border-zinc-800 p-5">
            <div className="flex items-center justify-between border-b pb-3 mb-3 border-slate-100 dark:border-zinc-800">
              <h3 className="font-bold text-slate-900 dark:text-white">
                New Product Category
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                autoFocus
                placeholder="Category name (e.g. Frozen Foods)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !name.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {loading ? "Adding..." : "Add Category"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
