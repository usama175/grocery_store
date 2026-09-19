"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { checkout } from "@/app/actions/sales";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThermalReceiptModal, type ReceiptData } from "./thermal-receipt-modal";
import { QUICK_CASH_DENOMINATIONS, PAYMENT_METHODS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Barcode,
  Printer,
  Volume2,
  VolumeX,
  CreditCard,
  User,
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
  const [payments, setPayments] = useState<PaymentLine[]>([
    { method: "cash", amount: 0 },
  ]);
  const [cashTendered, setCashTendered] = useState<number | "">("");
  const [status, setStatus] = useState<{ message: string; type: "error" | "success" } | null>(null);
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Completed receipt for thermal printing modal
  const [currentReceipt, setCurrentReceipt] = useState<ReceiptData | null>(null);

  // Web Audio sound effects
  const playBeep = useCallback((type: "scan" | "success" | "alert") => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "scan") {
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === "success") {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === "alert") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch {
      // AudioContext policy fallback
    }
  }, [soundEnabled]);

  const focusSearch = useCallback(() => {
    setTimeout(() => {
      searchRef.current?.focus();
      searchRef.current?.select();
    }, 50);
  }, []);

  useEffect(() => {
    focusSearch();
  }, [focusSearch]);

  // Filter products by search or category
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

  // Keep single cash payment in sync with net amount if untouched
  useEffect(() => {
    const timer = setTimeout(() => {
      if (payments.length === 1 && payments[0].method === "cash" && payments[0].amount !== net) {
        setPayments([{ method: "cash", amount: net }]);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [net, payments]);

  const addProduct = (p: PosProduct, qty = 1) => {
    const stock = parseFloat(p.currentStock);
    if (stock <= 0) {
      playBeep("alert");
      setStatus({ message: `"${p.name}" is out of stock!`, type: "error" });
      return;
    }

    setCart((prev) => {
      const existing = prev.find((l) => l.productId === p.id);
      if (existing) {
        const newQty = existing.quantity + qty;
        if (newQty > stock) {
          playBeep("alert");
          setStatus({
            message: `Cannot add more than ${stock} ${p.unit} in stock for ${p.name}`,
            type: "error",
          });
          return prev;
        }
        playBeep("scan");
        return prev.map((l) =>
          l.productId === p.id ? { ...l, quantity: newQty } : l
        );
      }
      playBeep("scan");
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
            playBeep("alert");
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
      // If exact barcode match exists
      const exactBarcode = products.find(
        (p) => p.barcode && p.barcode.toLowerCase() === query.trim().toLowerCase()
      );
      if (exactBarcode) {
        addProduct(exactBarcode);
        return;
      }
      // Else add first match
      if (filteredProducts[0]) {
        addProduct(filteredProducts[0]);
      }
    }
  };

  const setQuickCash = (amount: number) => {
    setCashTendered(amount);
    if (payments.length === 1 && payments[0].method === "cash") {
      setPayments([{ method: "cash", amount: net }]);
    }
  };

  const changeDue =
    typeof cashTendered === "number" && payments.length === 1 && payments[0].method === "cash"
      ? cashTendered - net
      : null;

  const selectedCustomer = customers.find((c) => c.id === customerId);

  const completeSale = useCallback(async () => {
    if (cart.length === 0) {
      setStatus({ message: "Cart is empty. Scan items first.", type: "error" });
      return;
    }

    const hasUdhaar = payments.some((p) => p.method === "udhaar" && p.amount > 0);
    if (hasUdhaar && !customerId) {
      setStatus({
        message: "Please select a registered customer to record Udhaar / Credit sale.",
        type: "error",
      });
      return;
    }

    const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
    if (Math.abs(totalPaid - net) > 0.01) {
      setStatus({
        message: `Payment split total (Rs ${totalPaid}) must equal Net Amount (Rs ${net}).`,
        type: "error",
      });
      return;
    }

    setLoading(true);
    setStatus(null);

    const result = await checkout({
      customerId: customerId === "" ? null : customerId,
      discountAmount: discount,
      items: cart.map((l) => ({ productId: l.productId, quantity: l.quantity })),
      payments: payments.filter((p) => p.amount > 0),
    });

    setLoading(false);

    if (!result.ok) {
      playBeep("alert");
      setStatus({ message: result.error, type: "error" });
      return;
    }

    playBeep("success");

    // Prepare receipt data
    const receiptData: ReceiptData = {
      invoiceNumber: result.sale.invoiceNumber,
      date: new Date(),
      customerName: selectedCustomer?.name,
      customerPhone: selectedCustomer?.phone || undefined,
      customerKhataBalance: selectedCustomer
        ? parseFloat(selectedCustomer.balance) +
          (payments.find((p) => p.method === "udhaar")?.amount || 0)
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
      cashTendered: typeof cashTendered === "number" ? cashTendered : undefined,
      changeDue: changeDue !== null ? changeDue : undefined,
      payments: payments.filter((p) => p.amount > 0),
    };

    setCurrentReceipt(receiptData);

    // Reset Cart & State for Next Sale
    setCart([]);
    setDiscount(0);
    setPayments([{ method: "cash", amount: 0 }]);
    setCashTendered("");
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
    payments,
    net,
    subtotal,
    cashTendered,
    changeDue,
    selectedCustomer,
    playBeep,
    focusSearch,
  ]);

  // Global Keyboard Shortcuts (F9: Checkout, F2: Search, Esc: Clear)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "F9") {
        e.preventDefault();
        void completeSale();
      } else if (e.key === "F2" || (e.key === "/" && document.activeElement !== searchRef.current)) {
        e.preventDefault();
        focusSearch();
      } else if (e.key === "Escape" && cart.length > 0 && !currentReceipt) {
        if (confirm("Clear current cart?")) {
          setCart([]);
          setDiscount(0);
          setPayments([{ method: "cash", amount: 0 }]);
          setCashTendered("");
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [completeSale, focusSearch, cart.length, currentReceipt]);

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
            <p className="text-xs text-slate-400">
              Hotkeys: <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-zinc-800 rounded font-mono">[F2]</kbd> Search · <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-zinc-800 rounded font-mono">[F9]</kbd> Checkout
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800"
            title="Toggle Scan Sound Feedback"
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5 text-emerald-600" /> : <VolumeX className="h-3.5 w-3.5 text-slate-400" />}
            <span className="hidden sm:inline">{soundEnabled ? "Sound ON" : "Muted"}</span>
          </button>

          {/* Re-print last receipt button */}
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

      {/* Main Grid: Left Catalog & Cart vs Right Payment Drawer */}
      <div className="grid gap-4 lg:grid-cols-[1fr_390px] xl:grid-cols-[1fr_420px]">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Barcode Search & Category Tabs */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="relative">
                <Barcode className="absolute left-3.5 top-3 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <Input
                  ref={searchRef}
                  placeholder="Scan barcode or type item name... (Press Enter to add)"
                  className="h-11 pl-11 pr-4 text-base font-medium shadow-inner rounded-xl border-slate-300 dark:border-zinc-700 focus-visible:ring-emerald-500"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onSearchKeyDown}
                  autoComplete="off"
                />
              </div>

              {/* Quick Category Buttons */}
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

              {/* Instant Search Results Dropdown/Grid */}
              <div className="grid gap-2 max-h-56 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3 border border-slate-200 dark:border-zinc-800 rounded-xl p-2 bg-slate-50/50 dark:bg-zinc-900/50">
                {filteredProducts.slice(0, 18).map((p) => {
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
                          {p.category?.name || "General"} · {p.barcode || "No Barcode"}
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
          <Card>
            <CardHeader className="py-3 px-4 border-b border-slate-100 dark:border-zinc-800 flex flex-row items-center justify-between">
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
            <CardContent className="p-0">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <ShoppingCart className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="font-medium text-sm">Cart is empty</p>
                  <p className="text-xs">Scan a barcode or click products to ring up bill</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-zinc-800/60 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100 dark:border-zinc-800">
                      <tr>
                        <th className="py-2.5 px-4">Item</th>
                        <th className="py-2.5 px-2 text-right">Price</th>
                        <th className="py-2.5 px-2 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                      {cart.map((line) => (
                        <tr
                          key={line.productId}
                          className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40"
                        >
                          <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">
                            {line.name}
                            <span className="block text-[10px] text-slate-400 font-normal">
                              Unit: {line.unit}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-right font-medium text-slate-600 dark:text-zinc-300">
                            {formatCurrency(line.saleRate)}
                          </td>
                          <td className="py-2.5 px-2">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => updateQuantity(line.productId, -1)}
                                className="h-6 w-6 rounded bg-slate-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-slate-200"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center font-bold text-slate-900 dark:text-white text-xs">
                                {line.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(line.productId, 1)}
                                className="h-6 w-6 rounded bg-slate-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-slate-200"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-emerald-600 dark:text-emerald-400 text-sm">
                            {formatCurrency(line.saleRate * line.quantity)}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => removeLine(line.productId)}
                              className="text-slate-400 hover:text-red-600 p-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Checkout Drawer & Payment Calculations */}
        <div className="space-y-4">
          <Card className="border-t-4 border-t-emerald-600 shadow-md">
            <CardHeader className="py-3 px-4 border-b border-slate-100 dark:border-zinc-800">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span>Payment & Checkout</span>
                <CreditCard className="h-4 w-4 text-emerald-600" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5">
              {/* Customer Selector & Khata Balance */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1 flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-slate-400" /> Customer
                </label>
                <select
                  className="h-10 w-full rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 text-xs font-medium"
                  value={customerId}
                  onChange={(e) =>
                    setCustomerId(e.target.value ? Number(e.target.value) : "")
                  }
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

              {/* Subtotal, Discount & Net Payable */}
              <div className="rounded-xl bg-slate-900 text-white p-3.5 shadow-inner">
                <div className="flex justify-between text-xs text-slate-400 pb-1">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-200">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400 pb-1">
                  <span>Discount (Rs)</span>
                  <input
                    type="number"
                    min={0}
                    value={discount || ""}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="h-6 w-20 rounded bg-slate-800 px-2 text-right text-xs font-bold text-white border border-slate-700"
                  />
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between items-baseline">
                  <span className="text-xs uppercase font-bold text-emerald-400">
                    Net Payable
                  </span>
                  <span className="text-2xl font-black text-emerald-400">
                    {formatCurrency(net)}
                  </span>
                </div>
              </div>

              {/* Quick Cash Buttons */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Quick Cash Calculator
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQuickCash(net)}
                    className="rounded-lg bg-slate-100 dark:bg-zinc-800 py-1 text-xs font-bold hover:bg-slate-200"
                  >
                    Exact Net
                  </button>
                  {QUICK_CASH_DENOMINATIONS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setQuickCash(d)}
                      className="rounded-lg bg-slate-100 dark:bg-zinc-800 py-1 text-xs font-semibold hover:bg-slate-200"
                    >
                      Rs {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cash Tendered & Live Change Due */}
              <div className="rounded-xl bg-slate-50 dark:bg-zinc-800/60 p-3 border border-slate-200 dark:border-zinc-700">
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Cash Received (Tendered)
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 1000"
                  className="h-9 font-bold text-slate-900 dark:text-white"
                  value={cashTendered}
                  onChange={(e) =>
                    setCashTendered(
                      e.target.value === "" ? "" : parseFloat(e.target.value)
                    )
                  }
                />
                {changeDue !== null && (
                  <div
                    className={`mt-2 flex items-center justify-between rounded-lg p-2 text-xs font-bold ${
                      changeDue >= 0
                        ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-300"
                    }`}
                  >
                    <span>{changeDue >= 0 ? "Change to return:" : "Short amount:"}</span>
                    <span className="text-sm">{formatCurrency(Math.abs(changeDue))}</span>
                  </div>
                )}
              </div>

              {/* Split Payment Methods */}
              <div className="space-y-2 border-t border-slate-100 dark:border-zinc-800 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                    Payment Method Split
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setPayments((prev) => [
                        ...prev,
                        { method: "jazzcash", amount: 0 },
                      ])
                    }
                    className="text-[11px] font-bold text-emerald-600 hover:underline"
                  >
                    + Split Payment
                  </button>
                </div>

                {payments.map((p, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl bg-slate-50 dark:bg-zinc-800/40 p-2.5 border border-slate-200 dark:border-zinc-700/80 space-y-2"
                  >
                    <div className="grid grid-cols-[130px_1fr] gap-2">
                      <Input
                        list="pos-payment-methods"
                        placeholder="e.g. cash"
                        className="h-9 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 text-xs font-semibold capitalize"
                        value={p.method}
                        onChange={(e) => {
                          const method = e.target.value;
                          setPayments((prev) =>
                            prev.map((row, i) =>
                              i === idx ? { ...row, method } : row
                            )
                          );
                        }}
                      />
                      <datalist id="pos-payment-methods">
                        {PAYMENT_METHODS.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))}
                      </datalist>

                      <Input
                        type="number"
                        min={0}
                        placeholder="Amount"
                        className="h-9 font-bold text-xs"
                        value={p.amount || ""}
                        onChange={(e) => {
                          const amount = parseFloat(e.target.value) || 0;
                          setPayments((prev) =>
                            prev.map((row, i) =>
                              i === idx ? { ...row, amount } : row
                            )
                          );
                        }}
                      />
                    </div>

                    {/* Digital Wallet TID / Reference input */}
                    {(p.method === "jazzcash" ||
                      p.method === "easypaisa" ||
                      p.method === "bank") && (
                      <Input
                        placeholder="Transaction ID / Last 4 digits (TID)"
                        className="h-8 text-xs font-mono"
                        value={p.referenceId ?? ""}
                        onChange={(e) => {
                          setPayments((prev) =>
                            prev.map((row, i) =>
                              i === idx
                                ? { ...row, referenceId: e.target.value }
                                : row
                            )
                          );
                        }}
                      />
                    )}
                  </div>
                ))}
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
                className="w-full h-12 text-base font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
                disabled={loading || cart.length === 0}
                onClick={completeSale}
              >
                {loading ? "Processing..." : `Complete Sale — F9`}
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
