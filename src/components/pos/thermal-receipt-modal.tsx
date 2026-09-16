"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Printer, X, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export type ReceiptData = {
  invoiceNumber: string;
  date: Date | string;
  customerName?: string;
  customerPhone?: string;
  customerKhataBalance?: number;
  items: {
    name: string;
    quantity: number;
    saleRate: number;
    total: number;
    unit: string;
  }[];
  subtotal: number;
  discount: number;
  netAmount: number;
  cashTendered?: number;
  changeDue?: number;
  payments: {
    method: string;
    amount: number;
    referenceId?: string;
  }[];
};

export function ThermalReceiptModal({
  receipt,
  onClose,
}: {
  receipt: ReceiptData | null;
  onClose: () => void;
}) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "p" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handlePrint();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!receipt) return null;

  const formattedDate = new Date(receipt.date).toLocaleString("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="flex flex-col max-h-[90vh] w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
        {/* Modal Toolbar */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 px-5 py-3 bg-slate-50 dark:bg-zinc-800/60">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
            <CheckCircle2 className="h-4 w-4" /> Sale Completed
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 h-8 text-xs font-semibold"
            >
              <Printer className="h-3.5 w-3.5" /> Print Receipt
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Preview (Print Target) */}
        <div className="overflow-y-auto p-6 flex justify-center bg-slate-100/60 dark:bg-zinc-950">
          <div
            id="thermal-receipt"
            ref={receiptRef}
            className="w-[80mm] bg-white text-black p-4 font-mono text-[11px] leading-tight shadow-md border border-dashed border-slate-300 select-all"
          >
            {/* Header */}
            <div className="text-center space-y-0.5 pb-2 border-b border-dashed border-black">
              <h2 className="text-sm font-black tracking-wider uppercase">
                AL-MADINA SUPER GROCERY
              </h2>
              <p className="text-[10px]">Main Bazaar, Near Clock Tower</p>
              <p className="text-[10px]">Ph: 0300-1234567 / 042-3588990</p>
            </div>

            {/* Metadata */}
            <div className="py-2 text-[10px] space-y-0.5 border-b border-dashed border-black">
              <div className="flex justify-between">
                <span>Inv: {receipt.invoiceNumber}</span>
                <span>{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="font-bold">
                  {receipt.customerName || "Walk-in Guest"}
                </span>
              </div>
              {receipt.customerPhone && (
                <div className="flex justify-between">
                  <span>Phone:</span>
                  <span>{receipt.customerPhone}</span>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="py-2 border-b border-dashed border-black">
              <div className="flex justify-between font-bold text-[10px] pb-1">
                <span className="w-1/2">ITEM</span>
                <span className="w-1/4 text-center">QTY</span>
                <span className="w-1/4 text-right">TOTAL</span>
              </div>
              <div className="space-y-1">
                {receipt.items.map((item, idx) => (
                  <div key={idx} className="text-[10px]">
                    <div className="font-semibold truncate">{item.name}</div>
                    <div className="flex justify-between text-[9px] text-gray-700">
                      <span></span>
                      <span>
                        {item.quantity} {item.unit} × {item.saleRate.toFixed(0)}
                      </span>
                      <span className="font-bold text-black">
                        Rs {item.total.toFixed(0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals & Net */}
            <div className="py-2 text-[11px] space-y-0.5 border-b border-dashed border-black">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>Rs {receipt.subtotal.toFixed(2)}</span>
              </div>
              {receipt.discount > 0 && (
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>-Rs {receipt.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-black pt-1">
                <span>NET PAYABLE:</span>
                <span>Rs {receipt.netAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method Breakdown */}
            <div className="py-2 text-[10px] space-y-0.5 border-b border-dashed border-black">
              <div className="font-bold pb-0.5">PAYMENT BREAKDOWN:</div>
              {receipt.payments.map((p, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="capitalize">
                    {p.method}
                    {p.referenceId ? ` (TID:${p.referenceId})` : ""}
                  </span>
                  <span>Rs {p.amount.toFixed(2)}</span>
                </div>
              ))}
              {receipt.cashTendered !== undefined && receipt.cashTendered > 0 && (
                <>
                  <div className="flex justify-between pt-0.5 text-gray-700">
                    <span>Cash Tendered:</span>
                    <span>Rs {receipt.cashTendered.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Change Due:</span>
                    <span>Rs {(receipt.changeDue ?? 0).toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Customer Khata Ledger Note */}
            {receipt.customerKhataBalance !== undefined &&
              receipt.customerKhataBalance > 0 && (
                <div className="py-1.5 text-[10px] space-y-0.5 bg-gray-100 p-1 my-1 rounded border border-gray-300">
                  <div className="flex justify-between font-bold">
                    <span>Current Khata Balance:</span>
                    <span>Rs {receipt.customerKhataBalance.toFixed(2)}</span>
                  </div>
                  <div className="text-[8px] text-gray-600">
                    Please clear outstanding dues within the agreed credit cycle.
                  </div>
                </div>
              )}

            {/* Footer */}
            <div className="text-center pt-2 text-[9px] space-y-0.5 text-gray-700">
              <p className="font-bold">*** THANK YOU FOR YOUR VISIT ***</p>
              <p>Goods once sold can be exchanged in 3 days</p>
              <p>Perishable/Dairy items non-refundable</p>
              <p className="text-[8px] pt-1">Powered by GroceryPOS Retail Engine</p>
            </div>
          </div>
        </div>

        {/* Modal Action Footnotes */}
        <div className="flex items-center justify-between p-3 border-t border-slate-100 dark:border-zinc-800 text-xs text-slate-500 bg-white dark:bg-zinc-900">
          <span>Press [Esc] to close or [Ctrl+P] to print</span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Done (Close)
          </Button>
        </div>
      </div>
    </div>
  );
}
