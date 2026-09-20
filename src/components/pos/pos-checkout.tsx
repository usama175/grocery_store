"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { checkout } from "@/app/actions/sales";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThermalReceiptModal, type ReceiptData } from "./thermal-receipt-modal";
import { formatCurrency } from "@/lib/utils";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Printer,
  User,
  Banknote,
  Smartphone,
  WalletCards,
  Landmark,
  FileClock
} from "lucide-react";

export type PosProduct = {
  id: number;
  name: string;
  barcode: string | null;
  saleRate: string;
  purchaseRate: string;
  currentStock: string;
  unit: string;
  category: { name: string } | null;
  categoryId: number | null;
};

export type PosCustomer = {
  id: number;
  name: string;
  phone: string | null;
  balance: string;
};

type CartLine = {
  productId: number;
  name: string;
  saleRate: number;
  quantity: number;
  unit: string;
  currentStock: number;
};

type PaymentLine = {
  method: string;
  amount: number;
  referenceId?: string;
};

export function PosCheckout({
  products,
  customers,
  categories,
}: {
  products: PosProduct[];
  customers: PosCustomer[];
  categories: { id: number; name: string }[];
}) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerId, setCustomerId] = useState<number | "">("");
  const [discount, setDiscount] = useState(0);
  
  // Single payment line for the quick payment UI
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  
  const [status, setStatus] = useState<{ message: string; type: "error" | "success" } | null>(null);
  const [loading, setLoading] = useState(false);

  // Completed receipt for thermal printing modal
  const [currentReceipt, setCurrentReceipt] = useState<ReceiptData | null>(null);

  const focusSearch = useCallback(() => {
    setTimeout(() => {
      searchRef.current?.focus();
      searchRef.current?.select();
    }, 50);
  }, []);

  useEffect(() => {
    focusSearch();
  }, [focusSearch]);

  const filteredProducts = useMemo(() => {
    let result = products;
    if (selectedCategory !== null) {
      result = result.filter((p) => p.categoryId === selectedCategory);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.barcode && p.barcode.includes(q))
      );
    }
    return result;
  }, [query, selectedCategory, products]);

  const subtotal = cart.reduce((s, l) => s + l.saleRate * l.quantity, 0);
  const net = Math.max(0, subtotal - discount);

  const addProduct = (p: PosProduct, qty = 1) => {
    const stock = parseFloat(p.currentStock);
    if (stock <= 0) {
      setStatus({ message: `"${p.name}" is out of stock!`, type: "error" });
      return;
    }

    setCart((prev) => {
      const existing = prev.find((l) => l.productId === p.id);
      if (existing) {
        const newQty = existing.quantity + qty;
        if (newQty > stock) {
          setStatus({
            message: `Cannot add more than ${stock} ${p.unit} in stock for ${p.name}`,
            type: "error",
          });
          return prev;
        }
        return prev.map((l) =>
          l.productId === p.id ? { ...l, quantity: newQty } : l
        );
      }
      return [
        ...prev,
        {
          productId: p.id,
          name: p.name,
          saleRate: parseFloat(p.saleRate),
          quantity: qty,
          unit: p.unit,
          currentStock: stock,
        },
      ];
    });

    setStatus(null);
    setQuery("");
    focusSearch();
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((l) => {
          if (l.productId !== productId) return l;
          const newQty = Math.max(0, l.quantity + delta);
          if (newQty > l.currentStock) {
            setStatus({
              message: `Maximum stock for ${l.name} is ${l.currentStock} ${l.unit}`,
              type: "error",
            });
            return l;
          }
          return { ...l, quantity: newQty };
        })
        .filter((l) => l.quantity > 0)
    );
  };

  const removeLine = (productId: number) => {
    setCart((prev) => prev.filter((l) => l.productId !== productId));
  };

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const exactBarcode = products.find(
        (p) => p.barcode && p.barcode.toLowerCase() === query.trim().toLowerCase()
      );
      if (exactBarcode) {
        addProduct(exactBarcode);
        return;
      }
      if (filteredProducts[0]) {
        addProduct(filteredProducts[0]);
      }
    }
  };

  const selectedCustomer = customers.find((c) => c.id === customerId);

  const completeSale = useCallback(async () => {
    if (cart.length === 0) {
      setStatus({ message: "Cart is empty. Scan items first.", type: "error" });
      return;
    }

    if (paymentMethod === "udhaar" && !customerId) {
      setStatus({
        message: "Please select a registered customer to record Udhaar / Credit sale.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    setStatus(null);

    const paymentLine: PaymentLine = {
      method: paymentMethod,
      amount: net, // Send the full net amount automatically
    };

    const result = await checkout({
      customerId: customerId === "" ? null : customerId,
      discountAmount: discount,
      items: cart.map((l) => ({ productId: l.productId, quantity: l.quantity })),
      payments: net > 0 ? [paymentLine] : [], // Only process payment if net > 0
    });

    setLoading(false);

    if (!result.ok) {
      setStatus({ message: result.error, type: "error" });
      return;
    }

    const receiptData: ReceiptData = {
      invoiceNumber: result.sale.invoiceNumber,
      date: new Date(),
      customerName: selectedCustomer?.name,
      customerPhone: selectedCustomer?.phone || undefined,
      customerKhataBalance: selectedCustomer
        ? parseFloat(selectedCustomer.balance) +
          (paymentMethod === "udhaar" ? net : 0)
        : undefined,
      items: cart.map((l) => ({
        name: l.name,
        quantity: l.quantity,
        saleRate: l.saleRate,
        total: l.quantity * l.saleRate,
        unit: l.unit,
      })),
      subtotal,
      discount,
      netAmount: net,
      payments: net > 0 ? [paymentLine] : [],
    };

    setCurrentReceipt(receiptData);

    // Reset Form
    setCart([]);
    setDiscount(0);
    setPaymentMethod("cash");
    setCustomerId("");
    setStatus({
      message: `Sale complete — Invoice #${result.sale.invoiceNumber}`,
      type: "success",
    });
    focusSearch();
  }, [
    cart,
    customerId,
    discount,
    paymentMethod,
    net,
    subtotal,
    selectedCustomer,
    focusSearch,
  ]);

  const paymentOptions = [
    { value: "cash", label: "Cash", icon: Banknote, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950 border-emerald-200" },
    { value: "jazzcash", label: "JazzCash", icon: Smartphone, color: "text-rose-600 bg-rose-50 dark:bg-rose-950 border-rose-200" },
    { value: "easypaisa", label: "EasyPaisa", icon: WalletCards, color: "text-green-600 bg-green-50 dark:bg-green-950 border-green-200" },
    { value: "bank", label: "Bank", icon: Landmark, color: "text-blue-600 bg-blue-50 dark:bg-blue-950 border-blue-200" },
    { value: "udhaar", label: "Udhaar", icon: FileClock, color: "text-amber-600 bg-amber-50 dark:bg-amber-950 border-amber-200" },
  ];

  return (
    <div className="space-y-4">
      {/* POS Topbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              POS Terminal
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentReceipt && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentReceipt(currentReceipt)}
              className="gap-1.5 h-8 text-xs font-medium"
            >
              <Printer className="h-3.5 w-3.5" /> Re-print Receipt
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-4 lg:grid-cols-[1fr_450px] xl:grid-cols-[1fr_500px]">
        {/* Left Column (Catalog + Cart) */}
        <div className="space-y-4 flex flex-col min-h-[70vh]">
          {/* Barcode Search & Category Tabs */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="relative">
                <Input
                  ref={searchRef}
                  placeholder="Search item name... (Press Enter to add)"
                  className="h-11 px-4 text-base font-medium shadow-inner rounded-xl border-slate-300 dark:border-zinc-700 focus-visible:ring-emerald-500"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onSearchKeyDown}
                  autoComplete="off"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-all ${
                    selectedCategory === null
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200"
                  }`}
                >
                  All Items
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCategory(c.id)}
                    className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-all ${
                      selectedCategory === c.id
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              <div className="grid gap-2 max-h-48 overflow-y-auto sm:grid-cols-2 lg:grid-cols-4 border border-slate-200 dark:border-zinc-800 rounded-xl p-2 bg-slate-50/50 dark:bg-zinc-900/50">
                {filteredProducts.slice(0, 16).map((p) => {
                  const stock = parseFloat(p.currentStock);
                  const isOut = stock <= 0;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      disabled={isOut}
                      onClick={() => addProduct(p)}
                      className={`flex flex-col justify-between text-left p-2.5 rounded-xl border transition-all ${
                        isOut
                          ? "opacity-50 cursor-not-allowed bg-slate-100 dark:bg-zinc-800/40 border-slate-200"
                          : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-emerald-500 hover:shadow-md active:scale-[0.98]"
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-xs text-slate-900 dark:text-white line-clamp-1">
                          {p.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {p.barcode || "No Barcode"}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 dark:border-zinc-800/80">
                        <span className="font-black text-xs text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(p.saleRate)}
                        </span>
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                            isOut
                              ? "text-red-600 bg-red-50 dark:bg-red-950"
                              : "text-slate-500 bg-slate-100 dark:bg-zinc-800"
                          }`}
                        >
                          {isOut ? "Out" : `${stock} ${p.unit}`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Cart Table */}
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader className="py-3 px-4 border-b border-slate-100 dark:border-zinc-800 flex flex-row items-center justify-between shrink-0">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <span>Active Bill</span>
                <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs px-2 py-0.5 font-bold">
                  {cart.length} items
                </span>
              </CardTitle>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCart([])}
                  className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium"
                >
                  <Trash2 className="h-3 w-3" /> Clear Cart
                </button>
              )}
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto flex-1">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <ShoppingCart className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="font-medium text-sm">Cart is empty</p>
                  <p className="text-xs">Search for a product or click products to ring up bill</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-zinc-800/60 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100 dark:border-zinc-800 sticky top-0 z-10">
                    <tr>
                      <th className="py-2.5 px-4">Item</th>
                      <th className="py-2.5 px-2 text-right">Price</th>
                      <th className="py-2.5 px-2 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                      <th className="py-2.5 px-3 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {cart.map((line) => {
                      return (
                        <tr
                          key={line.productId}
                          className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                        >
                          <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-2">
                              <div>
                                {line.name}
                                <span className="block text-[10px] text-slate-400 font-normal">
                                  Unit: {line.unit}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-right font-medium text-slate-600 dark:text-zinc-300">
                            {formatCurrency(line.saleRate)}
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); updateQuantity(line.productId, -1); }}
                                className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-slate-200"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-10 text-center font-bold text-slate-900 dark:text-white text-sm">
                                {line.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); updateQuantity(line.productId, 1); }}
                                className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-slate-200"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right font-black text-emerald-600 dark:text-emerald-400 text-sm">
                            {formatCurrency(line.saleRate * line.quantity)}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); removeLine(line.productId); }}
                              className="text-slate-400 hover:text-red-600 p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Keypad & Payment Drawer */}
        <div className="space-y-4">
          <Card className="border-t-4 border-t-emerald-600 shadow-md">
            <CardContent className="p-4 space-y-4">
              
              {/* Customer Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1 flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-slate-400" /> Customer
                </label>
                <select
                  className="h-10 w-full rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 text-xs font-medium"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value ? Number(e.target.value) : "")}
                >
                  <option value="">Walk-in Guest (Cash / Immediate)</option>
                  {customers.map((c) => {
                    const bal = parseFloat(c.balance);
                    return (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.phone ? `(${c.phone})` : ""}
                        {bal > 0 ? ` — Khata: Rs ${bal}` : ""}
                      </option>
                    );
                  })}
                </select>

                {selectedCustomer && parseFloat(selectedCustomer.balance) > 0 && (
                  <div className="mt-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 p-2 text-[11px] text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900 flex justify-between">
                    <span>Outstanding Khata Balance:</span>
                    <span className="font-bold">
                      {formatCurrency(selectedCustomer.balance)}
                    </span>
                  </div>
                )}
              </div>

              {/* Totals Screen */}
              <div className="rounded-xl bg-slate-900 text-white p-4 shadow-inner">
                <div className="flex justify-between text-sm text-slate-400 pb-1.5">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-200">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-400 pb-2">
                  <span>Discount</span>
                  <span className="font-medium text-red-400">- {formatCurrency(discount)}</span>
                </div>
                <div className="mt-1 pt-2 border-t border-slate-800 flex justify-between items-baseline">
                  <span className="text-sm uppercase font-bold text-emerald-400">
                    Net Payable
                  </span>
                  <span className="text-3xl font-black text-emerald-400">
                    {formatCurrency(net)}
                  </span>
                </div>
              </div>

              {/* Discount Input */}
              <div className="bg-slate-100 dark:bg-zinc-800/50 p-3 rounded-xl border border-slate-200 dark:border-zinc-700">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-2">
                  Discount Amount (Rs)
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={discount || ""}
                  onChange={(e) => setDiscount(e.target.value ? Number(e.target.value) : 0)}
                  className="h-10 text-lg font-bold border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  min="0"
                />
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {paymentOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setPaymentMethod(opt.value)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all ${
                        paymentMethod === opt.value
                          ? opt.color + " ring-2 ring-emerald-500/50 ring-offset-1"
                          : "bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:border-slate-300"
                      }`}
                    >
                      <opt.icon className="h-5 w-5 mb-1" />
                      <span className="text-[10px] font-bold">{opt.label}</span>
                    </button>
                  ))}
                </div>
                
              </div>

              {/* Status Message */}
              {status && (
                <div
                  className={`rounded-lg p-2.5 text-xs font-medium border ${
                    status.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300"
                  }`}
                >
                  {status.message}
                </div>
              )}

              {/* Complete Checkout Button */}
              <Button
                type="button"
                className="w-full h-14 text-lg font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
                disabled={loading || cart.length === 0}
                onClick={completeSale}
              >
                {loading ? "Processing..." : `Complete Sale`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 80mm Thermal Receipt Dialog */}
      <ThermalReceiptModal
        receipt={currentReceipt}
        onClose={() => {
          setCurrentReceipt(null);
          focusSearch();
        }}
      />
    </div>
  );
}
