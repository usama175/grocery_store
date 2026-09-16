"use client";

import { useState } from "react";
import { createProduct, updateProduct } from "@/app/actions/products";
import { PRODUCT_UNITS } from "@/lib/constants";
import { Plus, Edit2, X, Sparkles } from "lucide-react";

export type ProductFormProps = {
  categories: { id: number; name: string }[];
  productToEdit?: {
    id: number;
    name: string;
    barcode: string | null;
    categoryId: number | null;
    unit: string;
    purchaseRate: number;
    saleRate: number;
    currentStock: number;
    minStockAlert: number;
  };
  triggerLabel?: string;
};

export function ProductModal({
  categories,
  productToEdit,
  triggerLabel,
}: ProductFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(productToEdit?.name || "");
  const [barcode, setBarcode] = useState(productToEdit?.barcode || "");
  const [categoryId, setCategoryId] = useState<number | "">(
    productToEdit?.categoryId ?? ""
  );
  const [unit, setUnit] = useState<"pcs" | "kg" | "pack" | "liter">(
    (productToEdit?.unit as "pcs" | "kg" | "pack" | "liter") || "pcs"
  );
  const [purchaseRate, setPurchaseRate] = useState(
    productToEdit?.purchaseRate ? String(productToEdit.purchaseRate) : ""
  );
  const [saleRate, setSaleRate] = useState(
    productToEdit?.saleRate ? String(productToEdit.saleRate) : ""
  );
  const [currentStock, setCurrentStock] = useState(
    productToEdit?.currentStock !== undefined
      ? String(productToEdit.currentStock)
      : "10"
  );
  const [minStockAlert, setMinStockAlert] = useState(
    productToEdit?.minStockAlert !== undefined
      ? String(productToEdit.minStockAlert)
      : "5"
  );

  const cost = parseFloat(purchaseRate) || 0;
  const retail = parseFloat(saleRate) || 0;
  const grossProfitPerUnit = retail - cost;
  const marginPercent = retail > 0 ? ((grossProfitPerUnit / retail) * 100).toFixed(1) : "0";

  const generateBarcode = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    setBarcode(`890${random}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a product name");
      return;
    }
    if (cost < 0 || retail < 0) {
      setError("Prices cannot be negative");
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      name: name.trim(),
      barcode: barcode.trim() || undefined,
      categoryId: categoryId === "" ? null : Number(categoryId),
      unit,
      purchaseRate: cost,
      saleRate: retail,
      currentStock: parseFloat(currentStock) || 0,
      minStockAlert: parseFloat(minStockAlert) || 5,
    };

    let result;
    if (productToEdit) {
      result = await updateProduct(productToEdit.id, payload);
    } else {
      result = await createProduct(payload);
    }

    setLoading(false);

    if (!result.ok) {
      setError(result.error || "Failed to save product");
      return;
    }

    if (!productToEdit) {
      setName("");
      setBarcode("");
      setCategoryId("");
      setPurchaseRate("");
      setSaleRate("");
      setCurrentStock("10");
      setMinStockAlert("5");
    }
    setOpen(false);
  };

  return (
    <>
      {productToEdit ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-gray-500 hover:text-emerald-700 flex items-center text-sm font-medium transition-colors"
        >
          <Edit2 className="w-4 h-4 mr-1.5" /> Edit
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1.5" /> {triggerLabel || "Add Product"}
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setOpen(false)} />
          
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-xl mx-auto flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">
                {productToEdit ? "Edit Product" : "Add New Product"}
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(100vh-10rem)] p-6 bg-gray-50/50">
              <form id="product-form" onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-rose-50 text-rose-700 p-3 rounded-lg text-sm border border-rose-100">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    required
                    placeholder="e.g. Organic Bananas"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Barcode / SKU
                    </label>
                    <button
                      type="button"
                      onClick={generateBarcode}
                      className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Auto-generate
                    </button>
                  </div>
                  <input
                    placeholder="Scan or enter barcode"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    >
                      <option value="">No Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit
                    </label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value as "pcs" | "kg" | "pack" | "liter")}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    >
                      {PRODUCT_UNITS.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cost Price *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rs</span>
                      <input
                        required
                        type="number"
                        step="0.01"
                        min={0}
                        placeholder="0.00"
                        value={purchaseRate}
                        onChange={(e) => setPurchaseRate(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Selling Price *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rs</span>
                      <input
                        required
                        type="number"
                        step="0.01"
                        min={0}
                        placeholder="0.00"
                        value={saleRate}
                        onChange={(e) => setSaleRate(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 p-3 rounded-lg flex items-center justify-between shadow-sm">
                  <span className="text-sm font-medium text-gray-600">Profit Margin:</span>
                  <span className={`text-sm font-semibold ${grossProfitPerUnit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    Rs {grossProfitPerUnit.toFixed(2)} ({marginPercent}%)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Stock
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={currentStock}
                      onChange={(e) => setCurrentStock(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Low Stock Alert Level
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={minStockAlert}
                      onChange={(e) => setMinStockAlert(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="product-form"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : productToEdit ? "Update Product" : "Save Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
